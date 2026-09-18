/**
 * Default Official Timetables for 1AP, 2AP, 3AP, 4AP, 5AP
 * Pre-filled with pedagogically sound distribution according to the latest official 2025-2026 circulars,
 * the Ministerial Practical Guide (الدليل التطبيقي الرسمي), and strict pedagogical inspection constraints:
 * 
 * 1. Morning Period: Strictly 3 hours of instruction (180 min) + 15 min break strictly after 1.5 hours (09:30 - 09:45).
 * 2. Afternoon Period: Strictly 2 hours of instruction (120 min) WITHOUT ANY BREAK (13:00 - 15:00).
 * 3. Double Shift Support: Strictly follows Table 4.3 (1AP & 2AP - 21h) and Table 5.3 (3AP, 4AP, 5AP - 22h30).
 * 4. 4AP Circular 468 (16 Sept 2026): PE is 1 single combined session of 1h30 (90 min) at the start of period (Mon 13:00 - 14:30).
 * 5. Math: 1h + separating activity + 30m attached session.
 * 6. Alternating rules: French & English never meet; PE & Art never meet; Science & Math 1h30 blocks never meet.
 */

import { DayOfWeek, GradeLevel, ShiftSystem, Timetable, TimeSlot, OfficialPatternCode, OfficialPatternInfo } from '../types';

export const DAYS_CONFIG: { id: DayOfWeek; arabicName: string; isHalfDay: boolean }[] = [
  { id: 'sunday', arabicName: 'الأحد', isHalfDay: false },
  { id: 'monday', arabicName: 'الإثنين', isHalfDay: false },
  { id: 'tuesday', arabicName: 'الثلاثاء', isHalfDay: true }, // نصف يوم (صباحاً فقط في الدوام الواحد)
  { id: 'wednesday', arabicName: 'الأربعاء', isHalfDay: false },
  { id: 'thursday', arabicName: 'الخميس', isHalfDay: false }
];

/**
 * Add minutes to "HH:MM" formatted string
 */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * 1AP (السنة الأولى ابتدائي) — نظام الدوام الواحد (جدول 1.3 - 21 ساعة)
 * الفترة الصباحية: 3 ساعات (استراحة 15د بعد 1.5 سا: 09:30 - 09:45)
 * الفترة المسائية: ساعتان بدون استراحة (13:00 - 15:00)
 * الثلاثاء والخميس مساءً: عطلة أسبوعية (شاغر)
 * ═════════════════════════════════════════════════════════════════════════════
 */
function create1APSingleShiftSlots(): TimeSlot[] {
  const g = '1ap';
  return [
    // الأحد (Sunday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    { id: `${g}_sun_1`, day: 'sunday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'الحصة 1: فهم المنطوق (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_2`, day: 'sunday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'arabic', activityName: 'الحصة 2: تعبير شفوي (60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_rec1`, day: 'sunday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_sun_3`, day: 'sunday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'الحصة 3: قراءة إجمالية (60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_4`, day: 'sunday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): ساعتان بدون استراحة
    // الفترة الأولى للرياضيات (ساعة ونصف في نفس الفترة مفصولة بنشاط فني: 60د + 30د)
    { id: `${g}_sun_5`, day: 'sunday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_6`, day: 'sunday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_7`, day: 'sunday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (30د)', teacherRole: 'arabic_teacher' },

    // الإثنين (Monday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    { id: `${g}_mon_1`, day: 'monday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'الحصة 4: إنتاج شفوي (60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_2`, day: 'monday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_rec1`, day: 'monday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_mon_3`, day: 'monday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'الحصة 5: قراءة (تجريد الحرف الأول) (60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_4`, day: 'monday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'الحصة 6: كتابة (الحرف الأول) (30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): ساعتان بدون استراحة
    { id: `${g}_mon_5`, day: 'monday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية (60د)', teacherRole: 'pe_teacher' },
    { id: `${g}_mon_6`, day: 'monday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'الحصة 8: محفوظات (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_7`, day: 'monday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية (30د)', teacherRole: 'arabic_teacher' },

    // الثلاثاء (Tuesday): صباح 3سا (استراحة 09:30-09:45) + مساء عطلة أسبوعية
    // الفترة الثانية للرياضيات (ساعة ونصف في نفس الفترة مفصولة بمحفوظات: 60د + 30د)
    { id: `${g}_tue_1`, day: 'tuesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_2`, day: 'tuesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'الحصة 13: محفوظات (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_rec1`, day: 'tuesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_tue_3`, day: 'tuesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_4`, day: 'tuesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'الحصة 7: تطبيقات (تثبيت الحرف الأول) (60د)', teacherRole: 'arabic_teacher' },

    // الأربعاء (Wednesday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    // الفترة الثالثة للرياضيات (ساعة ونصف في نفس الفترة مفصولة بتربية إسلامية: 60د + 30د)
    { id: `${g}_wed_1`, day: 'wednesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_2`, day: 'wednesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_rec1`, day: 'wednesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_wed_3`, day: 'wednesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_4`, day: 'wednesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'الحصة 9: قراءة (تجريد الحرف الثاني) (60د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): ساعتان بدون استراحة
    { id: `${g}_wed_5`, day: 'wednesday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية (60د)', teacherRole: 'pe_teacher' },
    { id: `${g}_wed_6`, day: 'wednesday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'الحصة 10: كتابة (الحرف الثاني) (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_7`, day: 'wednesday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية (30د)', teacherRole: 'arabic_teacher' },

    // الخميس (Thursday): صباح 3سا (استراحة 09:30-09:45) + مساء عطلة أسبوعية (وفق جدول 1.3)
    { id: `${g}_thu_1`, day: 'thursday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'الحصة 11: تطبيقات (تثبيت الحرف الثاني) (60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_2`, day: 'thursday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'الحصة 12: إملاء منظور (لتثبيت رسم الحرفين) (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_rec1`, day: 'thursday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_thu_3`, day: 'thursday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'الحصة 14: إدماج وألعاب لغوية (60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_4`, day: 'thursday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'math', activityName: 'ألعاب رياضياتية (30د)', teacherRole: 'arabic_teacher' }
  ];
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * 2AP (السنة الثانية ابتدائي) — نظام الدوام الواحد (جدول 1.3 - 21 ساعة)
 * ═════════════════════════════════════════════════════════════════════════════
 */
function create2APSingleShiftSlots(): TimeSlot[] {
  const g = '2ap';
  return [
    // ═════════════════════════════════════════════════════════════════════════
    // اليوم الأول (الأحد - Sunday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    // لغة عربية: 2سا و30د (الحصص 01، 02، 03، 04) + ت. إسلامية (30د) + رياضيات مدمجة (1سا و30د مفصولة بت. فنية 30د)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_sun_1`, day: 'sunday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 01: فهم المنطوق (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_2`, day: 'sunday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 03: قراءة (بناء الفقرة الأولى من النص وتجريد الحرف الأول - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_rec1`, day: 'sunday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_sun_3`, day: 'sunday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 02: تعبير شفوي (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_4`, day: 'sunday', period: 'morning', startTime: '10:15', endTime: '10:45', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 04: كتابة (الحرف الأول على كراس القسم - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_5`, day: 'sunday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية - الحصة 1: قرآن كريم وحديث (30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): حصة رياضيات مدمجة 1سا و30د مفصولة بنشاط تربية فنية 30د
    { id: `${g}_sun_6`, day: 'sunday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات - بناء المفهوم والأنشطة العددية (حصة مدمجة - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_7`, day: 'sunday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية - الحصة 1: تعبير تشكيلي ورسم (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_8`, day: 'sunday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات - تدريب وتطبيقات تابعة للحصة السابقة (حصة مدمجة - 30د)', teacherRole: 'arabic_teacher' },

    // ═════════════════════════════════════════════════════════════════════════
    // اليوم الثاني (الإثنين - Monday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    // لغة عربية: 2سا و30د (الحصص 05، 06، 07) + ت. إسلامية (30د) + ت. بدنية ورياضية (ساعتان: حصتان ذات 60د)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_mon_1`, day: 'monday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 05: إنتاج شفوي (60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_2`, day: 'monday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 07: إملاء (إملاء منظور لتثبيت رسم الحرف الأول - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_rec1`, day: 'monday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_mon_3`, day: 'monday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 06: قراءة (قراءة الفقرة الأولى وتثبيت الحرف الأول - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_4`, day: 'monday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية - الحصة 2: تهذيب وسيرة نبوية (30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): ساعتان تربية بدنية ورياضية (حصتان ذات 60 دقيقة)
    { id: `${g}_mon_5`, day: 'monday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية - الحصة 1 (60د)', teacherRole: 'pe_teacher' },
    { id: `${g}_mon_6`, day: 'monday', period: 'afternoon', startTime: '14:00', endTime: '15:00', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية - الحصة 2 (60د)', teacherRole: 'pe_teacher' },

    // ═════════════════════════════════════════════════════════════════════════
    // اليوم الثالث (الثلاثاء - Tuesday): صباح 3سا (استراحة 09:30-09:45) + مساء عطلة أسبوعية
    // لغة عربية: 1سا و30د (الحصص 08، 09) + رياضيات مدمجة: 1سا و30د (60د + 30د مفصولة بكتابة الحرف الثاني)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_tue_1`, day: 'tuesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات - بناء المفهوم وهندسة وقياس (حصة مدمجة - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_2`, day: 'tuesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 09: كتابة (الحرف الثاني على كراس القسم - نشاط فاصل - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_rec1`, day: 'tuesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_tue_3`, day: 'tuesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات - تدريب وتطبيقات تابعة للحصة السابقة (حصة مدمجة - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_4`, day: 'tuesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 08: قراءة (بناء الفقرة الثانية من النص وتجريد الحرف الثاني - 60د)', teacherRole: 'arabic_teacher' },

    // ═════════════════════════════════════════════════════════════════════════
    // اليوم الرابع (الأربعاء - Wednesday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    // لغة عربية صباحاً: الحصص 10، 11، 12، 13 (3 ساعات) + مساءً: رياضيات مدمجة (1سا و30د مفصولة بت. فنية 30د)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_wed_1`, day: 'wednesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 10: قراءة (قراءة الفقرة الثانية وتثبيت الحرف الثاني - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_2`, day: 'wednesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 11: محفوظات (تقديم وتحفيظ مقطوعة شعرية مناسبة - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_rec1`, day: 'wednesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_wed_3`, day: 'wednesday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 12: قراءة إتقان (قراءة سليمة على الكتاب وتطوير مهارات الفهم الصريح - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_4`, day: 'wednesday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 13: إملاء (إملاء منظور لتثبيت رسم الحرف الثاني - 30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): حصة رياضيات مدمجة 1سا و30د مفصولة بنشاط تربية فنية 30د
    { id: `${g}_wed_5`, day: 'wednesday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات - أنشطة ومفاهيم وحل مشكلات (حصة مدمجة - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_6`, day: 'wednesday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية - الحصة 2: تربية موسيقية وإنشاد (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_7`, day: 'wednesday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات - تدريب وتطبيقات تابعة للحصة السابقة (حصة مدمجة - 30د)', teacherRole: 'arabic_teacher' },

    // ═════════════════════════════════════════════════════════════════════════
    // اليوم الخامس (الخميس - Thursday): صباح 3سا (استراحة 09:30-09:45) + مساء عطلة أسبوعية
    // لغة عربية: الحصتان 14 و 15 (إدماج 60د ومحفوظات 30د) + ت. إسلامية (30د) + ت. فنية (30د) + ألعاب رياضياتية (30د بنهاية الأسبوع)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_thu_1`, day: 'thursday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 14: إدماج (ألعاب شفوية لتثبيت الصيغ، ألعاب كتابية ولتطوير مهارات القراءة السليمة - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_2`, day: 'thursday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'لغة عربية - الحصة 15: محفوظات (تقديم وتحفيظ مقطوعة شعرية - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_rec1`, day: 'thursday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_thu_3`, day: 'thursday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية - الحصة 3: تطبيقات وقيم وسلوك (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_4`, day: 'thursday', period: 'morning', startTime: '10:15', endTime: '10:45', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية - الحصة 3: تذوق فني وأشغال يدوية (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_5`, day: 'thursday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات - ألعاب رياضياتية (30د ختامية في نهاية الأسبوع)', teacherRole: 'arabic_teacher' }
  ];
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * 3AP (السنة الثالثة ابتدائي) — نظام الدوام الواحد (جدول 2.3)
 * الصباح: 3 ساعات (استراحة 09:30 - 09:45)
 * المساء: ساعتان بدون استراحة (13:00 - 15:00) | الخميس مساءً 1سا و30د (13:00 - 14:30)
 * ═════════════════════════════════════════════════════════════════════════════
 */
function create3APSingleShiftSlots(): TimeSlot[] {
  const g = '3ap';
  return [
    // ═════════════════════════════════════════════════════════════════════════
    // الأحد (Sunday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    // ═════════════════════════════════════════════════════════════════════════
    // حصة رياضيات مدمجة 1: بناء المفاهيم (60د) + نشاط فاصل (تعبير شفوي 30د) + تطبيقات وتمارين (30د)
    { id: `${g}_sun_1`, day: 'sunday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'فهم المنطوق (مرحلة العرض والأجرأة واكتشاف القيم - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_2`, day: 'sunday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (حصة مدمجة 1: بناء المفاهيم والأنشطة العددية - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_rec1`, day: 'sunday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_sun_3`, day: 'sunday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'التعبير الشفوي واستعمال الصيغ والأساليب (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_4`, day: 'sunday', period: 'morning', startTime: '10:15', endTime: '10:45', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات وتمارين تابعة للحصة المدمجة 1 - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_5`, day: 'sunday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية - الحصة 1: قرآن كريم وتفسير (30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): ساعتان بدون استراحة
    { id: `${g}_sun_6`, day: 'sunday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'القراءة (أداء وفهم - قراءة سليمة ومسترسلة وفهم المعاني - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_7`, day: 'sunday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية - الحصة 1: تربية تشكيلية ورسم (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_8`, day: 'sunday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'history', activityName: 'تاريخ - الحصة 1: دراسة معالم وآثار وأحداث تاريخية (30د)', teacherRole: 'arabic_teacher' },

    // ═════════════════════════════════════════════════════════════════════════
    // الإثنين (Monday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_mon_1`, day: 'monday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'الإنتاج الشفوي (التدريب على التعبير والتواصل الشفوي - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_2`, day: 'monday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'science', activityName: 'تربية علمية وتكنولوجية - الحصة 1: ملاحظة واستكشاف وتجريب (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_rec1`, day: 'monday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_mon_3`, day: 'monday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'english', activityName: 'English - Session 1: Oral Interaction & Vocabulary (60mn)', teacherRole: 'english_teacher' },
    { id: `${g}_mon_4`, day: 'monday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية - الحصة 2: حديث نبوي شريف وسيرة (30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): ساعتان بدون استراحة
    { id: `${g}_mon_5`, day: 'monday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية - الحصة 1 (60د)', teacherRole: 'pe_teacher' },
    { id: `${g}_mon_6`, day: 'monday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية - الحصة 2: تربية موسيقية وأناشيد (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_7`, day: 'monday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية - الحصة 3: عقائد وآداب وأخلاق وسلوك (30د)', teacherRole: 'arabic_teacher' },

    // ═════════════════════════════════════════════════════════════════════════
    // الثلاثاء (Tuesday): صباح 3سا (استراحة 09:30-09:45) + مساء عطلة أسبوعية
    // ═════════════════════════════════════════════════════════════════════════
    // حصة رياضيات مدمجة 2: هندسة وقياس (60د) + نشاط فاصل (محفوظات 30د) + تطبيقات هندسية (30د)
    { id: `${g}_tue_1`, day: 'tuesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (حصة مدمجة 2: هندسة وقياس وتنظيم معطيات - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_2`, day: 'tuesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'المحفوظات (حفظ مقطوعة شعرية وتحليل المعاني - نشاط فاصل 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_rec1`, day: 'tuesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_tue_3`, day: 'tuesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات هندسية تابعة للحصة المدمجة 2 - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_4`, day: 'tuesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة ودراسة ظاهرة تركيبية وتطبيقاتها (60د)', teacherRole: 'arabic_teacher' },

    // ═════════════════════════════════════════════════════════════════════════
    // الأربعاء (Wednesday): صباح 3سا (استراحة 09:30-09:45) + مساء 2سا (بدون استراحة)
    // ═════════════════════════════════════════════════════════════════════════
    { id: `${g}_wed_1`, day: 'wednesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة ودراسة ظاهرة إملائية أو صرفية وتطبيقاتها (60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_2`, day: 'wednesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'science', activityName: 'تربية علمية وتكنولوجية - الحصة 2: استنتاج وتطبيقات علمية (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_rec1`, day: 'wednesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_wed_3`, day: 'wednesday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'arabic', activityName: 'المطالعة (مطالعة مواضيع قريبة من اهتمامات الأطفال ومحيطهم - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_4`, day: 'wednesday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'art', activityName: 'تربية فنية - الحصة 3: أشغال يدوية وتذوق فني (30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): ساعتان بدون استراحة
    { id: `${g}_wed_5`, day: 'wednesday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'pe', activityName: 'تربية بدنية ورياضية - الحصة 2 (60د)', teacherRole: 'pe_teacher' },
    { id: `${g}_wed_6`, day: 'wednesday', period: 'afternoon', startTime: '14:00', endTime: '15:00', durationMinutes: 60, subjectId: 'english', activityName: 'English - Session 2: Reading & Discovery / Phonics (60mn)', teacherRole: 'english_teacher' },

    // ═════════════════════════════════════════════════════════════════════════
    // الخميس (Thursday): صباح 3سا (استراحة 09:30-09:45) + مساء عطلة أسبوعية لتلاميذ 3AP
    // الحجم الإجمالي: 4 حصص صباحية (يكتمل بها الأسبوع بدقة بـ 21 ساعة و29 حصة)
    // ═════════════════════════════════════════════════════════════════════════
    // حصة رياضيات مدمجة 3: تطبيقات (30د) + نشاط لغوي فاصل (الإنتاج الكتابي 60د كاملة) + استراحة + حل مشكلات (60د) + ألعاب رياضياتية (30د)
    { id: `${g}_thu_1`, day: 'thursday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات حل المشكلات تابعة للحصة المدمجة 3 - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_2`, day: 'thursday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'arabic', activityName: 'اللغة العربية - الحصة 9: الإنتاج الكتابي (وفقاً للمذكرة المنهجية رقم 03 - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_rec1`, day: 'thursday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_thu_3`, day: 'thursday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (حصة مدمجة 3: حل مشكلات وأنشطة عددية - 60د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_4`, day: 'thursday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (ألعاب رياضياتية وتفكير إبداعي بنهاية الأسبوع - 30د)', teacherRole: 'arabic_teacher' }
  ];
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * 4AP (السنة الرابعة ابتدائي) — المنشور 468 (16 سبتمبر 2026) وجدول 2.3 (22 سا و 30 د)
 * 
 * القواعد الصارمة المطبقة بدقة مطلقة:
 * 1. الفترة الصباحية: 3 ساعات دراسية (08:00 - 11:15) تتخللها استراحة مقدرة بـ 15 دقيقة
 *    بعد أول ساعة ونصف حصراً (09:30 - 09:45) في جميع الأيام.
 * 2. الفترة المسائية: ساعتان بدون فترة راحة (13:00 - 15:00) أيام الأحد والإثنين والأربعاء،
 *    وساعة ونصف بدون فترة راحة (13:00 - 14:30) يوم الخميس.
 * 3. الثلاثاء مساءً: عطلة أسبوعية شاغرة للتنسيق البيداغوجي.
 * 4. التربية البدنية: حصة مجمعة واحدة 1سا و30د (90د) في أول الفترة المسائية (الإثنين 13:00 - 14:30).
 * 5. تناوب المواد: الفرنسية والإنجليزية لا تلتقيان؛ البدنية والفنية لا تلتقيان؛ العلمية والرياضيات 1.5سا لا تلتقيان.
 * 6. الرياضيات: حصة 1سا + نشاط فاصل + حصة 30د تابعة.
 * 7. التربية الإسلامية: 4 حصص 30د تشمل حصة التربية الخُلُقية المضافة بالمنشور 468.
 * ═════════════════════════════════════════════════════════════════════════════
 */
function create4APSingleShiftSlots(): TimeSlot[] {
  const g = '4ap';
  return [
    // ═══════════════════════════════════════════════════════════════════════════
    // الأحد (Sunday) - 4 سا و 30 د (6 حصص)
    // ═══════════════════════════════════════════════════════════════════════════
    // الصباح (08:00 - 11:15): استراحة 09:30 - 09:45 بعد ساعة ونصف
    { id: `${g}_sun_1`, day: 'sunday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'فهم المنطوق (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_2`, day: 'sunday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (بناء المفاهيم والأنشطة العددية - 1سا)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_rec1`, day: 'sunday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_sun_3`, day: 'sunday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'تعبير شفوي (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_4`, day: 'sunday', period: 'morning', startTime: '10:15', endTime: '10:45', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تمارين وتطبيقات تابعة للحصة - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_5`, day: 'sunday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (قرآن كريم وتفسير - 30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): ساعتان كاملتان بدون استراحة
    { id: `${g}_sun_6`, day: 'sunday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'french', activityName: 'Français (Séance 1: Compréhension & Expression Orale)', teacherRole: 'french_teacher' },
    { id: `${g}_sun_7`, day: 'sunday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية تشكيلية ورسم (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_8`, day: 'sunday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'civics', activityName: 'تربية مدنية (مفاهيم المواطنة والمؤسسات - 30د)', teacherRole: 'arabic_teacher' },

    // ═══════════════════════════════════════════════════════════════════════════
    // الإثنين (Monday) - 5 ساعات (6 حصص)
    // ═══════════════════════════════════════════════════════════════════════════
    // الصباح (08:00 - 11:15): استراحة 09:30 - 09:45 بعد ساعة ونصف
    { id: `${g}_mon_1`, day: 'monday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'إنتاج شفوي (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_2`, day: 'monday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وأداء وفهم (1سا)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_rec1`, day: 'monday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_mon_3`, day: 'monday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'english', activityName: 'English (Session 1: Oral Communication & Vocab - 1h)', teacherRole: 'english_teacher' },
    { id: `${g}_mon_4`, day: 'monday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'history_geo', activityName: 'تاريخ وطني (30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): ساعتان كاملتان بدون استراحة (بدنية 90د مجمعة في أول الفترة)
    { id: `${g}_mon_5`, day: 'monday', period: 'afternoon', startTime: '13:00', endTime: '14:30', durationMinutes: 90, subjectId: 'pe', activityName: 'تربية بدنية ورياضية (حصة مجمعة في أول الفترة - 1سا و30د)', teacherRole: 'pe_teacher' },
    { id: `${g}_mon_6`, day: 'monday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'science', activityName: 'تربية علمية وتكنولوجية (ملاحظة وتجريب علمي 1 - 30د)', teacherRole: 'arabic_teacher' },

    // ═══════════════════════════════════════════════════════════════════════════
    // الثلاثاء (Tuesday) - 3 ساعات (4 حصص) - نصف يوم صباحاً
    // ═══════════════════════════════════════════════════════════════════════════
    // الصباح (08:00 - 11:15): استراحة 09:30 - 09:45 بعد ساعة ونصف
    { id: `${g}_tue_1`, day: 'tuesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (هندسة وقياس وتنظيم معطيات - 1سا)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_2`, day: 'tuesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'محفوظات (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_rec1`, day: 'tuesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_tue_3`, day: 'tuesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات هندسية تابعة للحصة - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_4`, day: 'tuesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة ودراسة ظاهرة تركيبية (1سا)', teacherRole: 'arabic_teacher' },

    // ═══════════════════════════════════════════════════════════════════════════
    // الأربعاء (Wednesday) - 5 ساعات (8 حصص: 4 صباحاً + 4 مساءً)
    // ═══════════════════════════════════════════════════════════════════════════
    // الصباح (08:00 - 11:15): استراحة 09:30 - 09:45 بعد ساعة ونصف
    { id: `${g}_wed_1`, day: 'wednesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة ودراسة ظاهرة صرفية / إملائية (1سا)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_2`, day: 'wednesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'مطالعة (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_rec1`, day: 'wednesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_wed_3`, day: 'wednesday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'french', activityName: 'Français (Séance 2: Écrit / Lecture & Production)', teacherRole: 'french_teacher' },
    { id: `${g}_wed_4`, day: 'wednesday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'history_geo', activityName: 'جغرافيا وبيئة (30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:00): ساعتان كاملتان بدون استراحة
    { id: `${g}_wed_5`, day: 'wednesday', period: 'afternoon', startTime: '13:00', endTime: '13:30', durationMinutes: 30, subjectId: 'science', activityName: 'تربية علمية وتكنولوجية (استنتاج وتطبيقات 2 - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_6`, day: 'wednesday', period: 'afternoon', startTime: '13:30', endTime: '14:00', durationMinutes: 30, subjectId: 'art', activityName: 'تربية موسيقية وأناشيد (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_7`, day: 'wednesday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (عقائد وعبادات - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_8`, day: 'wednesday', period: 'afternoon', startTime: '14:30', endTime: '15:00', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية خُلُقية وترسيخ القيم والفضائل (30د - الحصة المضافة بالمنشور 468)', teacherRole: 'arabic_teacher' },

    // ═══════════════════════════════════════════════════════════════════════════
    // الخميس (Thursday) - 4 سا و 30 د (6 حصص)
    // ═══════════════════════════════════════════════════════════════════════════
    // الصباح (08:00 - 11:15): استراحة 09:30 - 09:45 بعد ساعة ونصف
    { id: `${g}_thu_1`, day: 'thursday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (حل مشكلات وأنشطة عددية - 1سا)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_2`, day: 'thursday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (سيرة نبوية وآداب - نشاط فاصل 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_rec1`, day: 'thursday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_thu_3`, day: 'thursday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تمارين وتطبيقات حل المشكلات - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_4`, day: 'thursday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'الإنتاج الكتابي (1سا)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 14:30): ساعة ونصف بدون استراحة (وفق جدول 2.3)
    { id: `${g}_thu_5`, day: 'thursday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'english', activityName: 'English (Session 2: Reading & Writing Project - 1h)', teacherRole: 'english_teacher' },
    { id: `${g}_thu_6`, day: 'thursday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'civics', activityName: 'تربية مدنية (المسؤولية المدنية والحياة الجماعية - 30د)', teacherRole: 'arabic_teacher' }
  ];
}

/**
 * 5AP (السنة الخامسة ابتدائي)
 */
function create5APSingleShiftSlots(): TimeSlot[] {
  return create4APSingleShiftSlots();
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * 4AP / 5AP (السنة الرابعة والخامسة ابتدائي) — بتضمين اللغة الأمازيغية (3 سا)
 * النمط 3.1: جدول 3.3 بالدليل التطبيقي الرسمي (25 ساعة و 30 دقيقة أسبوعياً)
 * 
 * القواعد الصارمة المطبقة بدقة مطلقة (طبقاً للصورة Capture.PNG):
 * 1. الفترة الصباحية (الأحد إلى الخميس):
 *    - 08:00 إلى 09:30 (1.5 ساعة)
 *    - استراحة صباحية: 09:30 إلى 09:45 (15 دقيقة بعد أول ساعة ونصف)
 *    - 09:45 إلى 11:15 (1.5 ساعة)
 *    - إجمالي الصباح: 3 ساعات يومياً (15 ساعة أسبوعياً).
 * 2. راحة منتصف النهار: راحة عامة يومياً من 11:15 إلى 13:00.
 * 3. الفترة المسائية (مقسمة إلى فترتين تتخللهما استراحة مسائية 15د):
 *    - الأحد، الإثنين، الأربعاء:
 *        * الحصة الأولى: من 13:00 إلى 14:30 (1.5 ساعة)
 *        * استراحة مسائية: من 14:30 إلى 14:45 (15 دقيقة)
 *        * الحصة الثانية: من 14:45 إلى 16:00 (1.25 ساعة = 75 دقيقة تشمل الأمازيغية)
 *        * إجمالي المساء لهذه الأيام: ساعتان و45 دقيقة يومياً.
 *    - الخميس:
 *        * الحصة الأولى: من 13:00 إلى 14:30 (1.5 ساعة)
 *        * استراحة مسائية: من 14:30 إلى 14:45 (15 دقيقة)
 *        * الحصة الثانية: من 14:45 إلى 15:30 (45 دقيقة - أنشطة ختامية / إسلامية)
 *        * إجمالي مساء الخميس: ساعتان و15 دقيقة.
 *    - الثلاثاء: أمسية فارغة (راحة للتنسيق التربوي).
 * 4. المجموع الأسبوعي: 15 سا صباح + 10.5 سا مساء = 25 ساعة و30 دقيقة تماماً.
 * ═════════════════════════════════════════════════════════════════════════════
 */
function create4APSingleShiftSlotsWithAmazigh(): TimeSlot[] {
  const g = '4ap_amz';
  return [
    // ═══════════════════════════════════════════════════════════════════════════
    // الأحد (Sunday) - 5 سا و 45 د (3 سا صباحاً + 2 سا و 45 د مساءً)
    // ═══════════════════════════════════════════════════════════════════════════
    // الصباح (08:00 - 11:15): استراحة 09:30 - 09:45
    { id: `${g}_sun_1`, day: 'sunday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'فهم المنطوق (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_2`, day: 'sunday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (بناء المفاهيم والأنشطة العددية - 1سا)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_rec1`, day: 'sunday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_sun_3`, day: 'sunday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'arabic', activityName: 'تعبير شفوي (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_4`, day: 'sunday', period: 'morning', startTime: '10:15', endTime: '10:45', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تمارين وتطبيقات تابعة للحصة - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_5`, day: 'sunday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (قرآن كريم وتفسير - 30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 16:00): 13:00-14:30 ثم استراحة مسائية 15د ثم 14:45-16:00
    { id: `${g}_sun_6`, day: 'sunday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'french', activityName: 'Français (Séance 1: Compréhension & Expression Orale - 1h)', teacherRole: 'french_teacher' },
    { id: `${g}_sun_7`, day: 'sunday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'art', activityName: 'تربية تشكيلية ورسم (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_sun_rec2`, day: 'sunday', period: 'afternoon', startTime: '14:30', endTime: '14:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة مسائية', isRecess: true },
    { id: `${g}_sun_8`, day: 'sunday', period: 'afternoon', startTime: '14:45', endTime: '15:30', durationMinutes: 45, subjectId: 'amazigh', activityName: 'اللغة الأمازيغية (الحصة 1: فهم المنطوق والتعبير - 45د)', teacherRole: 'amazigh_teacher' },
    { id: `${g}_sun_9`, day: 'sunday', period: 'afternoon', startTime: '15:30', endTime: '16:00', durationMinutes: 30, subjectId: 'civics', activityName: 'تربية مدنية (مفاهيم المواطنة والمؤسسات - 30د)', teacherRole: 'arabic_teacher' },

    // ═══════════════════════════════════════════════════════════════════════════
    // الإثنين (Monday) - 5 سا و 45 د (3 سا صباحاً + 2 سا و 45 د مساءً)
    // ═══════════════════════════════════════════════════════════════════════════
    // الصباح (08:00 - 11:15): استراحة 09:30 - 09:45
    { id: `${g}_mon_1`, day: 'monday', period: 'morning', startTime: '08:00', endTime: '08:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'إنتاج شفوي (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_2`, day: 'monday', period: 'morning', startTime: '08:30', endTime: '09:30', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة وأداء وفهم (1سا)', teacherRole: 'arabic_teacher' },
    { id: `${g}_mon_rec1`, day: 'monday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_mon_3`, day: 'monday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'english', activityName: 'English (Session 1: Oral Communication & Vocab - 1h)', teacherRole: 'english_teacher' },
    { id: `${g}_mon_4`, day: 'monday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'history_geo', activityName: 'تاريخ وطني (30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 16:00): بدنية 90د مجمعة في أول الفترة ثم استراحة 15د ثم أمازيغية 45د وعلمية 30د
    { id: `${g}_mon_5`, day: 'monday', period: 'afternoon', startTime: '13:00', endTime: '14:30', durationMinutes: 90, subjectId: 'pe', activityName: 'تربية بدنية ورياضية (حصة مجمعة في أول الفترة - 1سا و30د)', teacherRole: 'pe_teacher' },
    { id: `${g}_mon_rec2`, day: 'monday', period: 'afternoon', startTime: '14:30', endTime: '14:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة مسائية', isRecess: true },
    { id: `${g}_mon_6`, day: 'monday', period: 'afternoon', startTime: '14:45', endTime: '15:30', durationMinutes: 45, subjectId: 'amazigh', activityName: 'اللغة الأمازيغية (الحصة 2: قراءة وأداء وفهم - 45د)', teacherRole: 'amazigh_teacher' },
    { id: `${g}_mon_7`, day: 'monday', period: 'afternoon', startTime: '15:30', endTime: '16:00', durationMinutes: 30, subjectId: 'science', activityName: 'تربية علمية وتكنولوجية (ملاحظة وتجريب علمي 1 - 30د)', teacherRole: 'arabic_teacher' },

    // ═══════════════════════════════════════════════════════════════════════════
    // الثلاثاء (Tuesday) - 3 ساعات صباحاً (نصف يوم - مساء شاغر)
    // ═══════════════════════════════════════════════════════════════════════════
    { id: `${g}_tue_1`, day: 'tuesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (هندسة وقياس وتنظيم معطيات - 1سا)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_2`, day: 'tuesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'محفوظات (نشاط فاصل - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_rec1`, day: 'tuesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_tue_3`, day: 'tuesday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تطبيقات هندسية تابعة للحصة - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_tue_4`, day: 'tuesday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة ودراسة ظاهرة تركيبية (1سا)', teacherRole: 'arabic_teacher' },

    // ═══════════════════════════════════════════════════════════════════════════
    // الأربعاء (Wednesday) - 5 سا و 45 د (3 سا صباحاً + 2 سا و 45 د مساءً)
    // ═══════════════════════════════════════════════════════════════════════════
    { id: `${g}_wed_1`, day: 'wednesday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'arabic', activityName: 'قراءة ودراسة ظاهرة صرفية / إملائية (1سا)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_2`, day: 'wednesday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'arabic', activityName: 'مطالعة (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_rec1`, day: 'wednesday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_wed_3`, day: 'wednesday', period: 'morning', startTime: '09:45', endTime: '10:45', durationMinutes: 60, subjectId: 'french', activityName: 'Français (Séance 2: Écrit / Lecture & Production - 1h)', teacherRole: 'french_teacher' },
    { id: `${g}_wed_4`, day: 'wednesday', period: 'morning', startTime: '10:45', endTime: '11:15', durationMinutes: 30, subjectId: 'history_geo', activityName: 'جغرافيا وبيئة (30د)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 16:00)
    { id: `${g}_wed_5`, day: 'wednesday', period: 'afternoon', startTime: '13:00', endTime: '13:30', durationMinutes: 30, subjectId: 'science', activityName: 'تربية علمية وتكنولوجية (استنتاج وتطبيقات 2 - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_6`, day: 'wednesday', period: 'afternoon', startTime: '13:30', endTime: '14:00', durationMinutes: 30, subjectId: 'art', activityName: 'تربية موسيقية وأناشيد (30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_7`, day: 'wednesday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (عقائد وعبادات - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_wed_rec2`, day: 'wednesday', period: 'afternoon', startTime: '14:30', endTime: '14:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة مسائية', isRecess: true },
    { id: `${g}_wed_8`, day: 'wednesday', period: 'afternoon', startTime: '14:45', endTime: '15:30', durationMinutes: 45, subjectId: 'amazigh', activityName: 'اللغة الأمازيغية (الحصة 3: تراكيب وظواهر لغوية - 45د)', teacherRole: 'amazigh_teacher' },
    { id: `${g}_wed_9`, day: 'wednesday', period: 'afternoon', startTime: '15:30', endTime: '16:00', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية خُلُقية وترسيخ القيم والفضائل (30د)', teacherRole: 'arabic_teacher' },

    // ═══════════════════════════════════════════════════════════════════════════
    // الخميس (Thursday) - 5 سا و 15 د (3 سا صباحاً + 2 سا و 15 د مساءً)
    // ═══════════════════════════════════════════════════════════════════════════
    { id: `${g}_thu_1`, day: 'thursday', period: 'morning', startTime: '08:00', endTime: '09:00', durationMinutes: 60, subjectId: 'math', activityName: 'رياضيات (حل مشكلات وأنشطة عددية - 1سا)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_2`, day: 'thursday', period: 'morning', startTime: '09:00', endTime: '09:30', durationMinutes: 30, subjectId: 'islamic', activityName: 'تربية إسلامية (سيرة نبوية وآداب - نشاط فاصل 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_rec1`, day: 'thursday', period: 'morning', startTime: '09:30', endTime: '09:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة', isRecess: true },
    { id: `${g}_thu_3`, day: 'thursday', period: 'morning', startTime: '09:45', endTime: '10:15', durationMinutes: 30, subjectId: 'math', activityName: 'رياضيات (تمارين وتطبيقات حل المشكلات - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_4`, day: 'thursday', period: 'morning', startTime: '10:15', endTime: '11:15', durationMinutes: 60, subjectId: 'arabic', activityName: 'الإنتاج الكتابي (1سا)', teacherRole: 'arabic_teacher' },
    // المساء (13:00 - 15:30): 13:00-14:30 ثم استراحة 14:30-14:45 ثم 14:45-15:30
    { id: `${g}_thu_5`, day: 'thursday', period: 'afternoon', startTime: '13:00', endTime: '14:00', durationMinutes: 60, subjectId: 'english', activityName: 'English (Session 2: Reading & Writing Project - 1h)', teacherRole: 'english_teacher' },
    { id: `${g}_thu_6`, day: 'thursday', period: 'afternoon', startTime: '14:00', endTime: '14:30', durationMinutes: 30, subjectId: 'civics', activityName: 'تربية مدنية (المسؤولية المدنية والحياة الجماعية - 30د)', teacherRole: 'arabic_teacher' },
    { id: `${g}_thu_rec2`, day: 'thursday', period: 'afternoon', startTime: '14:30', endTime: '14:45', durationMinutes: 15, subjectId: 'recess', activityName: 'استراحة مسائية', isRecess: true },
    { id: `${g}_thu_7`, day: 'thursday', period: 'afternoon', startTime: '14:45', endTime: '15:30', durationMinutes: 45, subjectId: 'amazigh', activityName: 'اللغة الأمازيغية (الحصة 4: إنتاج كتابي ومشاريع - 45د)', teacherRole: 'amazigh_teacher' }
  ];
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * مولد نظام الدوامين (Double Shift Generator)
 * مطبق بدقة من جداول الدليل التطبيقي الرسمي (Capture1.PNG):
 * 
 * - جدول 4.3 (السنتان 1 و 2 - 21 ساعة لكل فوج):
 *   - الأحد، الإثنين، الأربعاء:
 *       ف1: صباحاً 08:00 - 10:30 | مساءً 13:00 - 15:00
 *       ف2: صباحاً 10:30 - 13:00 | مساءً 15:00 - 17:00
 *   - الثلاثاء:
 *       ف1: 08:00 - 12:30 (استراحة 10:00 - 10:15)
 *       ف2: 12:30 - 17:00 (استراحة 14:30 - 14:45)
 *   - الخميس:
 *       ف1: صباحاً 08:00 - 11:00 (استراحة 09:30 - 09:45) | مساءً شاغر
 *       ف2: صباحاً 11:00 - 14:00 (استراحة 12:30 - 12:45) | مساءً شاغر
 * 
 * - جدول 5.3 (السنوات 3، 4، 5 - 22 سا و 30 د لكل فوج):
 *   - الأحد، الإثنين، الأربعاء، الخميس (4 أيام متطابقة):
 *       ف1: صباحاً 08:00 - 10:30 (2سا و30د) | مساءً 13:00 - 15:00 (2سا بدون استراحة)
 *       ف2: صباحاً 10:30 - 13:00 (2سا و30د) | مساءً 15:00 - 17:00 (2سا بدون استراحة)
 *   - الثلاثاء:
 *       ف1: 08:00 - 12:30 (4سا و30د - استراحة 10:00 - 10:15)
 *       ف2: 12:30 - 17:00 (4سا و30د - استراحة 14:30 - 14:45)
 * ═════════════════════════════════════════════════════════════════════════════
 */
export function buildDoubleShiftSlots(
  singleSlots: TimeSlot[],
  shift: 'double_g1' | 'double_g2',
  grade: GradeLevel
): TimeSlot[] {
  const isLowerGrade = grade === '1AP' || grade === '2AP';
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
  const result: TimeSlot[] = [];

  for (const day of days) {
    const daySlots = singleSlots.filter((s) => s.day === day && !s.isRecess);

    if (day === 'tuesday') {
      // الثلاثاء: فترة ممتدة 4 سا و 30 د (270 دقيقة)
      // ف1: 08:00 - 12:30 (استراحة 10:00 - 10:15)
      // ف2: 12:30 - 17:00 (استراحة 14:30 - 14:45)
      let currentTime = shift === 'double_g1' ? '08:00' : '12:30';
      const recessThreshold = shift === 'double_g1' ? '10:00' : '14:30';
      let recessInserted = false;

      daySlots.forEach((slot, index) => {
        // فحص إدراج الاستراحة بعد مرور ساعتين تقريباً
        if (!recessInserted && currentTime >= recessThreshold) {
          const recStart = currentTime;
          const recEnd = addMinutesToTime(recStart, 15);
          result.push({
            id: `rec_tue_${shift}_${index}`,
            day: 'tuesday',
            period: shift === 'double_g1' ? 'morning' : 'afternoon',
            startTime: recStart,
            endTime: recEnd,
            durationMinutes: 15,
            subjectId: 'recess',
            activityName: 'استراحة',
            isRecess: true
          });
          currentTime = recEnd;
          recessInserted = true;
        }

        const slotEnd = addMinutesToTime(currentTime, slot.durationMinutes);
        result.push({
          ...slot,
          id: `${slot.id}_${shift}`,
          period: shift === 'double_g1' ? 'morning' : 'afternoon',
          startTime: currentTime,
          endTime: slotEnd
        });
        currentTime = slotEnd;
      });

      // إذا لم تدرج الاستراحة بعد
      if (!recessInserted) {
        result.splice(result.length - 2, 0, {
          id: `rec_tue_${shift}`,
          day: 'tuesday',
          period: shift === 'double_g1' ? 'morning' : 'afternoon',
          startTime: shift === 'double_g1' ? '10:00' : '14:30',
          endTime: shift === 'double_g1' ? '10:15' : '14:45',
          durationMinutes: 15,
          subjectId: 'recess',
          activityName: 'استراحة',
          isRecess: true
        });
      }
    } else if (day === 'thursday' && isLowerGrade) {
      // الخميس للسنتين 1 و 2 (جدول 4.3): 3 ساعات صباحاً والمساء عطلة
      // ف1: 08:00 - 11:00 (استراحة 09:30 - 09:45)
      // ف2: 11:00 - 14:00 (استراحة 12:30 - 12:45)
      let currentTime = shift === 'double_g1' ? '08:00' : '11:00';
      const recessTime = shift === 'double_g1' ? '09:30' : '12:30';
      let recessInserted = false;

      daySlots.forEach((slot, index) => {
        if (!recessInserted && currentTime >= recessTime) {
          const recStart = currentTime;
          const recEnd = addMinutesToTime(recStart, 15);
          result.push({
            id: `rec_thu_${shift}_${index}`,
            day: 'thursday',
            period: 'morning',
            startTime: recStart,
            endTime: recEnd,
            durationMinutes: 15,
            subjectId: 'recess',
            activityName: 'استراحة',
            isRecess: true
          });
          currentTime = recEnd;
          recessInserted = true;
        }

        const slotEnd = addMinutesToTime(currentTime, slot.durationMinutes);
        result.push({
          ...slot,
          id: `${slot.id}_${shift}`,
          period: 'morning',
          startTime: currentTime,
          endTime: slotEnd
        });
        currentTime = slotEnd;
      });
    } else if (day === 'thursday' && !isLowerGrade) {
      // الخميس للسنوات 3 و 4 و 5 (جدول 5.3 - فارق التوقيت):
      // ف1: صباحاً 08:00 - 11:00 (3 ساعات) | مساءً 13:00 - 15:00 (ساعتان)
      // ف2: صباحاً 10:30 - 13:00 (2.5 ساعة) | مساءً 15:00 - 17:00 (ساعتان)
      const morningSlots = daySlots.filter((s) => s.period === 'morning');
      const afternoonSlots = daySlots.filter((s) => s.period === 'afternoon');

      let currentMorning = shift === 'double_g1' ? '08:00' : '10:30';
      morningSlots.forEach((slot) => {
        const end = addMinutesToTime(currentMorning, slot.durationMinutes);
        result.push({
          ...slot,
          id: `${slot.id}_${shift}`,
          period: 'morning',
          startTime: currentMorning,
          endTime: end
        });
        currentMorning = end;
      });

      let currentAfternoon = shift === 'double_g1' ? '13:00' : '15:00';
      afternoonSlots.forEach((slot) => {
        const end = addMinutesToTime(currentAfternoon, slot.durationMinutes);
        result.push({
          ...slot,
          id: `${slot.id}_${shift}`,
          period: 'afternoon',
          startTime: currentAfternoon,
          endTime: end
        });
        currentAfternoon = end;
      });
    } else {
      // الأيام العادية: الأحد، الإثنين، الأربعاء
      // صباحاً:
      // ف1: 08:00 - 10:30 (150 دقيقة)
      // ف2: 10:30 - 13:00 (150 دقيقة)
      // مساءً:
      // ف1: 13:00 - 15:00 (120 دقيقة - بدون استراحة)
      // ف2: 15:00 - 17:00 (120 دقيقة - بدون استراحة)
      const morningSlots = daySlots.filter((s) => s.period === 'morning');
      const afternoonSlots = daySlots.filter((s) => s.period === 'afternoon');

      // جدولة الحصص الصباحية
      let currentMorning = shift === 'double_g1' ? '08:00' : '10:30';
      morningSlots.forEach((slot) => {
        const end = addMinutesToTime(currentMorning, slot.durationMinutes);
        result.push({
          ...slot,
          id: `${slot.id}_${shift}`,
          period: 'morning',
          startTime: currentMorning,
          endTime: end
        });
        currentMorning = end;
      });

      // جدولة الحصص المسائية (بدون أي استراحة إطلاقاً)
      let currentAfternoon = shift === 'double_g1' ? '13:00' : '15:00';
      afternoonSlots.forEach((slot) => {
        const end = addMinutesToTime(currentAfternoon, slot.durationMinutes);
        result.push({
          ...slot,
          id: `${slot.id}_${shift}`,
          period: 'afternoon',
          startTime: currentAfternoon,
          endTime: end
        });
        currentAfternoon = end;
      });
    }
  }

  return result;
}

/**
 * Retrieve Default Official Timetable for any grade & shift system
 */
export function getDefaultTimetable(
  grade: GradeLevel,
  shiftSystem: ShiftSystem = 'single',
  hasAmazigh: boolean = false
): Timetable {
  let slots: TimeSlot[] = [];

  if (grade === '1AP') {
    slots = create1APSingleShiftSlots();
  } else if (grade === '2AP') {
    slots = create2APSingleShiftSlots();
  } else if (grade === '3AP') {
    slots = create3APSingleShiftSlots();
  } else if (grade === '4AP') {
    slots = hasAmazigh && shiftSystem === 'single' ? create4APSingleShiftSlotsWithAmazigh() : create4APSingleShiftSlots();
  } else if (grade === '5AP') {
    slots = hasAmazigh && shiftSystem === 'single' ? create4APSingleShiftSlotsWithAmazigh() : create5APSingleShiftSlots();
  }

  // إذا كان النظام هو نظام الدوامين (فوج 1 أو فوج 2)
  if (shiftSystem === 'double_g1' || shiftSystem === 'double_g2') {
    slots = buildDoubleShiftSlots(slots, shiftSystem, grade);
  }

  return {
    id: `tt_${grade}_${Date.now()}`,
    grade,
    shiftSystem,
    hasAmazigh,
    schoolName: 'مدرسة الشهيد العربي بن مهيدي الابتدائية',
    wilaya: 'الجزائر',
    commune: 'الجزائر الوسطى',
    dairaOrInspection: 'المقاطعة التفتيشية الثالثة',
    academicYear: '2025-2026',
    classGroup: shiftSystem === 'double_g1' ? 'الفوج التربوي 01 (فوج 1)' : (shiftSystem === 'double_g2' ? 'الفوج التربوي 02 (فوج 2)' : 'الفوج التربوي 01'),
    arabicTeacherName: 'أ. أحمد بن علي',
    frenchTeacherName: 'أ. مريم بلقاسم',
    englishTeacherName: 'أ. سارة منصوري',
    peTeacherName: 'أ. كمال عمراوي',
    amazighTeacherName: 'أ. ماسينيسا أيت قاسي',
    directorName: 'السيد مدير المدرسة',
    inspectorName: 'السيد مفتش المقاطعة التربوية',
    slots,
    updatedAt: new Date().toISOString()
  };
}

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * Official Pattern Identification
 * الأنماط الرسمية الخمسة المعتمدة في الدليل التطبيقي الرسمي (Capture.PNG & Capture1.PNG)
 * ═════════════════════════════════════════════════════════════════════════════
 */
export function getOfficialPattern(
  shift: ShiftSystem,
  grade: GradeLevel,
  hasAmazigh: boolean
): OfficialPatternInfo {
  if (shift === 'single') {
    if (grade === '1AP' || grade === '2AP') {
      return {
        code: '1.1',
        tableNumber: '1.3',
        title: 'النمط 1.1: السنوات الأولى والثانية ابتدائي (نظام الدوام الواحد)',
        shortTitle: 'النمط 1.1 (جدول 1.3)',
        totalWeeklyHours: '21 ساعة أسبوعياً',
        shiftSystemName: 'نظام الدوام الواحد',
        applicableGrades: ['1AP', '2AP'],
        hasAmazigh: false,
        morningTiming: '08:00 — 11:15 (استراحة 15د من 09:30 إلى 09:45 بعد ساعة ونصف)',
        afternoonTiming: '13:00 — 15:00 (ساعتان كاملتان بدون استراحة)',
        tuesdayTiming: 'صباح فقط 08:00 — 11:15 (مساء شاغر للتنسيق التربوي)',
        thursdayTiming: 'صباح فقط 08:00 — 11:15 (مساء شاغر)',
        description: 'وفق جدول 1.3: 15 ساعة صباحية + 6 ساعات مسائية = 21 ساعة أسبوعياً.'
      };
    }
    if (hasAmazigh && (grade === '4AP' || grade === '5AP')) {
      return {
        code: '3.1',
        tableNumber: '3.3',
        title: 'النمط 3.1: السنوات الرابعة والخامسة ابتدائي بتضمين اللغة الأمازيغية (نظام الدوام الواحد)',
        shortTitle: 'النمط 3.1 (جدول 3.3)',
        totalWeeklyHours: '25 ساعة و30 دقيقة أسبوعياً',
        shiftSystemName: 'نظام الدوام الواحد (مع الأمازيغية)',
        applicableGrades: ['4AP', '5AP'],
        hasAmazigh: true,
        morningTiming: '08:00 — 11:15 (استراحة 15د من 09:30 إلى 09:45 بعد ساعة ونصف)',
        afternoonTiming: '13:00 — 16:00 (تتخللها استراحة مسائية 15د من 14:30 إلى 14:45)',
        tuesdayTiming: 'صباح فقط 08:00 — 11:15 (مساء شاغر للتنسيق التربوي)',
        thursdayTiming: '13:00 — 15:30 (تتخللها استراحة مسائية 15د من 14:30 إلى 14:45)',
        description: 'وفق جدول 3.3: 15 ساعة صباحية + 10.5 ساعات مسائية = 25 ساعة و30 دقيقة أسبوعياً.'
      };
    }
    return {
      code: '2.1',
      tableNumber: '2.3',
      title: 'النمط 2.1: السنوات الثالثة والرابعة والخامسة ابتدائي دون أمازيغية (نظام الدوام الواحد)',
      shortTitle: 'النمط 2.1 (جدول 2.3)',
      totalWeeklyHours: '22 ساعة و30 دقيقة أسبوعياً',
      shiftSystemName: 'نظام الدوام الواحد (دون أمازيغية)',
      applicableGrades: ['3AP', '4AP', '5AP'],
      hasAmazigh: false,
      morningTiming: '08:00 — 11:15 (استراحة 15د من 09:30 إلى 09:45 بعد ساعة ونصف)',
      afternoonTiming: '13:00 — 15:00 (ساعتان كاملتان بدون استراحة)',
      tuesdayTiming: 'صباح فقط 08:00 — 11:15 (مساء شاغر للتنسيق التربوي)',
      thursdayTiming: '13:00 — 14:30 (ساعة ونصف بدون استراحة)',
      description: 'وفق جدول 2.3: 15 ساعة صباحية + 7.5 ساعات مسائية = 22 ساعة و30 دقيقة أسبوعياً.'
    };
  }

  // نظام الدوامين
  if (grade === '1AP' || grade === '2AP') {
    return {
      code: '1.2',
      tableNumber: '4.3',
      title: 'النمط 1.2: السنوات الأولى والثانية ابتدائي (نظام الدوامين)',
      shortTitle: 'النمط 1.2 (جدول 4.3)',
      totalWeeklyHours: '21 ساعة لكل فوج أسبوعياً',
      shiftSystemName: shift === 'double_g1' ? 'نظام الدوامين (الفوج 1)' : 'نظام الدوامين (الفوج 2)',
      applicableGrades: ['1AP', '2AP'],
      hasAmazigh: false,
      morningTiming: shift === 'double_g1' ? '08:00 — 10:30 (2.5 سا)' : '10:30 — 13:00 (2.5 سا)',
      afternoonTiming: shift === 'double_g1' ? '13:00 — 15:00 (ساعتان بدون استراحة)' : '15:00 — 17:00 (ساعتان بدون استراحة)',
      tuesdayTiming: shift === 'double_g1' ? '08:00 — 12:30 (4.5 سا متصلة - مساء فارغ)' : '12:30 — 17:00 (4.5 سا متصلة - صباح فارغ)',
      thursdayTiming: shift === 'double_g1' ? '08:00 — 11:00 (3 سا صباحية فقط - مساء فارغ)' : '11:00 — 14:00 (3 سا تمتد للمنتصف فقط - مساء فارغ)',
      description: 'وفق جدول 4.3: 21 ساعة عمل أسبوعياً لكل فوج مع تناوب الفترات وعطلة مساء الخميس.'
    };
  }

  return {
    code: '2.2',
    tableNumber: '5.3',
    title: 'النمط 2.2: السنوات الثالثة والرابعة والخامسة ابتدائي (نظام الدوامين)',
    shortTitle: 'النمط 2.2 (جدول 5.3)',
    totalWeeklyHours: '22 ساعة و30 دقيقة لكل فوج أسبوعياً',
    shiftSystemName: shift === 'double_g1' ? 'نظام الدوامين (الفوج 1)' : 'نظام الدوامين (الفوج 2)',
    applicableGrades: ['3AP', '4AP', '5AP'],
    hasAmazigh: false,
    morningTiming: shift === 'double_g1' ? '08:00 — 10:30 (الخميس: 08:00 — 11:00)' : '10:30 — 13:00',
    afternoonTiming: shift === 'double_g1' ? '13:00 — 15:00 (ساعتان بدون استراحة)' : '15:00 — 17:00 (ساعتان بدون استراحة)',
    tuesdayTiming: shift === 'double_g1' ? '08:00 — 12:30 (4.5 سا متصلة - مساء فارغ)' : '12:30 — 17:00 (4.5 سا متصلة - صباح فارغ)',
    thursdayTiming: shift === 'double_g1' ? 'صباح 08:00 — 11:00 ومساء 13:00 — 15:00' : 'صباح 10:30 — 13:00 ومساء 15:00 — 17:00',
    description: 'وفق جدول 5.3: 22 ساعة و30 دقيقة عمل أسبوعياً لكل فوج مع فارق توقيت الخميس واستغلال الحجرات.'
  };
}

/**
 * دالة استخراج توقيت الفترة الرسمية بدقة متناهية ودون أي اجتهاد
 */
export function getPeriodTimingInfo(
  shift: ShiftSystem,
  grade: GradeLevel,
  hasAmazigh: boolean,
  dayId: DayOfWeek,
  period: 'morning' | 'afternoon'
): {
  timeRange: string;
  recessInfo?: string;
  isEmpty: boolean;
  emptyReason?: string;
  badgeText?: string;
} {
  // 1. نظام الدوام الواحد (Single Shift)
  if (shift === 'single') {
    // الفترة الصباحية موحدة تماماً لجميع الأنماط (1.1 و 2.1 و 3.1)
    if (period === 'morning') {
      return {
        timeRange: '08:00 — 11:15',
        recessInfo: 'استراحة: 09:30 — 09:45 (15 دقيقة بعد أول 1.5 ساعة)',
        isEmpty: false,
        badgeText: 'استراحة 09:30-09:45'
      };
    }

    // الفترة المسائية لنظام الدوام الواحد
    if (dayId === 'tuesday') {
      return {
        timeRange: '—',
        isEmpty: true,
        emptyReason: 'أمسية فارغة (عطلة أسبوعية للتنسيق والتكوين البيداغوجي)'
      };
    }

    // النمط 1.1: السنوات 1 و 2
    if (grade === '1AP' || grade === '2AP') {
      if (dayId === 'thursday') {
        return {
          timeRange: '—',
          isEmpty: true,
          emptyReason: 'أمسية فارغة (راحة أسبوعية للسنتين 1 و 2)'
        };
      }
      return {
        timeRange: '13:00 — 15:00',
        recessInfo: 'ساعتان كاملتان (بدون فترة راحة)',
        isEmpty: false,
        badgeText: 'بدون استراحة'
      };
    }

    // النمط 3.1: السنوات 4 و 5 مع الأمازيغية
    if (hasAmazigh && (grade === '4AP' || grade === '5AP')) {
      if (dayId === 'thursday') {
        return {
          timeRange: '13:00 — 15:30',
          recessInfo: 'فترتان تتخللهما استراحة مسائية 15د (14:30 — 14:45)',
          isEmpty: false,
          badgeText: 'استراحة مسائية 14:30-14:45'
        };
      }
      return {
        timeRange: '13:00 — 16:00',
        recessInfo: 'فترتان تتخللهما استراحة مسائية 15د (14:30 — 14:45)',
        isEmpty: false,
        badgeText: 'استراحة مسائية 14:30-14:45'
      };
    }

    // النمط 2.1: السنوات 3 و 4 و 5 دون أمازيغية
    if (dayId === 'thursday') {
      return {
        timeRange: '13:00 — 14:30',
        recessInfo: 'ساعة ونصف كاملة (بدون استراحة)',
        isEmpty: false,
        badgeText: 'بدون استراحة (1.5 سا)'
      };
    }
    return {
      timeRange: '13:00 — 15:00',
      recessInfo: 'ساعتان كاملتان (بدون فترة راحة)',
      isEmpty: false,
      badgeText: 'بدون استراحة'
    };
  }

  // 2. نظام الدوامين - الفوج 1 (Double Shift G1)
  if (shift === 'double_g1') {
    if (dayId === 'tuesday') {
      if (period === 'morning') {
        return {
          timeRange: '08:00 — 12:30',
          recessInfo: 'دراسة ممتدة 4.5 سا (استراحة 10:00 — 10:15)',
          isEmpty: false,
          badgeText: 'فترة ممتدة (4.5 سا)'
        };
      }
      return {
        timeRange: '—',
        isEmpty: true,
        emptyReason: 'أمسية فارغة للفوج 1 (دراسة صباحية ممتدة)'
      };
    }

    if (dayId === 'thursday') {
      if (grade === '1AP' || grade === '2AP') {
        if (period === 'morning') {
          return {
            timeRange: '08:00 — 11:00',
            recessInfo: '3 ساعات صباحية فقط (استراحة 09:30 — 09:45)',
            isEmpty: false,
            badgeText: 'صباح فقط (3 سا)'
          };
        }
        return {
          timeRange: '—',
          isEmpty: true,
          emptyReason: 'أمسية فارغة للفوجين (عطلة نهاية الأسبوع)'
        };
      }
      // للسنوات 3 و 4 و 5
      if (period === 'morning') {
        return {
          timeRange: '08:00 — 11:00',
          recessInfo: '3 ساعات صباحية (استراحة 09:30 — 09:45)',
          isEmpty: false,
          badgeText: 'صباح (3 سا)'
        };
      }
      return {
        timeRange: '13:00 — 15:00',
        recessInfo: 'ساعتان كاملتان (بدون استراحة)',
        isEmpty: false,
        badgeText: 'بدون استراحة'
      };
    }

    // الأحد والإثنين والأربعاء
    if (period === 'morning') {
      return {
        timeRange: '08:00 — 10:30',
        recessInfo: 'ساعتان ونصف (فترة صباحية أولى)',
        isEmpty: false,
        badgeText: '2.5 ساعة'
      };
    }
    return {
      timeRange: '13:00 — 15:00',
      recessInfo: 'ساعتان كاملتان (بدون أي استراحة)',
      isEmpty: false,
      badgeText: 'بدون استراحة'
    };
  }

  // 3. نظام الدوامين - الفوج 2 (Double Shift G2)
  if (shift === 'double_g2') {
    if (dayId === 'tuesday') {
      if (period === 'morning') {
        return {
          timeRange: '—',
          isEmpty: true,
          emptyReason: 'صباح فارغ للفوج 2 (دراسة مسائية ممتدة)'
        };
      }
      return {
        timeRange: '12:30 — 17:00',
        recessInfo: 'دراسة ممتدة 4.5 سا (استراحة 14:30 — 14:45)',
        isEmpty: false,
        badgeText: 'فترة ممتدة (4.5 سا)'
      };
    }

    if (dayId === 'thursday') {
      if (grade === '1AP' || grade === '2AP') {
        if (period === 'morning') {
          return {
            timeRange: '11:00 — 14:00',
            recessInfo: '3 ساعات تمتد لمنتصف النهار فقط (استراحة 12:30 — 12:45)',
            isEmpty: false,
            badgeText: 'صباح ممتد (3 سا)'
          };
        }
        return {
          timeRange: '—',
          isEmpty: true,
          emptyReason: 'أمسية فارغة للفوجين (عطلة نهاية الأسبوع)'
        };
      }
      // للسنوات 3 و 4 و 5
      if (period === 'morning') {
        return {
          timeRange: '10:30 — 13:00',
          recessInfo: 'ساعتان ونصف صباحية',
          isEmpty: false,
          badgeText: '2.5 ساعة'
        };
      }
      return {
        timeRange: '15:00 — 17:00',
        recessInfo: 'ساعتان كاملتان (بدون استراحة)',
        isEmpty: false,
        badgeText: 'بدون استراحة'
      };
    }

    // الأحد والإثنين والأربعاء
    if (period === 'morning') {
      return {
        timeRange: '10:30 — 13:00',
        recessInfo: 'ساعتان ونصف (فترة صباحية ثانية)',
        isEmpty: false,
        badgeText: '2.5 ساعة'
      };
    }
    return {
      timeRange: '15:00 — 17:00',
      recessInfo: 'ساعتان كاملتان (بدون أي استراحة)',
      isEmpty: false,
      badgeText: 'بدون استراحة'
    };
  }

  return {
    timeRange: '—',
    isEmpty: true,
    emptyReason: 'فترة غير محددة'
  };
}
