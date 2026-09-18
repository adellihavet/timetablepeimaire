import React, { useState } from 'react';
import { SchoolInfo, TeacherAssignment, GradeLevel, TeacherRole, ClassGroup, SchoolShiftMode } from '../types';
import { 
  School, 
  MapPin, 
  Users, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Languages, 
  UserCheck, 
  Building2,
  BookOpen,
  Dumbbell,
  Check,
  Scale
} from 'lucide-react';
import { getCleanGradeName } from '../utils/slotFormatter';

interface SchoolSetupStepProps {
  schoolInfo: SchoolInfo;
  teachers: TeacherAssignment[];
  hasAmazigh: boolean;
  shiftMode: SchoolShiftMode;
  classGroups: ClassGroup[];
  onUpdateSchoolInfo: (info: SchoolInfo) => void;
  onUpdateTeachers: (teachers: TeacherAssignment[]) => void;
  onUpdateClassGroups: (groups: ClassGroup[]) => void;
  onBack: () => void;
  onGenerate: () => void;
}

const ALL_GRADES: { id: GradeLevel; name: string }[] = [
  { id: '1AP', name: 'السنة الأولى (1AP)' },
  { id: '2AP', name: 'السنة الثانية (2AP)' },
  { id: '3AP', name: 'السنة الثالثة (3AP)' },
  { id: '4AP', name: 'السنة الرابعة (4AP)' },
  { id: '5AP', name: 'السنة الخامسة (5AP)' },
];

export const SchoolSetupStep: React.FC<SchoolSetupStepProps> = ({
  schoolInfo,
  teachers,
  hasAmazigh,
  shiftMode,
  classGroups,
  onUpdateSchoolInfo,
  onUpdateTeachers,
  onUpdateClassGroups,
  onBack,
  onGenerate,
}) => {
  const [localInfo, setLocalInfo] = useState<SchoolInfo>(schoolInfo);
  const [localGroups, setLocalGroups] = useState<ClassGroup[]>(classGroups);
  const [localTeachers, setLocalTeachers] = useState<TeacherAssignment[]>(teachers);

  // Update school info field
  const handleInfoChange = (field: keyof SchoolInfo, val: string) => {
    const updated = { ...localInfo, [field]: val };
    setLocalInfo(updated);
    onUpdateSchoolInfo(updated);
  };

  // Update Arabic teacher for a specific class group
  const handleGroupArabicTeacherChange = (groupId: string, teacherName: string) => {
    const updated = localGroups.map((g) =>
      g.id === groupId ? { ...g, arabicTeacherName: teacherName } : g
    );
    setLocalGroups(updated);
    onUpdateClassGroups(updated);
  };

  // Add a group to a grade (e.g. 1AP -> adds 1AP_2)
  const handleAddGroupToGrade = (grade: GradeLevel) => {
    const existing = localGroups.filter((g) => g.grade === grade);
    const nextIndex = existing.length + 1;
    const newGroup: ClassGroup = {
      id: `${grade}_${nextIndex}_${Date.now()}`,
      grade,
      groupIndex: nextIndex,
      groupLabel: `فوج 0${nextIndex}`,
      displayName: `${getCleanGradeName(grade)} — فوج 0${nextIndex}`,
      shiftSystem: shiftMode === 'full_double' ? 'double_g1' : 'single',
      arabicTeacherName: `أستاذ(ة) ${getCleanGradeName(grade)} ف${nextIndex}`,
    };
    const updated = [...localGroups, newGroup];
    setLocalGroups(updated);
    onUpdateClassGroups(updated);
  };

  // Remove a group from a grade (must keep at least 1)
  const handleRemoveGroup = (groupId: string, grade: GradeLevel) => {
    const countForGrade = localGroups.filter((g) => g.grade === grade).length;
    if (countForGrade <= 1) {
      alert(`يجب الإبقاء على فوج واحد على الأقل لمستوى ${getCleanGradeName(grade)}.`);
      return;
    }
    const updated = localGroups.filter((g) => g.id !== groupId);
    setLocalGroups(updated);
    onUpdateClassGroups(updated);
  };

  // Specialised teachers handlers
  const handleAddSpecialistTeacher = (role: TeacherRole, defaultSubject: string, defaultGrades: GradeLevel[]) => {
    const sameRoleTeachers = localTeachers.filter((t) => t.role === role);
    const count = sameRoleTeachers.length + 1;
    const relevantGroups = localGroups.filter((g) => defaultGrades.includes(g.grade));
    const allRelevantGroupIds = relevantGroups.map((g) => g.id);

    // Collect group IDs currently claimed by existing teachers of this role
    const claimedGroupIds = new Set<string>();
    sameRoleTeachers.forEach((t) => {
      (t.assignedGroupIds || []).forEach((gid) => claimedGroupIds.add(gid));
    });

    // Groups that are currently unassigned
    const unassignedGroupIds = allRelevantGroupIds.filter((gid) => !claimedGroupIds.has(gid));

    const newT: TeacherAssignment = {
      id: `teacher_${role}_${Date.now()}`,
      name: `أ. جديد (${defaultSubject} ${count})`,
      role,
      subjectName: defaultSubject,
      assignedGrades: defaultGrades,
      assignedGroups: unassignedGroupIds.length > 0 ? `${unassignedGroupIds.length} أفواج` : 'لا يوجد أفواج مسندة',
      assignedGroupIds: unassignedGroupIds,
    };
    const updated = [...localTeachers, newT];
    setLocalTeachers(updated);
    onUpdateTeachers(updated);
  };

  const handleUpdateTeacherField = (id: string, field: keyof TeacherAssignment, val: any) => {
    const updated = localTeachers.map((t) => (t.id === id ? { ...t, [field]: val } : t));
    setLocalTeachers(updated);
    onUpdateTeachers(updated);
  };

  const handleRemoveTeacher = (id: string, role: TeacherRole) => {
    const count = localTeachers.filter((t) => t.role === role).length;
    if (count <= 1) {
      alert('يجب الإبقاء على أستاذ متخصص واحد على الأقل لهذه المادة.');
      return;
    }
    const updated = localTeachers.filter((t) => t.id !== id);
    setLocalTeachers(updated);
    onUpdateTeachers(updated);
  };

  const toggleTeacherGrade = (teacherId: string, grade: GradeLevel) => {
    const updated = localTeachers.map((t) => {
      if (t.id !== teacherId) return t;
      const exists = t.assignedGrades.includes(grade);
      const newGrades = exists
        ? t.assignedGrades.filter((g) => g !== grade)
        : [...t.assignedGrades, grade];
      
      // Update assignedGroupIds to align with grade toggles
      const currentGroups = t.assignedGroupIds || [];
      const gradeGroups = localGroups.filter((g) => g.grade === grade).map((g) => g.id);
      let newGroupIds: string[];
      if (exists) {
        newGroupIds = currentGroups.filter((gid) => !gradeGroups.includes(gid));
      } else {
        newGroupIds = Array.from(new Set([...currentGroups, ...gradeGroups]));
      }

      return {
        ...t,
        assignedGrades: newGrades,
        assignedGroupIds: newGroupIds,
        assignedGroups: newGroupIds.length > 0 ? `${newGroupIds.length} أفواج` : 'لا يوجد أفواج مسندة',
      };
    });
    setLocalTeachers(updated);
    onUpdateTeachers(updated);
  };

  const toggleTeacherGroup = (teacherId: string, groupId: string, role: TeacherRole) => {
    const targetTeacher = localTeachers.find((t) => t.id === teacherId);
    if (!targetTeacher) return;

    const currentGroups = targetTeacher.assignedGroupIds || [];
    const isCurrentlyAssigned = currentGroups.includes(groupId);

    const updated = localTeachers.map((t) => {
      if (t.id === teacherId) {
        const newGroupIds = isCurrentlyAssigned
          ? currentGroups.filter((id) => id !== groupId)
          : [...currentGroups, groupId];
        return {
          ...t,
          assignedGroupIds: newGroupIds,
          assignedGroups: newGroupIds.length > 0 ? `${newGroupIds.length} أفواج` : 'لا يوجد أفواج مسندة',
        };
      }
      // When assigning groupId to teacherId, guarantee mutual exclusivity by removing it from any other teacher of the SAME role
      if (t.role === role && !isCurrentlyAssigned) {
        const otherGroups = t.assignedGroupIds || [];
        if (otherGroups.includes(groupId)) {
          const filtered = otherGroups.filter((id) => id !== groupId);
          return {
            ...t,
            assignedGroupIds: filtered,
            assignedGroups: filtered.length > 0 ? `${filtered.length} أفواج` : 'لا يوجد أفواج مسندة',
          };
        }
      }
      return t;
    });

    setLocalTeachers(updated);
    onUpdateTeachers(updated);
  };

  const assignAllGroupsToTeacher = (teacherId: string, groupIds: string[], role: TeacherRole) => {
    const updated = localTeachers.map((t) => {
      if (t.id === teacherId) {
        const current = t.assignedGroupIds || [];
        const merged = Array.from(new Set([...current, ...groupIds]));
        return {
          ...t,
          assignedGroupIds: merged,
          assignedGroups: `${merged.length} أفواج`,
        };
      }
      // Remove these groups from other teachers of the same role
      if (t.role === role) {
        const remaining = (t.assignedGroupIds || []).filter((id) => !groupIds.includes(id));
        return {
          ...t,
          assignedGroupIds: remaining,
          assignedGroups: remaining.length > 0 ? `${remaining.length} أفواج` : 'لا يوجد أفواج مسندة',
        };
      }
      return t;
    });
    setLocalTeachers(updated);
    onUpdateTeachers(updated);
  };

  const clearTeacherGroups = (teacherId: string) => {
    const updated = localTeachers.map((t) => {
      if (t.id !== teacherId) return t;
      return { ...t, assignedGroupIds: [], assignedGroups: 'لا يوجد أفواج مسندة' };
    });
    setLocalTeachers(updated);
    onUpdateTeachers(updated);
  };

  // Automatically distribute all eligible groups equally among all teachers of this role
  const autoDistributeGroupsForRole = (role: TeacherRole) => {
    const roleTeachers = localTeachers.filter((t) => t.role === role);
    if (roleTeachers.length <= 1) return;

    // Collect all unique groups that match any teacher's assigned grades for this role
    const eligibleGroups = localGroups.filter((g) =>
      roleTeachers.some((t) => t.assignedGrades.includes(g.grade))
    );

    const distribution: Record<string, string[]> = {};
    roleTeachers.forEach((t) => {
      distribution[t.id] = [];
    });

    // Round-robin distribution
    eligibleGroups.forEach((grp, idx) => {
      // Find candidate teachers who support this grade
      const candidates = roleTeachers.filter((t) => t.assignedGrades.includes(grp.grade));
      const targetTeacher = candidates.length > 0
        ? [...candidates].sort((a, b) => distribution[a.id].length - distribution[b.id].length)[0]
        : roleTeachers[idx % roleTeachers.length];

      distribution[targetTeacher.id].push(grp.id);
    });

    const updated = localTeachers.map((t) => {
      if (t.role !== role) return t;
      const assigned = distribution[t.id] || [];
      return {
        ...t,
        assignedGroupIds: assigned,
        assignedGroups: assigned.length > 0 ? `${assigned.length} أفواج` : 'لا يوجد أفواج مسندة',
      };
    });

    setLocalTeachers(updated);
    onUpdateTeachers(updated);
  };

  const calculateTeacherHours = (t: TeacherAssignment): number => {
    const roleTeachers = localTeachers.filter((item) => item.role === t.role);
    let assigned: ClassGroup[] = [];

    // If multiple teachers exist for this role, rely strictly on assignedGroupIds
    if (roleTeachers.length > 1) {
      const gids = t.assignedGroupIds || [];
      assigned = localGroups.filter((g) => gids.includes(g.id));
    } else {
      assigned = localGroups.filter((g) => {
        if (t.assignedGroupIds && t.assignedGroupIds.length > 0) {
          return t.assignedGroupIds.includes(g.id);
        }
        return t.assignedGrades.includes(g.grade);
      });
    }

    if (t.role === 'pe_teacher') {
      return assigned.reduce((sum, g) => sum + (['4AP', '5AP'].includes(g.grade) ? 1.5 : 2.0), 0);
    }
    if (t.role === 'french_teacher' || t.role === 'english_teacher') {
      return assigned.length * 2.0;
    }
    if (t.role === 'amazigh_teacher') {
      return assigned.length * 3.0;
    }
    return assigned.length * 21.0;
  };

  const renderSpecialistTeacherCard = (
    t: TeacherAssignment,
    role: TeacherRole,
    colorScheme: {
      bg: string;
      border: string;
      badgeActive: string;
    },
    availableGrades: GradeLevel[]
  ) => {
    const eligibleGroups = localGroups.filter((g) => t.assignedGrades.includes(g.grade));
    const currentAssignedGroupIds = t.assignedGroupIds || [];
    const weeklyHours = calculateTeacherHours(t);
    const sameRoleTeachers = localTeachers.filter((item) => item.role === role);
    const hasMultipleTeachers = sameRoleTeachers.length > 1;

    return (
      <div key={t.id} className={`p-3.5 ${colorScheme.bg} rounded-xl border ${colorScheme.border} space-y-2.5 shadow-2xs`}>
        <div className="flex items-center justify-between gap-2">
          <input
            type="text"
            value={t.name}
            onChange={(e) => handleUpdateTeacherField(t.id, 'name', e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-xs"
            placeholder="اسم الأستاذ"
          />
          {hasMultipleTeachers && (
            <button
              type="button"
              onClick={() => handleRemoveTeacher(t.id, role)}
              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
              title="حذف الأستاذ"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Assigned Grades */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-700 flex-wrap">
          <span className="font-bold">المستويات المؤطرة:</span>
          {availableGrades.map((grade) => {
            const isAssigned = t.assignedGrades.includes(grade);
            return (
              <button
                key={grade}
                type="button"
                onClick={() => toggleTeacherGrade(t.id, grade)}
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                  isAssigned ? `${colorScheme.badgeActive} text-white shadow-2xs` : 'bg-white text-slate-500 border border-slate-200'
                }`}
              >
                {grade}
              </button>
            );
          })}
        </div>

        {/* Assigned Groups (خاصية الأفواج المسندة بدقة وحصرية) */}
        <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-600" />
              <span>الأفواج المسندة ({currentAssignedGroupIds.length} فوج):</span>
            </span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => assignAllGroupsToTeacher(t.id, eligibleGroups.map((g) => g.id), role)}
                className="text-slate-700 hover:text-slate-900 font-bold hover:underline cursor-pointer"
              >
                إسناد الكل
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => clearTeacherGroups(t.id)}
                className="text-slate-500 hover:text-rose-600 font-bold hover:underline cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {eligibleGroups.map((grp) => {
              const isAssignedToThis = currentAssignedGroupIds.includes(grp.id);
              const otherTeacher = sameRoleTeachers.find(
                (other) => other.id !== t.id && (other.assignedGroupIds || []).includes(grp.id)
              );

              return (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => toggleTeacherGroup(t.id, grp.id, role)}
                  title={
                    isAssignedToThis
                      ? 'مسند لهذا الأستاذ (انقر لإلغاء الإسناد)'
                      : otherTeacher
                      ? `مسند حالياً إلى: ${otherTeacher.name} (انقر لنقله إلى هذا الأستاذ)`
                      : 'غير مسند (انقر لإسناده لهذا الأستاذ)'
                  }
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isAssignedToThis
                      ? `${colorScheme.badgeActive} text-white shadow-2xs`
                      : otherTeacher
                      ? 'bg-slate-100 text-slate-500 border border-dashed border-slate-300 hover:border-slate-400 hover:bg-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {isAssignedToThis ? (
                    <Check className="w-3 h-3 shrink-0" />
                  ) : otherTeacher ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0" />
                  ) : null}
                  <span>{grp.displayName || `${grp.grade} (${grp.groupLabel})`}</span>
                  {otherTeacher && (
                    <span className="text-[9px] font-normal text-slate-400 max-w-[70px] truncate">
                      ({otherTeacher.name.split(' ')[0]})
                    </span>
                  )}
                </button>
              );
            })}
            {eligibleGroups.length === 0 && (
              <p className="text-[11px] text-slate-400 italic">يرجى تحديد مستوى واحد على الأقل أولاً.</p>
            )}
          </div>

          {/* Weekly hours summary */}
          <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1">
            <span className="flex items-center gap-1">
              <span>الحجم الساعي الأسبوعي:</span>
              <span className="font-extrabold text-slate-900 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                {weeklyHours} سا أسبوعياً
              </span>
            </span>
            {hasMultipleTeachers && currentAssignedGroupIds.length === 0 && (
              <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[9px]">
                لم تسند له أفواج
              </span>
            )}
            {currentAssignedGroupIds.length > 0 && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[9px]">
                {currentAssignedGroupIds.length} أفواج مسندة
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchoolInfo(localInfo);
    onUpdateClassGroups(localGroups);
    onUpdateTeachers(localTeachers);
    onGenerate();
  };

  // Filter teachers by role
  const frenchTeachers = localTeachers.filter((t) => t.role === 'french_teacher');
  const englishTeachers = localTeachers.filter((t) => t.role === 'english_teacher');
  const peTeachers = localTeachers.filter((t) => t.role === 'pe_teacher');
  const amazighTeachers = localTeachers.filter((t) => t.role === 'amazigh_teacher');

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-8 animate-fadeIn text-right font-['Cairo',sans-serif]">
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-500">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 cursor-pointer"
        >
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]">✓</span>
          <span>1. نوع الدوام</span>
        </button>
        <span className="text-slate-300">—</span>
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
          <span>2. صفحة الإسناد وتأطير الأفواج</span>
        </div>
        <span className="text-slate-300">—</span>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px]">3</span>
          <span>3. توليد جدول المواقيت</span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: School Information */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                1. البيانات الإدارية للمؤسسة وهيئة الإشراف
              </h2>
              <p className="text-xs text-slate-500">
                تظهر هذه المعلومات في الترويسة الرسمية لجداول التوقيت المطبوعة (A4)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                اسم المدرسة الابتدائية:
              </label>
              <input
                type="text"
                required
                value={localInfo.schoolName}
                onChange={(e) => handleInfoChange('schoolName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                placeholder="مثال: مدرسة الشهيد العربي بن مهيدي"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                مديرية التربية لولاية:
              </label>
              <input
                type="text"
                required
                value={localInfo.wilaya}
                onChange={(e) => handleInfoChange('wilaya', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                placeholder="مثال: الجزائر وسط، سطيف، وهران..."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                مفتشية التعليم الابتدائي (المقاطعة):
              </label>
              <input
                type="text"
                required
                value={localInfo.dairaOrInspection}
                onChange={(e) => handleInfoChange('dairaOrInspection', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                placeholder="مثال: المقاطعة التفتيشية 03"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                السنة الدراسية:
              </label>
              <input
                type="text"
                required
                value={localInfo.academicYear}
                onChange={(e) => handleInfoChange('academicYear', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono font-medium"
                placeholder="2025 / 2026"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                اسم مدير(ة) المدرسة الابتدائية:
              </label>
              <input
                type="text"
                value={localInfo.directorName}
                onChange={(e) => handleInfoChange('directorName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                placeholder="للتوقيع والختم الرسمي"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                اسم مفتش(ة) المقاطعة التفتيشية:
              </label>
              <input
                type="text"
                value={localInfo.inspectorName}
                onChange={(e) => handleInfoChange('inspectorName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                placeholder="للمصادقة والتأشيرة البيداغوجية"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Class Groups & Arabic Teachers (أستاذ لغة عربية لكل فوج) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  2. هيكلة الأفواج التربوية وإسناد أستاذ اللغة العربية لكل فوج
                </h2>
                <p className="text-xs text-slate-500">
                  فوج واحد أو أكثر لكل مستوى، مع إسناد أستاذ لغة عربية مخصص لكل فوج تربوي
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {ALL_GRADES.map((g) => {
              const gradeGroups = localGroups.filter((grp) => grp.grade === g.id);

              return (
                <div
                  key={g.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {g.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        ({gradeGroups.length} {gradeGroups.length === 1 ? 'فوج تربوي' : 'أفواج تربوية'})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddGroupToGrade(g.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                      title="إضافة فوج ثانٍ أو ثالث لهذا المستوى"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة فوج آخر لهذا المستوى</span>
                    </button>
                  </div>

                  {/* Groups list for this grade */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {gradeGroups.map((group) => (
                      <div
                        key={group.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-800 text-xs">
                            {group.groupLabel}
                          </span>
                          {gradeGroups.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveGroup(group.id, g.id)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                              title="حذف هذا الفوج"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            اسم أستاذ(ة) اللغة العربية للفوج:
                          </label>
                          <input
                            type="text"
                            required
                            value={group.arabicTeacherName}
                            onChange={(e) =>
                              handleGroupArabicTeacherChange(group.id, e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:ring-1 focus:ring-emerald-500 text-xs font-medium"
                            placeholder="اسم أستاذ اللغة العربية ومواد عامة"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Specialized Teachers (لغات أجنبية، تربية بدنية، أمازيغية) */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-100 text-teal-800">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  3. إسناد أساتذة المواد المتخصصة (أستاذ أو أكثر)
                </h2>
                <p className="text-xs text-slate-500">
                  أساتذة اللغات الأجنبية (فرنسية، إنجليزية)، والتربية البدنية والرياضية، والأمازيغية
                </p>
              </div>
            </div>
          </div>

          {/* French Teachers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>أساتذة اللغة الفرنسية (4AP و 5AP):</span>
              </h4>
              <div className="flex items-center gap-2">
                {frenchTeachers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => autoDistributeGroupsForRole('french_teacher')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-800 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors cursor-pointer"
                    title="توزيع الأفواج المعنية بالتساوي بين أساتذة الفرنسية"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>توزيع الأفواج بالتساوي</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAddSpecialistTeacher('french_teacher', 'لغة فرنسية', ['4AP', '5AP'])}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة أستاذ لغة فرنسية آخر</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {frenchTeachers.map((t) =>
                renderSpecialistTeacherCard(
                  t,
                  'french_teacher',
                  {
                    bg: 'bg-blue-50/40',
                    border: 'border-blue-200',
                    badgeActive: 'bg-blue-600',
                  },
                  ['4AP', '5AP']
                )
              )}
            </div>
          </div>

          {/* English Teachers */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>أساتذة اللغة الإنجليزية (3AP و 4AP و 5AP):</span>
              </h4>
              <div className="flex items-center gap-2">
                {englishTeachers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => autoDistributeGroupsForRole('english_teacher')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-800 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors cursor-pointer"
                    title="توزيع الأفواج المعنية بالتساوي بين أساتذة الإنجليزية"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>توزيع الأفواج بالتساوي</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAddSpecialistTeacher('english_teacher', 'لغة إنجليزية', ['3AP', '4AP', '5AP'])}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة أستاذ لغة إنجليزية آخر</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {englishTeachers.map((t) =>
                renderSpecialistTeacherCard(
                  t,
                  'english_teacher',
                  {
                    bg: 'bg-indigo-50/40',
                    border: 'border-indigo-200',
                    badgeActive: 'bg-indigo-600',
                  },
                  ['3AP', '4AP', '5AP']
                )
              )}
            </div>
          </div>

          {/* PE Teachers */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>أساتذة التربية البدنية والرياضية (جميع المستويات):</span>
              </h4>
              <div className="flex items-center gap-2">
                {peTeachers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => autoDistributeGroupsForRole('pe_teacher')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                    title="توزيع الأفواج المعنية بالتساوي بين أساتذة التربية البدنية"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>توزيع الأفواج بالتساوي</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAddSpecialistTeacher('pe_teacher', 'تربية بدنية ورياضية', ['1AP', '2AP', '3AP', '4AP', '5AP'])}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة أستاذ تربية بدنية آخر</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {peTeachers.map((t) =>
                renderSpecialistTeacherCard(
                  t,
                  'pe_teacher',
                  {
                    bg: 'bg-emerald-50/40',
                    border: 'border-emerald-200',
                    badgeActive: 'bg-emerald-600',
                  },
                  ['1AP', '2AP', '3AP', '4AP', '5AP']
                )
              )}
            </div>
          </div>

          {/* Amazigh Teachers (only if Amazigh is active) */}
          {hasAmazigh && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-lime-600"></span>
                  <span>أساتذة اللغة الأمازيغية (4AP و 5AP):</span>
                </h4>
                <div className="flex items-center gap-2">
                  {amazighTeachers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => autoDistributeGroupsForRole('amazigh_teacher')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-lime-800 bg-lime-100 hover:bg-lime-200 rounded-lg transition-colors cursor-pointer"
                      title="توزيع الأفواج المعنية بالتساوي بين أساتذة الأمازيغية"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>توزيع الأفواج بالتساوي</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAddSpecialistTeacher('amazigh_teacher', 'لغة أمازيغية', ['4AP', '5AP'])}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-lime-700 bg-lime-50 hover:bg-lime-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة أستاذ لغة أمازيغية آخر</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {amazighTeachers.map((t) =>
                  renderSpecialistTeacherCard(
                    t,
                    'amazigh_teacher',
                    {
                      bg: 'bg-lime-50/40',
                      border: 'border-lime-200',
                      badgeActive: 'bg-lime-700',
                    },
                    ['4AP', '5AP']
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة لاختيار نوع الدوام</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-extrabold rounded-xl shadow-md shadow-emerald-700/20 transition-all hover:gap-3 cursor-pointer"
          >
            <span>توليد وبناء جداول المواقيت الأسبوعية</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
