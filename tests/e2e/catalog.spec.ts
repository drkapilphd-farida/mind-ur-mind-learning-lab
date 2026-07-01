import { test, expect } from '@playwright/test'

// Catalog is fully public — no auth needed
test.use({ storageState: { cookies: [], origins: [] } })

test('displays the course catalog heading', async ({ page }) => {
  await page.goto('/courses')
  await expect(page.getByRole('heading', { name: 'Course Catalog' })).toBeVisible()
})

test('searching by title filters results', async ({ page }) => {
  await page.goto('/courses')
  await page.getByPlaceholder('Search courses…').fill('E2E Test Course')
  await page.getByRole('button', { name: 'Apply' }).click()

  await expect(page.getByText('E2E Test Course', { exact: true })).toBeVisible()
})

test('free filter hides paid courses', async ({ page }) => {
  await page.goto('/courses')
  await page.selectOption('select[name="filter"]', 'free')
  await page.getByRole('button', { name: 'Apply' }).click()

  // Active filter chip should appear (use the link role to be specific)
  await expect(page.getByRole('link', { name: 'Free' })).toBeVisible()
  // No dollar-sign price badges
  await expect(page.locator('text=/\\$\\d/')).toHaveCount(0)
})

test('clear-all button resets to /courses', async ({ page }) => {
  await page.goto('/courses?q=E2E+Test+Course')
  await page.getByTitle('Clear all').click()
  await expect(page).toHaveURL('/courses')
})

test('popular sort changes the URL', async ({ page }) => {
  await page.goto('/courses')
  await page.selectOption('select[name="sort"]', 'popular')
  await page.getByRole('button', { name: 'Apply' }).click()
  await expect(page).toHaveURL(/sort=popular/)
})
