import { z } from 'zod';
import { doctors, services, type Appointment } from './appointments.js';

export const appointmentSchema = z.object({
  patientId: z.string().optional(),
  patient: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[+()\d\s.-]{8,40}$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
    const parsed = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }),
  time: z.string().regex(/^(?:0\d|1\d|2[0-3]):(?:00|30)$/).refine(value => value >= '08:00' && value <= '19:30'),
  service: z.string().refine(value => services.includes(value)),
  doctor: z.string().refine(value => doctors.includes(value)),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'expired', 'no-answer']),
});
export function appointmentSchemaForDoctors(names: string[]) { return appointmentSchema.extend({ doctor: z.string().refine(value => names.includes(value)) }); }
export type AppointmentFields = z.infer<typeof appointmentSchema>;

export { hasConflict } from './conflicts.js';
