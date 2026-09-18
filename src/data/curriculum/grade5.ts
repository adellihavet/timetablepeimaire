import { GradeCurriculum } from '../../types';
import { SUBJECT_COLORS } from './colors';

/**
 * منهاج ومواقيت السنة الخامسة ابتدائي (5AP)
 * معتمد وفق القرار رقم 16 الأحدث:
 * - الحجم الساعي الإجمالي: 22:30 ساعة (بدون أمازيغية) / 25:30 ساعة (مع الأمازيغية 3سا)
 * - عدد الحصص الأسبوعية: 31 حصة
 * - اللغة الفرنسية: ساعتان (02 سا) - حصتان ذات 1 ساعة (أستاذ الفرنسية)
 * - اللغة الإنجليزية: ساعتان (02 سا) - حصتان ذات 1 ساعة (أستاذ الإنجليزية)
 * - التربية البدنية: ساعة ونصف (01 سا و 30 د) - حصتان: 60د + 30د (أستاذ البدنية)
 * - الرياضيات: 4 ساعات ونصف (04 سا و 30 د) - 6 حصص
 * - اللغة العربية: 6 ساعات ونصف (06 سا و 30 د) - 9 حصص
 */
export const GRADE_5_CURRICULUM: GradeCurriculum = {
  grade: '5AP',
  gradeLabel: 'السنة الخامسة ابتدائي (5AP) - الطور الثالث',
  gradeArabicName: 'السنة الخامسة من التعليم الابتدائي',
  schoolYear: '2025-2026',
  totalWeeklyHours: 22.5,
  totalSessions: 31,
  legalReference: 'القرار رقم 16 الأحدث المعتمد رسمياً',
  precedenceNote: 'تطابق كامل مع توقيت ومواد السنة الرابعة ابتدائي (الطور الثالث) وفق أحدث قرار وزاري رقم 16.',
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
      notes: '6 ساعات ونصف أسبوعياً (4 حصص 60د + 5 حصص 30د)',
      activities: [
        'قراءة وأداء وفهم (1سا)',
        'فهم المنطوق (30د)',
        'تعبير شفوي (30د)',
        'إنتاج شفوي (30د)',
        'قراءة ودراسة ظاهرة تركيبية (1سا)',
        'قراءة ودراسة ظاهرة صرفية أو إملائية (1سا)',
        'محفوظات (30د)',
        'مطالعة (30د)',
        'إنتاج كتابي (1سا)'
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
      notes: 'ساعتان أسبوعياً (حصتان ذات 1 ساعة) وفق القرار 16 الأحدث',
      activities: [
        'Séance 1: Compréhension & Production de l\'oral (60mn)',
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
      notes: 'ساعتان أسبوعياً (حصتان ذات 1 ساعة) وفق جدول القرار رقم 16',
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
      notes: '4 ساعات ونصف أسبوعياً (3 حصص 60د + 3 حصص 30د)',
      activities: [
        'أنشطة عددية وحسابية (60د)',
        'حساب سريع وتدريب (30د)',
        'أنشطة هندسية وقياس (60د)',
        'حل وضعيات ومشكلات (60د)',
        'تطبيقات وتثبيت (30د)',
        'معالجة ودعم (30د)'
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
      notes: 'ساعة واحدة أسبوعياً (حصتان ذات 30د وفق القرار 16)',
      activities: [
        'ملاحظة وتجريب علمي (30د)',
        'استنتاج وتطبيقات تكنولوجية (30د)'
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
      totalSessions: 3,
      sessions60: 1,
      sessions45: 0,
      sessions30: 2,
      notes: 'ساعتان أسبوعياً (حصة 60د + حصتان 30د) وفق جدول القرار رقم 16',
      activities: [
        'قرآن كريم وتفسير وحديث (60د)',
        'عقائد وعبادات ومعاملات (30د)',
        'سيرة وأخلاق (30د)'
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
      notes: 'ساعة واحدة أسبوعياً (حصتان ذات 30د) وفق جدول القرار 16',
      activities: [
        'مفاهيم المواطنة والمؤسسات الوطنية (30د)',
        'المسؤولية المدنية والعمل الجماعي (30د)'
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
      notes: 'ساعة واحدة أسبوعياً: حصة تاريخ (30د) + حصة جغرافيا (30د)',
      activities: [
        'حصة التاريخ الوطني (30د)',
        'حصة الجغرافيا العامة والوطنية (30د)'
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
      notes: 'ساعة واحدة أسبوعياً (حصتان ذات 30د) وفق القرار 16',
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
      totalSessions: 2,
      sessions60: 1,
      sessions45: 0,
      sessions30: 1,
      notes: 'ساعة ونصف أسبوعياً (حصة 60د + حصة 30د) وفق جدول القرار 16',
      activities: [
        'تربية بدنية رئيسية (60د)',
        'تربية بدنية وألعاب حركية (30د)'
      ]
    }
  ]
};
