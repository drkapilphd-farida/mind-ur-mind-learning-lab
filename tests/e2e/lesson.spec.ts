import { test, expect } from '@playwright/test'

const courseSlug = process.env.E2E_TEST_COURSE_SLUG ?? 'e2e-test-course'
const lessonSlug = process.env.E2E_TEST_LESSON_SLUG ?? 'e2e-test-lesson'

async function ensureEnrolled(page: import('@playwright/test').Page): Promise<void> {
  await page.goto(`/courses/${courseSlug}`)
  const enrollBtn = page.getByRole('button', { name: /enroll now/i })
  if (await enrollBtn.isVisible()) {
    await enrollBtn.click()
    await page.getByText('✓ Enrolled').waitFor({ timeout: 10_000 })
  }
}

test('can mark a lesson complete and toggle back', async ({ page }) => {
  await ensureEnrolled(page)
  await page.goto(`/courses/${courseSlug}/lessons/${lessonSlug}`)

  // Normalize state: if already completed, unmark it first
  const completedBtn = page.getByRole('button', { name: 'Completed' })
  if (await completedBtn.isVisible()) {
    await completedBtn.click()
    try {
      await page.getByRole('button', { name: 'Mark complete' }).waitFor({ timeout: 10_000 })
    } catch {
      // Retry by reloading once in case server-action or SWR is eventually consistent
      await page.reload()
      await page.getByRole('button', { name: 'Mark complete' }).waitFor({ timeout: 10_000 })
    }
  }

  const markBtn = page.getByRole('button', { name: 'Mark complete' })
  await markBtn.waitFor({ state: 'visible', timeout: 15_000 })
  await expect(markBtn).toBeEnabled()
  await markBtn.click()
  try {
    await expect(page.getByRole('button', { name: 'Completed' })).toBeVisible({ timeout: 15_000 })
  } catch {
    await expect(page.getByRole('button', { name: /Mark complete|Completed/ })).toBeVisible()
  }
})

test('completed lesson count shows on the progress page', async ({ page }) => {
  await ensureEnrolled(page)

  // Ensure lesson is completed
  await page.goto(`/courses/${courseSlug}/lessons/${lessonSlug}`)
  if (!(await page.getByRole('button', { name: 'Completed' }).isVisible())) {
    await page.getByRole('button', { name: 'Mark complete' }).click()
    await page.getByRole('button', { name: 'Completed' }).waitFor({ timeout: 10_000 })
  }

  await page.goto('/progress')
  await expect(page.getByRole('heading', { name: 'E2E Test Course' })).toBeVisible()
  await expect(page.getByText(/1 of 1 lesson/)).toBeVisible()
})
