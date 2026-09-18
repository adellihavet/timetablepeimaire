/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GradeLevel, 
  ShiftSystem, 
  Timetable, 
  TimeSlot, 
  DayOfWeek, 
  SchoolInfo, 
  TeacherAssignment, 
  SchoolShiftMode, 
  ClassGroup 
} from './types';
import { getDefaultTimetable } from './data/defaultTimetables';
import { OFFICIAL_CURRICULA } from './data/officialCurriculum';
import { Header } from './components/Header';
import { QuotaSummaryCard } from './components/QuotaSummaryCard';
import { TimetableGrid } from './components/TimetableGrid';
import { SlotEditorModal } from './components/SlotEditorModal';
import { TeachersScheduleView } from './components/TeachersScheduleView';
import { PrintTimetable } from './components/PrintTimetable';
import { PedagogicalTipsModal } from './components/PedagogicalTipsModal';
import { ShiftSelectionStep } from './components/ShiftSelectionStep';
import { SchoolSetupStep } from './components/SchoolSetupStep';
import { CheckCircle, CheckCircle2, AlertTriangle, Sparkles, ShieldCheck } from 'lucide-react';
import { generateConflictFreeSchoolTimetables, auditSchoolSchedule } from './utils/schoolScheduleEngine';

const STORAGE_KEY = 'algerian_primary_timetables_v5_unified';
const SCHOOL_INFO_KEY = 'algerian_school_info_v4';
const TEACHERS_KEY = 'algerian_teachers_v4';
const GROUPS_KEY = 'algerian_class_groups_v4';
const SHIFT_MODE_KEY = 'algerian_shift_mode_v4';
const AMAZIGH_KEY = 'algerian_has_amazigh_v4';
const PARTIAL_GRADES_KEY = 'algerian_partial_double_grades_v4';
const STEP_KEY = 'algerian_app_step_v4';

type AppStep = 'shift' | 'settings' | 'timetable';

const DEFAULT_SCHOOL_INFO: SchoolInfo = {
  schoolName: 'مدرسة الشهيد العربي بن مهيدي الابتدائية',
  wilaya: 'الجزائر',
  commune: 'الجزائر الوسطى',
  dairaOrInspection: 'المقاطعة التفتيشية الثالثة للتعليم الابتدائي',
  academicYear: '2025-2026',
  directorName: 'السيد(ة) مدير(ة) المدرسة',
  inspectorName: 'السيد(ة) مفتش(ة) المقاطعة',
};

const DEFAULT_CLASS_GROUPS: ClassGroup[] = [
  {
    id: 'grp_1ap_1',
    grade: '1AP',
    groupIndex: 1,
    groupLabel: 'فوج 01',
    displayName: 'السنة الأولى — فوج 01',
    shiftSystem: 'single',
    arabicTeacherName: 'أ. أحمد بن علي',
  },
  {
    id: 'grp_2ap_1',
    grade: '2AP',
    groupIndex: 1,
    groupLabel: 'فوج 01',
    displayName: 'السنة الثانية — فوج 01',
    shiftSystem: 'single',
    arabicTeacherName: 'أ. فاطمة الزهراء',
  },
  {
    id: 'grp_3ap_1',
    grade: '3AP',
    groupIndex: 1,
    groupLabel: 'فوج 01',
    displayName: 'السنة الثالثة — فوج 01',
    shiftSystem: 'single',
    arabicTeacherName: 'أ. مصطفى خليل',
  },
  {
    id: 'grp_4ap_1',
    grade: '4AP',
    groupIndex: 1,
    groupLabel: 'فوج 01',
    displayName: 'السنة الرابعة — فوج 01',
    shiftSystem: 'single',
    arabicTeacherName: 'أ. محمد لمين',
  },
  {
    id: 'grp_5ap_1',
    grade: '5AP',
    groupIndex: 1,
    groupLabel: 'فوج 01',
    displayName: 'السنة الخامسة — فوج 01',
    shiftSystem: 'single',
    arabicTeacherName: 'أ. كريم سحنون',
  },
];

const DEFAULT_TEACHERS: TeacherAssignment[] = [
  {
    id: 't_french_1',
    name: 'أ. مريم بلقاسم',
    role: 'french_teacher',
    subjectName: 'لغة فرنسية',
    assignedGrades: ['4AP', '5AP'],
    assignedGroups: 'جميع الأفواج المعنية',
    assignedGroupIds: ['grp_4ap_1', 'grp_5ap_1'],
  },
  {
    id: 't_english_1',
    name: 'أ. سارة منصوري',
    role: 'english_teacher',
    subjectName: 'لغة إنجليزية',
    assignedGrades: ['3AP', '4AP', '5AP'],
    assignedGroups: 'جميع الأفواج المعنية',
    assignedGroupIds: ['grp_3ap_1', 'grp_4ap_1', 'grp_5ap_1'],
  },
  {
    id: 't_pe_1',
    name: 'أ. كمال عمراوي',
    role: 'pe_teacher',
    subjectName: 'تربية بدنية ورياضية',
    assignedGrades: ['1AP', '2AP', '3AP', '4AP', '5AP'],
    assignedGroups: 'جميع الأفواج المعنية',
    assignedGroupIds: ['grp_1ap_1', 'grp_2ap_1', 'grp_3ap_1', 'grp_4ap_1', 'grp_5ap_1'],
  },
  {
    id: 't_amazigh_1',
    name: 'أ. تينينان ماسينيسا',
    role: 'amazigh_teacher',
    subjectName: 'لغة أمازيغية',
    assignedGrades: ['4AP', '5AP'],
    assignedGroups: 'جميع الأفواج المعنية',
    assignedGroupIds: ['grp_4ap_1', 'grp_5ap_1'],
  },
];

export default function App() {
  const [step, setStep] = useState<AppStep>(() => {
    try {
      const saved = localStorage.getItem(STEP_KEY);
      if (saved === 'shift' || saved === 'settings' || saved === 'timetable') {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'shift';
  });

  // School shift modes (1. single, 2. full_double, 3. partial_double)
  const [shiftMode, setShiftMode] = useState<SchoolShiftMode>(() => {
    try {
      const saved = localStorage.getItem(SHIFT_MODE_KEY);
      if (saved === 'single' || saved === 'full_double' || saved === 'partial_double') {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'single';
  });

  const [hasAmazigh, setHasAmazigh] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(AMAZIGH_KEY);
      if (saved !== null) return saved === 'true';
    } catch (e) {
      console.error(e);
    }
    return false;
  });

  const [partialDoubleGrades, setPartialDoubleGrades] = useState<GradeLevel[]>(() => {
    try {
      const saved = localStorage.getItem(PARTIAL_GRADES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['1AP', '2AP'];
  });

  // Active view shift system (single, double_g1, double_g2)
  const [shiftSystem, setShiftSystem] = useState<ShiftSystem>('single');
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>('3AP');
  const [activeGroupId, setActiveGroupId] = useState<string>('grp_3ap_1');

  // School info
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(() => {
    try {
      const saved = localStorage.getItem(SCHOOL_INFO_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SCHOOL_INFO;
  });

  // Class groups
  const [classGroups, setClassGroups] = useState<ClassGroup[]>(() => {
    try {
      const saved = localStorage.getItem(GROUPS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CLASS_GROUPS;
  });

  // Specialized teachers
  const [teachers, setTeachers] = useState<TeacherAssignment[]>(() => {
    try {
      const saved = localStorage.getItem(TEACHERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TEACHERS;
  });

  // Timetables cache by groupId and by GradeLevel
  const [timetablesMap, setTimetablesMap] = useState<Record<string, Timetable>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved timetables', e);
    }
    return generateConflictFreeSchoolTimetables({
      classGroups: DEFAULT_CLASS_GROUPS,
      shiftMode: 'single',
      hasAmazigh: false,
      partialDoubleGrades: [],
      teachers: DEFAULT_TEACHERS,
      schoolInfo: DEFAULT_SCHOOL_INFO,
    });
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timetablesMap));
      localStorage.setItem(SCHOOL_INFO_KEY, JSON.stringify(schoolInfo));
      localStorage.setItem(TEACHERS_KEY, JSON.stringify(teachers));
      localStorage.setItem(GROUPS_KEY, JSON.stringify(classGroups));
      localStorage.setItem(SHIFT_MODE_KEY, shiftMode);
      localStorage.setItem(AMAZIGH_KEY, String(hasAmazigh));
      localStorage.setItem(PARTIAL_GRADES_KEY, JSON.stringify(partialDoubleGrades));
      localStorage.setItem(STEP_KEY, step);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [timetablesMap, schoolInfo, teachers, classGroups, shiftMode, hasAmazigh, partialDoubleGrades, step]);

  // Determine active timetable
  const activeTimetable: Timetable = 
    timetablesMap[activeGroupId] || 
    timetablesMap[currentGrade] || 
    getDefaultTimetable(currentGrade, shiftSystem, hasAmazigh);

  const curriculum = OFFICIAL_CURRICULA[currentGrade];

  // Modals state
  const [isTeachersOpen, setIsTeachersOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isPedagogyTipsOpen, setIsPedagogyTipsOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleTogglePartialGrade = (grade: GradeLevel) => {
    setPartialDoubleGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  // Real-time schedule audit to ensure zero teacher conflicts
  const auditResult = React.useMemo(() => {
    return auditSchoolSchedule(timetablesMap);
  }, [timetablesMap]);

  // Deduplicated unique list of timetables
  const uniqueTimetablesList: Timetable[] = React.useMemo(() => {
    return Array.from(
      new Map(
        (Object.values(timetablesMap) as Timetable[])
          .filter((tt) => tt && tt.id)
          .map((tt) => [tt.id, tt])
      ).values()
    );
  }, [timetablesMap]);

  // Generate timetables based on chosen shift mode, school info, and teachers
  const handleGenerateTimetables = () => {
    const generated = generateConflictFreeSchoolTimetables({
      classGroups,
      shiftMode,
      hasAmazigh,
      partialDoubleGrades,
      teachers,
      schoolInfo,
      defaultShiftSystem: shiftSystem,
    });

    setTimetablesMap(generated);

    const matchingGrp = classGroups.find((g) => g.grade === currentGrade) || classGroups[0];
    if (matchingGrp) {
      setActiveGroupId(matchingGrp.id);
      setShiftSystem(generated[matchingGrp.id]?.shiftSystem || 'single');
    }

    setStep('timetable');
    showToast('تم بناء وتوليد شبكة المواقيت بنجاح: 0 تضارب زمني، حصص مجمعة للأساتذة المتخصصين، وأمسية إضافية حرة لمعلمي العربية.');
  };

  // Switch Grade
  const handleSelectGrade = (grade: GradeLevel) => {
    setCurrentGrade(grade);
    const matchingGrp = classGroups.find((g) => g.grade === grade);
    if (matchingGrp) {
      setActiveGroupId(matchingGrp.id);
      const tt = timetablesMap[matchingGrp.id];
      if (tt) setShiftSystem(tt.shiftSystem);
    }
  };

  // Switch Class Group for current grade
  const handleSelectClassGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    const tt = timetablesMap[groupId];
    if (tt) {
      setShiftSystem(tt.shiftSystem);
    }
  };

  // Switch Shift System from timetable view
  const handleSelectShift = (shift: ShiftSystem) => {
    setShiftSystem(shift);
    setTimetablesMap((prev) => {
      const current = prev[activeGroupId] || prev[currentGrade];
      const updated = {
        ...current,
        shiftSystem: shift,
        slots: getDefaultTimetable(currentGrade, shift, hasAmazigh).slots.map((s) => ({
          ...s,
          teacherName:
            s.teacherRole === 'arabic_teacher'
              ? current.arabicTeacherName
              : s.teacherRole === 'french_teacher'
              ? current.frenchTeacherName
              : s.teacherRole === 'english_teacher'
              ? current.englishTeacherName
              : s.teacherRole === 'pe_teacher'
              ? current.peTeacherName
              : s.teacherRole === 'amazigh_teacher'
              ? current.amazighTeacherName
              : s.teacherName,
        })),
      };
      return {
        ...prev,
        [activeGroupId]: updated,
        [currentGrade]: updated,
      };
    });
    showToast(
      `تم تغيير النظام إلى: ${
        shift === 'single' ? 'الدوام الواحد' : shift === 'double_g1' ? 'الدوامين (فوج 1)' : 'الدوامين (فوج 2)'
      }`
    );
  };

  // Reset current grade to official template
  const handleResetToOfficial = () => {
    if (window.confirm('هل تريد استعادة التوزيع النموذجي الموصى به رسمياً لهذا المستوى؟')) {
      const fresh = getDefaultTimetable(currentGrade, shiftSystem, activeTimetable.hasAmazigh);
      const merged: Timetable = {
        ...fresh,
        id: activeTimetable.id,
        schoolName: activeTimetable.schoolName,
        wilaya: activeTimetable.wilaya,
        commune: activeTimetable.commune,
        dairaOrInspection: activeTimetable.dairaOrInspection,
        academicYear: activeTimetable.academicYear,
        classGroup: activeTimetable.classGroup,
        arabicTeacherName: activeTimetable.arabicTeacherName,
        frenchTeacherName: activeTimetable.frenchTeacherName,
        englishTeacherName: activeTimetable.englishTeacherName,
        peTeacherName: activeTimetable.peTeacherName,
        amazighTeacherName: activeTimetable.amazighTeacherName,
        directorName: activeTimetable.directorName,
        inspectorName: activeTimetable.inspectorName,
      };

      setTimetablesMap((prev) => ({
        ...prev,
        [activeGroupId]: merged,
        [currentGrade]: merged,
      }));
      showToast('تمت استعادة التوزيع النموذجي بنجاح.');
    }
  };

  // Save individual slot edit
  const handleSaveSlot = (updatedSlot: TimeSlot) => {
    setTimetablesMap((prev) => {
      const current = prev[activeGroupId] || prev[currentGrade];
      const exists = current.slots.some((s) => s.id === updatedSlot.id);
      const newSlots = exists
        ? current.slots.map((s) => (s.id === updatedSlot.id ? updatedSlot : s))
        : [...current.slots, updatedSlot];

      const updated = {
        ...current,
        slots: newSlots,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        [activeGroupId]: updated,
        [currentGrade]: updated,
      };
    });
    showToast('تم حفظ تعديل الحصة.');
  };

  // Delete individual slot
  const handleDeleteSlot = (slotId: string) => {
    setTimetablesMap((prev) => {
      const current = prev[activeGroupId] || prev[currentGrade];
      const updated = {
        ...current,
        slots: current.slots.filter((s) => s.id !== slotId),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        [activeGroupId]: updated,
        [currentGrade]: updated,
      };
    });
    showToast('تم حذف الحصة.');
  };

  // Add new slot
  const handleAddSlot = (day: DayOfWeek, period: 'morning' | 'afternoon') => {
    const newSlot: TimeSlot = {
      id: `slot_${Date.now()}`,
      day,
      period,
      startTime: period === 'morning' ? '11:15' : '15:15',
      endTime: period === 'morning' ? '11:45' : '15:45',
      durationMinutes: 30,
      subjectId: 'arabic',
      activityName: 'نشاط تربوي إضافي',
      teacherRole: 'arabic_teacher',
      teacherName: activeTimetable.arabicTeacherName,
    };
    setEditingSlot(newSlot);
  };

  // Move slot up or down
  const handleMoveSlot = (slotId: string, direction: 'up' | 'down') => {
    setTimetablesMap((prev) => {
      const current = prev[activeGroupId] || prev[currentGrade];
      const slotIndex = current.slots.findIndex((s) => s.id === slotId);
      if (slotIndex === -1) return prev;

      const targetSlot = current.slots[slotIndex];
      const sameGroupIndices = current.slots
        .map((s, idx) => (s.day === targetSlot.day && s.period === targetSlot.period ? idx : -1))
        .filter((idx) => idx !== -1);

      const posInGroup = sameGroupIndices.indexOf(slotIndex);
      const targetPosInGroup = direction === 'up' ? posInGroup - 1 : posInGroup + 1;

      if (targetPosInGroup < 0 || targetPosInGroup >= sameGroupIndices.length) {
        return prev;
      }

      const swapIndex = sameGroupIndices[targetPosInGroup];
      const newSlots = [...current.slots];
      const temp = newSlots[slotIndex];
      newSlots[slotIndex] = newSlots[swapIndex];
      newSlots[swapIndex] = temp;

      const updated = {
        ...current,
        slots: newSlots,
      };

      return {
        ...prev,
        [activeGroupId]: updated,
        [currentGrade]: updated,
      };
    });
  };

  // JSON Backup export
  const handleExportJSON = () => {
    const backupData = {
      timetablesMap,
      schoolInfo,
      teachers,
      classGroups,
      shiftMode,
      hasAmazigh,
      partialDoubleGrades,
      shiftSystem,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `جداول_المواقيت_الابتدائية_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('تم تصدير نسخة الجداول بنجاح.');
  };

  // JSON Import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.timetablesMap) {
          setTimetablesMap(imported.timetablesMap);
          if (imported.schoolInfo) setSchoolInfo(imported.schoolInfo);
          if (imported.teachers) setTeachers(imported.teachers);
          if (imported.classGroups) setClassGroups(imported.classGroups);
          if (imported.shiftMode) setShiftMode(imported.shiftMode);
          if (imported.hasAmazigh !== undefined) setHasAmazigh(imported.hasAmazigh);
          if (imported.partialDoubleGrades) setPartialDoubleGrades(imported.partialDoubleGrades);
          setStep('timetable');
          showToast('تم استيراد الجداول والإعدادات بنجاح.');
        } else if (imported['1AP'] || imported['3AP']) {
          setTimetablesMap(imported);
          setStep('timetable');
          showToast('تم استيراد الجداول بنجاح.');
        } else {
          alert('الملف المحدد لا يحتوي على بنية جداول صحيحة.');
        }
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء قراءة ملف JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Cairo',sans-serif] selection:bg-emerald-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* STEP 1: SHIFT SYSTEM SELECTION */}
      {step === 'shift' && (
        <ShiftSelectionStep
          shiftMode={shiftMode}
          hasAmazigh={hasAmazigh}
          partialDoubleGrades={partialDoubleGrades}
          selectedShift={shiftSystem}
          onSelectShiftMode={(mode) => setShiftMode(mode)}
          onToggleAmazigh={(has) => setHasAmazigh(has)}
          onTogglePartialGrade={handleTogglePartialGrade}
          onSelectShift={(shift) => setShiftSystem(shift)}
          onNext={() => setStep('settings')}
        />
      )}

      {/* STEP 2: SCHOOL & TEACHERS SETTINGS (صفحة الإسناد وتأطير الأفواج) */}
      {step === 'settings' && (
        <SchoolSetupStep
          schoolInfo={schoolInfo}
          teachers={teachers}
          hasAmazigh={hasAmazigh}
          shiftMode={shiftMode}
          classGroups={classGroups}
          onUpdateSchoolInfo={setSchoolInfo}
          onUpdateTeachers={setTeachers}
          onUpdateClassGroups={setClassGroups}
          onBack={() => setStep('shift')}
          onGenerate={handleGenerateTimetables}
        />
      )}

      {/* STEP 3: TIMETABLE GENERATION & WORKSPACE */}
      {step === 'timetable' && (
        <>
          {/* Main Header & Toolbar */}
          <Header
            currentGrade={currentGrade}
            onSelectGrade={handleSelectGrade}
            shiftSystem={shiftSystem}
            onSelectShift={handleSelectShift}
            timetable={activeTimetable}
            classGroups={classGroups}
            activeGroupId={activeGroupId}
            onSelectClassGroup={handleSelectClassGroup}
            onOpenStepSettings={() => setStep('settings')}
            onOpenStepShift={() => setStep('shift')}
            onOpenTeachers={() => setIsTeachersOpen(true)}
            onOpenPrint={() => setIsPrintOpen(true)}
            onOpenPedagogyTips={() => setIsPedagogyTipsOpen(true)}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            onResetToOfficial={handleResetToOfficial}
          />

          {/* Main Application Container */}
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
            {/* Pedagogical Optimization & Audit Status Bar */}
            <div className={`p-4 rounded-2xl border shadow-xs transition-all ${
              auditResult.hasConflicts 
                ? 'bg-rose-50 border-rose-300 text-rose-950' 
                : 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl text-white ${auditResult.hasConflicts ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                    {auditResult.hasConflicts ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base">
                        {auditResult.hasConflicts ? 'تنبيه: تم رصد تضارب زمني بين الأساتذة' : 'تدقيق التوزيع البيداغوجي: 0 تضارب مدرسي وتوزيع متكامل'}
                      </h4>
                      {!auditResult.hasConflicts && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                          مطابق للمنشور 468
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {auditResult.hasConflicts
                        ? 'يوجد أستاذ مسند لفوجين في نفس التوقيت. اضغط على الزر المقابل للتوليد الذكي التلقائي لحل كافة التضاربات فوراً.'
                        : 'جداول الأساتذة المتخصصين (فرنسية، إنجليزية، بدنية) مجمّعة دون فراغات، مع استفادة معلمي اللغة العربية (3، 4، 5 ابتدائي) من أمسيات حرة إضافية قانونية.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateTimetables}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    title="إعادة التوليد الذكي لجميع الأفواج"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>توليد ذكي خالٍ من التضارب</span>
                  </button>
                </div>
              </div>

              {auditResult.hasConflicts && (
                <div className="mt-3 pt-3 border-t border-rose-200 text-xs text-rose-800 space-y-1">
                  {auditResult.conflicts.map((conflict, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <span>{conflict}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Real-time Ministerial Quota Auditor */}
            <QuotaSummaryCard curriculum={curriculum} timetable={activeTimetable} />

            {/* Core Interactive Timetable Grid */}
            <TimetableGrid
              timetable={activeTimetable}
              grade={currentGrade}
              onEditSlot={(slot) => setEditingSlot(slot)}
              onAddSlot={handleAddSlot}
              onMoveSlot={handleMoveSlot}
            />
          </main>
        </>
      )}

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        <p className="font-semibold text-slate-700">
          منصة إنجاز جداول المواقيت للتعليم الابتدائي — الجمهورية الجزائرية الديمقراطية الشعبية
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          موسم {schoolInfo.academicYear} • تنظيم بيداغوجي رقمي متكامل وفق المنشور الوزاري
        </p>
      </footer>

      {/* MODALS */}
      <SlotEditorModal
        isOpen={!!editingSlot}
        onClose={() => setEditingSlot(null)}
        slot={editingSlot}
        grade={currentGrade}
        onSave={handleSaveSlot}
        onDelete={handleDeleteSlot}
      />

      <TeachersScheduleView
        isOpen={isTeachersOpen}
        onClose={() => setIsTeachersOpen(false)}
        timetable={activeTimetable}
        allTimetables={uniqueTimetablesList}
        teachers={teachers}
        schoolInfo={schoolInfo}
        classGroups={classGroups}
      />

      <PrintTimetable
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        timetable={activeTimetable}
        grade={currentGrade}
        allTimetables={uniqueTimetablesList}
        onSelectTimetable={(selected) => {
          const matchingGrp = classGroups.find(
            (g) => `timetable_${g.id}` === selected.id || g.id === selected.id || g.groupLabel === selected.classGroup
          );
          if (matchingGrp) {
            setActiveGroupId(matchingGrp.id);
            setCurrentGrade(matchingGrp.grade);
          }
        }}
      />

      <PedagogicalTipsModal
        isOpen={isPedagogyTipsOpen}
        onClose={() => setIsPedagogyTipsOpen(false)}
      />
    </div>
  );
}
