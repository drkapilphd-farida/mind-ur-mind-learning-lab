import { z } from 'zod'

export const SignInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type SignInInput = z.infer<typeof SignInSchema>

export const SignUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type SignUpInput = z.infer<typeof SignUpSchema>

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>

export type AuthActionResult =
  | { success: true }
  | { success: false; error: string }

// Quantum Mind App™ login — email OTP (a 6-digit code emailed via
// Supabase's built-in signInWithOtp), not phone/SMS. Deliberately
// reverted from an earlier phone-OTP design: SMS delivery requires a
// paid provider (Twilio/MSG91/etc.) per message, where email OTP uses
// Supabase's own email sending at no per-login cost.
export const AppLoginEmailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export type AppLoginEmailInput = z.infer<typeof AppLoginEmailSchema>

export const AppLoginVerifyOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  token: z.string().length(6, 'Enter the 6-digit code'),
})

export type AppLoginVerifyOtpInput = z.infer<typeof AppLoginVerifyOtpSchema>
