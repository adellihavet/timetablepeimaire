import { SubjectId } from '../../types';

export interface SubjectColorTheme {
  bg: string;
  border: string;
  text: string;
  lightBg: string;
  hex: string;
  lightHex: string;
  borderHex: string;
  textHex: string;
  badgeHex: string;
}

export const SUBJECT_COLORS: Record<SubjectId, SubjectColorTheme> = {
  // اللغة العربية - زمردي عميق
  arabic: {
    bg: 'bg-emerald-600',
    border: 'border-emerald-500',
    text: 'text-emerald-950',
    lightBg: 'bg-emerald-50',
    hex: '#059669',
    lightHex: '#ecfdf5',
    borderHex: '#10b981',
    textHex: '#064e3b',
    badgeHex: '#047857'
  },
  // الرياضيات - أزرق ملكي زاهي
  math: {
    bg: 'bg-blue-600',
    border: 'border-blue-500',
    text: 'text-blue-950',
    lightBg: 'bg-blue-50',
    hex: '#2563eb',
    lightHex: '#eff6ff',
    borderHex: '#3b82f6',
    textHex: '#172554',
    badgeHex: '#1d4ed8'
  },
  // التربية الإسلامية - تيل / أخضر بحري وقور
  islamic: {
    bg: 'bg-teal-600',
    border: 'border-teal-500',
    text: 'text-teal-950',
    lightBg: 'bg-teal-50',
    hex: '#0d9488',
    lightHex: '#f0fdfa',
    borderHex: '#14b8a6',
    textHex: '#134e4a',
    badgeHex: '#0f766e'
  },
  // التربية العلمية والتكنولوجية - برتقالي كهرماني دافئ (متميز تماماً عن التاريخ)
  science: {
    bg: 'bg-amber-600',
    border: 'border-amber-500',
    text: 'text-amber-950',
    lightBg: 'bg-amber-50',
    hex: '#d97706',
    lightHex: '#fffbeb',
    borderHex: '#f59e0b',
    textHex: '#78350f',
    badgeHex: '#b45309'
  },
  // التربية المدنية - سماوي / أزرق زاهٍ
  civics: {
    bg: 'bg-sky-600',
    border: 'border-sky-500',
    text: 'text-sky-950',
    lightBg: 'bg-sky-50',
    hex: '#0284c7',
    lightHex: '#f0f9ff',
    borderHex: '#38bdf8',
    textHex: '#0c4a6e',
    badgeHex: '#0369a1'
  },
  // التاريخ والجغرافيا - بني ترابي / كهرماني غامق أصيل
  history_geo: {
    bg: 'bg-amber-800',
    border: 'border-amber-700',
    text: 'text-amber-950',
    lightBg: 'bg-amber-100/40',
    hex: '#92400e',
    lightHex: '#fef3c7',
    borderHex: '#b45309',
    textHex: '#451a03',
    badgeHex: '#78350f'
  },
  // التاريخ - بني ترابي / كهرماني غامق أصيل
  history: {
    bg: 'bg-amber-800',
    border: 'border-amber-700',
    text: 'text-amber-950',
    lightBg: 'bg-amber-100/40',
    hex: '#92400e',
    lightHex: '#fef3c7',
    borderHex: '#b45309',
    textHex: '#451a03',
    badgeHex: '#78350f'
  },
  // التربية الفنية - قرمزي فوشيا إبداعي
  art: {
    bg: 'bg-fuchsia-600',
    border: 'border-fuchsia-500',
    text: 'text-fuchsia-950',
    lightBg: 'bg-fuchsia-50',
    hex: '#c026d3',
    lightHex: '#fdf4ff',
    borderHex: '#d946ef',
    textHex: '#701a75',
    badgeHex: '#a21caf'
  },
  // التربية البدنية والرياضية - وردي قرمزي رياضي نشط
  pe: {
    bg: 'bg-rose-600',
    border: 'border-rose-500',
    text: 'text-rose-950',
    lightBg: 'bg-rose-50',
    hex: '#e11d48',
    lightHex: '#fff1f2',
    borderHex: '#f43f5e',
    textHex: '#881337',
    badgeHex: '#be123c'
  },
  // اللغة الفرنسية - أزرق نيلي كلاسيكي
  french: {
    bg: 'bg-indigo-600',
    border: 'border-indigo-500',
    text: 'text-indigo-950',
    lightBg: 'bg-indigo-50',
    hex: '#4f46e5',
    lightHex: '#eef2ff',
    borderHex: '#6366f1',
    textHex: '#312e81',
    badgeHex: '#4338ca'
  },
  // اللغة الإنجليزية - بنفسجي موف زاهي
  english: {
    bg: 'bg-violet-600',
    border: 'border-violet-500',
    text: 'text-violet-950',
    lightBg: 'bg-violet-50',
    hex: '#7c3aed',
    lightHex: '#f5f3ff',
    borderHex: '#8b5cf6',
    textHex: '#4c1d95',
    badgeHex: '#6d28d9'
  },
  // اللغة الأمازيغية - أخضر ليموني نضر
  amazigh: {
    bg: 'bg-lime-600',
    border: 'border-lime-500',
    text: 'text-lime-950',
    lightBg: 'bg-lime-50',
    hex: '#65a30d',
    lightHex: '#f7fee7',
    borderHex: '#84cc16',
    textHex: '#365314',
    badgeHex: '#4d7c0f'
  },
  // الاستراحة
  recess: {
    bg: 'bg-slate-400',
    border: 'border-slate-400',
    text: 'text-slate-800',
    lightBg: 'bg-slate-100',
    hex: '#64748b',
    lightHex: '#f1f5f9',
    borderHex: '#94a3b8',
    textHex: '#1e293b',
    badgeHex: '#475569'
  }
};

/**
 * دالة مساعدة لاسترجاع نسق الألوان المخصص للمادة
 */
export function getSubjectColorConfig(subjectId?: string): SubjectColorTheme {
  if (!subjectId) return SUBJECT_COLORS.arabic;
  if (subjectId in SUBJECT_COLORS) {
    return SUBJECT_COLORS[subjectId as SubjectId];
  }
  const lower = subjectId.toLowerCase();
  if (lower.includes('math') || lower.includes('رياضيات')) return SUBJECT_COLORS.math;
  if (lower.includes('french') || lower.includes('فرنسية')) return SUBJECT_COLORS.french;
  if (lower.includes('english') || lower.includes('إنجليزية')) return SUBJECT_COLORS.english;
  if (lower.includes('pe') || lower.includes('sport') || lower.includes('بدنية') || lower.includes('رياضة')) return SUBJECT_COLORS.pe;
  if (lower.includes('islamic') || lower.includes('إسلامية')) return SUBJECT_COLORS.islamic;
  if (lower.includes('science') || lower.includes('علمية')) return SUBJECT_COLORS.science;
  if (lower.includes('civic') || lower.includes('مدنية')) return SUBJECT_COLORS.civics;
  if (lower.includes('history') || lower.includes('تاريخ') || lower.includes('جغرافيا') || lower.includes('geo')) return SUBJECT_COLORS.history_geo;
  if (lower.includes('art') || lower.includes('فنية') || lower.includes('تشكيلية') || lower.includes('موسيق')) return SUBJECT_COLORS.art;
  if (lower.includes('amazigh') || lower.includes('أمازيغ')) return SUBJECT_COLORS.amazigh;
  return SUBJECT_COLORS.arabic;
}

