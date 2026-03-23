import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Download, Users, CheckCircle2, Clock, XCircle, LogOut } from "lucide-react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663375882276/AcFeksXYT56o4U9QsgyZGe/aqara_logo_6a235e61.png";

const ATTENDANCE_LABEL: Record<string, string> = {
  attend: "참석",
  not_attend: "불참",
  reviewing: "검토중",
};

const SALES_EXP_LABEL: Record<string, string> = {
  under1: "1년 미만", "1to3": "1~3년", "3to5": "3~5년", "5to10": "5~10년", over10: "10년 이상",
};

const SALES_VOL_LABEL: Record<string, string> = {
  under100: "100대 미만", "100to300": "100~300대", "300to500": "300~500대", "500to1000": "500~1,000대", over1000: "1,000대 이상",
};

const IOT_INTENT_LABEL: Record<string, string> = {
  already: "이미 진행", reviewing: "검토중", interested: "관심있음", none: "없음",
};

type SurveyRow = {
  id: number;
  attendanceStatus: string;
  businessName: string;
  contactName: string;
  contactPhone: string;
  email: string | null;
  businessRegion: string;
  businessRegionDetail: string | null;
  salesExperience: string;
  annualSalesVolume: string;
  salesTarget: string;
  installationMethod: string;
  installationStaff: string;
  iotExpansionIntent: string;
  attendancePurpose: string;
  attendancePurposeOther: string | null;
  interestedProducts: string | null;
  additionalInquiry: string | null;
  submittedAt: Date;
  ipAddress: string | null;
};

function parseJsonArray(val: string | null | undefined): string {
  if (!val) return "";
  try { return (JSON.parse(val) as string[]).join(", "); } catch { return val; }
}

function downloadCSV(data: SurveyRow[] | undefined) {
  if (!data || data.length === 0) return;
  const headers = [
    "ID", "제출일시", "참석여부", "업체명", "담당자", "연락처", "이메일",
    "소재지", "소재지상세", "판매경력", "연간판매량", "판매대상",
    "설치방식", "설치인원", "IoT확장의향", "참석목적", "관심제품", "기타문의",
  ];
  const rows = data.map(r => [
    r.id,
    new Date(r.submittedAt).toLocaleString("ko-KR"),
    ATTENDANCE_LABEL[r.attendanceStatus] ?? r.attendanceStatus,
    r.businessName,
    r.contactName,
    r.contactPhone,
    r.email ?? "",
    r.businessRegion,
    r.businessRegionDetail ?? "",
    SALES_EXP_LABEL[r.salesExperience] ?? r.salesExperience,
    SALES_VOL_LABEL[r.annualSalesVolume] ?? r.annualSalesVolume,
    r.salesTarget,
    r.installationMethod,
    r.installationStaff,
    IOT_INTENT_LABEL[r.iotExpansionIntent] ?? r.iotExpansionIntent,
    parseJsonArray(r.attendancePurpose),
    parseJsonArray(r.interestedProducts),
    r.additionalInquiry ?? "",
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aqara_survey_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { data: rawData, isLoading, error } = trpc.survey.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    retry: false,
  });

  const responses = rawData as SurveyRow[] | undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">
        <img src={LOGO_URL} alt="AqaraLife" className="h-7 mb-8" />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">관리자 로그인</h2>
          <p className="text-sm text-gray-500 mb-6">설문 응답 조회는 관리자 계정이 필요합니다.</p>
          <a
            href={getLoginUrl()}
            className="block w-full bg-black text-white font-semibold py-3 rounded-xl text-sm hover:bg-gray-800 transition-colors"
          >
            로그인하기
          </a>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-sm w-full text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">접근 권한 없음</h2>
          <p className="text-sm text-gray-500">관리자 계정으로 로그인해 주세요.</p>
        </div>
      </div>
    );
  }

  const attendCount = responses?.filter(r => r.attendanceStatus === "attend").length ?? 0;
  const reviewCount = responses?.filter(r => r.attendanceStatus === "reviewing").length ?? 0;
  const notAttendCount = responses?.filter(r => r.attendanceStatus === "not_attend").length ?? 0;
  const totalCount = responses?.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-black text-white px-5 py-4 flex items-center justify-between">
        <img src={LOGO_URL} alt="AqaraLife" className="h-6 brightness-0 invert" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">{user.name ?? user.email}</span>
          <button
            onClick={() => { void logout(); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            로그아웃
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">설문 응답 관리</h1>
            <p className="text-sm text-gray-500 mt-1">파트너 설명회 사전 설문 응답 현황</p>
          </div>
          <button
            onClick={() => downloadCSV(responses)}
            disabled={!responses || responses.length === 0}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV 다운로드
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: Users, label: "전체 응답", value: totalCount, color: "text-gray-700", bg: "bg-white" },
            { icon: CheckCircle2, label: "참석", value: attendCount, color: "text-green-600", bg: "bg-green-50" },
            { icon: Clock, label: "검토중", value: reviewCount, color: "text-amber-600", bg: "bg-amber-50" },
            { icon: XCircle, label: "불참", value: notAttendCount, color: "text-red-500", bg: "bg-red-50" },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} rounded-2xl p-4 border border-gray-100 shadow-sm text-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-red-500 text-sm">데이터를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        ) : !responses || responses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">아직 제출된 설문이 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["#", "참석여부", "업체명", "담당자", "연락처", "소재지", "판매경력", "연간판매량", "IoT의향", "제출일시"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r, i) => (
                    <tr key={r.id} className={`border-b border-gray-50 hover:bg-amber-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                      <td className="px-4 py-3 text-gray-400 text-xs">{r.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          r.attendanceStatus === "attend" ? "bg-green-100 text-green-700" :
                          r.attendanceStatus === "reviewing" ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-600"
                        }`}>
                          {ATTENDANCE_LABEL[r.attendanceStatus] ?? r.attendanceStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{r.businessName}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.contactName}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        <a href={`tel:${r.contactPhone}`} className="hover:text-amber-600">{r.contactPhone}</a>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {r.businessRegion}{r.businessRegionDetail ? ` ${r.businessRegionDetail}` : ""}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{SALES_EXP_LABEL[r.salesExperience] ?? r.salesExperience}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{SALES_VOL_LABEL[r.annualSalesVolume] ?? r.annualSalesVolume}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs ${r.iotExpansionIntent === "already" ? "text-green-600 font-semibold" : r.iotExpansionIntent === "none" ? "text-gray-400" : "text-amber-600"}`}>
                          {IOT_INTENT_LABEL[r.iotExpansionIntent] ?? r.iotExpansionIntent}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(r.submittedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
