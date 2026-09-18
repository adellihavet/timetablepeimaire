import { GradeCurriculum } from '../../types';
import { SUBJECT_COLORS } from './colors';

/**
 * منهاج ومواقيت السنة الرابعة ابتدائي (4AP)
 * حُسم وفق المنشور الوزاري رقم 468 المؤرخ في 16 سبتمبر 2026 والقرار رقم 16:
 * - الحجم الساعي الإجمالي: 22:30 ساعة (بدون أمازيغية) / 25:30 ساعة (مع الأمازيغية 3سا)
 * - عدد الحصص الأسبوعية: 32 حصة
 * - اللغة الفرنسية: ساعتان (02 سا) - حصتان ذات 1 ساعة (أستاذ الفرنسية)
 * - اللغة الإنجليزية: ساعتان (02 سا) - حصتان ذات 1 ساعة بعد إضافة 30د (أستاذ الإنجليزية)
 * - التربية البدنية: ساعة ونصف (01 سا و 30 د) - حصة واحدة مجمعة ذات 90 دقيقة (أستاذ البدنية)
 * - التربية الإسلامية: ساعتان (02 سا) - 4 حصص ذات 30 دقيقة
 * - الرياضيات: 4 ساعات ونصف (04 سا و 30 د) - 6 حصص
 * - اللغة العربية: 6 ساعات ونصف (06 سا و 30 د) - 9 حصص
 */
export const GRADE_4_CURRICULUM: GradeCurriculum = {
  grade: '4AP',
  gradeLabel: 'السنة الرابعة ابتدائي (4AP) - المنشور الوزاري 468 (16 سبتمبر 2026)',
  gradeArabicName: 'السنة الرابعة من التعليم الابتدائي',
  schoolYear: '2026-2027',
  totalWeeklyHours: 22.5,
  totalSessions: 32,
  legalReference: 'المنشور الوزاري رقم 468 المؤرخ في 16 سبتمبر 2026 والقرار رقم 16',
  precedenceNote: 'وفق المنشور الوزاري رقم 468 الصادر في 16 سبتمبر 2026: تم اعتماد التوقيت الرسمي للسنة الرابعة بإضافة 30د للغة الإنجليزية (لتصبح 2 سا: حصتان 1سا)، وإضافة 30د للتربية الإسلامية تخصص للتربية الخُلُقية وترسيخ القيم (لتصبح 2 سا: 4 حصص ذات 30د)، وتعديل التربية البدنية إلى حصة واحدة مجمعة ذات ساعة ونصف (01 × 1سا و30د)، وتدعيم التربية المدنية والتربية الفنية بـ 15د لتصبح كل منهما ساعة واحدة (حصتان ذات 30د)، والتربية العلمية ساعة (حصتان ذات 30د)، والتاريخ والجغرافيا ساعة (حصتان ذات 30د)، والعربية 6:30سا (4×1سا + 5×30د)، والرياضيات 4:30سا (3×1سا + 3×30د).',
  subjects: [
    {
      id: 'arabic',
      name: 'اللغة العربية',
      shortName: 'لغة عربية',
      color: SUBJECT_COLORS.arabic.bg,
      borderColor: SUBJECT_COLORS.arabic.border,
      textColor: SUBJECT_COLORS.arabic.text,
      teacherRole: 'arabic_teacher',
      totalWeeklyHours: 6.5,
      totalSessions: 9,
      sessions60: 4,
      sessions45: 0,
      sessions30: 5,
      notes: '6 ساعات ونصف أسبوعياً (4 حصص 60د + 5 حصص 30د وفق المنشور 468)',
      activities: [
        'فهم المنطوق (30د)',
        'تعبير شفوي (30د)',
        'إنتاج شفوي (30د)',
        'قراءة وأداء وفهم (1سا)',
        'محفوظات (30د)',
        'قراءة ودراسة ظاهرة تركيبية (1سا)',
        'قراءة ودراسة ظاهرة صرفية أو إملائية (1سا)',
        'مطالعة (30د)',
        'الإنتاج الكتابي (1سا)'
      ]
    },
    {
      id: 'french',
      name: 'اللغة الفرنسية',
      shortName: 'لغة فرنسية',
      color: SUBJECT_COLORS.french.bg,
      borderColor: SUBJECT_COLORS.french.border,
      textColor: SUBJECT_COLORS.french.text,
      teacherRole: 'french_teacher',
      totalWeeklyHours: 2,
      totalSessions: 2,
      sessions60: 2,
      sessions45: 0,
      sessions30: 0,
      notes: 'ساعتان أسبوعياً (حصتان ذات 1 ساعة) موزعة يومي الأحد والأربعاء طبقاً للمنشور 468',
      activities: [
        'Séance 1: Compréhension & Expression Orale (60mn)',
        'Séance 2: Lecture & Production de l\'écrit (60mn)'
      ]
    },
    {
      id: 'english',
      name: 'اللغة الإنجليزية',
      shortName: 'لغة إنجليزية',
      color: SUBJECT_COLORS.english.bg,
      borderColor: SUBJECT_COLORS.english.border,
      textColor: SUBJECT_COLORS.english.text,
      teacherRole: 'english_teacher',
      totalWeeklyHours: 2,
      totalSessions: 2,
      sessions60: 2,
      sessions45: 0,
      sessions30: 0,
      notes: 'ساعتان أسبوعياً (حصتان ذات 1 ساعة) بعد إضافة 30 دقيقة طبقاً للمنشور رقم 468 المؤرخ في 16 سبتمبر 2026',
      activities: [
        'Session 1: Oral Communication & Vocabulary (60mn)',
        'Session 2: Reading & Writing Project (60mn)'
      ]
    },
    {
      id: 'math',
      name: 'الرياضيات',
      shortName: 'رياضيات',
      color: SUBJECT_COLORS.math.bg,
      borderColor: SUBJECT_COLORS.math.border,
      textColor: SUBJECT_COLORS.math.text,
      teacherRole: 'arabic_teacher',
      totalWeeklyHours: 4.5,
      totalSessions: 6,
      sessions60: 3,
      sessions45: 0,
      sessions30: 3,
      notes: '4 ساعات ونصف أسبوعياً (3 حصص 60د + 3 حصص 30د تابعة) وفق المنشور 468',
      activities: [
        'بناء المفاهيم والأنشطة العددية (60د)',
        'تمارين وتطبيقات بناء المفهوم (30د تابعة)',
        'هندسة وقياس وتنظيم معطيات (60د)',
        'تطبيقات هندسية (30د تابعة)',
        'حل مشكلات وحساب (60د)',
        'تطبيقات حل المشكلات والمعالجة (30د تابعة)'
      ]
    },
    {
      id: 'science',
      name: 'التربية العلمية والتكنولوجية',
      shortName: 'ت. علمية',
      color: SUBJECT_COLORS.science.bg,
      borderColor: SUBJECT_COLORS.science.border,
      textColor: SUBJECT_COLORS.science.text,
      teacherRole: 'arabic_teacher',
      totalWeeklyHours: 1,
      totalSessions: 2,
      sessions60: 0,
      sessions45: 0,
      sessions30: 2,
      notes: 'ساعة واحدة أسبوعياً (حصتان ذات 30د) تتناوب يومياً مع الرياضيات طبقاً للمنشور 468',
      activities: [
        'ملاحظة وتجريب علمي 1 (30د)',
        'استنتاج وتطبيقات تكنولوجية 2 (30د)'
      ]
    },
    {
      id: 'islamic',
      name: 'التربية الإسلامية',
      shortName: 'ت. إسلامية',
      color: SUBJECT_COLORS.islamic.bg,
      borderColor: SUBJECT_COLORS.islamic.border,
      textColor: SUBJECT_COLORS.islamic.text,
      teacherRole: 'arabic_teacher',
      totalWeeklyHours: 2,
      totalSessions: 4,
      sessions60: 0,
      sessions45: 0,
      sessions30: 4,
      notes: 'ساعتان أسبوعياً (4 حصص ذات 30د) بعد إضافة 30 دقيقة خُصصت للتربية الخُلُقية طبقاً للمنشور رقم 468',
      activities: [
        'قرآن كريم وتفسير (30د)',
        'عقائد وعبادات (30د)',
        'سيرة نبوية وآداب (30د)',
        'تربية خُلُقية وترسيخ القيم والفضائل (30د - الحصة المضافة بالمنشور 468)'
      ]
    },
    {
      id: 'civics',
      name: 'التربية المدنية',
      shortName: 'ت. مدنية',
      color: SUBJECT_COLORS.civics.bg,
      borderColor: SUBJECT_COLORS.civics.border,
      textColor: SUBJECT_COLORS.civics.text,
      teacherRole: 'arabic_teacher',
      totalWeeklyHours: 1,
      totalSessions: 2,
      sessions60: 0,
      sessions45: 0,
      sessions30: 2,
      notes: 'ساعة واحدة أسبوعياً (حصتان ذات 30د) بعد تدعيمها بـ 15 دقيقة طبقاً للمنشور 468',
      activities: [
        'مفاهيم المواطنة والمؤسسات (30د)',
        'المسؤولية المدنية والحياة الجماعية (30د)'
      ]
    },
    {
      id: 'history_geo',
      name: 'تاريخ و جغرافيا',
      shortName: 'تاريخ وجغرافيا',
      color: SUBJECT_COLORS.history_geo.bg,
      borderColor: SUBJECT_COLORS.history_geo.border,
      textColor: SUBJECT_COLORS.history_geo.text,
      teacherRole: 'arabic_teacher',
      totalWeeklyHours: 1,
      totalSessions: 2,
      sessions60: 0,
      sessions45: 0,
      sessions30: 2,
      notes: 'ساعة واحدة أسبوعياً: حصة تاريخ (30د) + حصة جغرافيا (30د) طبقاً للمنشور 468',
      activities: [
        'حصة التاريخ الوطني (30د)',
        'حصة الجغرافيا والبيئة (30د)'
      ]
    },
    {
      id: 'art',
      name: 'التربية الفنية',
      shortName: 'ت. فنية',
      color: SUBJECT_COLORS.art.bg,
      borderColor: SUBJECT_COLORS.art.border,
      textColor: SUBJECT_COLORS.art.text,
      teacherRole: 'arabic_teacher',
      totalWeeklyHours: 1,
      totalSessions: 2,
      sessions60: 0,
      sessions45: 0,
      sessions30: 2,
      notes: 'ساعة واحدة أسبوعياً (حصتان ذات 30د: تشكيلية وموسيقية) بعد تدعيمها بـ 15 دقيقة طبقاً للمنشور 468',
      activities: [
        'تربية تشكيلية ورسم (30د)',
        'تربية موسيقية وأناشيد (30د)'
      ]
    },
    {
      id: 'pe',
      name: 'التربية البدنية والرياضية',
      shortName: 'ت. بدنية',
      color: SUBJECT_COLORS.pe.bg,
      borderColor: SUBJECT_COLORS.pe.border,
      textColor: SUBJECT_COLORS.pe.text,
      teacherRole: 'pe_teacher',
      totalWeeklyHours: 1.5,
      totalSessions: 1,
      sessions90: 1,
      sessions60: 0,
      sessions45: 0,
      sessions30: 0,
      notes: 'ساعة ونصف أسبوعياً (حصة واحدة مجمعة ذات 1سا و30د في بداية الفترة المسائية) طبقاً للمنشور رقم 468',
      activities: [
        'تربية بدنية ورياضية - حصة مجمعة في أول الفترة (1سا و30د)'
      ]
    }
  ]
};
