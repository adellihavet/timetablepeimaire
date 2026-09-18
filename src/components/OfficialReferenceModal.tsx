import React from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, Calendar, BookOpen, ShieldCheck } from 'lucide-react';
import { OFFICIAL_DOCUMENTS } from '../data/officialCurriculum';

interface OfficialReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialReferenceModal: React.FC<OfficialReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden text-right">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">المرجعية القانونية ومعالجة تناقضات الوثائق</h2>
              <p className="text-xs text-emerald-200">
                تطبيق القاعدة الإلزامية: <span className="font-bold underline text-white">اعتماد ما ورد في الوثيقة الأحدث</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Rule banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                توجيه معالجة الاختلافات بين الوثائق الرسمية:
              </h4>
              <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                قاعدة الفصل القطعية: <strong className="font-bold text-amber-950">"عند وجود اختلاف أو تناقض، يجب اعتماد ما هو موجود في الوثيقة الأحدث"</strong>.
                لذلك، تم اعتماد <strong className="font-bold text-emerald-900 underline">القرار الوزاري رقم 16</strong> كمرجع أسمى وأحدث لتحديد الحصص والمواقيت، وتجاوز ما سبقه من مناشير أو أدلة قديمة.
              </p>
            </div>
          </div>

          {/* Comparative contradiction table */}
          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>جدول الفصل في التناقضات وفق الوثيقة الأحدث (القرار رقم 16)</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3">المستوى والمادة</th>
                    <th className="p-3 bg-red-50/70 text-red-900">الوثائق القديمة (دليل 2023 والمناشير السابقة)</th>
                    <th className="p-3 bg-emerald-100/70 text-emerald-950 font-extrabold">
                      الوثيقة الأحدث المعتمدة (القرار رقم 16) ✓
                    </th>
                    <th className="p-3">السند الوزاري الأحدث</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">اللغة الفرنسية (السنة الثالثة)</td>
                    <td className="p-3 text-red-700 line-through">3 ساعات ثم خُفضت لساعتين</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">تم حذف اللغة الفرنسية نهائياً (0 سا)</td>
                    <td className="p-3 text-slate-500 font-bold">القرار رقم 16 (الأحدث)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">الرياضيات (السنة الثالثة)</td>
                    <td className="p-3 text-red-700 line-through">4 ساعات و 30 دقيقة</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">5 ساعات كاملة (4 حصص 60د + حصتان 30د)</td>
                    <td className="p-3 text-slate-500 font-bold">القرار رقم 16 (الأحدث)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">اللغة الإنجليزية (السنة الرابعة 4AP)</td>
                    <td className="p-3 text-red-700 line-through">1 ساعة و 30 دقيقة في السابق</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">2 ساعتان (حصتان ذات 1 ساعة: 2×1سا)</td>
                    <td className="p-3 text-slate-500 font-bold">المنشور 468 (16 سبتمبر 2026) والقرار 16</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">التربية الإسلامية (السنة الرابعة 4AP)</td>
                    <td className="p-3 text-red-700 line-through">1 ساعة و 30 دقيقة (3 حصص)</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">2 ساعتان (4 حصص ذات 30د تشمل حصة التربية الخُلُقية المضافة)</td>
                    <td className="p-3 text-slate-500 font-bold">المنشور 468 (16 سبتمبر 2026)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">التربية البدنية والرياضية (السنة الرابعة 4AP)</td>
                    <td className="p-3 text-red-700 line-through">ساعة واحدة فقط أو حصتان منفصلتان</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">1 ساعة و 30 دقيقة (حصة مجمعة واحدة 1×90د في أول الفترة)</td>
                    <td className="p-3 text-slate-500 font-bold">المنشور 468 (16 سبتمبر 2026)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">التربية الفنية والتربية المدنية (السنة الرابعة 4AP)</td>
                    <td className="p-3 text-red-700 line-through">45 دقيقة سابقاً لكل مادة</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">1 ساعة لكل مادة بعد تدعيمها بـ 15د (حصتان 30د لكل منهما)</td>
                    <td className="p-3 text-slate-500 font-bold">المنشور 468 (16 سبتمبر 2026)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">اللغة الفرنسية (السنة الرابعة والخامسة)</td>
                    <td className="p-3 text-red-700 line-through">3 ساعات ثم 4:30 سا سابقاً</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">2 ساعتان فقط (حصتان ذات 1 ساعة)</td>
                    <td className="p-3 text-slate-500 font-bold">القرار رقم 16 والمنشور 468</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">التاريخ والجغرافيا (السنة الثالثة)</td>
                    <td className="p-3 text-red-700 line-through">مادة مدمجة "تاريخ وجغرافيا" (45 دقيقة)</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">إفراد التاريخ بحصة مستقلة (30 دقيقة) مع إلغاء الجغرافيا</td>
                    <td className="p-3 text-slate-500 font-bold">القرار رقم 16 والمناشير الداعمة</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">مجموع الحجم الساعي الأسبوعي (3AP)</td>
                    <td className="p-3 text-red-700 line-through">22:45 سا أو 23:00 سا</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">21 ساعة أسبوعياً تماماً</td>
                    <td className="p-3 text-slate-500 font-bold">القرار رقم 16 (الأحدث)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">هندسة الفترة الصباحية (الدوام الواحد)</td>
                    <td className="p-3 text-red-700 line-through">توزيعات عشوائية أو فترات راحة متغيرة</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">3 ساعات (08:00 - 11:15) تتخللها استراحة 15د بعد أول ساعة ونصف (09:30 - 09:45)</td>
                    <td className="p-3 text-slate-500 font-bold">الدليل التطبيقي الرسمي (جداول 1.3 و 2.3)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">هندسة الفترة المسائية (الدوام الواحد)</td>
                    <td className="p-3 text-red-700 line-through">ساعتان وربع أو إضافة استراحة مسائية</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">ساعتان كاملتان (13:00 - 15:00) بدون أي فترة راحة (ويوم الخميس 1:30 سا للأطوار العليا)</td>
                    <td className="p-3 text-slate-500 font-bold">الدليل التطبيقي الرسمي (جداول 1.3 و 2.3)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">توقيت نظام الدوامين (فوج 01 وفوج 02)</td>
                    <td className="p-3 text-red-700 line-through">تضارب التوقيت وتداخل القاعات</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">ف1 (صباح 08:00-10:30 / مساء 13:00-15:00) | ف2 (صباح 10:30-13:00 / مساء 15:00-17:00) والثلاثاء ممتد 4.5 سا</td>
                    <td className="p-3 text-slate-500 font-bold">الدليل التطبيقي (جداول 4.3 و 5.3)</td>
                  </tr>

                  <tr className="hover:bg-slate-50/80">
                    <td className="p-3 font-bold text-slate-900">مجموع الحجم الساعي الأسبوعي (4AP / 5AP)</td>
                    <td className="p-3 text-red-700 line-through">جداول قديمة مختلفة</td>
                    <td className="p-3 font-bold text-emerald-700 bg-emerald-50/50">22:30 سا (بدون أمازيغية) / 25:30 سا (مع الأمازيغية)</td>
                    <td className="p-3 text-slate-500 font-bold">القرار رقم 16 (الأحدث)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Manual Timing Patterns Details */}
          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>الأنماط الخمسة الرسمية للمواقيت المعتمدة في الدليل التطبيقي</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Pattern 1.1 */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-xs">النمط 1.1: السنوات الأولى والثانية (1AP / 2AP)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-emerald-600 text-white">الدوام الواحد • 21 سا</span>
                </div>
                <div className="text-[11px] text-slate-700 space-y-1">
                  <p>• <strong>الصباح:</strong> 08:00 - 11:15 (استراحة 15د: 09:30 - 09:45).</p>
                  <p>• <strong>المساء:</strong> 13:00 - 15:00 (ساعتان <span className="text-rose-700 font-bold">بدون استراحة</span>).</p>
                  <p>• <strong>الثلاثاء والخميس:</strong> مساء شاغر تماماً (عطلة أسبوعية رسمية وفق جدول 1.3).</p>
                </div>
              </div>

              {/* Pattern 2.1 */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-xs">النمط 2.1: السنوات 4AP / 5AP (22:30 سا) و السنة 3AP (21 سا - 29 حصة)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-blue-600 text-white">الدوام الواحد • وفق المنهاج</span>
                </div>
                <div className="text-[11px] text-slate-700 space-y-1">
                  <p>• <strong>الصباح:</strong> 08:00 - 11:15 (استراحة 15د: 09:30 - 09:45).</p>
                  <p>• <strong>المساء:</strong> 13:00 - 15:00 (ساعتان <span className="text-rose-700 font-bold">بدون استراحة</span>).</p>
                  <p>• <strong>السنة 3AP:</strong> 21 ساعة موزعة على 29 حصة (الخميس مساءً شاغر لتلاميذ 3AP مع إفراد 30د للألعاب الرياضياتية).</p>
                  <p>• <strong>السنتان 4AP / 5AP:</strong> 22:30 سا وتشمل دراسة الخميس مساءً 13:00 - 14:30 (ساعة ونصف بدون استراحة).</p>
                  <p>• <strong>الثلاثاء مساءً:</strong> فراغ بيداغوجي وتنسيق تربوي لجميع المستويات.</p>
                </div>
              </div>

              {/* Pattern 3.1 */}
              <div className="p-4 rounded-xl border border-lime-300 bg-lime-50/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-xs">النمط 3.1: السنوات 4AP / 5AP (مع تدريس الأمازيغية)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-lime-700 text-white">الدوام الواحد • 25:30 سا</span>
                </div>
                <div className="text-[11px] text-slate-700 space-y-1">
                  <p>• <strong>الصباح:</strong> 08:00 - 11:15 (استراحة 15د: 09:30 - 09:45).</p>
                  <p>• <strong>المساء الممتد:</strong> 13:00 - 15:45 (حصة 90د + استراحة 15د: 14:30-14:45 + حصة أمازيغية 45د).</p>
                  <p>• <strong>إدماج الأمازيغية:</strong> 4 حصص ذات 45د موزعة مسائياً وفق جدول 3.3 بالدليل الرسمي.</p>
                </div>
              </div>

              {/* Pattern 1.2 & 2.2 */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-xs">النمط 1.2 و 2.2: نظام الدوامين (فوج 1 وفوج 2)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-amber-600 text-white">الدوامين • تناوب الأفواج</span>
                </div>
                <div className="text-[11px] text-slate-700 space-y-1">
                  <p>• <strong>ف1:</strong> صباح (08:00-10:30) / مساء (13:00-15:00) <span className="text-rose-700 font-bold">بدون استراحة مسائية</span>.</p>
                  <p>• <strong>ف2:</strong> صباح (10:30-13:00) / مساء (15:00-17:00) <span className="text-rose-700 font-bold">بدون استراحة مسائية</span>.</p>
                  <p>• <strong>الثلاثاء الممتد:</strong> ف1 (08:00-12:30 4.5 سا مع راحة 10:00-10:15) / ف2 (12:30-17:00 4.5 سا مع راحة 14:30-14:45).</p>
                  <p>• <strong>الخميس للأطوار الدنيا (1/2):</strong> ف1 (08:00-11:00) / ف2 (11:00-14:00) والمساء شاغر.</p>
                </div>
              </div>
            </div>
          </div>

          {/* List of active documents */}
          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <span>قائمة الوثائق الرسمية وسياق اعتمادها</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OFFICIAL_DOCUMENTS.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl border ${
                    doc.status === 'active_latest'
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : doc.status === 'future_decree'
                      ? 'bg-blue-50/50 border-blue-200'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-slate-900 text-xs">{doc.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        doc.status === 'active_latest'
                          ? 'bg-emerald-600 text-white'
                          : doc.status === 'future_decree'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {doc.status === 'active_latest'
                        ? 'الوثيقة الأحدث (سارية)'
                        : doc.status === 'future_decree'
                        ? 'تطبيق مستقبلي 2026/2027'
                        : 'وثيقة سابقة ملغاة جزئياً'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{doc.date}</span>
                    <span>•</span>
                    <span>الرقم: {doc.number}</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2 leading-relaxed">{doc.summary}</p>
                  <ul className="text-[11px] space-y-1 text-slate-700 list-disc list-inside">
                    {doc.keyChanges.slice(0, 3).map((change, idx) => (
                      <li key={idx} className="leading-normal">{change}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            تم ضبط جميع التوزيعات والحصص البرمجية في المنصة وفق هذا المعيار بدقة 100%.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-colors shadow-xs"
          >
            إغلاق ومتابعة العمل
          </button>
        </div>
      </div>
    </div>
  );
};
