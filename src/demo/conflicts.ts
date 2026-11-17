import type { Appointment } from './appointments.js';
// Demo assumes a 30-minute slot per doctor; real equipment/duration rules are future work.
export function hasConflict(records: Appointment[], input: Pick<Appointment, 'date' | 'time' | 'doctor' | 'status'>, excludeId?: number) {
  if (!['pending', 'confirmed'].includes(input.status)) return false;
  const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  return records.some(item => item.id !== excludeId && item.date === input.date && item.doctor === input.doctor
    && ['pending', 'confirmed'].includes(item.status) && Math.abs(minutes(item.time) - minutes(input.time)) < 30);
}
