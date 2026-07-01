import { test, expect } from '@playwright/test'

const courseSlug = process.env.E2E_TEST_COURSE_SLUG ?? 'e2e-test-course'
const lessonSlug = process.env.E2E_TEST_LESSON_SLUG ?? 'e2e-test-lesson'

test.describe('certificate flow', () => {
  test.describe.configure({ mode: 'serial' })

  let certUrl = ''

  test('completing all lessons enables certificate claim', async ({ page }) => {
    // Ensure enrolled
    await page.goto(`/courses/${courseSlug}`)
    const enrollBtn = page.getByRole('button', { name: /enroll now/i })
    if (await enrollBtn.isVisible()) {
      await enrollBtn.click()
      await page.getByText('✓ Enrolled').waitFor({ timeout: 10_000 })
    }

    let claimBtn = page.getByRole('button', { name: /Claim your certificate/i })
    let viewCertLink = page.getByRole('link', { name: /View your certificate/i })

    if (!(await claimBtn.isVisible()) && !(await viewCertLink.isVisible())) {
      // Complete the lesson only when the course has not yet exposed a certificate action.
      await page.goto(`/courses/${courseSlug}/lessons/${lessonSlug}`)

      const completedBtn = page.getByRole('button', { name: /Completed/i })
      if (await completedBtn.isVisible()) {
        await completedBtn.click()
        await page.waitForLoadState('networkidle')
        await page.reload()
      }

      const markBtn = page.getByRole('button', { name: /Mark complete/i })
      await markBtn.waitFor({ state: 'visible', timeout: 20_000 })
      await expect(markBtn).toBeEnabled()
      await markBtn.click()
      await page.getByRole('button', { name: /Completed/i }).waitFor({ timeout: 20_000 })

      await page.goto(`/courses/${courseSlug}`)
      claimBtn = page.getByRole('button', { name: /Claim your certificate/i })
      viewCertLink = page.getByRole('link', { name: /View your certificate/i })
    }

    if (await claimBtn.isVisible()) {
      await claimBtn.click()
      try {
        await Promise.any([
          page.waitForURL('**/certificates/**', { timeout: 20_000 }),
          page.getByRole('heading', { name: 'Certificate of Completion' }).waitFor({ timeout: 20_000 }),
        ])
      } catch {
        await page.waitForTimeout(1000)
        if (await viewCertLink.isVisible()) {
          await viewCertLink.click()
          await page.waitForURL('**/certificates/**', { timeout: 20_000 })
        } else {
          await page.reload()
          if (await viewCertLink.isVisible()) {
            await viewCertLink.click()
            await page.waitForURL('**/certificates/**', { timeout: 20_000 })
          } else {
            throw new Error('Claim button click did not navigate and no view link appeared')
          }
        }
      }
    } else if (await viewCertLink.isVisible()) {
      await viewCertLink.click()
      await page.waitForURL('**/certificates/**', { timeout: 20_000 })
    } else {
      throw new Error('Expected certificate claim or view link to be available')
    }

    certUrl = page.url()

    await expect(page.getByRole('heading', { name: 'Certificate of Completion' })).toBeVisible()
    await expect(page.locator('main').locator('p', { hasText: 'E2E Test Course' })).toBeVisible()
  })

  test('certificate page is publicly accessible without login', async ({ page }) => {
    test.skip(!certUrl, 'certificate URL not captured — skipping public-access test')

    await page.context().clearCookies()
    await page.goto(certUrl)

    await expect(page.getByRole('heading', { name: 'Certificate of Completion' })).toBeVisible()
    await expect(page.locator('main').locator('p', { hasText: 'E2E Test Course' })).toBeVisible()
  })
})
