import React from 'react';
import { SchoolShiftMode, GradeLevel, ShiftSystem } from '../types';
import { Sun, Clock, Split, ArrowLeft, Check, School, Languages, Info } from 'lucide-react';

interface ShiftSelectionStepProps {
  shiftMode: SchoolShiftMode;
  hasAmazigh: boolean;
  partialDoubleGrades: GradeLevel[];
  selectedShift: ShiftSystem;
  onSelectShiftMode: (mode: SchoolShiftMode) => void;
  onToggleAmazigh: (has: boolean) => void;
  onTogglePartialGrade: (grade: GradeLevel) => void;
  onSelectShift: (shift: ShiftSystem) => void;
  onNext: () => void;
}

const ALL_GRADES: { id: GradeLevel; name: string }[] = [
  { id: '1AP', name: 'السنة الأولى (1AP)' },
  { id: '2AP', name: 'السنة الثانية (2AP)' },
  { id: '3AP', name: 'السنة الثالثة (3AP)' },
  { id: '4AP', name: 'السنة الرابعة (4AP)' },
  { id: '5AP', name: 'السنة الخامسة (5AP)' },
];

export const ShiftSelectionStep: React.FC<ShiftSelectionStepProps> = ({
  shiftMode,
  hasAmazigh,
  partialDoubleGrades,
  selectedShift,
  onSelectShiftMode,
  onToggleAmazigh,
  onTogglePartialGrade,
  onSelectShift,
  onNext,
}) => {
  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-8 animate-fadeIn text-right font-['Cairo',sans-serif]">
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
          <span>1. ضبط نوع الدوام واللغات</span>
        </div>
        <span className="text-slate-300">—</span>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px]">2</span>
          <span>2. إسناد الأساتذة وهيكلة الأفواج</span>
        </div>
        <span className="text-slate-300">—</span>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px]">3</span>
          <span>3. جدول التوقيت والطباعة</span>
        </div>
      </div>

      {/* Main Title */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <School className="w-3.5 h-3.5" />
          <span>الإعدادات الأولية للمؤسسة التربوية</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          تحديد نظام الدوام المدرسي وتدريس الأمازيغية
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          حدد نظام الدوام المعتمد في مدرستك من بين الخيارات الرسمية الثلاثة لبناء شبكة المواقيت بدقة متناهية
        </p>
      </div>

      {/* Amazigh Language Global Switcher Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              تدريس اللغة الأمازيغية بالمؤسسة
            </h3>
            <p className="text-xs text-slate-600">
              تحديد ما إذا كانت المدرسة تدرّس اللغة الأمازيغية (إضافة 4 حصص 45د للأطوار 4AP و 5AP وفق جدول 3.3 بالدليل الرسمي)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-emerald-200 shrink-0">
          <button
            type="button"
            onClick={() => onToggleAmazigh(false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !hasAmazigh
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            بدون أمازيغية
          </button>
          <button
            type="button"
            onClick={() => onToggleAmazigh(true)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              hasAmazigh
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            مع الأمازيغية ✓
          </button>
        </div>
      </div>

      {/* 3 Shift System Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* OPTION 1: Single Shift (الدوام الواحد) */}
        <div
          onClick={() => onSelectShiftMode('single')}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
            shiftMode === 'single'
              ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          {shiftMode === 'single' && (
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Check className="w-4 h-4" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  الخيار الأول
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  1. نظام الدوام الواحد
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              جميع الأفواج التربوية تدرس بالدوام الواحد (صباحاً ومساءً).
            </p>

            <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs text-slate-700">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">الصباح:</span>
                <span className="font-mono font-bold text-slate-800">08:00 — 11:15 (راحة 15د)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">المساء:</span>
                <span className="font-mono font-bold text-slate-800">
                  {hasAmazigh ? '13:00 — 15:45' : '13:00 — 15:00 (بدون استراحة)'}
                </span>
              </div>
              <div className="text-[10px] text-emerald-800 font-semibold pt-1">
                {hasAmazigh ? '• مع تدريس الأمازيغية (25:30 سا)' : '• بدون أمازيغية (21 سا / 22:30 سا)'}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-emerald-800">
            ✓ جداول الدليل التطبيقي (1.3 و 2.3 و 3.3)
          </div>
        </div>

        {/* OPTION 2: Full Double Shift (الدوامين الكلي) */}
        <div
          onClick={() => onSelectShiftMode('full_double')}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
            shiftMode === 'full_double'
              ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          {shiftMode === 'full_double' && (
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Check className="w-4 h-4" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                  الخيار الثاني
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  2. نظام الدوامين الكلي
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              جميع الأفواج بالمدرسة معنية بالدوامين والتناوب بين الفوجين (ف1 وف2).
            </p>

            <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs text-slate-700">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">الفوج 1:</span>
                <span className="font-mono font-bold text-slate-800">صباح 08:00 | مساء 13:00</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">الفوج 2:</span>
                <span className="font-mono font-bold text-slate-800">صباح 10:30 | مساء 15:00</span>
              </div>
              <div className="text-[10px] text-teal-800 font-semibold pt-1">
                الثلاثاء: فترة ممتدة 4.5 سا بالتناوب
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-teal-800">
            ✓ مطابقة تامة لجدولي الدليل 4.3 و 5.3
          </div>
        </div>

        {/* OPTION 3: Partial Double Shift (الدوامين الجزئي) */}
        <div
          onClick={() => onSelectShiftMode('partial_double')}
          className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
            shiftMode === 'partial_double'
              ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          {shiftMode === 'partial_double' && (
            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Check className="w-4 h-4" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Split className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  الخيار الثالث
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  3. نظام الدوامين الجزئي
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              المدرسة تجمع بين الدوام الواحد لبعض الأفواج والدوامين لأفواج أخرى.
            </p>

            <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs text-slate-700">
              <div className="text-[11px] text-amber-900 font-semibold">
                يقوم المستخدم هنا بتحديد الأفواج المعنية بالدوامين بدقة.
              </div>
              <div className="text-[10px] text-slate-500">
                شائع جداً: السنوات 1 و 2 دوامين، وبقية المستويات دوام واحد (أو العكس).
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-bold text-amber-800">
            ✓ تخصيص نظام الدوام لكل مستوى وفوج
          </div>
        </div>
      </div>

      {/* When Partial Double Shift is selected: let user pick which grades are on double shift */}
      {shiftMode === 'partial_double' && (
        <div className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">
                تحديد المستويات المعنية بنظام الدوامين (في الدوامين الجزئي):
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                المستويات المحددة ستتبع نظام الدوامين، وباقي المستويات غير المحددة ستتبع نظام الدوام الواحد.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
            {ALL_GRADES.map((g) => {
              const isDouble = partialDoubleGrades.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onTogglePartialGrade(g.id)}
                  className={`p-3 rounded-xl border-2 text-xs font-bold transition-all flex flex-col items-center gap-1.5 text-center cursor-pointer ${
                    isDouble
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-amber-400'
                  }`}
                >
                  <span className="text-[13px]">{g.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isDouble ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isDouble ? 'دوامين' : 'دوام واحد'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Double shift group preference when viewing/generating (فوج 1 أو فوج 2) */}
      {(shiftMode === 'full_double' || shiftMode === 'partial_double') && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-xs text-slate-800">
              توقيت الفوج المستهدف للطباعة والعرض المبدئي:
            </h4>
            <p className="text-[11px] text-slate-500">
              يمكنك التبديل بين الفوج 01 والفوج 02 في أي وقت داخل الشبكة وعند الطباعة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectShift('double_g1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                selectedShift === 'double_g1'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              الفوج 1 (صباح 08:00 / مساء 13:00)
            </button>
            <button
              type="button"
              onClick={() => onSelectShift('double_g2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                selectedShift === 'double_g2'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              الفوج 2 (صباح 10:30 / مساء 15:00)
            </button>
          </div>
        </div>
      )}

      {/* Proceed Navigation Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-extrabold rounded-xl shadow-md shadow-emerald-700/20 transition-all hover:gap-3 cursor-pointer"
        >
          <span>المتابعة إلى صفحة الإسناد وتحديد أساتذة الأفواج</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
