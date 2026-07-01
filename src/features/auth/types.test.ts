import { describe, it, expect } from 'vitest'
import { SignInSchema, SignUpSchema, ForgotPasswordSchema } from './types'

describe('SignInSchema', () => {
  it('accepts valid credentials', () => {
    const result = SignInSchema.safeParse({
      email: 'user@example.com',
      password: 'secret',
    })
    expect(result.success).toBe(true)
  })

  it('rejects malformed email', () => {
    const result = SignInSchema.safeParse({
      email: 'not-an-email',
      password: 'secret',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = SignInSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('SignUpSchema', () => {
  const valid = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    password: 'strongpass',
  }

  it('accepts valid signup data', () => {
    expect(SignUpSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a name shorter than 2 characters', () => {
    const result = SignUpSchema.safeParse({ ...valid, fullName: 'J' })
    expect(result.success).toBe(false)
  })

  it('rejects a password shorter than 8 characters', () => {
    const result = SignUpSchema.safeParse({ ...valid, password: '1234567' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid email', () => {
    const result = SignUpSchema.safeParse({ ...valid, email: 'bad-email' })
    expect(result.success).toBe(false)
  })
})

describe('ForgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(
      ForgotPasswordSchema.safeParse({ email: 'user@example.com' }).success,
    ).toBe(true)
  })

  it('rejects a non-email string', () => {
    expect(
      ForgotPasswordSchema.safeParse({ email: 'not-email' }).success,
    ).toBe(false)
  })
})
