import { Download, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const INVITE_CARD_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375882276/AcFeksXYT56o4U9QsgyZGe/invite_card-WyeVASSVUT8gP7DtauXSwV.png";
const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375882276/AcFeksXYT56o4U9QsgyZGe/aqara_logo_6a235e61.png";

export default function InviteCard() {
  const siteUrl = window.location.origin;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      toast.success("링크가 복사되었습니다!");
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "아카라 스마트 도어락 파트너 설명회",
          text: "도어락 판매를 넘어, IoT 설치 수익까지 함께 만드는 새로운 기회에 초대합니다.",
          url: siteUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      await handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black px-5 py-4 flex items-center justify-between">
        <img src={LOGO_URL} alt="AqaraLife" className="h-6 brightness-0 invert" />
        <a href="/" className="text-xs text-gray-400 hover:text-white transition-colors">← 메인으로</a>
      </div>

      <div className="max-w-sm mx-auto px-5 py-8">
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold text-gray-900 mb-1">초대장 공유하기</h1>
          <p className="text-sm text-gray-500">카카오톡, 문자 등으로 초대장을 공유하세요.</p>
        </div>

        {/* Card image */}
        <div className="rounded-2xl overflow-hidden shadow-xl mb-6">
          <img src={INVITE_CARD_URL} alt="아카라 파트너 설명회 초대장" className="w-full" />
        </div>

        {/* Link info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
          <div className="text-xs font-semibold text-gray-500 mb-2">참석 신청 링크</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-700 font-mono truncate border border-gray-200">
              {siteUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex-shrink-0 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              복사
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
            카카오톡 / 문자로 공유하기
          </button>
          <a
            href={INVITE_CARD_URL}
            download="아카라_파트너설명회_초대장.png"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3.5 rounded-xl text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            초대장 이미지 저장
          </a>
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 border-2 border-amber-300 hover:border-amber-400 text-amber-700 font-semibold py-3.5 rounded-xl text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            참석 신청 페이지 바로가기
          </a>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ※ 링크를 통해 접속한 대리점 사장님께서 직접 참석 신청 및 사전 설문을 작성하실 수 있습니다.
        </p>
      </div>
    </div>
  );
}
