import { expect, test } from '@playwright/test';
import { onboard } from './helpers';

test('two comparable routine sessions produce an explained optional target that stays editable',async({page})=>{
  await onboard(page);await page.goto('/train');
  await page.getByRole('button',{name:'Create routine',exact:true}).click();
  await page.getByRole('textbox',{name:'Routine name',exact:true}).fill('Push');
  await page.getByRole('button',{name:'Add routine exercise',exact:true}).click();
  await page.getByRole('textbox',{name:'Search exercises',exact:true}).fill('Barbell Bench');
  await page.getByRole('button',{name:'Add Barbell Bench Press',exact:true}).click();
  await page.getByRole('button',{name:'Remove planned set 3 exercise 1',exact:true}).click();
  for(const index of [1,2])await page.getByRole('textbox',{name:`Planned kg exercise 1 set ${index}`,exact:true}).fill('60');
  await page.getByRole('button',{name:'Save routine',exact:true}).click();
  for(let session=0;session<2;session++){
    await page.getByRole('button',{name:'Start routine · Push',exact:true}).click();
    for(const index of [1,2]){const checkbox=page.getByRole('checkbox',{name:`Complete set ${index} of Barbell Bench Press`,exact:true});await checkbox.click();await expect(checkbox).toBeChecked();}
    await page.getByRole('button',{name:'Finish workout',exact:true}).click();await page.getByRole('button',{name:'Save workout',exact:true}).click();
    await expect(page.getByText('SAVED SESSION',{exact:true})).toBeVisible();await page.goto('/train');
  }
  await page.goto('/insights');await expect(page.getByText('NEXT TARGET · 61 kg × 8',{exact:true})).toBeVisible();
  await expect(page.getByText(/Both latest sessions: 2 working sets/)).toBeVisible();
  await page.goto('/train');await page.getByRole('button',{name:'Start routine · Push',exact:true}).click();
  await page.getByRole('button',{name:'Use target for first set',exact:true}).click();
  const weight=page.getByRole('textbox',{name:'Weight (kg) set 1 of Barbell Bench Press',exact:true});await expect(weight).toHaveValue('61');
  await expect(page.getByRole('checkbox',{name:'Complete set 1 of Barbell Bench Press',exact:true})).not.toBeChecked();
  await weight.fill('62');await weight.press('Tab');await expect(page.getByText('Saving locally…')).toHaveCount(0);
  await page.reload();await expect(weight).toHaveValue('62');
});
