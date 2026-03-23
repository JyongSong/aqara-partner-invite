import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["attend", "not_attend", "reviewing"]);
export const salesExperienceEnum = pgEnum("sales_experience", ["under1", "1to3", "3to5", "5to10", "over10"]);
export const annualSalesVolumeEnum = pgEnum("annual_sales_volume", ["under100", "100to300", "300to500", "500to1000", "over1000"]);
export const salesTargetEnum = pgEnum("sales_target", ["enduser", "b2b", "both"]);
export const installationMethodEnum = pgEnum("installation_method", ["own_team", "outsource", "mixed"]);
export const installationStaffEnum = pgEnum("installation_staff", ["none", "1to2", "3to5", "6to10", "over10"]);
export const iotExpansionIntentEnum = pgEnum("iot_expansion_intent", ["already", "reviewing", "interested", "none"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const surveyResponses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  attendanceStatus: attendanceStatusEnum("attendance_status").notNull(),
  businessName: varchar("business_name", { length: 200 }).notNull(),
  contactName: varchar("contact_name", { length: 100 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 30 }).notNull(),
  email: varchar("email", { length: 320 }),
  businessRegion: varchar("business_region", { length: 50 }).notNull(),
  businessRegionDetail: varchar("business_region_detail", { length: 100 }),
  salesExperience: salesExperienceEnum("sales_experience").notNull(),
  annualSalesVolume: annualSalesVolumeEnum("annual_sales_volume").notNull(),
  salesTarget: salesTargetEnum("sales_target").notNull(),
  installationMethod: installationMethodEnum("installation_method").notNull(),
  installationStaff: installationStaffEnum("installation_staff").notNull(),
  iotExpansionIntent: iotExpansionIntentEnum("iot_expansion_intent").notNull(),
  attendancePurpose: text("attendance_purpose").notNull(),
  attendancePurposeOther: text("attendance_purpose_other"),
  interestedProducts: text("interested_products"),
  additionalInquiry: text("additional_inquiry"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
});

export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = typeof surveyResponses.$inferInsert;
