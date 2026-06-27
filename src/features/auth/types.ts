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
