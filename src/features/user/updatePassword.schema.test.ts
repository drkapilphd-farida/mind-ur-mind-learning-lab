import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

describe('updatePassword schema', () => {
  it('passes when passwords match and meet minimum length', () => {
    const result = schema.safeParse({
      password: 'validpassword',
      confirmPassword: 'validpassword',
    })
    expect(result.success).toBe(true)
  })

  it('fails when passwords do not match', () => {
    const result = schema.safeParse({
      password: 'validpassword',
      confirmPassword: 'differentpass',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) =>
        i.path.includes('confirmPassword'),
      )
      expect(issue?.message).toBe('Passwords do not match')
    }
  })

  it('fails when password is shorter than 8 characters', () => {
    const result = schema.safeParse({
      password: '1234567',
      confirmPassword: '1234567',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('password'))
      expect(issue?.message).toBe('Password must be at least 8 characters')
    }
  })

  it('fails when confirmPassword is empty', () => {
    const result = schema.safeParse({
      password: 'validpassword',
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
  })
})
