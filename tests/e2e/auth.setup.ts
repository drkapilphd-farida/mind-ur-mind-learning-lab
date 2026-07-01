import { test as setup } from '@playwright/test'
import path from 'path'
import { readFile, access } from 'fs/promises'

const AUTH_FILE = path.join(process.cwd(), 'tests/.auth/user.json')
const CRED_FILE = path.join(process.cwd(), 'tests/.auth/credentials.json')

setup('save authenticated session', async ({ page }) => {
  // If global-setup already wrote the Playwright storage state, reuse it.
  try {
    await access(AUTH_FILE)
    return
  } catch {
    // Fall back to UI sign-in using credentials written by global-setup
    const credsRaw = await readFile(CRED_FILE, 'utf8')
    const { email, password } = JSON.parse(credsRaw)

    await page.goto('/login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('**/dashboard')

    await page.context().storageState({ path: AUTH_FILE })
  }
})
