import { z } from "zod";

// ==========================================
// 1. Database Entity Schemas
// ==========================================

// User Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  phone: z.string(),
  phone_verified_at: z.string().datetime().nullable(),
  email: z.string().email().nullable(),
  oauth_provider: z.string().nullable(),
  oauth_id: z.string().nullable(),
  name: z.string().nullable(),
  dob: z.string().nullable(), // YYYY-MM-DD
  profile_photo_asset_id: z.string().uuid().nullable(),
  storage_used_bytes: z.number().int().nonnegative(),
  storage_quota_bytes: z.number().int().positive(),
  created_at: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

// Profile Schema
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  headline: z.string().nullable(),
  career_goal: z.string().nullable(),
  bio: z.string().nullable(),
  completion_pct: z.number().int().min(0).max(100),
  updated_at: z.string().datetime(),
});
export type Profile = z.infer<typeof ProfileSchema>;

// Profile Section Schema
export const ProfileSectionSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  type: z.enum(['about', 'education', 'projects', 'experience', 'certificates', 'achievements', 'research', 'contact']),
  entries: z.array(z.record(z.any())),
  reviewed_at: z.string().datetime().nullable(),
  position: z.number().int().nonnegative(),
});
export type ProfileSection = z.infer<typeof ProfileSectionSchema>;

// Asset Schema
export const AssetSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  section_type: z.enum(['resume', 'photo', 'project', 'certificate', 'achievement', 'research']),
  entry_id: z.string().uuid().nullable(),
  kind: z.enum(['image', 'pdf']),
  gcs_path: z.string(),
  cdn_asset_id: z.string(),
  size_bytes: z.number().int().positive(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  thumbnail_path: z.string().nullable(),
  created_at: z.string().datetime(),
});
export type Asset = z.infer<typeof AssetSchema>;

// Entry Link Schema
export const EntryLinkSchema = z.object({
  id: z.string().uuid(),
  entry_id: z.string().uuid(),
  section_type: z.string(),
  url: z.string().url(),
  label: z.string(),
  position: z.number().int().nonnegative(),
});
export type EntryLink = z.infer<typeof EntryLinkSchema>;

// Organization Schema
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  contact_email: z.string().email(),
  plan_type: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

// Activation Key Schema
export const ActivationKeySchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  org_id: z.string().uuid().nullable(),
  batch_id: z.string().uuid(),
  status: z.enum(['unused', 'redeemed', 'expired', 'revoked']),
  redeemed_by_user_id: z.string().uuid().nullable(),
  redeemed_at: z.string().datetime().nullable(),
  expires_at: z.string().datetime().nullable(),
});
export type ActivationKey = z.infer<typeof ActivationKeySchema>;

// Template Schema
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  thumbnail_url: z.string().nullable(),
  is_active: z.boolean(),
  tier: z.enum(['free', 'paid']),
});
export type Template = z.infer<typeof TemplateSchema>;

// Theme Variant Schema
export const ThemeVariantSchema = z.object({
  id: z.string().uuid(),
  template_id: z.string(),
  name: z.string(),
  tokens: z.record(z.any()),
});
export type ThemeVariant = z.infer<typeof ThemeVariantSchema>;

// Portfolio Schema
export const PortfolioSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  handle: z.string(),
  selected_template_id: z.string().nullable(),
  selected_theme_id: z.string().uuid().nullable(),
  domain_id: z.string().uuid().nullable(),
  is_indexable: z.boolean(),
  is_published: z.boolean(),
  draft_preview_token: z.string().nullable(),
  published_at: z.string().datetime().nullable(),
});
export type Portfolio = z.infer<typeof PortfolioSchema>;

// Subscription Schema
export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  source: z.enum(['activation_key', 'purchase']),
  plan: z.enum(['annual', 'lifetime']),
  razorpay_sub_id: z.string().nullable(),
  activation_key_id: z.string().uuid().nullable(),
  status: z.string(),
  expires_at: z.string().datetime().nullable(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

// Payment Schema
export const PaymentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().positive(),
  razorpay_payment_id: z.string().nullable(),
  status: z.string(),
  created_at: z.string().datetime(),
});
export type Payment = z.infer<typeof PaymentSchema>;


// ==========================================
// 2. Client-Facing Request Payload Schemas
// ==========================================

// Send OTP Payload Schema (Step 1 Onboarding)
export const SendOtpSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number cannot exceed 15 digits"),
});
export type SendOtpPayload = z.infer<typeof SendOtpSchema>;

// Verify OTP Payload Schema (Step 1 Onboarding)
export const VerifyOtpSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});
export type VerifyOtpPayload = z.infer<typeof VerifyOtpSchema>;

// Google OAuth Link Payload Schema (Step 2 Onboarding)
export const GoogleAuthSchema = z.object({
  token: z.string().min(1, "Google OAuth token is required"),
});
export type GoogleAuthPayload = z.infer<typeof GoogleAuthSchema>;

// Basic Name/DOB Details Payload Schema (Step 3 Onboarding)
export const BasicInfoSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must match format YYYY-MM-DD"),
});
export type BasicInfoPayload = z.infer<typeof BasicInfoSchema>;

// Profile Section PATCH Schema (Step 6 Onboarding)
export const PatchSectionSchema = z.object({
  entries: z.array(z.record(z.any())),
  reviewed_at: z.string().datetime().nullable().optional(),
});
export type PatchSectionPayload = z.infer<typeof PatchSectionSchema>;

// Activation Key Check Payload Schema (Step 7 Onboarding)
export const RedeemKeySchema = z.object({
  code: z.string().min(4, "Activation key must be valid format").max(50),
});
export type RedeemKeyPayload = z.infer<typeof RedeemKeySchema>;

// Portfolio Publication Payload Schema (Step 8 & 9 Onboarding)
export const PublishPortfolioSchema = z.object({
  handle: z.string().min(3, "Handle must be at least 3 characters").max(50).regex(/^[a-z0-9-]+$/, "Handle can only contain lowercase letters, numbers, and hyphens"),
  selected_template_id: z.string(),
  selected_theme_id: z.string().uuid("Theme Variant ID must be a valid UUID"),
});
export type PublishPortfolioPayload = z.infer<typeof PublishPortfolioSchema>;
