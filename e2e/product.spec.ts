import { expect, test } from '@playwright/test';
import { onboard, saveWorkout } from './helpers';

test('analytics, unit stability, insights, information screens, and confirmed real reset', async ({page}) => {
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await onboard(page);
  await saveWorkout(page,'First strength','61.235','8');
  await expect(page.getByText('489.88 kg',{exact:true})).toBeVisible();
  await page.goto('/progress');
  await expect(page.getByText('61.24 kg',{exact:true})).toBeVisible();
  await expect(page.getByText('77.56 kg',{exact:true})).toBeVisible();
  await saveWorkout(page,'Second strength','65','5');
  await page.goto('/progress');
  await expect(page.getByText('65 kg',{exact:true})).toBeVisible();
  await expect(page.getByText('77.56 kg',{exact:true})).toBeVisible();
  await page.screenshot({path:'test-results/stage3-progress.png',fullPage:true});
  await page.getByText('Estimated 1RM · KG',{exact:true}).scrollIntoViewIfNeeded();
  await page.screenshot({path:'test-results/stage3-chart.png',fullPage:true});
  await page.goto('/settings');
  for(let i=0;i<3;i++){
    await page.getByRole('button',{name:'Pounds (lb)',exact:true}).click();
    await expect(page.getByText('Saving locally…')).toHaveCount(0);
    await page.getByRole('button',{name:'Kilograms (kg)',exact:true}).click();
    await expect(page.getByText('Saving locally…')).toHaveCount(0);
  }
  await page.reload();
  await page.goto('/progress');
  await expect(page.getByText('77.56 kg',{exact:true})).toBeVisible();
  await page.goto('/insights');
  await expect(page.getByRole('heading',{name:'Rule-based Insights',exact:true})).toBeVisible();
  await expect(page.getByText(/65 kg, previously 61.24 kg/)).toBeVisible();
  await expect(page.getByRole('textbox')).toHaveCount(0);
  for(const [route,title] of [['fuel','Fuel the work.'],['learn','Understand the why.'],['recovery','Room to rebuild.']]){
    await page.goto('/'+route);
    await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();
    await expect(page.getByText('INFORMATIONAL PREVIEW',{exact:true})).toBeVisible();
  }
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Open Settings',exact:true})).toBeVisible();
  await page.screenshot({path:'test-results/stage3-today.png',fullPage:true});
  await page.getByRole('button',{name:'Open Settings',exact:true}).click();
  await page.getByRole('button',{name:'Reset real database',exact:true}).click();
  await page.getByRole('button',{name:'Cancel',exact:true}).click();
  await page.goto('/history');
  await expect(page.getByRole('button',{name:'Review First strength',exact:true})).toBeVisible();
  await page.goto('/settings');
  await page.getByRole('button',{name:'Reset real database',exact:true}).click();
  await page.getByRole('button',{name:'Reset real data',exact:true}).click();
  await expect(page.getByText('YOUR STARTING POINT · 1 / 3')).toBeVisible();
  await page.reload();
  await expect(page.getByText('YOUR STARTING POINT · 1 / 3')).toBeVisible();
  expect(errors).toEqual([]);
});

test('small screens, enlarged text, and tab navigation',async({page})=>{
  await page.setViewportSize({width:320,height:720});
  await onboard(page);
  await page.getByRole('tab',{name:'Progress',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Proof of your effort.',exact:true})).toBeVisible();
  for(const label of ['Fuel','Learn','Today','Train']){
    await page.getByRole('tab',{name:label,exact:true}).click();
  }
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Make today count.',exact:true})).toBeVisible();
  await page.evaluate(()=>{
    const nodes=document.querySelectorAll<HTMLElement>('[dir="auto"]');
    nodes.forEach(node=>{const value=parseFloat(getComputedStyle(node).fontSize);node.style.fontSize=`${value*1.5}px`;node.style.lineHeight='1.5';});
  });
  await page.screenshot({path:'test-results/stage3-small-text.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
