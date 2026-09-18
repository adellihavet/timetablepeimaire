import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Award, Users } from 'lucide-react';
import { GradeCurriculum, SubjectId, Timetable } from '../types';
import { SUBJECT_COLORS, AMAZIGH_SUBJECT } from '../data/officialCurriculum';

interface QuotaSummaryCardProps {
  curriculum: GradeCurriculum;
  timetable: Timetable;
}

export const QuotaSummaryCard: React.FC<QuotaSummaryCardProps> = ({ curriculum, timetable }) => {
  // Calculate allocated minutes and sessions per subject from the timetable
  const subjectStats = React.useMemo(() => {
    const stats: Record<
      string,
      {
        allocatedMinutes: number;
        sessionsCount: number;
        s90: number;
        s60: number;
        s45: number;
        s30: number;
      }
    > = {};

    timetable.slots.forEach((slot) => {
      if (slot.subjectId === 'free' || slot.subjectId === 'recess') return;
      if (!stats[slot.subjectId]) {
        stats[slot.subjectId] = { allocatedMinutes: 0, sessionsCount: 0, s90: 0, s60: 0, s45: 0, s30: 0 };
      }
      stats[slot.subjectId].allocatedMinutes += slot.durationMinutes;
      stats[slot.subjectId].sessionsCount += 1;
      if (slot.durationMinutes === 90) stats[slot.subjectId].s90 += 1;
      else if (slot.durationMinutes === 60) stats[slot.subjectId].s60 += 1;
      else if (slot.durationMinutes === 45) stats[slot.subjectId].s45 += 1;
      else if (slot.durationMinutes === 30) stats[slot.subjectId].s30 += 1;
    });

    return stats;
  }, [timetable.slots]);

  // Overall calculations
  const statsList = Object.values(subjectStats) as Array<{
    allocatedMinutes: number;
    sessionsCount: number;
    s90: number;
    s60: number;
    s45: number;
    s30: number;
  }>;
  const totalAllocatedMinutes = statsList.reduce((acc, curr) => acc + curr.allocatedMinutes, 0);
  const totalAllocatedHours = totalAllocatedMinutes / 60;
  const totalAllocatedSessions = statsList.reduce((acc, curr) => acc + curr.sessionsCount, 0);

  const targetHours = timetable.hasAmazigh ? curriculum.totalWeeklyHours + 3 : curriculum.totalWeeklyHours;
  const targetSessions = timetable.hasAmazigh ? curriculum.totalSessions + 4 : curriculum.totalSessions;

  const isPerfectMatch = Math.abs(totalAllocatedHours - targetHours) < 0.05 && totalAllocatedSessions === targetSessions;

  // Teacher loads
  const teacherLoads = React.useMemo(() => {
    const loads = {
      arabic_teacher: { name: timetable.arabicTeacherName || 'معلم اللغة العربية', minutes: 0, count: 0 },
      french_teacher: { name: timetable.frenchTeacherName || 'أستاذ اللغة الفرنسية', minutes: 0, count: 0 },
      english_teacher: { name: timetable.englishTeacherName || 'أستاذ اللغة الإنجليزية', minutes: 0, count: 0 },
      pe_teacher: { name: timetable.peTeacherName || 'أستاذ التربية البدنية', minutes: 0, count: 0 },
      amazigh_teacher: { name: timetable.amazighTeacherName || 'أستاذ الأمازيغية', minutes: 0, count: 0 }
    };

    timetable.slots.forEach((s) => {
      if (s.subjectId === 'free' || s.subjectId === 'recess') return;
      const role = s.teacherRole || 'arabic_teacher';
      if (loads[role]) {
        loads[role].minutes += s.durationMinutes;
        loads[role].count += 1;
      }
    });

    return loads;
  }, [timetable]);

  const subjectsToDisplay = [...curriculum.subjects];
  if (timetable.hasAmazigh) {
    subjectsToDisplay.push(AMAZIGH_SUBJECT);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Header with Compliance Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-base">
              المطابقة البيداغوجية مع النصاب الوزاري ({curriculum.gradeArabicName})
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            النصاب الأسبوعي الإجمالي: <span className="font-semibold text-slate-700">{targetHours} ساعة</span> ({targetSessions} حصة)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPerfectMatch ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>مطابق للنصاب الوزاري بنسبة 100%</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>
                الحجم الحالي: {totalAllocatedHours} سا / الهدف: {targetHours} سا
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Grid of Subject Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {subjectsToDisplay.map((subj) => {
          const stats = subjectStats[subj.id] || { allocatedMinutes: 0, sessionsCount: 0, s60: 0, s45: 0, s30: 0 };
          const hours = stats.allocatedMinutes / 60;
          const targetH = subj.totalWeeklyHours;
          const isMatch = Math.abs(hours - targetH) < 0.05 && stats.sessionsCount === subj.totalSessions;
          const colors = SUBJECT_COLORS[subj.id] || SUBJECT_COLORS.arabic;

          return (
            <div
              key={subj.id}
              className={`p-2.5 rounded-xl border transition-all text-xs ${
                isMatch
                  ? 'bg-slate-50 border-slate-200'
                  : hours < targetH
                  ? 'bg-amber-50/60 border-amber-300'
                  : 'bg-rose-50/60 border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900 truncate" title={subj.name}>
                  {subj.shortName}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    isMatch ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
              </div>

              <div className="flex items-baseline justify-between text-[11px] text-slate-600">
                <span>المُنجز:</span>
                <span className={`font-bold ${isMatch ? 'text-slate-800' : 'text-amber-700'}`}>
                  {hours} سا ({stats.sessionsCount} ح)
                </span>
              </div>

              <div className="flex items-baseline justify-between text-[10px] text-slate-400 mt-0.5">
                <span>الرسمي:</span>
                <span>
                  {targetH} سا ({subj.totalSessions} ح)
                </span>
              </div>

              {/* Breakdown breakdown */}
              <div className="mt-1.5 pt-1 border-t border-slate-200/60 text-[10px] text-slate-500 flex justify-between font-mono">
                {((subj.sessions90 && subj.sessions90 > 0) || stats.s90 > 0) && (
                  <span title="حصص 90 دقيقة (1سا و30د)">س90: {stats.s90}/{subj.sessions90 || 0}</span>
                )}
                <span title="حصص 60 دقيقة">س60: {stats.s60}/{subj.sessions60}</span>
                {subj.sessions45 > 0 && <span title="حصص 45 دقيقة">س45: {stats.s45}/{subj.sessions45}</span>}
                <span title="حصص 30 دقيقة">س30: {stats.s30}/{subj.sessions30}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teacher Weekly Loads Footer */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs">
        <div className="flex items-center gap-2 mb-2 font-bold text-slate-800">
          <Users className="w-4 h-4 text-emerald-700" />
          <span>أنصبة المعلمين والأساتذة الأسبوعية في هذا الفوج التربوي:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
          <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 truncate">معلم اللغة العربية:</span>
            <span className="font-bold text-emerald-800 font-mono">
              {(teacherLoads.arabic_teacher.minutes / 60).toFixed(1)} سا ({teacherLoads.arabic_teacher.count} ح)
            </span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 truncate">أستاذ الفرنسية:</span>
            <span className="font-bold text-indigo-800 font-mono">
              {(teacherLoads.french_teacher.minutes / 60).toFixed(1)} سا ({teacherLoads.french_teacher.count} ح)
            </span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 truncate">أستاذ الإنجليزية:</span>
            <span className="font-bold text-violet-800 font-mono">
              {(teacherLoads.english_teacher.minutes / 60).toFixed(1)} سا ({teacherLoads.english_teacher.count} ح)
            </span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 truncate">أستاذ التربية البدنية:</span>
            <span className="font-bold text-rose-800 font-mono">
              {(teacherLoads.pe_teacher.minutes / 60).toFixed(1)} سا ({teacherLoads.pe_teacher.count} ح)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
