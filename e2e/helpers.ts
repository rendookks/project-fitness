import { expect, Page } from '@playwright/test';
export async function onboard(page: Page) {
  await page.goto('/');
  await expect(page.getByText('YOUR STARTING POINT · 1 / 3')).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Let’s build momentum', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Make today count.' })).toBeVisible();
}
export async function saveWorkout(page: Page, name: string, weight: string, reps: string, unit = 'kg') {
  await page.goto('/train');
  await page.getByRole('textbox', { name: 'Workout name', exact: true }).fill(name);
  await page.getByTestId('start-workout').click();
  await page.getByRole('button', { name: 'Add exercise', exact: true }).click();
  await page.getByRole('button', { name: 'Add Barbell Bench Press', exact: true }).click();
  await page.getByRole('button', { name: 'Add set · Barbell Bench Press', exact: true }).click();
  await page.getByRole('textbox', { name: `Weight (${unit})`, exact: true }).fill(weight);
  await page.getByRole('textbox', { name: 'Repetitions', exact: true }).fill(reps);
  await page.getByRole('button', { name: 'Not completed yet', exact: true }).click();
  await page.getByRole('button', { name: 'Save set', exact: true }).click();
  await page.getByRole('button', { name: 'Finish workout', exact: true }).click();
  await page.getByRole('button', { name: 'Save workout', exact: true }).click();
  await expect(page.getByText('SAVED SESSION', { exact: true })).toBeVisible();
}
