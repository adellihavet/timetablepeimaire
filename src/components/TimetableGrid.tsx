import React from 'react';
import { 
  Clock, 
  Edit3, 
  Coffee, 
  Plus, 
  ArrowLeftRight, 
  ChevronUp, 
  ChevronDown, 
  Sparkles,
  Info
} from 'lucide-react';
import { DayOfWeek, GradeLevel, SubjectId, Timetable, TimeSlot } from '../types';
import { DAYS_CONFIG, getOfficialPattern, getPeriodTimingInfo } from '../data/defaultTimetables';
import { getCurriculumForGrade, SUBJECT_COLORS, getSubjectColorConfig } from '../data/curriculum';
import { getCleanSlotTitle } from '../utils/slotFormatter';

interface TimetableGridProps {
  timetable: Timetable;
  grade: GradeLevel;
  onEditSlot: (slot: TimeSlot) => void;
  onAddSlot: (day: DayOfWeek, period: 'morning' | 'afternoon') => void;
  onMoveSlot: (slotId: string, direction: 'up' | 'down') => void;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  timetable,
  grade,
  onEditSlot,
  onAddSlot,
  onMoveSlot
}) => {
  const hasAmazigh = timetable.hasAmazigh ?? false;
  const curriculum = getCurriculumForGrade(grade, hasAmazigh);
  const officialPattern = getOfficialPattern(timetable.shiftSystem, grade, hasAmazigh);

  // Group slots by Day and Period
  const slotsByDay = React.useMemo(() => {
    const grouped: Record<DayOfWeek, { morning: TimeSlot[]; afternoon: TimeSlot[] }> = {
      sunday: { morning: [], afternoon: [] },
      monday: { morning: [], afternoon: [] },
      tuesday: { morning: [], afternoon: [] },
      wednesday: { morning: [], afternoon: [] },
      thursday: { morning: [], afternoon: [] }
    };

    timetable.slots.forEach((s) => {
      if (grouped[s.day]) {
        grouped[s.day][s.period].push(s);
      }
    });

    return grouped;
  }, [timetable.slots]);

  const getSubjectInfo = (subjectId: SubjectId | 'free') => {
    if (subjectId === 'free') {
      return { name: 'فراغ / حر', color: 'bg-slate-200', border: 'border-slate-300', text: 'text-slate-700', light: 'bg-slate-50' };
    }
    if (subjectId === 'recess') {
      return { name: 'استراحة', color: 'bg-amber-400', border: 'border-amber-400', text: 'text-amber-900', light: 'bg-amber-50' };
    }
    const subj = curriculum.subjects.find((s) => s.id === subjectId);
    if (!subj) {
      return { name: subjectId, color: 'bg-slate-600', border: 'border-slate-600', text: 'text-white', light: 'bg-slate-50' };
    }
    const colors = SUBJECT_COLORS[subjectId] || SUBJECT_COLORS.arabic;
    return {
      name: subj.name,
      shortName: subj.shortName,
      color: colors.bg,
      border: colors.border,
      text: colors.text,
      light: colors.lightBg
    };
  };

  const getTeacherBadge = (role?: string) => {
    switch (role) {
      case 'french_teacher':
        return { label: 'أ. الفرنسية', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'english_teacher':
        return { label: 'أ. الإنجليزية', bg: 'bg-violet-100 text-violet-800 border-violet-200' };
      case 'pe_teacher':
        return { label: 'أ. التربية البدنية', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'amazigh_teacher':
        return { label: 'أ. الأمازيغية', bg: 'bg-lime-100 text-lime-800 border-lime-200' };
      default:
        return { label: 'معلم العربية', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table toolbar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <h2 className="font-extrabold text-slate-900 text-sm sm:text-base">
            جدول توزيع الحصص الأسبوعي — {curriculum.gradeArabicName}
          </h2>
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            {officialPattern.shortTitle} • {officialPattern.totalWeeklyHours}
          </span>
          {hasAmazigh && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-lime-100 text-lime-800 border border-lime-300">
              اللغة الأمازيغية مدمجة
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-emerald-700" />
          <span>انقر على أي حصة لتعديل نشاطها، مدتها، أو الأستاذ المكلف</span>
        </div>
      </div>

      {/* Grid container: 5 columns for days */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px] grid grid-cols-5 divide-x divide-x-reverse divide-slate-200 bg-slate-100">
          {DAYS_CONFIG.map((day) => {
            const dayData = slotsByDay[day.id];
            return (
              <div key={day.id} className="flex flex-col bg-slate-50/70">
                {/* Day Header */}
                <div className="py-2.5 px-3 bg-slate-800 text-white font-extrabold text-center text-sm border-b border-slate-700 flex items-center justify-center gap-1.5 shadow-2xs">
                  <span>{day.arabicName}</span>
                  {day.isHalfDay && (
                    <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded font-normal">
                      نصف يوم
                    </span>
                  )}
                </div>

                <div className="p-2 space-y-3 flex-1 flex flex-col justify-between">
                  {/* MORNING PERIOD */}
                  {(() => {
                    const morningInfo = getPeriodTimingInfo(timetable.shiftSystem, grade, hasAmazigh, day.id, 'morning');
                    return (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        الفترة الصباحية ({morningInfo.timeRange})
                      </span>
                      {morningInfo.badgeText && (
                        <span className="text-[9px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          {morningInfo.badgeText}
                        </span>
                      )}
                    </div>

                    {morningInfo.isEmpty || dayData.morning.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-100 border border-dashed border-slate-300 text-center flex flex-col items-center justify-center gap-1 text-slate-500 my-1">
                        <span className="text-xs font-bold text-slate-700">
                          {morningInfo.emptyReason || 'فترة شاغرة'}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                      {dayData.morning.map((slot, idx) => {
                        if (slot.isRecess) {
                          return (
                            <div
                              key={slot.id}
                              onClick={() => onEditSlot(slot)}
                              className="py-1 px-2 rounded-lg bg-amber-100/70 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-200/70 transition-colors"
                              title="استراحة الصباح (15 دقيقة بعد أول 1.5 ساعة)"
                            >
                              <Coffee className="w-3 h-3 text-amber-700" />
                              <span>استراحة ({slot.startTime} - {slot.endTime})</span>
                            </div>
                          );
                        }

                        const subj = getSubjectInfo(slot.subjectId);
                        const teacherBadge = getTeacherBadge(slot.teacherRole);
                        const cleanTitle = getCleanSlotTitle(slot);
                        const colorTheme = getSubjectColorConfig(slot.subjectId);

                        return (
                          <div
                            key={slot.id}
                            onClick={() => onEditSlot(slot)}
                            style={{
                              backgroundColor: colorTheme.lightHex,
                              borderColor: colorTheme.borderHex,
                              borderRightWidth: '4px',
                              borderRightColor: colorTheme.hex,
                            }}
                            className="group relative p-2.5 rounded-xl border shadow-2xs hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-1 mb-2">
                              <span style={{ color: colorTheme.textHex }} className="font-extrabold text-xs leading-tight">
                                {cleanTitle}
                              </span>
                              <span className="font-mono text-[10px] font-semibold text-slate-600 bg-white/80 border border-slate-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>

                            {/* Footer info: Duration + Teacher */}
                            <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-200/60 text-[10px]">
                              <span
                                style={{
                                  backgroundColor: colorTheme.badgeHex,
                                }}
                                className="px-1.5 py-0.5 rounded-full text-white font-bold text-[9px] shadow-2xs"
                              >
                                {slot.durationMinutes === 90 ? '90 د (1سا و30د)' : `${slot.durationMinutes} د`}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium border truncate max-w-[110px] ${teacherBadge.bg}`} title={slot.teacherName || teacherBadge.label}>
                                {slot.teacherName || teacherBadge.label}
                              </span>
                            </div>

                            {/* Hover Controls */}
                            <div className="absolute top-1.5 left-1.5 hidden group-hover:flex items-center gap-0.5 bg-white/90 p-0.5 rounded-md shadow-xs border border-slate-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveSlot(slot.id, 'up');
                                }}
                                disabled={idx === 0}
                                className="p-0.5 text-slate-500 hover:text-emerald-700 disabled:opacity-30"
                                title="تحريك لأعلى"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveSlot(slot.id, 'down');
                                }}
                                disabled={idx === dayData.morning.length - 1}
                                className="p-0.5 text-slate-500 hover:text-emerald-700 disabled:opacity-30"
                                title="تحريك لأسفل"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditSlot(slot);
                                }}
                                className="p-0.5 text-emerald-700 hover:text-emerald-900"
                                title="تعديل الحصة"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <button
                        onClick={() => onAddSlot(day.id, 'morning')}
                        className="w-full py-1 text-[11px] text-slate-400 hover:text-emerald-700 border border-dashed border-slate-300 hover:border-emerald-400 rounded-lg flex items-center justify-center gap-1 transition-colors bg-white/50"
                      >
                        <Plus className="w-3 h-3" />
                        <span>إضافة حصة صباحية</span>
                      </button>
                    </div>
                    )}
                  </div>
                    );
                  })()}

                  {/* AFTERNOON PERIOD */}
                  {(() => {
                    const afternoonInfo = getPeriodTimingInfo(timetable.shiftSystem, grade, hasAmazigh, day.id, 'afternoon');
                    return (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        الفترة المسائية ({afternoonInfo.timeRange})
                      </span>
                      {afternoonInfo.badgeText && (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${
                          afternoonInfo.badgeText.includes('استراحة')
                            ? 'text-amber-800 bg-amber-50 border-amber-200'
                            : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                        }`}>
                          {afternoonInfo.badgeText}
                        </span>
                      )}
                    </div>

                    {afternoonInfo.isEmpty || dayData.afternoon.length === 0 ? (
                      /* Afternoon holiday / free period */
                      <div className="p-4 rounded-xl bg-slate-200/60 border border-slate-300/80 text-center flex flex-col items-center justify-center gap-1 text-slate-500">
                        <span className="text-xs font-bold text-slate-700">
                          {afternoonInfo.emptyReason || 'فترة شاغرة'}
                        </span>
                        <span className="text-[10px] text-slate-500 leading-tight">
                          {afternoonInfo.recessInfo || 'راحة أسبوعية رسمية'}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {dayData.afternoon.map((slot, idx) => {
                          if (slot.isRecess) {
                            return (
                              <div
                                key={slot.id}
                                onClick={() => onEditSlot(slot)}
                                className="py-1 px-2 rounded-lg bg-amber-100/70 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-200/70 transition-colors"
                              >
                                <Coffee className="w-3 h-3 text-amber-700" />
                                <span>استراحة ({slot.startTime} - {slot.endTime})</span>
                              </div>
                            );
                          }

                          const subj = getSubjectInfo(slot.subjectId);
                          const teacherBadge = getTeacherBadge(slot.teacherRole);
                          const cleanTitle = getCleanSlotTitle(slot);
                          const colorTheme = getSubjectColorConfig(slot.subjectId);

                          return (
                            <div
                              key={slot.id}
                              onClick={() => onEditSlot(slot)}
                              style={{
                                backgroundColor: colorTheme.lightHex,
                                borderColor: colorTheme.borderHex,
                                borderRightWidth: '4px',
                                borderRightColor: colorTheme.hex,
                              }}
                              className="group relative p-2.5 rounded-xl border shadow-2xs hover:shadow-md transition-all cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-1 mb-2">
                                <span style={{ color: colorTheme.textHex }} className="font-extrabold text-xs leading-tight">
                                  {cleanTitle}
                                </span>
                                <span className="font-mono text-[10px] font-semibold text-slate-600 bg-white/80 border border-slate-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>

                              <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-200/60 text-[10px]">
                                <span
                                  style={{
                                    backgroundColor: colorTheme.badgeHex,
                                  }}
                                  className="px-1.5 py-0.5 rounded-full text-white font-bold text-[9px] shadow-2xs"
                                >
                                  {slot.durationMinutes === 90 ? '90 د (1سا و30د)' : `${slot.durationMinutes} د`}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium border truncate max-w-[110px] ${teacherBadge.bg}`} title={slot.teacherName || teacherBadge.label}>
                                  {slot.teacherName || teacherBadge.label}
                                </span>
                              </div>

                              {/* Controls */}
                              <div className="absolute top-1.5 left-1.5 hidden group-hover:flex items-center gap-0.5 bg-white/90 p-0.5 rounded-md shadow-xs border border-slate-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveSlot(slot.id, 'up');
                                  }}
                                  disabled={idx === 0}
                                  className="p-0.5 text-slate-500 hover:text-emerald-700 disabled:opacity-30"
                                >
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMoveSlot(slot.id, 'down');
                                  }}
                                  disabled={idx === dayData.afternoon.length - 1}
                                  className="p-0.5 text-slate-500 hover:text-emerald-700 disabled:opacity-30"
                                >
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditSlot(slot);
                                  }}
                                  className="p-0.5 text-emerald-700 hover:text-emerald-900"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        <button
                          onClick={() => onAddSlot(day.id, 'afternoon')}
                          className="w-full py-1 text-[11px] text-slate-400 hover:text-emerald-700 border border-dashed border-slate-300 hover:border-emerald-400 rounded-lg flex items-center justify-center gap-1 transition-colors bg-white/50"
                        >
                          <Plus className="w-3 h-3" />
                          <span>إضافة حصة مسائية</span>
                        </button>
                      </div>
                    )}
                  </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
