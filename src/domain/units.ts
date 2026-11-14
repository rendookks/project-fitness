import { WeightUnit } from './models';
export const GRAMS_PER_POUND = 453.59237;
export const MAX_WEIGHT_GRAMS = 2_000_000;
export function toGrams(weight: number, unit: WeightUnit): number {
  if (!Number.isFinite(weight) || weight < 0) throw new Error('Enter a nonnegative weight.');
  const grams = Math.round(weight * (unit === 'kg' ? 1000 : GRAMS_PER_POUND));
  if (grams > MAX_WEIGHT_GRAMS) throw new Error('Weight must be at most 2,000 kg (4,409.24 lb).');
  return grams;
}
export function fromGrams(grams: number, unit: WeightUnit): number {
  return grams / (unit === 'kg' ? 1000 : GRAMS_PER_POUND);
}
/** Display precision never becomes a canonical value unless the user explicitly edits weight. */
export function formatWeight(grams: number, unit: WeightUnit): string {
  return Number(fromGrams(grams, unit).toFixed(2)).toLocaleString(undefined, { maximumFractionDigits: 2 });
}
export function editableWeight(grams: number, unit: WeightUnit): string {
  return String(Number(fromGrams(grams, unit).toFixed(2)));
}
export function parseWeight(text: string, unit: WeightUnit): number {
  const value = text.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(value)) throw new Error('Enter weight as a number, such as 20 or 20.5.');
  return toGrams(Number(value), unit);
}
export function parseReps(text: string): number {
  if (!/^\d+$/.test(text.trim())) throw new Error('Repetitions must be a whole number.');
  const reps = Number(text);
  if (!Number.isInteger(reps) || reps < 1 || reps > 999) throw new Error('Enter 1–999 repetitions.');
  return reps;
}
