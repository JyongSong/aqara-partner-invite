import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAllSurveyResponses,
  getSurveyResponseByPhone,
  getSurveyResponseCount,
  insertSurveyResponse,
} from "./db";
import { notifyOwner } from "./_core/notification";

const surveyInputSchema = z.object({
  // 섹션 1
  attendanceStatus: z.enum(["attend", "not_attend", "reviewing"]),
  businessName: z.string().min(1).max(200),
  contactName: z.string().min(1).max(100),
  contactPosition: z.string().min(1).max(100),
  contactPhone: z.string().min(1).max(30),
  email: z.string().email().optional().or(z.literal("")),

  // 섹션 2
  businessZipcode: z.string().max(10).optional(),
  businessAddress: z.string().min(1).max(300),
  businessAddressDetail: z.string().max(200).optional(),
  salesExperience: z.enum(["under1", "1to3", "3to5", "5to10", "over10"]),
  annualSalesVolume: z.enum(["under100", "100to300", "300to500", "500to1000", "over1000"]),
  salesTarget: z.enum(["enduser", "b2b", "both"]),

  // 섹션 3
  installationMethod: z.enum(["own_team", "outsource", "mixed"]),
  installationStaff: z.enum(["none", "1to2", "3to5", "6to10", "over10"]),

  // 섹션 4
  iotExpansionIntent: z.enum(["already", "reviewing", "interested", "none"]),

  // 섹션 5
  attendancePurpose: z.array(z.string()).min(1),
  attendancePurposeOther: z.string().optional(),

  // 관심 제품
  interestedProducts: z.array(z.string()).optional(),

  // 기타
  additionalInquiry: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  survey: router({
    // 설문 제출 (공개)
    submit: publicProcedure
      .input(surveyInputSchema)
      .mutation(async ({ input, ctx }) => {
        // 중복 제출 방지: 동일 연락처 확인
        const existing = await getSurveyResponseByPhone(input.contactPhone);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "이미 해당 연락처로 설문이 제출되었습니다.",
          });
        }

        const ipAddress =
          (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          ctx.req.socket?.remoteAddress ||
          null;

        await insertSurveyResponse({
          ...input,
          email: input.email || null,
          businessZipcode: input.businessZipcode || null,
          businessAddressDetail: input.businessAddressDetail || null,
          attendancePurpose: JSON.stringify(input.attendancePurpose),
          attendancePurposeOther: input.attendancePurposeOther || null,
          interestedProducts: input.interestedProducts
            ? JSON.stringify(input.interestedProducts)
            : null,
          additionalInquiry: input.additionalInquiry || null,
          ipAddress: ipAddress ?? undefined,
        });

        // 오너에게 알림
        await notifyOwner({
          title: "새 설문 응답 접수",
          content: `${input.businessName} / ${input.contactName} (${input.contactPhone}) 님이 설문을 제출했습니다. 참석 여부: ${input.attendanceStatus}`,
        }).catch(() => {});

        return { success: true };
      }),

    // 응답 수 조회 (공개 - 참석자 수 표시용)
    count: publicProcedure.query(async () => {
      const count = await getSurveyResponseCount();
      return { count };
    }),

    // 전체 응답 조회 (관리자 전용)
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "관리자만 접근 가능합니다." });
      }
      const responses = await getAllSurveyResponses();
      return responses;
    }),
  }),
});

export type AppRouter = typeof appRouter;
