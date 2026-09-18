import React from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, Clock, BookOpen, HeartPulse } from 'lucide-react';

interface PedagogicalTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PedagogicalTipsModal: React.FC<PedagogicalTipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden text-right">
        {/* Header */}
        <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-700 text-teal-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">معايير التفتيش والتنظيم البيداغوجي لجداول المواقيت</h2>
              <p className="text-xs text-teal-200">
                توجيهات المفتشية العامة للبيداغوجيا — معايير موحدة ومطبقة على جميع المستويات (1، 2، 3، 4، 5 ابتدائي)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-teal-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex items-start gap-3">
            <HeartPulse className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-teal-950 text-sm mb-1">
                احترام المنحنى النفسي-الفيزيولوجي لليقظة الذهنية للتلميذ:
              </h4>
              <p className="text-teal-900 text-xs">
                تكون طاقة الاستيعاب والتركيز لدى تلميذ المرحلة الابتدائية في ذروتها بين 08:30 و 10:00 صباحاً، لذا يجب برمجة التعلمات القاعدية المعقدة (أنشطة بناء المفاهيم في الرياضيات، وتجريد الحروف، ودراسة الظواهر التركيبية والصرفية) خلال هذه الفترة.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-1.5">
              <h5 className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>هيكلة حصص الرياضيات (ساعة + نشاط فاصل + نصف ساعة تابعة):</span>
              </h5>
              <p className="text-teal-900">
                تتكون حصص الرياضيات من ساعة ونصف ساعة مجمعة، حيث تُنجز حصة بناء المفهوم أو النشاط العددي (1 ساعة) ثم تُفصل بحصة لنشاط آخر (كالتربية الإسلامية أو نشاط خفيف)، ثم يُنجز النصف ساعة (30د) التابع مباشرة للساعة التي تم إنجازها لتطبيق وتثبيت المفهوم، بالإضافة لحصة مستقلة للألعاب الرياضياتية (30د).
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-1.5">
              <h5 className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>موقع حصص التربية البدنية والرياضية (في بداية الفترة أو نهايتها):</span>
              </h5>
              <p className="text-teal-900">
                يجب أن تُنفذ حصص التربية البدنية حصراً إما في <strong>بداية الفترة</strong> (مثلاً: 13:00) أو في <strong>آخر الفترة</strong> (مثلاً: 10:15 - 11:15 أو 14:45 - 15:15)، وتُمنع برمجتها في وسط الفترة لضمان جاهزية ونشاط التلاميذ وتفادي العودة للقسم بجهد عضلي مشتت.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-1.5">
              <h5 className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>التناوب اليومي بين التربية العلمية والرياضيات:</span>
              </h5>
              <p className="text-teal-900">
                تكون حصص التربية العلمية بالتناوب اليومي مع حصص الرياضيات؛ ففي اليوم الذي يدرس فيه المتعلم رياضيات ذات الساعة ونصف المفصولة لا تُبرمج له حصة تربية علمية، وذلك لضمان توازن الجهد الفكري والعلمي للتلميذ على مدار الأسبوع.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-1.5">
              <h5 className="font-bold text-teal-950 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>التناوب بين التربية الفنية والتربية البدنية:</span>
              </h5>
              <p className="text-teal-900">
                تُبرمج حصص التربية الفنية (موسيقية أو تشكيلية) بالتناوب مع حصص التربية البدنية، بحيث <strong>لا يدرس المتعلم تربية بدنية وفنية في نفس اليوم</strong> مطلقاً.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>الترتيب البيداغوجي الصارم لأنشطة اللغة العربية:</span>
              </h5>
              <p className="text-slate-600">
                وفق المنشور الوزاري، يُحترم التسلسل التدريجي: فهم المنطوق والتعبير الشفوي أولاً، ثم القراءة وأداء وفهم المكتوب واكتشاف الصيغ، ثم دراسة التراكيب والظواهر النحوية والصرفية والإملائية، وتتوج بالمحفوظات والمطالعة المستقلة (1 ساعة كاملة في السنة الثالثة) والإنتاج الكتابي.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>التناوب الصارم للغات الأجنبية (الفرنسية والإنجليزية):</span>
              </h5>
              <p className="text-slate-600">
                يُمنع برمجة اللغتين الأجنبيتين (الفرنسية والإنجليزية) في نفس اليوم في المستويات التي تدرسهما معاً، لضمان عدم حدوث تداخل صوتي أو تركيبي لدى المتعلم.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-teal-800 text-white rounded-xl hover:bg-teal-900 transition-colors font-bold text-xs"
          >
            فهمت ذلك، إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
