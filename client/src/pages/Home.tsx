import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MapPin, Calendar, Clock, Users, Gift, ChevronDown, Phone, Mail, CheckCircle2, Star, Award, Zap } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375882276/AcFeksXYT56o4U9QsgyZGe/aqara_logo_6a235e61.png";
const K100_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375882276/AcFeksXYT56o4U9QsgyZGe/doorlock_k100_29952d57.png";
const L100_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375882276/AcFeksXYT56o4U9QsgyZGe/doorlock_l100_b1d33277.png";
const U100_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375882276/AcFeksXYT56o4U9QsgyZGe/doorlock_u100_cec83568.png";


const PURPOSE_OPTIONS = [
  { value: "supply_condition", label: "새로운 공급 조건 확인" },
  { value: "price_competitiveness", label: "제품 단가 경쟁력 확보" },
  { value: "installation_education", label: "설치/서비스 교육" },
  { value: "iot_expansion", label: "IoT 제품 판매 확대" },
  { value: "new_business", label: "신규 사업 기회 탐색" },
  { value: "other", label: "기타 (직접 입력)" },
];

const PRODUCTS = [
  { value: "K100", label: "스마트 도어락 K100", img: K100_URL },
  { value: "L100", label: "스마트 도어락 L100", img: L100_URL },
  { value: "U100", label: "스마트 도어락 U100", img: U100_URL },
];

type FormData = {
  attendanceStatus: "attend" | "not_attend" | "reviewing";
  businessName: string;
  contactName: string;
  contactPosition: string;
  contactPhone: string;
  email: string;
  businessZipcode: string;
  businessAddress: string;
  businessAddressDetail: string;
  salesExperience: "under1" | "1to3" | "3to5" | "5to10" | "over10";
  annualSalesVolume: "under100" | "100to300" | "300to500" | "500to1000" | "over1000";
  salesTarget: "enduser" | "b2b" | "both";
  installationMethod: "own_team" | "outsource" | "mixed";
  installationStaff: "none" | "1to2" | "3to5" | "6to10" | "over10";
  iotExpansionIntent: "already" | "reviewing" | "interested" | "none";
  attendancePurpose: string[];
  attendancePurposeOther: string;
  interestedProducts: string[];
  additionalInquiry: string;
};

const initialForm: FormData = {
  attendanceStatus: "attend",
  businessName: "",
  contactName: "",
  contactPosition: "",
  contactPhone: "",
  email: "",
  businessZipcode: "",
  businessAddress: "",
  businessAddressDetail: "",
  salesExperience: "1to3",
  annualSalesVolume: "100to300",
  salesTarget: "enduser",
  installationMethod: "own_team",
  installationStaff: "1to2",
  iotExpansionIntent: "interested",
  attendancePurpose: [],
  attendancePurposeOther: "",
  interestedProducts: [],
  additionalInquiry: "",
};

function RadioGroup({ name, value, onChange, options }: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {options.map(opt => (
        <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${value === opt.value ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${value === opt.value ? "border-amber-500" : "border-gray-300"}`}>
            {value === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
          </div>
          <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} className="sr-only" />
          <span className={`text-base font-medium ${value === opt.value ? "text-amber-800" : "text-gray-700"}`}>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({ value, onChange, options }: {
  value: string[];
  onChange: (v: string[]) => void;
  options: { value: string; label: string }[];
}) {
  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  };
  return (
    <div className="grid grid-cols-1 gap-2">
      {options.map(opt => (
        <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${value.includes(opt.value) ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${value.includes(opt.value) ? "border-amber-500 bg-amber-500" : "border-gray-300"}`}>
            {value.includes(opt.value) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
          <input type="checkbox" value={opt.value} checked={value.includes(opt.value)} onChange={() => toggle(opt.value)} className="sr-only" />
          <span className={`text-base font-medium ${value.includes(opt.value) ? "text-amber-800" : "text-gray-700"}`}>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMutation = trpc.survey.submit.useMutation({
    onSuccess: () => {
      navigate("/success");
    },
    onError: (err) => {
      if (err.data?.code === "CONFLICT") {
        toast.error("이미 해당 연락처로 설문이 제출되었습니다.");
      } else {
        toast.error("제출 중 오류가 발생했습니다. 다시 시도해 주세요.");
      }
      console.error(err);
      setIsSubmitting(false);
    },
  });

  const openPostcodeSearch = () => {
    const daum = (window as any).daum;
    if (!daum?.Postcode) {
      toast.error("주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    new daum.Postcode({
      oncomplete: (data: any) => {
        const addr = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
        setForm(prev => ({
          ...prev,
          businessZipcode: data.zonecode,
          businessAddress: addr,
        }));
        setErrors(prev => ({ ...prev, businessAddress: undefined }));
        // 상세주소 입력 필드에 포커스
        setTimeout(() => {
          document.getElementById("businessAddressDetail")?.focus();
        }, 100);
      },
    }).open();
  };

  const update = (field: keyof FormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.businessName.trim()) newErrors.businessName = "업체명을 입력해 주세요.";
    if (!form.contactName.trim()) newErrors.contactName = "성함을 입력해 주세요.";
    if (!form.contactPosition.trim()) newErrors.contactPosition = "직책을 입력해 주세요.";
    if (!form.contactPhone.trim()) newErrors.contactPhone = "연락처를 입력해 주세요.";
    if (!form.businessAddress) newErrors.businessAddress = "사업장 주소를 검색해 주세요.";
    if (form.attendancePurpose.length === 0) newErrors.attendancePurpose = "참석 사유를 하나 이상 선택해 주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("필수 항목을 모두 입력해 주세요.");
      const firstError = document.querySelector("[data-error]");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setIsSubmitting(true);
    submitMutation.mutate({
      attendanceStatus: form.attendanceStatus,
      businessName: form.businessName,
      contactName: form.contactName,
      contactPosition: form.contactPosition,
      contactPhone: form.contactPhone,
      email: form.email || undefined,
      businessZipcode: form.businessZipcode,
      businessAddress: form.businessAddress,
      businessAddressDetail: form.businessAddressDetail || undefined,
      salesExperience: form.salesExperience,
      annualSalesVolume: form.annualSalesVolume,
      salesTarget: form.salesTarget,
      installationMethod: form.installationMethod,
      installationStaff: form.installationStaff,
      iotExpansionIntent: form.iotExpansionIntent,
      attendancePurpose: form.attendancePurpose,
      attendancePurposeOther: form.attendancePurposeOther || undefined,
      interestedProducts: form.interestedProducts.length > 0 ? form.interestedProducts : undefined,
      additionalInquiry: form.additionalInquiry || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO ── */}
      <section className="relative bg-black text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "radial-gradient(circle at 20% 50%, #c9a84c 0%, transparent 50%), radial-gradient(circle at 80% 20%, #c9a84c 0%, transparent 40%)"}} />
        </div>
        <div className="relative max-w-xl mx-auto px-5 pt-10 pb-12">
          {/* Logo */}
          <div className="mb-8">
            <img src={LOGO_URL} alt="AqaraLife" className="h-7 brightness-0 invert" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-semibold px-3 py-1.5 rounded-full mb-5">
            <Star className="w-3.5 h-3.5 fill-amber-300" />
            공식 소매 파트너 모집
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 text-white">
            도어락 판매를 넘어,<br />
            <span className="text-amber-400">IoT 설치 수익</span>까지<br />
            함께 만드는 새로운 기회
          </h1>
          <p className="text-gray-300 text-base leading-relaxed mb-8">
            아카라(Aqara) 공식 소매 파트너 설명회에 초대합니다.<br />
            직공급 구조 + 설치 교육 + IoT 수익 모델을 공개합니다.
          </p>

          {/* Key benefits */}
          <div className="grid grid-cols-1 gap-2 mb-8">
            {[
              "공식 소매 파트너 등록 기회",
              "설치/앱 서비스 교육 무상 제공",
              "설명회 당일 특별 공급가 제공",
              "아카라 스마트홈 스타터킷 증정 (사전 설문 응답 시)",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-base text-gray-200">{item}</span>
              </div>
            ))}
          </div>

          {/* Event info */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-400">일시</div>
                  <div className="text-base font-semibold text-white">2026년 4월 4일(토) 10:30 ~ 16:00</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-400">장소</div>
                  <div className="text-base font-semibold text-white">스타크 강남빌딩 마이워크스페이스타워 B1 교육장</div>
                  <div className="text-sm text-gray-400 mt-0.5">서울특별시 서초구 강남대로53길 8</div>
                  <a
                    href="https://naver.me/5t7s50VR"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-amber-400 mt-1 hover:text-amber-300"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    네이버 지도로 보기 →
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-400">참석 인원</div>
                  <div className="text-base font-semibold text-white">선착순 50명 (사전 신청 필수)</div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <a href="#survey" className="block w-full bg-amber-500 hover:bg-amber-400 text-black font-bold text-center py-4 rounded-xl text-lg transition-colors">
            참석 신청 + 사전 설문 작성하기
          </a>
          <p className="text-center text-sm text-gray-500 mt-3">
            ※ 사전 설문 응답 시 아카라 스마트홈 스타터킷 증정 (현장 수령)
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center pb-6">
          <ChevronDown className="w-5 h-5 text-gray-500 animate-bounce" />
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="bg-white py-12">
        <div className="max-w-xl mx-auto px-5">
          <div className="text-center mb-8">
            <div className="text-sm font-semibold text-amber-600 tracking-widest uppercase mb-2">Aqara Smart Door Lock</div>
            <h2 className="text-2xl font-bold text-gray-900">글로벌 No.1 스마트 도어락</h2>
            <p className="text-base text-gray-500 mt-2">2009년 설립 · 전세계 1,300만+ 유저 · 61개국 진출</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {PRODUCTS.map(p => (
              <div key={p.value} className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                <img src={p.img} alt={p.label} className="w-full aspect-square object-contain mb-2" />
                <div className="text-sm font-bold text-gray-800">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAM ── */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-xl mx-auto px-5">
          <div className="text-center mb-8">
            <div className="text-sm font-semibold text-amber-600 tracking-widest uppercase mb-2">Program</div>
            <h2 className="text-2xl font-bold text-gray-900">주요 프로그램</h2>
          </div>
          <div className="space-y-4">
            {[
              { icon: Award, title: "새로운 유통 정책 및 파트너 제도 안내", items: ["소매상 직공급 구조 및 운영 방식", "공식 등록 소매상 자격 요건 및 혜택", "파트너 수익 구조 안내"] },
              { icon: Zap, title: "도어락 + IoT 설치 서비스 교육", items: ["도어락 설치 및 고객 응대 방법", "IoT 기능 설명 및 앱 설치 지원", "고객 경험 향상 서비스 가이드"] },
              { icon: Star, title: "IoT 제품 확장 판매 기회 소개", items: ["아카라 카메라, 조명, 스위치 등", "설치형 제품 판매 및 시공 수익 모델", "패키지 제안 및 업셀링 전략"] },
              { icon: Gift, title: "현장 등록 및 특별 혜택", items: ["공식 소매 파트너 현장 등록", "설명회 참석자 특별 공급가 주문 기회", "점심 식사 제공 및 쇼룸 투어"] },
            ].map((prog, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <prog.icon className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-base font-bold text-gray-900">{i + 1}. {prog.title}</div>
                </div>
                <ul className="space-y-1.5 pl-11">
                  {prog.items.map((item, j) => (
                    <li key={j} className="text-sm text-gray-600 flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5 flex-shrink-0">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="bg-black text-white py-12">
        <div className="max-w-xl mx-auto px-5">
          <div className="text-center mb-8">
            <div className="text-sm font-semibold text-amber-400 tracking-widest uppercase mb-2">Benefits</div>
            <h2 className="text-2xl font-bold">참석 혜택</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "🏆", title: "공식 파트너 등록", desc: "아카라 공식 소매 파트너 자격 취득" },
              { icon: "💰", title: "특별 공급가", desc: "설명회 당일 한정 특별 공급가 제공" },
              { icon: "📚", title: "무상 교육", desc: "설치 및 영업 교육 무상 제공" },
              { icon: "🎁", title: "스타터킷 증정", desc: "사전 설문 완료 시 현장 증정" },
            ].map((b, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-4">
                <div className="text-2xl mb-2">{b.icon}</div>
                <div className="text-base font-bold mb-1">{b.title}</div>
                <div className="text-sm text-gray-400">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SURVEY FORM ── */}
      <section id="survey" className="bg-white py-12">
        <div className="max-w-xl mx-auto px-5">
          {/* Gift notice - 问卷前最先展示 */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Gift className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-base font-bold text-amber-800 mb-1">사전 설문 완료 혜택</div>
                <div className="text-sm text-amber-700">사전 설문 응답 완료 시 <strong>아카라 스마트홈 스타터킷</strong>을 설명회 현장에서 증정드립니다.</div>
                <div className="text-sm text-amber-600 mt-1">※ 참석자에 한하여 1인 1세트 제공 / 사전 신청자 한정</div>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="text-sm font-semibold text-amber-600 tracking-widest uppercase mb-2">Pre-Survey</div>
            <h2 className="text-2xl font-bold text-gray-900">참석 신청 + 사전 설문</h2>
            <p className="text-base text-gray-500 mt-2">
              사전 설문 응답 완료 시 <span className="font-semibold text-amber-600">아카라 스마트홈 스타터킷</span>을 현장에서 증정합니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 섹션 1 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 bg-amber-500 text-black text-sm font-bold rounded-full flex items-center justify-center">1</div>
                <h3 className="text-lg font-bold text-gray-900">기본 정보 & 참석 여부</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q1. 참석 여부 <span className="text-red-500">*</span></label>
                  <RadioGroup name="attendance" value={form.attendanceStatus} onChange={v => update("attendanceStatus", v)} options={[
                    { value: "attend", label: "참석 가능" },
                    { value: "not_attend", label: "참석 불가" },
                    { value: "reviewing", label: "검토 중" },
                  ]} />
                </div>
                <div data-error={errors.businessName}>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q2. 업체명 / 상호 <span className="text-red-500">*</span></label>
                  <input type="text" value={form.businessName} onChange={e => update("businessName", e.target.value)} placeholder="업체명을 입력해 주세요" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-amber-500 focus:outline-none transition-colors" />
                  {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                </div>
                <div data-error={errors.contactName}>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q3. 성함 <span className="text-red-500">*</span></label>
                  <input type="text" value={form.contactName} onChange={e => update("contactName", e.target.value)} placeholder="성함을 입력해 주세요" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-amber-500 focus:outline-none transition-colors" />
                  {errors.contactName && <p className="text-red-500 text-sm mt-1">{errors.contactName}</p>}
                </div>
                <div data-error={errors.contactPosition}>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q4. 직책 <span className="text-red-500">*</span></label>
                  <input type="text" value={form.contactPosition} onChange={e => update("contactPosition", e.target.value)} placeholder="직책을 입력해 주세요 (예: 사장, 실장, 기사)" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-amber-500 focus:outline-none transition-colors" />
                  {errors.contactPosition && <p className="text-red-500 text-sm mt-1">{errors.contactPosition}</p>}
                </div>
                <div data-error={errors.contactPhone}>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q5. 연락처 <span className="text-red-500">*</span></label>
                  <input type="tel" value={form.contactPhone} onChange={e => update("contactPhone", e.target.value)} placeholder="010-0000-0000" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-amber-500 focus:outline-none transition-colors" />
                  {errors.contactPhone && <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>}
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">이메일 (선택)</label>
                  <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="example@company.com" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-amber-500 focus:outline-none transition-colors" />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* 섹션 2 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 bg-amber-500 text-black text-sm font-bold rounded-full flex items-center justify-center">2</div>
                <h3 className="text-lg font-bold text-gray-900">사업 현황</h3>
              </div>
              <div className="space-y-5">
                <div data-error={errors.businessAddress}>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q6. 사업장 주소 <span className="text-red-500">*</span></label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" value={form.businessZipcode} readOnly placeholder="우편번호" className="w-28 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50 text-gray-600" />
                    <button type="button" onClick={openPostcodeSearch} className="px-4 py-3.5 bg-amber-500 text-white text-base font-semibold rounded-xl hover:bg-amber-600 transition-colors whitespace-nowrap">
                      우편번호 검색
                    </button>
                  </div>
                  <input type="text" value={form.businessAddress} readOnly placeholder="주소 검색 버튼을 눌러 주세요" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50 text-gray-600 mb-2" />
                  {errors.businessAddress && <p className="text-red-500 text-sm mt-1 mb-2">{errors.businessAddress}</p>}
                  <input id="businessAddressDetail" type="text" value={form.businessAddressDetail} onChange={e => update("businessAddressDetail", e.target.value)} placeholder="상세 주소 입력 (건물명, 층, 호수 등)" className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-amber-500 focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q7. 도어락 판매 경력 <span className="text-red-500">*</span></label>
                  <RadioGroup name="salesExp" value={form.salesExperience} onChange={v => update("salesExperience", v)} options={[
                    { value: "under1", label: "1년 미만" },
                    { value: "1to3", label: "1~3년" },
                    { value: "3to5", label: "3~5년" },
                    { value: "5to10", label: "5~10년" },
                    { value: "over10", label: "10년 이상" },
                  ]} />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q8. 2025년 연간 도어락 판매 대수 <span className="text-red-500">*</span></label>
                  <RadioGroup name="salesVol" value={form.annualSalesVolume} onChange={v => update("annualSalesVolume", v)} options={[
                    { value: "under100", label: "100대 미만" },
                    { value: "100to300", label: "100~300대" },
                    { value: "300to500", label: "300~500대" },
                    { value: "500to1000", label: "500~1,000대" },
                    { value: "over1000", label: "1,000대 이상" },
                  ]} />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q9. 주요 판매 대상 <span className="text-red-500">*</span></label>
                  <RadioGroup name="salesTarget" value={form.salesTarget} onChange={v => update("salesTarget", v)} options={[
                    { value: "enduser", label: "일반 소비자 (개인 고객 직접 판매)" },
                    { value: "b2b", label: "소매/재판매 (업체 납품)" },
                    { value: "both", label: "둘 다 병행" },
                  ]} />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* 섹션 3 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 bg-amber-500 text-black text-sm font-bold rounded-full flex items-center justify-center">3</div>
                <h3 className="text-lg font-bold text-gray-900">설치 운영 역량</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q10. 설치 기사 운영 방식 <span className="text-red-500">*</span></label>
                  <RadioGroup name="installMethod" value={form.installationMethod} onChange={v => update("installationMethod", v)} options={[
                    { value: "own_team", label: "자체 설치팀 운영" },
                    { value: "outsource", label: "외주(협력기사) 활용" },
                    { value: "mixed", label: "혼합 운영" },
                  ]} />
                </div>
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q11. 설치 기사 인원 <span className="text-red-500">*</span></label>
                  <RadioGroup name="installStaff" value={form.installationStaff} onChange={v => update("installationStaff", v)} options={[
                    { value: "none", label: "없음" },
                    { value: "1to2", label: "1~2명" },
                    { value: "3to5", label: "3~5명" },
                    { value: "6to10", label: "6~10명" },
                    { value: "over10", label: "10명 이상" },
                  ]} />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* 섹션 4 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 bg-amber-500 text-black text-sm font-bold rounded-full flex items-center justify-center">4</div>
                <h3 className="text-lg font-bold text-gray-900">사업 확장 가능성</h3>
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-2">Q12. 도어락 외 IoT/설치형 제품 사업 확대 의향 <span className="text-red-500">*</span></label>
                <RadioGroup name="iotIntent" value={form.iotExpansionIntent} onChange={v => update("iotExpansionIntent", v)} options={[
                  { value: "already", label: "이미 진행 중" },
                  { value: "reviewing", label: "검토 중" },
                  { value: "interested", label: "관심 있음" },
                  { value: "none", label: "없음" },
                ]} />
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* 섹션 5 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 bg-amber-500 text-black text-sm font-bold rounded-full flex items-center justify-center">5</div>
                <h3 className="text-lg font-bold text-gray-900">기대 및 참여 목적</h3>
              </div>
              <div className="space-y-5">
                <div data-error={errors.attendancePurpose}>
                  <label className="block text-base font-semibold text-gray-800 mb-2">Q13. 설명회 참석 사유 / 기대 사항 <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(복수 선택 가능)</span></label>
                  <CheckboxGroup value={form.attendancePurpose} onChange={v => update("attendancePurpose", v)} options={PURPOSE_OPTIONS} />
                  {errors.attendancePurpose && <p className="text-red-500 text-sm mt-1">{errors.attendancePurpose}</p>}
                  {form.attendancePurpose.includes("other") && (
                    <textarea value={form.attendancePurposeOther} onChange={e => update("attendancePurposeOther", e.target.value)} placeholder="기타 내용을 입력해 주세요" rows={2} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-amber-500 focus:outline-none transition-colors mt-2 resize-none" />
                  )}
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">관심 제품 <span className="text-gray-400 font-normal">(복수 선택 가능)</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRODUCTS.map(p => (
                      <label key={p.value} className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.interestedProducts.includes(p.value) ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                        <input type="checkbox" value={p.value} checked={form.interestedProducts.includes(p.value)} onChange={() => {
                          const cur = form.interestedProducts;
                          update("interestedProducts", cur.includes(p.value) ? cur.filter(x => x !== p.value) : [...cur, p.value]);
                        }} className="sr-only" />
                        <img src={p.img} alt={p.label} className="w-full aspect-square object-contain" />
                        <span className={`text-xs font-bold ${form.interestedProducts.includes(p.value) ? "text-amber-700" : "text-gray-700"}`}>{p.value}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-2">기타 문의사항 <span className="text-gray-400 font-normal">(선택)</span></label>
                  <textarea value={form.additionalInquiry} onChange={e => update("additionalInquiry", e.target.value)} placeholder="궁금하신 점이나 요청 사항을 자유롭게 입력해 주세요." rows={3} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base focus:border-amber-500 focus:outline-none transition-colors resize-none" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  제출 중...
                </>
              ) : (
                "참석 신청 및 설문 제출하기"
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-xl mx-auto px-5 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-4">문의</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">담당자:</span> 송지용
            </div>
            <a href="tel:010-9170-3550" className="flex items-center justify-center gap-2 text-sm text-gray-700 hover:text-amber-600">
              <Phone className="w-4 h-4" />
              010-9170-3550
            </a>
            <a href="mailto:songzy@aqara.kr" className="flex items-center justify-center gap-2 text-sm text-gray-700 hover:text-amber-600">
              <Mail className="w-4 h-4" />
              songzy@aqara.kr
            </a>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-200">
            <img src={LOGO_URL} alt="AqaraLife" className="h-5 mx-auto opacity-40" />
            <p className="text-xs text-gray-400 mt-2">© 2026 AqaraLife. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
