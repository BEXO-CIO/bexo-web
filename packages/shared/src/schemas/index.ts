import { z } from "zod";

// 1. User Schema
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

// 2. Profile Schema
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

// 3. Profile Section Schema
export const ProfileSectionSchema = z.object({
  id: z.string().uuid(),
  profile_id: z.string().uuid(),
  type: z.enum(['about', 'education', 'projects', 'experience', 'certificates', 'achievements', 'research', 'contact']),
  entries: z.array(z.record(z.any())),
  reviewed_at: z.string().datetime().nullable(),
  position: z.number().int().nonnegative(),
});
export type ProfileSection = z.infer<typeof ProfileSectionSchema>;

// 4. Asset Schema
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

// 5. Entry Link Schema
export const EntryLinkSchema = z.object({
  id: z.string().uuid(),
  entry_id: z.string().uuid(),
  section_type: z.string(),
  url: z.string().url(),
  label: z.string(),
  position: z.number().int().nonnegative(),
});
export type EntryLink = z.infer<typeof EntryLinkSchema>;

// 6. Organization Schema
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  contact_email: z.string().email(),
  plan_type: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

// 7. Activation Key Schema
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

// 8. Template Schema
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  thumbnail_url: z.string().nullable(),
  is_active: z.boolean(),
  tier: z.enum(['free', 'paid']),
});
export type Template = z.infer<typeof TemplateSchema>;

// 9. Theme Variant Schema
export const ThemeVariantSchema = z.object({
  id: z.string().uuid(),
  template_id: z.string(),
  name: z.string(),
  tokens: z.record(z.any()),
});
export type ThemeVariant = z.infer<typeof ThemeVariantSchema>;

// 10. Portfolio Schema
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

// 11. Subscription Schema
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

// 12. Payment Schema
export const PaymentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  amount: z.number().positive(),
  razorpay_payment_id: z.string().nullable(),
  status: z.string(),
  created_at: z.string().datetime(),
});
export type Payment = z.infer<typeof PaymentSchema>;
