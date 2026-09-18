import { GradeCurriculum } from '../../types';
import { SUBJECT_COLORS } from './colors';

/**
 * منهاج ومواقيت السنة الثالثة ابتدائي (3AP)
 * - الحجم الساعي الأسبوعي: 21 ساعة أسبوعياً
 * - عدد الحصص الأسبوعية: 29 حصة
 * - اللغة الفرنسية: ملغاة رسمياً (0 سا) وفق القرار رقم 16 والمنشور 467
 * - اللغة الإنجليزية: ساعتان (02 سا) - حصتان ذات 1 ساعة (أستاذ الإنجليزية)
 * - التربية البدنية: ساعتان (02 سا) - حصتان ذات 1 ساعة (أستاذ التربية البدنية)
 * - الرياضيات: 5 ساعات كاملة (05 سا) - 7 حصص
 * - اللغة العربية: 7 ساعات ونصف (07 سا و 30 د) - 9 حصص
 */
export const GRADE_3_CURRICULUM: GradeCurriculum = {
  grade: '3AP',
  gradeLabel: 'السنة الثالثة ابتدائي (3AP) - المواقيت الرسمية الدقيقة',
  gradeArabicName: 'السنة الثالثة من التعليم الابتدائي',
  schoolYear: '2025-2026',
  totalWeeklyHours: 21,
  totalSessions: 29,
  legalReference: 'المذكرة المنهجية رقم 03 والمنشور الوزاري رقم 467 والقرار رقم 16',
  precedenceNote: 'تفصيل مواقيت وحصص السنة الثالثة ابتدائي (الحجم الإجمالي: 21 ساعة أسبوعياً موزعة على 29 حصة بدقة متناهية): مادة اللغة العربية (7:30 سا / 9 حصص: 6 حصص 60د و3 حصص 30د)، مادة الرياضيات (5:00 سا / 7 حصص: 3 حصص 60د و4 حصص 30د مدمجة بحجم 1:30 سا مفصولة بنشاط فاصل + 30د ألعاب رياضياتية نهاية الأسبوع)، اللغة الإنجليزية (2:00 سا / حصتان 60د)، التربية البدنية (2:00 سا / حصتان 60د)، التربية الإسلامية (1:30 سا / 3 حصص 30د)، التربية الفنية (1:30 سا / 3 حصص 30د)، التربية العلمية والتكنولوجية (1:00 سا / حصتان 30د)، التاريخ (0:30 سا / حصة واحدة 30د).',
  subjects: [
    {
      id: 'arabic',
      name: 'اللغة العربية',
      shortName: 'لغة عربية',
      color: SUBJECT_COLORS.arabic.bg,
      borderColor: SUBJECT_COLORS.arabic.border,
      textColor: SUBJECT_COLORS.arabic.text,
      teacherRole: 'arabic_teacher',
      totalWeeklyHours: 7.5,
      totalSessions: 9,
      sessions60: 6,
      sessions45: 0,
      sessions30: 3,
      notes: '7 ساعات ونصف (07:30 سا) أسبوعياً مقسمة على 9 حصص (6 حصص 60د، و3 حصص 30د): الأحد (فهم المنطوق 30د، تعبير شفوي 30د، قراءة أداء وفهم 1سا)، الإثنين (إنتاج شفوي 1سا)، الثلاثاء (قراءة وظاهرة تركيبية 1سا، محفوظات 30د)، الأربعاء (قراءة وظاهرة صرفية أو إملائية 1سا، مطالعة 1سا)، الخميس (الإنتاج الكتابي 1سا).',
      activities: [
        'اليوم 1 - الحصة 1: فهم المنطوق (30د) - مرحلة العرض / الأجرأة / مسرحة الأحداث / اكتشاف الجوانب القيمية في النص المنطوق',
        'اليوم 1 - الحصة 2: تعبير شفوي (30د) - التعبير مشافهة حول موضوع المنطوق انطلاقاً من الواقع المعاش، واستعمال الصيغ والأساليب في وضعيات تواصلية دالة، والإنتاج انطلاقاً من سندات بصرية أو لغوية',
        'اليوم 1 - الحصة 3: قراءة: أداء وفهم (60د) - قراءة النص قراءة سليمة ومسترسلة وفهم المعاني الخفية والظاهرة',
        'اليوم 2 - الحصة 4: الإنتاج الشفوي (60د) - التدريب على التعبير والتواصل الشفوي واستثمار المكتسبات الشفوية',
        'اليوم 3 - الحصة 5: قراءة ودراسة ظاهرة تركيبية وتطبيقاتها (60د) - قراءة النص، التدريب على الظاهرة التركيبية ضمنياً، وإنجاز بعض التطبيقات الشفهية أو الكتابية حسب الحالة',
        'اليوم 3 - الحصة 6: المحفوظات (30د) - حفظ مقطوعة شعرية مناسبة للمحتوى، وتقديم وتحليل المعاني وتذوقها وإنشادها',
        'اليوم 4 - الحصة 7: قراءة ودراسة ظاهرة إملائية أو صرفية وتطبيقاتها (60د) - قراءة النص، التدريب على الظاهرة الصرفية أو الإملائية ضمنياً، وإنجاز تطبيقات شفهية أو كتابية حسب الحالة',
        'اليوم 4 - الحصة 8: المطالعة (60د) - مطالعة نصوص أو قصص أو مواضيع قريبة من اهتمامات الأطفال ومحيطهم وتنمية حب القراءة الحرة',
        'اليوم 5 - الحصة 9: الإنتاج الكتابي (60د) - التدريب على الإنتاج الكتابي وفقاً للمذكرة المنهجية رقم 03 لسنة 2018 الصادرة عن المفتشية العامة للبيداغوجيا'
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
      totalWeeklyHours: 5,
      totalSessions: 7,
      sessions60: 3,
      sessions45: 0,
      sessions30: 4,
      notes: '5 ساعات أسبوعياً مقسمة على 7 حصص (3 حصص 60د، و4 حصص 30د): تُقدَّم في شكل حصص مدمجة بحجم ساعة ونصف في نفس الفترة (60د + 30د) تُفصل بينهما مادة أخرى لتفادي إرهاق المتعلم، ونصف ساعة (30د) متبقية بنهاية الأسبوع للألعاب الرياضياتية',
      activities: [
        'رياضيات (حصة مدمجة 1: بناء المفاهيم والأنشطة العددية - 60 دقيقة)',
        'رياضيات (تطبيقات وتمارين تابعة للحصة المدمجة 1 - 30 دقيقة)',
        'رياضيات (حصة مدمجة 2: هندسة وقياس وتنظيم معطيات - 60 دقيقة)',
        'رياضيات (تطبيقات هندسية تابعة للحصة المدمجة 2 - 30 دقيقة)',
        'رياضيات (حصة مدمجة 3: حل مشكلات وأنشطة عددية - 60 دقيقة)',
        'رياضيات (تطبيقات حل المشكلات تابعة للحصة المدمجة 3 - 30 دقيقة)',
        'رياضيات (ألعاب رياضياتية وتفكير إبداعي بنهاية الأسبوع - 30 دقيقة)'
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
      notes: 'ساعتان (02:00 سا) أسبوعياً مقسمة على حصتين مدة كل واحدة منهما 60 دقيقة دون وجود حصص ذات 30 دقيقة',
      activities: [
        'English - Session 1: Oral Interaction & Vocabulary (60mn)',
        'English - Session 2: Reading & Discovery / Phonics (60mn)'
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
      notes: 'ساعة واحدة (01:00 سا) أسبوعياً مقسمة على حصتين مدة كل منهما 30 دقيقة',
      activities: [
        'تربية علمية وتكنولوجية - الحصة 1: ملاحظة واستكشاف وتجريب (30 دقيقة)',
        'تربية علمية وتكنولوجية - الحصة 2: استنتاج وتطبيقات علمية (30 دقيقة)'
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
      totalWeeklyHours: 1.5,
      totalSessions: 3,
      sessions60: 0,
      sessions45: 0,
      sessions30: 3,
      notes: 'ساعة ونصف (01:30 سا) أسبوعياً مقسمة على 3 حصص مدة كل حصة منها 30 دقيقة',
      activities: [
        'تربية إسلامية - الحصة 1: قرآن كريم وتفسير (30 دقيقة)',
        'تربية إسلامية - الحصة 2: حديث نبوي شريف وسيرة (30 دقيقة)',
        'تربية إسلامية - الحصة 3: عقائد وآداب وأخلاق وسلوك (30 دقيقة)'
      ]
    },
    {
      id: 'history',
      name: 'التاريخ',
      shortName: 'تاريخ',
      color: SUBJECT_COLORS.history.bg,
      borderColor: SUBJECT_COLORS.history.border,
      textColor: SUBJECT_COLORS.history.text,
      teacherRole: 'arabic_teacher',
      totalWeeklyHours: 0.5,
      totalSessions: 1,
      sessions60: 0,
      sessions45: 0,
      sessions30: 1,
      notes: 'نصف ساعة (00:30 سا) أسبوعياً تُقدَّم في حصة واحدة مدتها 30 دقيقة (دون جغرافيا)',
      activities: [
        'تاريخ - الحصة 1: دراسة معالم وآثار وأحداث تاريخية (30 دقيقة)'
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
      totalWeeklyHours: 1.5,
      totalSessions: 3,
      sessions60: 0,
      sessions45: 0,
      sessions30: 3,
      notes: 'ساعة ونصف (01:30 سا) أسبوعياً مقسمة على 3 حصص مدة كل حصة منها 30 دقيقة',
      activities: [
        'تربية فنية - الحصة 1: تربية تشكيلية ورسم (30 دقيقة)',
        'تربية فنية - الحصة 2: تربية موسيقية وأناشيد (30 دقيقة)',
        'تربية فنية - الحصة 3: أشغال يدوية وتذوق فني (30 دقيقة)'
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
      totalWeeklyHours: 2,
      totalSessions: 2,
      sessions60: 2,
      sessions45: 0,
      sessions30: 0,
      notes: 'ساعتان (02:00 سا) أسبوعياً مقسمة على حصتين مدة كل حصة منهما 60 دقيقة دون حصص 30 دقيقة',
      activities: [
        'تربية بدنية ورياضية - الحصة 1 (60 دقيقة)',
        'تربية بدنية ورياضية - الحصة 2 (60 دقيقة)'
      ]
    }
  ]
};
