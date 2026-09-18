import React, { useRef } from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { GradeLevel, Timetable, TimeSlot, DayOfWeek } from '../types';
import { DAYS_CONFIG } from '../data/defaultTimetables';
import { OFFICIAL_CURRICULA, getSubjectColorConfig } from '../data/officialCurriculum';
import { getCleanSlotTitle, getCleanGradeName } from '../utils/slotFormatter';

interface PrintTimetableProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: Timetable;
  grade: GradeLevel;
  allTimetables?: Timetable[];
  onSelectTimetable?: (t: Timetable) => void;
}

export const PrintTimetable: React.FC<PrintTimetableProps> = ({
  isOpen,
  onClose,
  timetable,
  grade,
  allTimetables,
  onSelectTimetable,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Group slots by day
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];

  const getDaySlots = (dayId: DayOfWeek) => {
    const morningSlots = timetable.slots.filter(
      (s) => s.day === dayId && s.period === 'morning' && !s.isRecess && s.subjectId !== 'recess'
    );
    const afternoonSlots = timetable.slots.filter(
      (s) => s.day === dayId && s.period === 'afternoon' && !s.isRecess && s.subjectId !== 'recess'
    );

    // Split morning into pre-recess and post-recess if single shift
    // Pre-recess is usually <= 09:30 or first 90 minutes
    const morningPre = morningSlots.filter((s) => s.startTime < '09:35');
    const morningPost = morningSlots.filter((s) => s.startTime >= '09:35');

    return {
      morningPre,
      morningPost,
      morningAll: morningSlots,
      afternoon: afternoonSlots,
    };
  };

  // Shift system label for the header banner
  const getShiftSystemBannerText = () => {
    if (timetable.shiftSystem === 'single') {
      return 'نظام الدوام الواحد' + (timetable.hasAmazigh ? ' (مع الأمازيغية)' : '');
    }
    if (timetable.shiftSystem === 'double_g1') {
      return 'نظام الدوامين — الفوج الأول' + (timetable.hasAmazigh ? ' (مع الأمازيغية)' : '');
    }
    return 'نظام الدوامين — الفوج الثاني' + (timetable.hasAmazigh ? ' (مع الأمازيغية)' : '');
  };

  // Dynamic timing strings
  const getMorningTimingLabel = () => {
    if (timetable.shiftSystem === 'single') return 'من 08:00 إلى 11:15';
    if (timetable.shiftSystem === 'double_g1') return 'من 08:00 إلى 10:30';
    return 'من 10:30 إلى 13:00';
  };

  const getMorningPreLabel = () => {
    if (timetable.shiftSystem === 'single') return '08:00 — 09:30';
    if (timetable.shiftSystem === 'double_g1') return '08:00 — 09:15';
    return '10:30 — 11:45';
  };

  const getMorningPostLabel = () => {
    if (timetable.shiftSystem === 'single') return '09:45 — 11:15';
    if (timetable.shiftSystem === 'double_g1') return '09:15 — 10:30';
    return '11:45 — 13:00';
  };

  const getAfternoonTimingLabel = () => {
    if (timetable.shiftSystem === 'single') {
      return timetable.hasAmazigh ? 'من 13:00 إلى 15:45' : 'من 13:00 إلى 15:00';
    }
    if (timetable.shiftSystem === 'double_g1') return 'من 13:00 إلى 15:00';
    return 'من 15:00 إلى 17:00';
  };

  // Helper to format hours in Algerian official format (e.g. "7 سا و 30 د" أو "5 سا" أو "30 د")
  const formatDurationArabic = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (wholeHours === 0 && minutes > 0) return `${minutes} د`;
    if (wholeHours > 0 && minutes === 0) return `${wholeHours} سا`;
    if (wholeHours > 0 && minutes > 0) return `${wholeHours} سا و ${minutes} د`;
    return '0 سا';
  };

  const formatSessionsArabic = (count: number): string => {
    if (count === 1) return '01 حصة';
    if (count === 2) return '02 حصتان';
    if (count >= 3 && count <= 10) return `0${count} حصص`;
    return `${count} حصة`;
  };

  // Extract subjects prescribed for this grade level from OFFICIAL_CURRICULA
  const activeCurriculum = OFFICIAL_CURRICULA[grade] || OFFICIAL_CURRICULA['1AP'];
  const subjectsList = activeCurriculum.subjects
    .filter((subj) => {
      if (subj.id === 'amazigh' && !timetable.hasAmazigh) return false;
      return true;
    })
    .map((subj) => {
      // Find actual slots in timetable matching this subject
      const matchingSlots = timetable.slots.filter(
        (s) => s.subjectId === subj.id && !s.isRecess && s.subjectId !== 'recess' && s.subjectId !== 'free'
      );
      const actualMinutes = matchingSlots.reduce((sum, s) => sum + s.durationMinutes, 0);
      const actualHours = actualMinutes > 0 ? actualMinutes / 60 : subj.totalWeeklyHours;
      const sessionCount = matchingSlots.length > 0 ? matchingSlots.length : subj.totalSessions;

      return {
        id: subj.id,
        name: subj.name,
        shortName: subj.shortName || subj.name,
        hours: actualHours,
        sessions: sessionCount,
      };
    });

  const totalSummaryHours = subjectsList.reduce((acc, s) => acc + s.hours, 0);
  const totalSummarySessions = subjectsList.reduce((acc, s) => acc + s.sessions, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[98vh] flex flex-col border border-slate-300 overflow-hidden text-right font-['Cairo',sans-serif]">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="print:hidden px-6 py-3 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                النموذج الرسمي المعتمد لطباعة التوقيت الأسبوعي
              </h3>
              <p className="text-[11px] text-slate-400">
                مطابق 100% للوثيقة الوزارية الرسمية (A4 أفقي - خط عربي أصيل)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {allTimetables && allTimetables.length > 1 && onSelectTimetable && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px]">الفوج:</span>
                <select
                  value={timetable.id}
                  onChange={(e) => {
                    const found = allTimetables.find((t) => t.id === e.target.value);
                    if (found) onSelectTimetable(found);
                  }}
                  className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  {allTimetables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {getCleanGradeName(t.grade)} — {t.classGroup}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة النموذج (A4 عرضي)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area (Landscape Official Template matching 1000035575.jpg) */}
        <div
          ref={printRef}
          className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-900 print:p-0 print:m-0 print:overflow-visible print:w-full"
          dir="rtl"
        >
          {/* Header Section from Image 1000035575.jpg */}
          <div className="grid grid-cols-12 gap-3 items-center pb-3 mb-3 border-b-2 border-slate-700">
            {/* Right: Wilaya, Inspection, Primary School */}
            <div className="col-span-4 text-right text-[11px] sm:text-xs text-slate-800 space-y-1 font-semibold">
              <div className="flex items-center gap-1">
                <span className="font-bold">مديرية التربية لولاية :</span>
                <span className="font-extrabold border-b border-dotted border-slate-600 flex-1 px-1">
                  {timetable.wilaya || '....................'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">مفتشية التعليم الابتدائي :</span>
                <span className="font-extrabold border-b border-dotted border-slate-600 flex-1 px-1">
                  {timetable.dairaOrInspection || '....................'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold">المدرسة الابتدائية :</span>
                <span className="font-extrabold border-b border-dotted border-slate-600 flex-1 px-1">
                  {timetable.schoolName || '....................'}
                </span>
              </div>
            </div>

            {/* Center: Official Country Heading & Salmon/Rose Banner */}
            <div className="col-span-4 text-center space-y-1">
              <div className="text-[11px] font-bold text-slate-800">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </div>
              <div className="text-[10px] font-semibold text-slate-700">
                وزارة التربية الوطنية
              </div>

              {/* Distinctive Salmon/Rose Banner matching 1000035575.jpg */}
              <div className="mt-1 px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-100 via-rose-50 to-rose-100 border-2 border-rose-300 shadow-xs inline-block min-w-[260px]">
                <h1 className="text-sm sm:text-base font-extrabold text-rose-950 font-['Amiri',serif] tracking-wide">
                  التَّوْقِيتُ الأُسْبُوعِي لِتَوْزِيعِ الحِصَصِ
                </h1>
                <div className="text-[10px] font-bold text-rose-800 mt-0.5 font-['Cairo',sans-serif]">
                  {getShiftSystemBannerText()}
                </div>
              </div>
            </div>

            {/* Left: Academic Year, Grade, Teacher Name (in rounded box matching 1000035575.jpg) */}
            <div className="col-span-4">
              <div className="p-2.5 rounded-xl border-2 border-rose-200/80 bg-rose-50/30 text-[10px] sm:text-[11px] text-slate-800 space-y-0.5 font-semibold">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">السنة الدراسية :</span>
                  <span className="font-bold font-mono text-slate-900">
                    {timetable.academicYear || '2025 / 2026'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">المستوى والفوج :</span>
                  <span className="font-extrabold text-slate-900">
                    {getCleanGradeName(timetable.grade)} ({timetable.classGroup})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">أستاذ(ة) العربية :</span>
                  <span className="font-bold text-emerald-900 truncate max-w-[150px]">
                    {timetable.arabicTeacherName || '....................'}
                  </span>
                </div>
                {(timetable.grade === '4AP' || timetable.grade === '5AP') && timetable.frenchTeacherName && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-600">أستاذ(ة) الفرنسية :</span>
                    <span className="font-bold text-blue-900 truncate max-w-[150px]">
                      {timetable.frenchTeacherName}
                    </span>
                  </div>
                )}
                {['3AP', '4AP', '5AP'].includes(timetable.grade) && timetable.englishTeacherName && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-600">أستاذ(ة) الإنجليزية :</span>
                    <span className="font-bold text-indigo-900 truncate max-w-[150px]">
                      {timetable.englishTeacherName}
                    </span>
                  </div>
                )}
                {timetable.peTeacherName && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-600">أستاذ(ة) البدنية :</span>
                    <span className="font-bold text-emerald-800 truncate max-w-[150px]">
                      {timetable.peTeacherName}
                    </span>
                  </div>
                )}
                {timetable.hasAmazigh && timetable.amazighTeacherName && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-600">أستاذ(ة) الأمازيغية :</span>
                    <span className="font-bold text-lime-900 truncate max-w-[150px]">
                      {timetable.amazighTeacherName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Official Grid Table matching 1000035575.jpg */}
          <div className="overflow-hidden border-2 border-slate-800 rounded-xl shadow-2xs">
            <table className="w-full text-center border-collapse text-xs font-['Cairo',sans-serif]">
              <thead>
                {/* Master Headers Row */}
                <tr className="bg-[#FFF3B0] text-slate-900 font-extrabold border-b-2 border-slate-800">
                  {/* Right Header Column: Split diagonal / two lines */}
                  <th
                    rowSpan={2}
                    className="p-2 w-24 border-l-2 border-slate-800 bg-[#FFF2B2] text-teal-950 font-extrabold text-xs"
                  >
                    <div className="text-[10px] text-slate-600 pb-0.5">التوقيت</div>
                    <div className="w-full h-px bg-slate-400 my-0.5"></div>
                    <div className="text-xs font-black text-teal-950 pt-0.5">الأيام</div>
                  </th>

                  {/* Morning Master Header */}
                  <th
                    colSpan={2}
                    className="p-2 border-l-2 border-slate-800 bg-[#FFF5BD] text-slate-900 font-extrabold text-xs"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>الفترة الصبـــــاحيـة ({getMorningTimingLabel()})</span>
                    </div>
                  </th>

                  {/* Vertical Green Recess Separator */}
                  <th
                    rowSpan={2}
                    className="p-1 w-8 border-l-2 border-slate-800 bg-emerald-400 text-emerald-950 font-black text-[9px] [writing-mode:vertical-rl] rotate-180 select-none"
                    title="الاستراحة الصباحية"
                  >
                    استراحة (15 دقيقة)
                  </th>

                  {/* Morning Post-Recess Header */}
                  <th
                    colSpan={2}
                    className="p-2 border-l-2 border-slate-800 bg-[#FFF5BD] text-slate-900 font-extrabold text-xs"
                  >
                    <span>الشطر الصباحي الثاني</span>
                  </th>

                  {/* Midday Break Vertical Separator */}
                  <th
                    rowSpan={2}
                    className="p-1 w-6 border-l-2 border-slate-800 bg-emerald-400 select-none"
                  ></th>

                  {/* Afternoon Master Header */}
                  <th
                    colSpan={2}
                    className="p-2 bg-[#FFF5BD] text-slate-900 font-extrabold text-xs"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span>الفترة المســـائيـة ({getAfternoonTimingLabel()})</span>
                    </div>
                  </th>
                </tr>

                {/* Sub-Timing Headers Row */}
                <tr className="bg-[#FFF9D6] text-[11px] font-bold text-slate-700 border-b-2 border-slate-800">
                  {/* Morning Block 1 Timing */}
                  <th colSpan={2} className="p-1.5 border-l-2 border-slate-800 font-mono">
                    {getMorningPreLabel()}
                  </th>

                  {/* Morning Block 2 Timing */}
                  <th colSpan={2} className="p-1.5 border-l-2 border-slate-800 font-mono">
                    {getMorningPostLabel()}
                  </th>

                  {/* Afternoon Timing */}
                  <th colSpan={2} className="p-1.5 font-mono">
                    {getAfternoonTimingLabel()}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y-2 divide-slate-700">
                {DAYS_CONFIG.map((day) => {
                  const daySlots = getDaySlots(day.id);
                  const isTuesday = day.id === 'tuesday';
                  const isThursday = day.id === 'thursday';
                  const isSingleShift = timetable.shiftSystem === 'single';

                  return (
                    <tr key={day.id} className="hover:bg-slate-50/50">
                      {/* Day Label Cell */}
                      <td className="p-2 font-black text-xs text-teal-950 bg-[#FFF2B2] border-l-2 border-slate-800 align-middle">
                        {day.arabicName}
                      </td>

                      {/* Morning Block 1 Slots */}
                      <td colSpan={2} className="p-1 border-l-2 border-slate-800 align-middle min-h-[52px]">
                        {daySlots.morningPre.length === 0 ? (
                          <div className="text-[10px] text-slate-400 font-bold py-2 text-center">
                            {timetable.shiftSystem === 'double_g2' ? 'شاغر (ف2)' : '—'}
                          </div>
                        ) : (
                          <div className="flex flex-row flex-nowrap items-stretch gap-1 w-full h-full">
                            {daySlots.morningPre.map((slot) => {
                              const cleanTitle = getCleanSlotTitle(slot);
                              const colorTheme = getSubjectColorConfig(slot.subjectId);
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
                                    style={{ color: colorTheme.textHex }}
                                    className="font-black text-[11px] leading-tight font-['Cairo',sans-serif] truncate max-w-full"
                                  >
                                    {cleanTitle}
                                  </span>
                                  <span className="font-mono text-[9px] text-slate-700 font-bold mt-0.5 whitespace-nowrap">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Vertical Green Column for Recess */}
                      <td className="bg-emerald-400 border-l-2 border-slate-800"></td>

                      {/* Morning Block 2 Slots */}
                      <td colSpan={2} className="p-1 border-l-2 border-slate-800 align-middle min-h-[52px]">
                        {daySlots.morningPost.length === 0 ? (
                          <div className="text-[10px] text-slate-400 font-bold py-2 text-center">
                            {timetable.shiftSystem === 'double_g2' ? 'شاغر (ف2)' : '—'}
                          </div>
                        ) : (
                          <div className="flex flex-row flex-nowrap items-stretch gap-1 w-full h-full">
                            {daySlots.morningPost.map((slot) => {
                              const cleanTitle = getCleanSlotTitle(slot);
                              const colorTheme = getSubjectColorConfig(slot.subjectId);
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
                                    style={{ color: colorTheme.textHex }}
                                    className="font-black text-[11px] leading-tight font-['Cairo',sans-serif] truncate max-w-full"
                                  >
                                    {cleanTitle}
                                  </span>
                                  <span className="font-mono text-[9px] text-slate-700 font-bold mt-0.5 whitespace-nowrap">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Midday Break Vertical Stripe */}
                      <td className="bg-emerald-400 border-l-2 border-slate-800"></td>

                      {/* Afternoon Block Slots */}
                      <td colSpan={2} className="p-1 align-middle min-h-[52px]">
                        {daySlots.afternoon.length === 0 ? (
                          <div className="p-2 rounded-lg bg-slate-100/90 text-center text-[10px] font-bold text-slate-600 flex items-center justify-center h-full">
                            {isTuesday
                              ? isSingleShift
                                ? 'فترة التنسيق التربوي (راحة أسبوعية)'
                                : 'شاغر'
                              : isThursday
                              ? isSingleShift && (timetable.grade === '1AP' || timetable.grade === '2AP')
                                ? 'عطلة أسبوعية رسمية'
                                : 'شاغر'
                              : 'فترة شاغرة'}
                          </div>
                        ) : (
                          <div className="flex flex-row flex-nowrap items-stretch gap-1 w-full h-full">
                            {daySlots.afternoon.map((slot) => {
                              const cleanTitle = getCleanSlotTitle(slot);
                              const colorTheme = getSubjectColorConfig(slot.subjectId);
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
                                    style={{ color: colorTheme.textHex }}
                                    className="font-black text-[11px] leading-tight font-['Cairo',sans-serif] truncate max-w-full"
                                  >
                                    {cleanTitle}
                                  </span>
                                  <span className="font-mono text-[9px] text-slate-700 font-bold mt-0.5 whitespace-nowrap">
                                    {slot.startTime} - {slot.endTime}
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

          {/* Dynamic Subject Quota & Session Count Verification Table requested by user */}
          <div className="mt-3 pt-1.5 border-t border-slate-300">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <h4 className="text-[11px] font-extrabold text-slate-800 font-['Cairo',sans-serif] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                <span>جدول تدقيق وتوزيع الحجم الساعي وعدد الحصص الأسبوعية حسب المواد المقررة:</span>
              </h4>
              <span className="text-[9px] text-slate-600 font-bold">
                (وثيقة مطابقة للمراقبة الإدارية والتفتيش البيداغوجي وفق القرار 16 والمنشور 468)
              </span>
            </div>

            <div className="overflow-x-auto border-2 border-slate-800 rounded shadow-2xs">
              <table className="w-full border-collapse text-center text-[10px] font-['Cairo',sans-serif]">
                <thead>
                  {/* الصف الأول: اسم المواد */}
                  <tr className="border-b-2 border-slate-800">
                    <th className="p-1 border-l border-slate-700 bg-slate-900 text-white w-28 text-center font-extrabold whitespace-nowrap">
                      المادة
                    </th>
                    {subjectsList.map((subj) => {
                      const colorTheme = getSubjectColorConfig(subj.id);
                      return (
                        <th
                          key={subj.id}
                          style={{
                            backgroundColor: colorTheme.hex,
                            borderColor: colorTheme.borderHex,
                            color: '#ffffff',
                          }}
                          className="p-1 border-l font-extrabold whitespace-nowrap text-white"
                        >
                          {subj.shortName || subj.name}
                        </th>
                      );
                    })}
                    <th className="p-1 bg-slate-900 text-white font-black w-24 text-center whitespace-nowrap">
                      المجموع الإجمالي
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* الصف الثاني: الزمن أو التوقيت */}
                  <tr className="border-b border-slate-400 font-bold text-slate-900">
                    <td className="p-1 border-l-2 border-slate-800 bg-slate-100 font-extrabold text-slate-800 whitespace-nowrap">
                      الزمن (التوقيت)
                    </td>
                    {subjectsList.map((subj) => {
                      const colorTheme = getSubjectColorConfig(subj.id);
                      return (
                        <td
                          key={subj.id}
                          style={{
                            backgroundColor: colorTheme.lightHex,
                            color: colorTheme.textHex,
                          }}
                          className="p-1 border-l border-slate-300 font-mono font-black whitespace-nowrap"
                        >
                          {formatDurationArabic(subj.hours)}
                        </td>
                      );
                    })}
                    <td className="p-1 font-mono font-black text-slate-950 bg-slate-100 whitespace-nowrap">
                      {formatDurationArabic(totalSummaryHours)}
                    </td>
                  </tr>

                  {/* الصف الثالث (مسمى عدد الحصص): عدد الحصص */}
                  <tr className="font-bold text-slate-900">
                    <td className="p-1 border-l-2 border-slate-800 bg-slate-100 font-extrabold text-slate-800 whitespace-nowrap">
                      عدد الحصص
                    </td>
                    {subjectsList.map((subj) => {
                      const colorTheme = getSubjectColorConfig(subj.id);
                      return (
                        <td
                          key={subj.id}
                          style={{
                            backgroundColor: colorTheme.lightHex,
                            color: colorTheme.textHex,
                          }}
                          className="p-1 border-l border-slate-300 font-mono font-black whitespace-nowrap"
                        >
                          {formatSessionsArabic(subj.sessions)}
                        </td>
                      );
                    })}
                    <td className="p-1 font-mono font-black text-slate-950 bg-slate-100 whitespace-nowrap">
                      {totalSummarySessions} حصة
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3 Signatures Area matching exactly 1000035575.jpg */}
          <div className="grid grid-cols-3 gap-6 text-center text-xs pt-5 mt-4">
            {/* Left: Inspection Stamp & Signature */}
            <div>
              <p className="font-bold text-slate-900 text-sm font-['Amiri',serif]">
                توقيع وختم المفتش
              </p>
              <div className="h-16 mt-2 flex items-end justify-center text-[10px] text-slate-400">
                ..................................................
              </div>
            </div>

            {/* Center: Director Stamp & Signature */}
            <div>
              <p className="font-bold text-slate-900 text-sm font-['Amiri',serif]">
                توقيع وختم المدير(ة)
              </p>
              <div className="h-16 mt-2 flex items-end justify-center text-[10px] text-slate-400">
                ..................................................
              </div>
            </div>

            {/* Right: Teacher Signature */}
            <div>
              <p className="font-bold text-slate-900 text-sm font-['Amiri',serif]">
                توقيع الاستاذ(ة)
              </p>
              <div className="h-16 mt-2 flex items-end justify-center text-[10px] text-slate-400">
                ..................................................
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
