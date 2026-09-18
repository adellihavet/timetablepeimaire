import React from 'react';
import { 
  Calendar, 
  Printer, 
  Settings, 
  Clock, 
  UserCheck, 
  Sparkles,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import { GradeLevel, ShiftSystem, Timetable, ClassGroup } from '../types';

interface HeaderProps {
  currentGrade: GradeLevel;
  onSelectGrade: (grade: GradeLevel) => void;
  shiftSystem: ShiftSystem;
  onSelectShift: (shift: ShiftSystem) => void;
  timetable: Timetable;
  classGroups?: ClassGroup[];
  activeGroupId?: string;
  onSelectClassGroup?: (groupId: string) => void;
  onOpenStepSettings: () => void;
  onOpenStepShift: () => void;
  onOpenTeachers: () => void;
  onOpenPrint: () => void;
  onOpenPedagogyTips: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetToOfficial: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentGrade,
  onSelectGrade,
  shiftSystem,
  onSelectShift,
  timetable,
  classGroups = [],
  activeGroupId,
  onSelectClassGroup,
  onOpenStepSettings,
  onOpenStepShift,
  onOpenTeachers,
  onOpenPrint,
  onOpenPedagogyTips,
  onExportJSON,
  onImportJSON,
  onResetToOfficial
}) => {
  const gradeGroups = classGroups.filter((g) => g.grade === currentGrade);
  const grades: { id: GradeLevel; label: string; tag: string }[] = [
    { id: '1AP', label: '1 ابتدائي', tag: '21 سا' },
    { id: '2AP', label: '2 ابتدائي', tag: '21 سا' },
    { id: '3AP', label: '3 ابتدائي', tag: '21 سا' },
    { id: '4AP', label: '4 ابتدائي', tag: '22:30 سا' },
    { id: '5AP', label: '5 ابتدائي', tag: '22:30 سا' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Ministerial Bar */}
      <div className="bg-emerald-800 text-emerald-50 px-4 py-1.5 text-xs font-medium flex flex-wrap items-center justify-between gap-2 border-b border-emerald-900">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>الجمهورية الجزائرية الديمقراطية الشعبية — وزارة التربية الوطنية</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-emerald-950/60 text-emerald-200 px-2 py-0.5 rounded-sm border border-emerald-700/50">
            الموسم الدراسي: {timetable.academicYear}
          </span>
          <span className="bg-emerald-700/60 text-emerald-100 px-2.5 py-0.5 rounded-sm border border-emerald-600/40">
            {shiftSystem === 'single' ? 'نظام الدوام الواحد' : shiftSystem === 'double_g1' ? 'نظام الدوامين (فوج 1)' : 'نظام الدوامين (فوج 2)'}
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 font-bold text-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                منصة إنجاز جداول المواقيت الابتدائية
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-800">{timetable.schoolName}</span>
              {timetable.commune && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>بلدية {timetable.commune}</span>
                </>
              )}
              <span className="text-slate-300">•</span>
              <span>ولاية {timetable.wilaya}</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-semibold">{timetable.classGroup}</span>
            </p>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          {/* Change Shift */}
          <button
            onClick={onOpenStepShift}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="الرجوع لتعديل نوع الدوام"
          >
            <Clock className="w-4 h-4 text-slate-600" />
            <span>تغيير نوع الدوام</span>
          </button>

          {/* Settings & Teachers */}
          <button
            onClick={onOpenStepSettings}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            title="تعديل بيانات المؤسسة وتوزيع الأساتذة"
          >
            <Settings className="w-4 h-4 text-emerald-700" />
            <span>المؤسسة والأساتذة</span>
          </button>

          {/* Teachers Schedule */}
          <button
            onClick={onOpenTeachers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-slate-600" />
            <span>جداول الأساتذة</span>
          </button>

          {/* Pedagogical Tips */}
          <button
            onClick={onOpenPedagogyTips}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>معايير التفتيش</span>
          </button>

          {/* Print A4 */}
          <button
            onClick={onOpenPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-sm shadow-emerald-700/30"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الجدول (A4)</span>
          </button>

          {/* JSON Export/Import */}
          <div className="flex items-center border-r border-slate-200 pr-2 mr-1 gap-1">
            <button
              onClick={onExportJSON}
              title="تصدير نسخة احتياطية (JSON)"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              title="استيراد جدول محفوظ"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={onImportJSON} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Grade Selector & Shift Mode Bar */}
      <div className="bg-slate-100/90 border-t border-slate-200 px-4 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Grade tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 ml-2 whitespace-nowrap">المستوى الدراسي:</span>
          {grades.map((g) => {
            const isSelected = currentGrade === g.id;
            return (
              <button
                key={g.id}
                onClick={() => onSelectGrade(g.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                <span>{g.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {g.tag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Shift selector & Reset */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-400 text-[11px] px-1 font-medium">النظام:</span>
            <button
              onClick={() => onSelectShift('single')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                shiftSystem === 'single'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الدوام الواحد
            </button>
            <button
              onClick={() => onSelectShift('double_g1')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                shiftSystem === 'double_g1'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              دوامين (فوج 1)
            </button>
            <button
              onClick={() => onSelectShift('double_g2')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                shiftSystem === 'double_g2'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              دوامين (فوج 2)
            </button>
          </div>

          <button
            onClick={onResetToOfficial}
            className="text-xs text-slate-500 hover:text-emerald-700 font-medium inline-flex items-center gap-1 transition-colors whitespace-nowrap"
            title="إعادة التعيين إلى التوزيع النموذجي"
          >
            <RotateCcw className="w-3 h-3" />
            <span>استعادة التوزيع النموذجي</span>
          </button>
        </div>
      </div>

      {/* Sub-bar for Multiple Groups in the Same Grade */}
      {gradeGroups.length > 1 && (
        <div className="bg-amber-50/70 border-t border-amber-200 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-bold text-amber-900 ml-1 whitespace-nowrap">
            أفواج هذا المستوى ({gradeGroups.length} أفواج):
          </span>
          {gradeGroups.map((grp) => {
            const isGrpActive = activeGroupId === grp.id;
            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => onSelectClassGroup?.(grp.id)}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 border whitespace-nowrap cursor-pointer ${
                  isGrpActive
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                    : 'bg-white text-slate-700 border-amber-300 hover:bg-amber-100'
                }`}
              >
                <span>{grp.groupLabel}</span>
                <span className={`text-[10px] ${isGrpActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                  — أستاذ(ة): {grp.arabicTeacherName}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
