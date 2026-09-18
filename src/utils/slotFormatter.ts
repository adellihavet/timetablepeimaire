import { TimeSlot, SubjectId } from '../types';

/**
 * Format slot title and display according to strict ministerial rules:
 * - In Arabic language (لغة عربية): write ONLY the activity name (e.g. "فهم المنطوق", "قراءة وتعبير", "كتابة", "تراكيب نحوية", "صرف", etc.), NEVER write "اللغة العربية".
 * - In all other subjects: write ONLY the official subject name without subtitles or additions (e.g. "رياضيات" only, "تربية إسلامية" only, etc.).
 */
export function getCleanSlotTitle(slot: TimeSlot): string {
  if (slot.isRecess || slot.subjectId === 'recess') {
    return 'استراحة';
  }

  if (slot.subjectId === 'arabic') {
    // In Arabic: activity name ONLY, never write "اللغة العربية"
    return slot.activityName || 'نشاط لغوي';
  }

  if (slot.subjectId === 'math' && slot.activityName && slot.activityName.includes('ألعاب رياضياتية')) {
    return 'ألعاب رياضياتية';
  }

  const subjectNames: Record<SubjectId | 'free', string> = {
    arabic: 'لغة عربية',
    math: 'رياضيات',
    islamic: 'تربية إسلامية',
    science: 'تربية علمية',
    civics: 'تربية مدنية',
    history_geo: 'تاريخ وجغرافيا',
    history: 'تاريخ',
    art: 'تربية فنية',
    pe: 'تربية بدنية ورياضية',
    french: 'لغة فرنسية',
    english: 'لغة إنجليزية',
    amazigh: 'لغة أمازيغية',
    recess: 'استراحة',
    free: 'شاغر'
  };

  return subjectNames[slot.subjectId] || slot.subjectId;
}

export function getCleanGradeName(grade: string): string {
  switch (grade) {
    case '1AP': return 'السنة الأولى';
    case '2AP': return 'السنة الثانية';
    case '3AP': return 'السنة الثالثة';
    case '4AP': return 'السنة الرابعة';
    case '5AP': return 'السنة الخامسة';
    default: return grade;
  }
}
