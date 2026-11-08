export interface Fan {
  id: string; name: string; rpm: number | null; dutyPercent: number | null;
  readOnly?: boolean; rpmUnavailable?: boolean; deviceName?: string | null;
}
export interface TemperatureSource { id:string;name:string;category?:string;value:number|null }
export function temperatureValue(source?:TemperatureSource):number|null {
  return source&&finite(source.value)?source.value:null;
}
export const finite = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
export function flow(rpm: unknown, factor: unknown, unit: string): number | null {
  if (!finite(rpm) || rpm < 0 || !finite(factor) || factor <= 0) return null;
  return rpm / factor * (unit === 'l/min' ? 1 : 60);
}
export function pumpPercent(fan?: Fan): number | null {
  if (!fan || fan.readOnly || !finite(fan.dutyPercent) || fan.dutyPercent < 0 || fan.dutyPercent > 100) return null;
  return fan.dutyPercent;
}
export function rpmValue(fan?: Fan): number | null {
  return fan && !fan.rpmUnavailable && finite(fan.rpm) && fan.rpm >= 0 ? fan.rpm : null;
}
export function numberDE(value: number | null, decimals = 0): string {
  return value === null ? '—' : value.toFixed(decimals).replace('.', ',');
}
