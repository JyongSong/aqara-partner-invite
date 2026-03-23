import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB functions
vi.mock("./db", () => ({
  insertSurveyResponse: vi.fn().mockResolvedValue(undefined),
  getAllSurveyResponses: vi.fn().mockResolvedValue([]),
  getSurveyResponseCount: vi.fn().mockResolvedValue(0),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {}, socket: { remoteAddress: "127.0.0.1" } } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@aqara.kr",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {}, socket: { remoteAddress: "127.0.0.1" } } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

const validSurveyInput = {
  attendanceStatus: "attend" as const,
  businessName: "테스트 도어락",
  contactName: "홍길동",
  contactPhone: "010-1234-5678",
  email: "test@example.com",
  businessRegion: "서울",
  businessRegionDetail: "강남구",
  salesExperience: "1to3" as const,
  annualSalesVolume: "100to300" as const,
  salesTarget: "enduser" as const,
  installationMethod: "own_team" as const,
  installationStaff: "1to2" as const,
  iotExpansionIntent: "interested" as const,
  attendancePurpose: ["supply_condition", "price_competitiveness"],
  attendancePurposeOther: undefined,
  interestedProducts: ["K100", "L100"],
  additionalInquiry: "문의사항 없음",
};

describe("survey.submit", () => {
  it("유효한 설문 데이터를 성공적으로 제출한다", async () => {
    const ctx = createPublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.survey.submit(validSurveyInput);
    expect(result).toEqual({ success: true });
  });

  it("필수 필드 누락 시 오류를 반환한다", async () => {
    const ctx = createPublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.survey.submit({ ...validSurveyInput, businessName: "" })
    ).rejects.toThrow();
  });

  it("attendancePurpose가 빈 배열이면 오류를 반환한다", async () => {
    const ctx = createPublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.survey.submit({ ...validSurveyInput, attendancePurpose: [] })
    ).rejects.toThrow();
  });
});

describe("survey.count", () => {
  it("설문 응답 수를 반환한다", async () => {
    const ctx = createPublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.survey.count();
    expect(result).toHaveProperty("count");
    expect(typeof result.count).toBe("number");
  });
});

describe("survey.list", () => {
  it("관리자는 전체 응답 목록을 조회할 수 있다", async () => {
    const ctx = createAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.survey.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("일반 사용자는 목록 조회 시 FORBIDDEN 오류를 받는다", async () => {
    const ctx = createPublicCtx();
    // non-admin user
    ctx.user = {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.survey.list()).rejects.toThrow();
  });
});
