import React, { useState, useMemo } from 'react';
import { 
  X, 
  UserCheck, 
  Clock, 
  Printer, 
  BookOpen, 
  Users, 
  FileText,
  Sparkles,
  Layers
} from 'lucide-react';
import { 
  TeacherRole, 
  Timetable, 
  TimeSlot, 
  DayOfWeek, 
  TeacherAssignment, 
  SchoolInfo, 
  ClassGroup, 
  GradeLevel 
} from '../types';
import { DAYS_CONFIG } from '../data/defaultTimetables';
import { getSubjectColorConfig } from '../data/officialCurriculum';
import { getCleanGradeName, getCleanSlotTitle } from '../utils/slotFormatter';

interface TeachersScheduleViewProps {
  isOpen: boolean;
  onClose: () => void;
  timetable?: Timetable;
  allTimetables?: Timetable[];
  teachers?: TeacherAssignment[];
  schoolInfo?: SchoolInfo;
  classGroups?: ClassGroup[];
}

export interface ConsolidatedTeacher {
  id: string;
  name: string;
  role: TeacherRole;
  roleTitle: string;
  subjectName: string;
  assignedGroupsList: string[];
  totalMinutes: number;
  totalHours: number;
  totalSessions: number;
  slots: {
    id: string;
    day: DayOfWeek;
    period: 'morning' | 'afternoon';
    startTime: string;
    endTime: string;
    durationMinutes: number;
    subjectId: string;
    activityName?: string;
    cleanTitle: string;
    grade: GradeLevel;
    classGroup: string;
    fullGroupLabel: string;
  }[];
  groupBreakdown: {
    groupLabel: string;
    grade: GradeLevel;
    sessions: number;
    hours: number;
  }[];
}

export const TeachersScheduleView: React.FC<TeachersScheduleViewProps> = ({
  isOpen,
  onClose,
  timetable,
  allTimetables = [],
  teachers = [],
  schoolInfo,
  classGroups = [],
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [printMode, setPrintMode] = useState<'single' | 'all'>('single');

  // Build the list of all consolidated teachers across the school
  const consolidatedTeachers = useMemo<ConsolidatedTeacher[]>(() => {
    // If allTimetables is empty, fallback to [timetable]
    const effectiveTimetables = allTimetables.length > 0 
      ? allTimetables 
      : (timetable ? [timetable] : []);

    const roleTitles: Record<TeacherRole, string> = {
      arabic_teacher: 'معلم(ة) اللغة العربية والمواد العامة',
      french_teacher: 'أستاذ(ة) مادة اللغة الفرنسية',
      english_teacher: 'أستاذ(ة) مادة اللغة الإنجليزية',
      pe_teacher: 'أستاذ(ة) التربية البدنية والرياضية',
      amazigh_teacher: 'أستاذ(ة) اللغة الأمازيغية',
    };

    const roleSubjects: Record<TeacherRole, string> = {
      arabic_teacher: 'اللغة العربية والرياضيات والمواد العامة',
      french_teacher: 'اللغة الفرنسية',
      english_teacher: 'اللغة الإنجليزية',
      pe_teacher: 'التربية البدنية والرياضية',
      amazigh_teacher: 'اللغة الأمازيغية',
    };

    const teachersMap = new Map<string, ConsolidatedTeacher>();

    // 1. First add configured teachers from props
    teachers.forEach((t) => {
      teachersMap.set(t.id, {
        id: t.id,
        name: t.name,
        role: t.role,
        roleTitle: roleTitles[t.role] || t.subjectName,
        subjectName: t.subjectName || roleSubjects[t.role],
        assignedGroupsList: [],
        totalMinutes: 0,
        totalHours: 0,
        totalSessions: 0,
        slots: [],
        groupBreakdown: [],
      });
    });

    // 2. Also ensure every specialist role has at least one teacher representation
    const specialistRoles: TeacherRole[] = ['french_teacher', 'english_teacher', 'pe_teacher'];
    if (effectiveTimetables.some((tt) => tt.hasAmazigh)) {
      specialistRoles.push('amazigh_teacher');
    }

    specialistRoles.forEach((role) => {
      const exists = Array.from(teachersMap.values()).some((t) => t.role === role);
      if (!exists) {
        let defName = '';
        if (role === 'french_teacher') defName = effectiveTimetables[0]?.frenchTeacherName || 'أستاذ اللغة الفرنسية';
        else if (role === 'english_teacher') defName = effectiveTimetables[0]?.englishTeacherName || 'أستاذ اللغة الإنجليزية';
        else if (role === 'pe_teacher') defName = effectiveTimetables[0]?.peTeacherName || 'أستاذ التربية البدنية';
        else if (role === 'amazigh_teacher') defName = effectiveTimetables[0]?.amazighTeacherName || 'أستاذ اللغة الأمازيغية';

        const syntheticId = `spec_${role}`;
        teachersMap.set(syntheticId, {
          id: syntheticId,
          name: defName,
          role,
          roleTitle: roleTitles[role],
          subjectName: roleSubjects[role],
          assignedGroupsList: [],
          totalMinutes: 0,
          totalHours: 0,
          totalSessions: 0,
          slots: [],
          groupBreakdown: [],
        });
      }
    });

    // 3. Also ensure class teachers for Arabic are present for each class group
    effectiveTimetables.forEach((tt) => {
      const arabicName = tt.arabicTeacherName || `معلم ${getCleanGradeName(tt.grade)} (${tt.classGroup || 'فوج 1'})`;
      const arabicId = `arabic_${tt.grade}_${tt.classGroup || '1'}`;
      
      const alreadyHasArabicForThis = Array.from(teachersMap.values()).some(
        (t) => t.role === 'arabic_teacher' && (t.name === arabicName || t.id === arabicId)
      );

      if (!alreadyHasArabicForThis) {
        teachersMap.set(arabicId, {
          id: arabicId,
          name: arabicName,
          role: 'arabic_teacher',
          roleTitle: roleTitles['arabic_teacher'],
          subjectName: roleSubjects['arabic_teacher'],
          assignedGroupsList: [],
          totalMinutes: 0,
          totalHours: 0,
          totalSessions: 0,
          slots: [],
          groupBreakdown: [],
        });
      }
    });

    // 4. Now, harvest all slots across ALL class groups/timetables for each teacher
    effectiveTimetables.forEach((tt) => {
      const fullLabel = `${getCleanGradeName(tt.grade)} — ${tt.classGroup || 'فوج 1'}`;

      tt.slots.forEach((slot) => {
        if (slot.isRecess || slot.subjectId === 'recess' || slot.subjectId === 'free') {
          return;
        }

        // Match to teacher
        for (const [tId, teacherObj] of teachersMap.entries()) {
          let isMatch = false;

          if (teacherObj.role === 'arabic_teacher') {
            // Arabic teacher matches if name matches or if assigned to this grade
            if (slot.teacherRole === 'arabic_teacher') {
              if (slot.teacherName && slot.teacherName === teacherObj.name) {
                isMatch = true;
              } else if (tt.arabicTeacherName === teacherObj.name) {
                isMatch = true;
              } else if (tId === `arabic_${tt.grade}_${tt.classGroup || '1'}`) {
                isMatch = true;
              }
            }
          } else {
            // Specialist teachers teach across multiple groups
            if (slot.teacherRole === teacherObj.role) {
              const allOfThisRole = Array.from(teachersMap.values()).filter((t) => t.role === teacherObj.role);

              if (slot.teacherName && slot.teacherName === teacherObj.name) {
                isMatch = true;
              } else if (
                (slot.teacherRole === 'french_teacher' && tt.frenchTeacherName === teacherObj.name) ||
                (slot.teacherRole === 'english_teacher' && tt.englishTeacherName === teacherObj.name) ||
                (slot.teacherRole === 'pe_teacher' && tt.peTeacherName === teacherObj.name) ||
                (slot.teacherRole === 'amazigh_teacher' && tt.amazighTeacherName === teacherObj.name)
              ) {
                isMatch = true;
              } else {
                // Check if teacher config explicitly has this group assigned
                const origTeacher = teachers.find((t) => t.id === tId);
                const timetableGroupId = tt.id.replace('timetable_', '');
                if (origTeacher?.assignedGroupIds && origTeacher.assignedGroupIds.includes(timetableGroupId)) {
                  isMatch = true;
                } else if (allOfThisRole.length === 1) {
                  // Fallback ONLY when there is exactly ONE teacher for this subject in the school
                  isMatch = true;
                }
              }
            }
          }

          if (isMatch) {
            const cleanTitle = getCleanSlotTitle(slot);

            teacherObj.slots.push({
              id: `${tt.id}_${slot.id}`,
              day: slot.day,
              period: slot.period,
              startTime: slot.startTime,
              endTime: slot.endTime,
              durationMinutes: slot.durationMinutes,
              subjectId: slot.subjectId,
              activityName: slot.activityName,
              cleanTitle,
              grade: tt.grade,
              classGroup: tt.classGroup || 'فوج 1',
              fullGroupLabel: fullLabel,
            });

            if (!teacherObj.assignedGroupsList.includes(fullLabel)) {
              teacherObj.assignedGroupsList.push(fullLabel);
            }
            break;
          }
        }
      });
    });

    // 5. Calculate statistics and breakdown for each teacher
    teachersMap.forEach((teacherObj) => {
      // Sort slots chronologically within each day
      teacherObj.slots.sort((a, b) => a.startTime.localeCompare(b.startTime));

      teacherObj.totalMinutes = teacherObj.slots.reduce((acc, s) => acc + s.durationMinutes, 0);
      teacherObj.totalHours = parseFloat((teacherObj.totalMinutes / 60).toFixed(1));
      teacherObj.totalSessions = teacherObj.slots.length;

      // Group breakdown
      const breakdownMap = new Map<string, { grade: GradeLevel; sessions: number; minutes: number }>();
      teacherObj.slots.forEach((s) => {
        const existing = breakdownMap.get(s.fullGroupLabel) || { grade: s.grade, sessions: 0, minutes: 0 };
        existing.sessions += 1;
        existing.minutes += s.durationMinutes;
        breakdownMap.set(s.fullGroupLabel, existing);
      });

      teacherObj.groupBreakdown = Array.from(breakdownMap.entries()).map(([label, data]) => ({
        groupLabel: label,
        grade: data.grade,
        sessions: data.sessions,
        hours: parseFloat((data.minutes / 60).toFixed(1)),
      }));
    });

    // Return all teachers who have slots or configured
    return Array.from(teachersMap.values()).filter(
      (t) => t.slots.length > 0 || t.role !== 'arabic_teacher'
    );
  }, [allTimetables, timetable, teachers]);

  // Set initial selected teacher
  React.useEffect(() => {
    if (consolidatedTeachers.length > 0 && !selectedTeacherId) {
      // Prefer French teacher or first teacher
      const pref = consolidatedTeachers.find((t) => t.role === 'french_teacher') || consolidatedTeachers[0];
      setSelectedTeacherId(pref.id);
    }
  }, [consolidatedTeachers, selectedTeacherId]);

  if (!isOpen) return null;

  const currentTeacher = consolidatedTeachers.find((t) => t.id === selectedTeacherId) || consolidatedTeachers[0];

  const handlePrintSingle = () => {
    setPrintMode('single');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintAll = () => {
    setPrintMode('all');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const formatHoursArabic = (hours: number): string => {
    const whole = Math.floor(hours);
    const mins = Math.round((hours - whole) * 60);
    if (whole === 0 && mins > 0) return `${mins} دقيقة`;
    if (whole > 0 && mins === 0) return `${whole} سا`;
    if (whole > 0 && mins > 0) return `${whole} سا و ${mins} د`;
    return '0 سا';
  };

  // Render teacher consolidated sheet
  const renderTeacherScheduleSheet = (teacher: ConsolidatedTeacher, isAllMode: boolean = false) => {
    // Group slots by day
    const daySchedules = DAYS_CONFIG.map((day) => {
      const daySlots = teacher.slots.filter((s) => s.day === day.id);
      return {
        ...day,
        slots: daySlots,
      };
    });

    return (
      <div 
        key={teacher.id}
        className={`bg-white text-slate-900 font-['Cairo',sans-serif] text-right p-4 sm:p-6 print:p-0 ${
          isAllMode ? 'print:break-after-page mb-10 print:mb-0' : ''
        }`}
      >
        {/* Official Header */}
        <div className="border-b-2 border-slate-800 pb-3 mb-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
            <div>
              <p className="font-['Amiri',serif] font-bold text-xs sm:text-sm">الجمهورية الجزائرية الديمقراطية الشعبية</p>
              <p className="font-['Amiri',serif] font-bold text-xs sm:text-sm">وزارة التربية الوطنية</p>
              <p className="text-slate-600 mt-0.5">
                مديرية التربية لولاية: <span className="text-slate-900 font-extrabold">{schoolInfo?.wilaya || '...................'}</span>
              </p>
              <p className="text-slate-600">
                مفتشية التعليم الابتدائي: <span className="text-slate-900 font-extrabold">{schoolInfo?.dairaOrInspection || '...................'}</span>
              </p>
            </div>

            {/* Emblem / Title Badge */}
            <div className="text-center px-4">
              <div className="w-10 h-10 mx-auto mb-1 rounded-full border-2 border-slate-800 flex items-center justify-center font-serif font-black text-slate-800 bg-slate-50">
                ★
              </div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 font-['Amiri',serif] border-y-2 border-slate-800 py-0.5 px-4 bg-slate-100">
                جدول الخدمة الأسبوعي للأستاذ(ة)
              </h2>
              <p className="text-[10px] font-extrabold text-emerald-800 mt-0.5">
                (التوزيع الزمني لكافة الأفواج التربوية المسندة في وثيقة واحدة)
              </p>
            </div>

            <div className="text-left">
              <p className="text-slate-600">
                المدرسة الابتدائية: <span className="text-slate-900 font-extrabold">{schoolInfo?.schoolName || '...................'}</span>
              </p>
              <p className="text-slate-600 mt-0.5">
                بلدية: <span className="text-slate-900 font-extrabold">{schoolInfo?.commune || '...................'}</span>
              </p>
              <p className="text-slate-600 mt-0.5">
                السنة الدراسية: <span className="text-slate-900 font-mono font-extrabold">{schoolInfo?.academicYear || '2026-2027'}</span>
              </p>
            </div>
          </div>

          {/* Teacher Info Card Banner */}
          {(() => {
            const teacherTheme = getSubjectColorConfig(teacher.role);
            return (
              <div 
                style={{
                  backgroundColor: teacherTheme.lightHex,
                  borderColor: teacherTheme.borderHex,
                }}
                className="mt-3 p-2.5 rounded-lg border-2 flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-800">اسم الأستاذ(ة):</span>
                  <span className="font-black text-sm text-slate-950 bg-white px-2.5 py-0.5 rounded border border-slate-300">
                    {teacher.name}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="font-extrabold text-slate-800">الصفة والمادة:</span>
                  <span 
                    style={{
                      backgroundColor: teacherTheme.hex,
                      color: '#ffffff',
                    }}
                    className="font-extrabold px-2 py-0.5 rounded-md text-[11px] shadow-2xs"
                  >
                    {teacher.roleTitle}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-bold text-slate-800">
                  <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-300">
                    <Clock className="w-3.5 h-3.5 text-slate-700" />
                    <span>الحجم الساعي الأسبوعي: <strong className="font-mono text-slate-900">{formatHoursArabic(teacher.totalHours)}</strong></span>
                  </div>
                  <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-300">
                    <BookOpen className="w-3.5 h-3.5 text-slate-700" />
                    <span>مجموع الحصص: <strong className="font-mono text-slate-900">{teacher.totalSessions} حصة</strong></span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* All Assigned Groups Bar */}
          <div className="mt-2 p-2 rounded-md bg-slate-100 border border-slate-300 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-700 shrink-0" />
              <span className="font-extrabold text-slate-900">الأفواج التربوية المسندة في هذا الجدول:</span>
              <div className="flex flex-wrap gap-1.5 items-center">
                {teacher.assignedGroupsList.map((grp, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-0.5 rounded bg-white text-slate-900 border border-slate-400 font-extrabold text-[11px] shadow-2xs"
                  >
                    {grp}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-bold shrink-0">
              مجموع الأفواج: {teacher.assignedGroupsList.length}
            </span>
          </div>
        </div>

        {/* Master Weekly Timetable Grid across ALL Assigned Groups */}
        <div className="border-2 border-slate-800 rounded-md overflow-hidden shadow-2xs mb-4">
          <table className="w-full border-collapse text-center text-xs">
            <thead>
              <tr className="bg-slate-800 text-white font-extrabold border-b-2 border-slate-800">
                <th className="p-2 border-l-2 border-slate-700 w-24 bg-slate-900">اليوم</th>
                <th className="p-2 border-l-2 border-slate-700 bg-slate-800">الفترة الصباحية الأولى</th>
                <th className="p-1 border-l-2 border-slate-700 w-8 bg-emerald-700 text-[10px]">استراحة</th>
                <th className="p-2 border-l-2 border-slate-700 bg-slate-800">الفترة الصباحية الثانية</th>
                <th className="p-1 border-l-2 border-slate-700 w-8 bg-amber-700 text-[10px]">مطعم / راحة</th>
                <th className="p-2 bg-slate-800">الفترة المسائية (بعد الزوال)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-800 font-semibold">
              {daySchedules.map((day) => {
                const morningSlots = day.slots.filter((s) => s.period === 'morning');
                const morningPre = morningSlots.filter((s) => s.startTime < '09:35');
                const morningPost = morningSlots.filter((s) => s.startTime >= '09:35');
                const afternoonSlots = day.slots.filter((s) => s.period === 'afternoon');

                const isTuesday = day.id === 'tuesday';

                return (
                  <tr key={day.id} className="min-h-[55px]">
                    {/* Day Column */}
                    <td className="p-2 border-l-2 border-slate-800 bg-slate-100 font-black text-slate-900 text-sm">
                      {day.arabicName}
                    </td>

                      {/* Morning Block 1 */}
                    <td className="p-1.5 border-l-2 border-slate-800 align-middle min-h-[55px]">
                      {morningPre.length === 0 ? (
                        <div className="text-[10px] text-slate-400 font-bold py-2">
                          —
                        </div>
                      ) : (
                        <div className="flex flex-row flex-nowrap items-stretch gap-1 w-full h-full">
                          {morningPre.map((slot) => {
                            const colorTheme = getSubjectColorConfig(slot.subjectId || teacher.role);
                            return (
                              <div
                                key={slot.id}
                                style={{
                                  backgroundColor: colorTheme.lightHex,
                                  borderColor: colorTheme.borderHex,
                                  borderTopColor: colorTheme.hex,
                                  borderTopWidth: '3.5px',
                                }}
                                className="flex-1 min-w-0 p-1 rounded-lg border-2 flex flex-col justify-center items-center text-center shadow-2xs transition-all"
                              >
                                <span 
                                  style={{ backgroundColor: colorTheme.badgeHex }}
                                  className="px-1.5 py-0.5 rounded text-white font-black text-[10px] mb-0.5 truncate max-w-full shadow-2xs"
                                >
                                  {slot.fullGroupLabel}
                                </span>
                                <span 
                                  style={{ color: colorTheme.textHex }}
                                  className="font-black text-[11px] leading-tight truncate max-w-full"
                                >
                                  {slot.cleanTitle}
                                </span>
                                <span className="font-mono text-[9px] text-slate-700 font-bold mt-0.5">
                                  {slot.startTime} - {slot.endTime} ({slot.durationMinutes}د)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Morning Recess */}
                    <td className="bg-emerald-300 border-l-2 border-slate-800"></td>

                    {/* Morning Block 2 */}
                    <td className="p-1.5 border-l-2 border-slate-800 align-middle min-h-[55px]">
                      {morningPost.length === 0 ? (
                        <div className="text-[10px] text-slate-400 font-bold py-2">
                          —
                        </div>
                      ) : (
                        <div className="flex flex-row flex-nowrap items-stretch gap-1 w-full h-full">
                          {morningPost.map((slot) => {
                            const colorTheme = getSubjectColorConfig(slot.subjectId || teacher.role);
                            return (
                              <div
                                key={slot.id}
                                style={{
                                  backgroundColor: colorTheme.lightHex,
                                  borderColor: colorTheme.borderHex,
                                  borderTopColor: colorTheme.hex,
                                  borderTopWidth: '3.5px',
                                }}
                                className="flex-1 min-w-0 p-1 rounded-lg border-2 flex flex-col justify-center items-center text-center shadow-2xs transition-all"
                              >
                                <span 
                                  style={{ backgroundColor: colorTheme.badgeHex }}
                                  className="px-1.5 py-0.5 rounded text-white font-black text-[10px] mb-0.5 truncate max-w-full shadow-2xs"
                                >
                                  {slot.fullGroupLabel}
                                </span>
                                <span 
                                  style={{ color: colorTheme.textHex }}
                                  className="font-black text-[11px] leading-tight truncate max-w-full"
                                >
                                  {slot.cleanTitle}
                                </span>
                                <span className="font-mono text-[9px] text-slate-700 font-bold mt-0.5">
                                  {slot.startTime} - {slot.endTime} ({slot.durationMinutes}د)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Lunch Break */}
                    <td className="bg-amber-300 border-l-2 border-slate-800"></td>

                    {/* Afternoon Block */}
                    <td className="p-1.5 align-middle min-h-[55px]">
                      {isTuesday ? (
                        <div className="p-2 rounded bg-slate-100 text-slate-600 text-[10px] font-bold text-center">
                          فترة التنسيق البيداغوجي والندوات التربوية (راحة رسمية)
                        </div>
                      ) : afternoonSlots.length === 0 ? (
                        <div className="text-[10px] text-slate-400 font-bold py-2 text-center">
                          —
                        </div>
                      ) : (
                        <div className="flex flex-row flex-nowrap items-stretch gap-1 w-full h-full">
                          {afternoonSlots.map((slot) => {
                            const colorTheme = getSubjectColorConfig(slot.subjectId || teacher.role);
                            return (
                              <div
                                key={slot.id}
                                style={{
                                  backgroundColor: colorTheme.lightHex,
                                  borderColor: colorTheme.borderHex,
                                  borderTopColor: colorTheme.hex,
                                  borderTopWidth: '3.5px',
                                }}
                                className="flex-1 min-w-0 p-1 rounded-lg border-2 flex flex-col justify-center items-center text-center shadow-2xs transition-all"
                              >
                                <span 
                                  style={{ backgroundColor: colorTheme.badgeHex }}
                                  className="px-1.5 py-0.5 rounded text-white font-black text-[10px] mb-0.5 truncate max-w-full shadow-2xs"
                                >
                                  {slot.fullGroupLabel}
                                </span>
                                <span 
                                  style={{ color: colorTheme.textHex }}
                                  className="font-black text-[11px] leading-tight truncate max-w-full"
                                >
                                  {slot.cleanTitle}
                                </span>
                                <span className="font-mono text-[9px] text-slate-700 font-bold mt-0.5">
                                  {slot.startTime} - {slot.endTime} ({slot.durationMinutes}د)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Assigned Groups Quota Table (جدول إحصاء وتوزيع الأنصبة حسب الأفواج) */}
        <div className="border border-slate-300 rounded p-2.5 bg-slate-50 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>جدول إحصاء وتوزيع الحصص والحجم الساعي حسب الأفواج التربوية المسندة:</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-bold">
              (مطابق للتنظيم التربوي المعتمد للمؤسسة)
            </span>
          </div>

          <table className="w-full border-collapse text-center text-[11px]">
            <thead>
              <tr className="bg-slate-200 border-b border-slate-300 font-extrabold text-slate-800">
                <th className="p-1 border-l border-slate-300 text-right pr-2">الفوج التربوي المسند</th>
                <th className="p-1 border-l border-slate-300">المستوى الدراسي</th>
                <th className="p-1 border-l border-slate-300">مادة التدريس</th>
                <th className="p-1 border-l border-slate-300">عدد الحصص الأسبوعية</th>
                <th className="p-1">الحجم الساعي الأسبوعي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {teacher.groupBreakdown.map((item, idx) => {
                const subjectTheme = getSubjectColorConfig(teacher.role);
                return (
                  <tr key={idx} className="bg-white">
                    <td className="p-1 border-l border-slate-200 font-bold text-slate-900 text-right pr-2">
                      {item.groupLabel}
                    </td>
                    <td className="p-1 border-l border-slate-200 font-semibold text-slate-700">
                      {getCleanGradeName(item.grade)}
                    </td>
                    <td className="p-1 border-l border-slate-200 font-semibold text-slate-700">
                      <span
                        style={{
                          backgroundColor: subjectTheme.lightHex,
                          borderColor: subjectTheme.borderHex,
                          color: subjectTheme.textHex,
                        }}
                        className="px-2 py-0.5 rounded text-[10px] font-extrabold border inline-block"
                      >
                        {teacher.subjectName}
                      </span>
                    </td>
                    <td className="p-1 border-l border-slate-200 font-mono font-bold text-slate-900">
                      {item.sessions} حصة
                    </td>
                    <td className="p-1 font-mono font-bold text-slate-900">
                      {formatHoursArabic(item.hours)}
                    </td>
                  </tr>
                );
              })}
              {/* Total Summary Row */}
              <tr className="bg-emerald-100 font-black text-slate-900 border-t-2 border-slate-400">
                <td colSpan={3} className="p-1 border-l border-slate-300 text-right pr-2">
                  المجموع الإجمالي للأنصبة المسندة (لكافة الأفواج في هذه النسخة):
                </td>
                <td className="p-1 border-l border-slate-300 font-mono">
                  {teacher.totalSessions} حصة
                </td>
                <td className="p-1 font-mono text-emerald-950">
                  {formatHoursArabic(teacher.totalHours)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3 Official Signature Blocks */}
        <div className="grid grid-cols-3 gap-6 text-center text-xs pt-4 mt-2 border-t border-slate-300">
          <div>
            <p className="font-bold text-slate-900 text-sm font-['Amiri',serif]">
              توقيع وختم مفتش المقاطعة
            </p>
            <div className="h-14 mt-1 flex items-end justify-center text-[10px] text-slate-400">
              ..................................................
            </div>
          </div>

          <div>
            <p className="font-bold text-slate-900 text-sm font-['Amiri',serif]">
              توقيع وختم مدير(ة) المؤسسة
            </p>
            <div className="h-14 mt-1 flex items-end justify-center text-[10px] text-slate-400">
              ..................................................
            </div>
          </div>

          <div>
            <p className="font-bold text-slate-900 text-sm font-['Amiri',serif]">
              توقيع واستلام الأستاذ(ة)
            </p>
            <div className="h-14 mt-1 flex items-end justify-center text-[10px] text-slate-400">
              ..................................................
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[96vh] flex flex-col border border-slate-300 overflow-hidden text-right font-['Cairo',sans-serif]">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="print:hidden px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold leading-tight">
                جداول الخدمة الأسبوعية للأساتذة (شاملة لكافة الأفواج المسندة في نسخة واحدة)
              </h2>
              <p className="text-[11px] text-slate-400">
                طباعة رسمية تتضمن جميع الأفواج المسندة والمواقيت في وثيقة واحدة معتمدة للتفتيش
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintSingle}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
              title="طباعة جدول هذا الأستاذ لجميع أفواجه"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة هذا الجدول (A4)</span>
            </button>

            <button
              onClick={handlePrintAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 text-xs font-bold transition-colors border border-slate-700 cursor-pointer"
              title="طباعة جداول كافة أساتذة المؤسسة دفعة واحدة"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">دفتر كافة الأساتذة</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Teacher Selector Tabs (Hidden in Print) */}
        <div className="print:hidden px-6 pt-3 pb-2 bg-slate-100 border-b border-slate-200 overflow-x-auto flex items-center gap-2">
          <span className="text-xs font-black text-slate-600 shrink-0 ml-1">اختر الأستاذ(ة):</span>
          {consolidatedTeachers.map((teacher) => {
            const isSelected = selectedTeacherId === teacher.id;
            return (
              <button
                key={teacher.id}
                onClick={() => setSelectedTeacherId(teacher.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span>{teacher.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-600'
                }`}>
                  {teacher.assignedGroupsList.length} أفواج • {formatHoursArabic(teacher.totalHours)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Printable View Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-200/50 print:p-0 print:bg-white print:overflow-visible">
          {printMode === 'all' ? (
            <div className="space-y-6 print:space-y-0">
              {consolidatedTeachers.map((t) => renderTeacherScheduleSheet(t, true))}
            </div>
          ) : (
            currentTeacher && renderTeacherScheduleSheet(currentTeacher, false)
          )}
        </div>

        {/* Bottom Bar (Hidden in Print) */}
        <div className="print:hidden px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              وثيقة معتمدة ومطابقة للمنشور 468 والقرار رقم 16 لتنظيم جداول توقيت التعليم الابتدائي
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-bold cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
