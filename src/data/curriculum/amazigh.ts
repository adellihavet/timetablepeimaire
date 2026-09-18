import { SubjectAllocation } from '../../types';
import { SUBJECT_COLORS } from './colors';

/**
 * مادة اللغة الأمازيغية الرسمية (النمط 3.1 - جدول 3.3 بالدليل التطبيقي الرسمي والقرار رقم 16)
 * - الحجم الساعي الأسبوعي: 3 ساعات (03 سا)
 * - عدد الحصص الأسبوعية: 4 حصص ذات 45 دقيقة (4 × 45 د)
 * - تسند لأستاذ(ة) اللغة الأمازيغية المتخصص(ة)
 */
export const AMAZIGH_SUBJECT: SubjectAllocation = {
  id: 'amazigh',
  name: 'اللغة الأمازيغية',
  shortName: 'أمازيغية',
  color: SUBJECT_COLORS.amazigh.bg,
  borderColor: SUBJECT_COLORS.amazigh.border,
  textColor: SUBJECT_COLORS.amazigh.text,
  teacherRole: 'amazigh_teacher',
  totalWeeklyHours: 3,
  totalSessions: 4,
  sessions60: 0,
  sessions45: 4,
  sessions30: 0,
  activities: [
    'حصة 1: فهم المنطوق والتعبير (45د)',
    'حصة 2: قراءة وأداء وفهم (45د)',
    'حصة 3: تراكيب وظواهر لغوية (45د)',
    'حصة 4: إنتاج كتابي ومشاريع (45د)'
  ]
};
