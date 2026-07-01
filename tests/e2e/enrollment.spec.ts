import { test, expect } from '@playwright/test'

const courseSlug = process.env.E2E_TEST_COURSE_SLUG ?? 'e2e-test-course'
const lessonSlug = process.env.E2E_TEST_LESSON_SLUG ?? 'e2e-test-lesson'

test('authenticated user can enroll in a free course', async ({ page }) => {
  await page.goto(`/courses/${courseSlug}`)

  const enrollBtn = page.getByRole('button', { name: /enroll now/i })
  const enrolledBadge = page.getByText('✓ Enrolled')

  // Already enrolled from a prior run — nothing to do
  if (await enrolledBadge.isVisible()) {
    await expect(enrolledBadge).toBeVisible()
    return
  }

  await enrollBtn.click()
  await expect(enrolledBadge).toBeVisible({ timeout: 10_000 })
})

test('enrolled user sees lesson list on course detail', async ({ page }) => {
  // Ensure enrolled
  await page.goto(`/courses/${courseSlug}`)
  const enrollBtn = page.getByRole('button', { name: /enroll now/i })
  if (await enrollBtn.isVisible()) {
    await enrollBtn.click()
    await page.getByText('✓ Enrolled').waitFor({ timeout: 10_000 })
  }

  await expect(page.getByText('E2E Test Lesson')).toBeVisible()
})

test('enrolled user can navigate to a lesson', async ({ page }) => {
  await page.goto(`/courses/${courseSlug}`)
  const enrollBtn = page.getByRole('button', { name: /enroll now/i })
  if (await enrollBtn.isVisible()) {
    await enrollBtn.click()
    await page.getByText('✓ Enrolled').waitFor({ timeout: 10_000 })
  }

  await page.getByRole('link', { name: 'E2E Test Lesson' }).click()
  await expect(page).toHaveURL(new RegExp(`/courses/${courseSlug}/lessons/${lessonSlug}`))
  await expect(page.getByRole('heading', { name: 'E2E Test Lesson' })).toBeVisible()
})
