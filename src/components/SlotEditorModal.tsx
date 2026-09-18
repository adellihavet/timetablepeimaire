import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Clock, BookOpen, User } from 'lucide-react';
import { GradeLevel, SubjectId, TeacherRole, TimeSlot } from '../types';
import { OFFICIAL_CURRICULA, SUBJECT_COLORS } from '../data/officialCurriculum';

interface SlotEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: TimeSlot | null;
  grade: GradeLevel;
  onSave: (updatedSlot: TimeSlot) => void;
  onDelete?: (slotId: string) => void;
}

export const SlotEditorModal: React.FC<SlotEditorModalProps> = ({
  isOpen,
  onClose,
  slot,
  grade,
  onSave,
  onDelete
}) => {
  const curriculum = OFFICIAL_CURRICULA[grade];

  const [subjectId, setSubjectId] = useState<SubjectId | 'free'>('arabic');
  const [activityName, setActivityName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [teacherRole, setTeacherRole] = useState<TeacherRole>('arabic_teacher');

  useEffect(() => {
    if (slot) {
      setSubjectId(slot.subjectId);
      setActivityName(slot.activityName || '');
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
      setDurationMinutes(slot.durationMinutes);
      setTeacherRole(slot.teacherRole || 'arabic_teacher');
    }
  }, [slot]);

  if (!isOpen || !slot) return null;

  // Find activities corresponding to the selected subject in this grade
  const currentSubjData = curriculum.subjects.find((s) => s.id === subjectId);
  const activitiesList = currentSubjData?.activities || [];

  const handleSubjectChange = (newSubjectId: SubjectId | 'free') => {
    setSubjectId(newSubjectId);
    const found = curriculum.subjects.find((s) => s.id === newSubjectId);
    if (found) {
      setTeacherRole(found.teacherRole);
      if (found.activities && found.activities.length > 0) {
        setActivityName(found.activities[0]);
      } else {
        setActivityName(found.name);
      }
    } else if (newSubjectId === 'recess') {
      setActivityName('استراحة');
      setDurationMinutes(15);
    } else if (newSubjectId === 'free') {
      setActivityName('حصة شاغرة / نشاط داعم');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...slot,
      subjectId,
      activityName,
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes),
      teacherRole,
      isRecess: subjectId === 'recess'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 text-right">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">تعديل الحصة التعليمية ({slot.startTime} - {slot.endTime})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Subject selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">المادة التعليمية:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {curriculum.subjects.map((subj) => {
                const isSelected = subjectId === subj.id;
                return (
                  <button
                    type="button"
                    key={subj.id}
                    onClick={() => handleSubjectChange(subj.id)}
                    className={`p-2 rounded-xl border text-right transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${SUBJECT_COLORS[subj.id]?.bg || 'bg-slate-400'}`} />
                    <span className="truncate">{subj.name}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => handleSubjectChange('recess')}
                className={`p-2 rounded-xl border text-right transition-all flex items-center gap-2 ${
                  subjectId === 'recess'
                    ? 'border-slate-600 bg-slate-100 text-slate-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                <span>استراحة (15د)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubjectChange('free')}
                className={`p-2 rounded-xl border text-right transition-all flex items-center gap-2 ${
                  subjectId === 'free'
                    ? 'border-slate-600 bg-slate-100 text-slate-900 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300" />
                <span>شاغرة / فراغ</span>
              </button>
            </div>
          </div>

          {/* Activity / Field Name */}
          {subjectId !== 'recess' && subjectId !== 'free' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                اسم النشاط البيداغوجي (وفق المخططات الرسمية):
              </label>
              {activitiesList.length > 0 && (
                <div className="mb-2">
                  <div className="text-[11px] text-slate-500 mb-1">اقتراحات رسمية سريعة:</div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-200">
                    {activitiesList.map((act, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActivityName(act)}
                        className={`text-[11px] px-2 py-1 rounded-md transition-colors ${
                          activityName === act
                            ? 'bg-emerald-700 text-white font-bold'
                            : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="أدخل عنوان النشاط (مثلاً: قراءة وأداء وفهم)..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Duration & Timing */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">وقت البداية:</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-center text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">وقت النهاية:</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-center text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">المدة بالدقائق:</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-2 py-2 border border-slate-300 rounded-xl text-xs"
              >
                <option value={90}>90 دقيقة (1سا و30د - حصة مجمعة)</option>
                <option value={60}>60 دقيقة (1 سا)</option>
                <option value={45}>45 دقيقة (45د)</option>
                <option value={30}>30 دقيقة (30د)</option>
                <option value={15}>15 دقيقة (استراحة)</option>
              </select>
            </div>
          </div>

          {/* Teacher Assignment */}
          {subjectId !== 'recess' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">الأستاذ المكلف بالحصة:</label>
              <select
                value={teacherRole}
                onChange={(e) => setTeacherRole(e.target.value as TeacherRole)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              >
                <option value="arabic_teacher">معلم اللغة العربية والمواد العامة</option>
                <option value="french_teacher">أستاذ مادة اللغة الفرنسية</option>
                <option value="english_teacher">أستاذ مادة اللغة الإنجليزية</option>
                <option value="pe_teacher">أستاذ مادة التربية البدنية والرياضية</option>
                <option value="amazigh_teacher">أستاذ مادة اللغة الأمازيغية</option>
              </select>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(slot.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-xl transition-colors font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>حذف الحصة</span>
              </button>
            )}
            <div className="flex items-center gap-2 mr-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-semibold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors font-bold shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
