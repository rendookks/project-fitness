import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

test('capture iPhone-sized browser views with explicitly fictional demo records',async({page})=>{
  test.setTimeout(120_000);
  await onboard(page);
  await page.screenshot({path:'docs/screenshots/v2-empty-today-web.png'});
  await page.goto('/progress');await expect(page.getByText('A baseline comes first',{exact:true})).toBeVisible();await page.screenshot({path:'docs/screenshots/v2-empty-progress-web.png'});
  await page.goto('/settings');await page.getByRole('button',{name:'Enable demo mode',exact:true}).click();
  await expect(page.getByText('DEMO MODE · Fictional training records',{exact:true})).toBeVisible();
  await page.goto('/train');await page.getByRole('button',{name:'Create routine',exact:true}).click();
  await page.getByRole('textbox',{name:'Routine name',exact:true}).fill('Push Day');
  await page.getByRole('button',{name:'Add routine exercise',exact:true}).click();await page.getByRole('textbox',{name:'Search exercises',exact:true}).fill('Barbell Bench');
  await page.getByRole('button',{name:'Add Barbell Bench Press',exact:true}).click();
  await page.screenshot({path:'docs/screenshots/v2-routine-web.png'});
  await page.getByRole('button',{name:'Save routine',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Edit routine',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Start routine · Push Day',exact:true})).toBeEnabled();await page.getByRole('heading',{name:'Ready to train.',exact:true}).scrollIntoViewIfNeeded();
  await page.screenshot({path:'docs/screenshots/v2-train-web.png'});
  await page.goto('/');await expect(page.getByRole('button',{name:'Start routine · Push Day',exact:true})).toBeVisible();await page.screenshot({path:'docs/screenshots/v2-today-web.png'});
  await page.goto('/progress');await expect(page.getByRole('heading',{name:'Proof of your effort.',exact:true})).toBeVisible();
  await page.screenshot({path:'docs/screenshots/v2-progress-web.png'});
  await page.getByText('Estimated 1RM · KG',{exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'docs/screenshots/v2-progress-chart-web.png'});
  await page.goto('/coach');await expect(page.getByRole('heading',{name:'Your next small step.',exact:true})).toBeVisible();await page.screenshot({path:'docs/screenshots/v2-coach-web.png'});
  await page.goto('/train');await page.getByRole('button',{name:'Start routine · Push Day',exact:true}).click();
  await page.getByRole('checkbox',{name:'Complete set 1 of Barbell Bench Press',exact:true}).click();await expect(page.getByRole('checkbox',{name:'Complete set 1 of Barbell Bench Press',exact:true})).toBeChecked();
  await page.screenshot({path:'docs/screenshots/v2-active-workout-web.png'});
  await page.getByRole('button',{name:'Add exercise',exact:true}).click();await page.screenshot({path:'docs/screenshots/v2-exercise-library-web.png'});
});
