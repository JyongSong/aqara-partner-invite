import { CheckCircle2, Calendar, MapPin, Phone, Mail, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375882276/AcFeksXYT56o4U9QsgyZGe/aqara_logo_6a235e61.png";

export default function SurveySuccess() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-black px-5 py-4">
        <img src={LOGO_URL} alt="AqaraLife" className="h-6 brightness-0 invert" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="max-w-sm w-full text-center">
          {/* Success icon */}
          <div className="w-20 h-20 bg-amber-50 border-4 border-amber-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-amber-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">신청이 완료되었습니다!</h1>
          <p className="text-sm text-gray-600 leading-relaxed mb-8">
            아카라 스마트 도어락 파트너 설명회 참석 신청 및 사전 설문이 성공적으로 접수되었습니다.
          </p>

          {/* Gift notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 text-left">
            <div className="text-sm font-bold text-amber-800 mb-2">🎁 스타터킷 증정 안내</div>
            <p className="text-xs text-amber-700 leading-relaxed">
              사전 설문 응답을 완료하셨습니다. <strong>아카라 스마트홈 스타터킷</strong>을 설명회 현장에서 수령하실 수 있습니다.
            </p>
            <p className="text-xs text-amber-600 mt-1">※ 참석자에 한하여 1인 1세트 / 사전 신청자 한정</p>
          </div>

          {/* Event info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8 text-left shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">행사 정보</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">일시</div>
                  <div className="text-sm font-semibold text-gray-800">2026년 4월 4일(토) 10:30 ~ 16:00</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">장소</div>
                  <div className="text-sm font-semibold text-gray-800">스타크 강남빌딩 마이워크스페이스타워 B1 교육장</div>
                  <div className="text-xs text-gray-500 mt-0.5">서울 서초구 강남대로53길</div>
                  <a
                    href="https://map.naver.com/v5/search/%EC%84%9C%EC%9A%B8%20%EC%84%9C%EC%B4%88%EA%B5%AC%20%EA%B0%95%EB%82%A8%EB%8C%80%EB%A1%9C53%EA%B8%B8%20%EC%8A%A4%ED%83%80%ED%81%AC%EA%B0%95%EB%82%A8%EB%B9%8C%EB%94%A9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-amber-600 mt-1 hover:text-amber-500"
                  >
                    <MapPin className="w-3 h-3" />
                    네이버 지도로 보기 →
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 mt-1 pt-3 border-t border-gray-200">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">주의사항</div>
                  <div className="text-xs text-gray-700">주차 공간이 한정되어 있으므로 대중교통을 이용해 주시기 바랍니다.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gray-100 rounded-2xl p-4 mb-8 text-left">
            <h3 className="text-sm font-bold text-gray-800 mb-3">문의</h3>
            <div className="space-y-2">
              <div className="text-sm text-gray-700"><span className="font-medium">담당자:</span> 송지용</div>
              <a href="tel:010-9170-3550" className="flex items-center gap-2 text-sm text-gray-700 hover:text-amber-600">
                <Phone className="w-3.5 h-3.5" />
                010-9170-3550
              </a>
              <a href="mailto:songzy@aqara.kr" className="flex items-center gap-2 text-sm text-gray-700 hover:text-amber-600">
                <Mail className="w-3.5 h-3.5" />
                songzy@aqara.kr
              </a>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:border-gray-400 transition-colors"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-5 py-4 text-center">
        <img src={LOGO_URL} alt="AqaraLife" className="h-4 mx-auto opacity-40 mb-1" />
        <p className="text-xs text-gray-400">© 2026 AqaraLife. All rights reserved.</p>
      </div>
    </div>
  );
}
