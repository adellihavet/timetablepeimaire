import React, { useState } from 'react';
import { X, Save, School, User, MapPin, Calendar, Languages } from 'lucide-react';
import { Timetable } from '../types';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  timetable: Timetable;
  onSave: (updated: Partial<Timetable>) => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  onClose,
  timetable,
  onSave
}) => {
  const [formData, setFormData] = useState({
    schoolName: timetable.schoolName,
    wilaya: timetable.wilaya,
    dairaOrInspection: timetable.dairaOrInspection,
    academicYear: timetable.academicYear,
    classGroup: timetable.classGroup,
    arabicTeacherName: timetable.arabicTeacherName,
    frenchTeacherName: timetable.frenchTeacherName,
    englishTeacherName: timetable.englishTeacherName,
    peTeacherName: timetable.peTeacherName,
    amazighTeacherName: timetable.amazighTeacherName || '',
    directorName: timetable.directorName,
    inspectorName: timetable.inspectorName,
    hasAmazigh: timetable.hasAmazigh
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 text-right">
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">إعدادات المؤسسة والتأطير التربوي</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-700">
          {/* Section 1: School Information */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>معلومات المؤسسة والمقاطعة التربوية</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">اسم المدرسة الابتدائية:</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">الولاية:</label>
                <input
                  type="text"
                  value={formData.wilaya}
                  onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">المقاطعة التفتيشية:</label>
                <input
                  type="text"
                  value={formData.dairaOrInspection}
                  onChange={(e) => setFormData({ ...formData, dairaOrInspection: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">الفوج التربوي:</label>
                <input
                  type="text"
                  value={formData.classGroup}
                  onChange={(e) => setFormData({ ...formData, classGroup: e.target.value })}
                  placeholder="مثال: الفوج 01 أو قسم أ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">الموسم الدراسي:</label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="hasAmazigh"
                  checked={formData.hasAmazigh}
                  onChange={(e) => setFormData({ ...formData, hasAmazigh: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="hasAmazigh" className="font-bold text-slate-800 cursor-pointer flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-emerald-600" />
                  <span>تدريس مادة اللغة الأمازيغية في هذا الفوج (اختياري)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Teachers & Administration */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              <span>أسماء الأساتذة والإدارة للطباعة الرسمية</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">معلم اللغة العربية والمواد العامة:</label>
                <input
                  type="text"
                  value={formData.arabicTeacherName}
                  onChange={(e) => setFormData({ ...formData, arabicTeacherName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">أستاذ اللغة الفرنسية:</label>
                <input
                  type="text"
                  value={formData.frenchTeacherName}
                  onChange={(e) => setFormData({ ...formData, frenchTeacherName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">أستاذ اللغة الإنجليزية:</label>
                <input
                  type="text"
                  value={formData.englishTeacherName}
                  onChange={(e) => setFormData({ ...formData, englishTeacherName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">أستاذ التربية البدنية والرياضية:</label>
                <input
                  type="text"
                  value={formData.peTeacherName}
                  onChange={(e) => setFormData({ ...formData, peTeacherName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              {formData.hasAmazigh && (
                <div>
                  <label className="block font-bold mb-1">أستاذ اللغة الأمازيغية:</label>
                  <input
                    type="text"
                    value={formData.amazighTeacherName}
                    onChange={(e) => setFormData({ ...formData, amazighTeacherName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold mb-1">اسم مدير(ة) المدرسة الابتدائية:</label>
                <input
                  type="text"
                  value={formData.directorName}
                  onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">اسم مفتش(ة) التعليم الابتدائي:</label>
                <input
                  type="text"
                  value={formData.inspectorName}
                  onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors font-bold shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
