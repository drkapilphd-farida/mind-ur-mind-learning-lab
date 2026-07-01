import { test, expect } from '@playwright/test'

// Smoke tests verify public pages load without authentication
test.use({ storageState: { cookies: [], origins: [] } })

test('homepage renders hero', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('course catalog renders', async ({ page }) => {
  await page.goto('/courses')
  await expect(page.getByRole('heading', { name: 'Course Catalog' })).toBeVisible()
})

test('invalid certificate token returns 404 or shows not-found page', async ({ page }) => {
  const res = await page.goto('/certificates/00000000-0000-0000-0000-000000000000')
  const status = res?.status()
  if (status === 404) return
  // Some dev servers return 200 with a not-found UI or page title.
  await expect(page).toHaveTitle(/Certificate Not Found/i)
  await expect(page.locator('h2')).toHaveText(/404 — Page Not Found/i)
})
