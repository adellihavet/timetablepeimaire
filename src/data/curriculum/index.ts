import { GradeCurriculum, GradeLevel } from '../../types';
import { SUBJECT_COLORS, getSubjectColorConfig } from './colors';
import type { SubjectColorTheme } from './colors';
import { OFFICIAL_DOCUMENTS } from './documents';
import { AMAZIGH_SUBJECT } from './amazigh';
import { GRADE_1_CURRICULUM } from './grade1';
import { GRADE_2_CURRICULUM } from './grade2';
import { GRADE_3_CURRICULUM } from './grade3';
import { GRADE_4_CURRICULUM } from './grade4';
import { GRADE_5_CURRICULUM } from './grade5';

// Export types and modules
export type { SubjectColorTheme };
export {
  SUBJECT_COLORS,
  getSubjectColorConfig,
  OFFICIAL_DOCUMENTS,
  AMAZIGH_SUBJECT,
  GRADE_1_CURRICULUM,
  GRADE_2_CURRICULUM,
  GRADE_3_CURRICULUM,
  GRADE_4_CURRICULUM,
  GRADE_5_CURRICULUM,
};

/**
 * الخريطة الشاملة لمناهج ومواقيت كافة المستويات التعليمية الابتدائية (1AP - 5AP)
 * مجمعة من ملفات المستويات المستقلة
 */
export const OFFICIAL_CURRICULA: Record<GradeLevel, GradeCurriculum> = {
  '1AP': GRADE_1_CURRICULUM,
  '2AP': GRADE_2_CURRICULUM,
  '3AP': GRADE_3_CURRICULUM,
  '4AP': GRADE_4_CURRICULUM,
  '5AP': GRADE_5_CURRICULUM,
};

/**
 * دالة استرجاع المنهاج الرسمي مع مراعاة وجود اللغة الأمازيغية من عدمه
 * - في حالة تفعيل الأمازيغية في السنة الرابعة أو الخامسة: يُضاف نصاب 3 ساعات (4 حصص ذات 45د)
 *   ويصبح الحجم الإجمالي 25.5 ساعة أسبوعياً.
 */
export function getCurriculumForGrade(grade: GradeLevel, hasAmazigh: boolean = false): GradeCurriculum {
  const base = OFFICIAL_CURRICULA[grade] || GRADE_1_CURRICULUM;
  if (!hasAmazigh || (grade !== '4AP' && grade !== '5AP')) {
    return base;
  }

  // في حالة تدريس اللغة الأمازيغية في السنة الرابعة أو الخامسة (النمط 3.1 - جدول 3.3 بالدليل التطبيقي)
  return {
    ...base,
    totalWeeklyHours: 25.5,
    totalSessions: base.totalSessions + 4,
    legalReference: 'القرار رقم 16 وجدول 3.3 بالدليل التطبيقي الرسمي للمواقيت (25 سا و 30 د)',
    precedenceNote: 'يتضمن 3 ساعات أسبوعية مخصصة للغة الأمازيغية (4 حصص ذات 45 دقيقة) موزعة مسائياً.',
    subjects: [...base.subjects, AMAZIGH_SUBJECT]
  };
}
