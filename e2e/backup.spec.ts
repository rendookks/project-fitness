import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { onboard, saveWorkout } from './helpers';

test('download a real backup, preview and cancel restore, replace atomically, reject corrupt files',async({page})=>{
  test.setTimeout(120_000);
  await onboard(page);await saveWorkout(page,'Protected workout','61.235','8');
  await page.goto('/train');await page.getByRole('textbox',{name:'Workout name',exact:true}).fill('Protected active');await page.getByTestId('start-workout').click();
  await page.getByRole('button',{name:'Add exercise',exact:true}).click();await page.getByRole('textbox',{name:'Search exercises',exact:true}).fill('Barbell Bench');await page.getByRole('button',{name:'Add Barbell Bench Press',exact:true}).click();await page.getByRole('button',{name:'Add set · Barbell Bench Press',exact:true}).click();
  await page.getByRole('tab',{name:'Today',exact:true}).click();await page.getByRole('button',{name:'Open Settings',exact:true}).click();
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export real-data backup',exact:true}).click();
  const artifact=await download;const backup=await readFile((await artifact.path())!,'utf8');const payload=JSON.parse(backup);
  expect(payload.workouts).toHaveLength(2);expect(payload.source).toBe('real');expect(payload.workouts.find((w:{status:string})=>w.status==='completed').exercises[0].sets[0].weightGrams).toBe(61235);
  const choose=async(text:string)=>{const selected=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Choose backup to restore',exact:true}).click();await (await selected).setFiles({name:'fitness.json',mimeType:'application/json',buffer:Buffer.from(text)});};
  await page.getByRole('button',{name:'Back to Today',exact:true}).click();await page.getByRole('tab',{name:'Train',exact:true}).click();const activeWeight=page.getByRole('textbox',{name:'Weight (kg) set 1 of Barbell Bench Press',exact:true});await activeWeight.fill('80');await activeWeight.press('Tab');await expect(page.getByText('Saving locally…')).toHaveCount(0);await page.getByRole('tab',{name:'Today',exact:true}).click();await page.getByRole('button',{name:'Open Settings',exact:true}).click();
  await page.getByRole('button',{name:'Pounds (lb)',exact:true}).click();
  await choose(backup);await expect(page.getByText(/1 saved workouts, 1 active workout/)).toBeVisible();await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await expect(page.getByRole('button',{name:'Pounds (lb)',exact:true})).toHaveAttribute('aria-pressed','true');
  await choose('{corrupt');await expect(page.getByText(/file is not valid JSON/)).toBeVisible();
  await choose(backup);await page.getByRole('button',{name:'Replace real data',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Make today count.',exact:true})).toBeVisible();
  await page.getByRole('tab',{name:'Train',exact:true}).click();await expect(page.getByRole('heading',{name:'Protected active',exact:true})).toBeVisible();await expect(activeWeight).toHaveValue('61.24');
  await page.reload();await expect(activeWeight).toHaveValue('61.24');
  await page.goto('/history');await page.getByRole('button',{name:'Review Protected workout',exact:true}).click();await expect(page.getByText('489.88 kg',{exact:true})).toBeVisible();
  await page.goto('/settings');await page.getByRole('button',{name:'Enable demo mode',exact:true}).click();await expect(page.getByText('DEMO MODE · Fictional training records',{exact:true})).toBeVisible();
  await page.goto('/settings');await expect(page.getByRole('button',{name:'Export real-data backup',exact:true})).toHaveCount(0);await expect(page.getByText('Return to real data to back up or restore. Fictional demo records are excluded.')).toBeVisible();
});
