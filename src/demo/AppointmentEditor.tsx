import { actingMember } from './profiles';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../components/Modal';
import { useDemo } from './DemoProvider';
import { services, type Appointment } from './appointments';
import { appointmentSchemaForDoctors, hasConflict, type AppointmentFields } from './scheduling';

const words = {
  en: { create: 'New Appointment', edit: 'Appointment details', close: 'Close', patient: 'Sample patient name', phone: 'Sample phone', date: 'Date', time: 'Time', service: 'Examination', doctor: 'Doctor', status: 'Status', save: 'Save appointment', invalid: 'Check this field. Use a valid date and a half-hour slot between 08:00 and 19:30.', conflict: 'This doctor already has an appointment within this 30-minute slot. Choose another time or doctor.', disclosure: 'Demo only. Use fictional details. Changes last until this page is reloaded.', cancel: 'Cancel appointment', statuses: ['Pending', 'Confirmed', 'Cancelled', 'Expired', 'No answer'] },
  fr: { create: 'Nouveau RDV', edit: 'Détails du rendez-vous', close: 'Fermer', patient: 'Nom fictif du patient', phone: 'Téléphone fictif', date: 'Date', time: 'Heure', service: 'Examen', doctor: 'Médecin', status: 'Statut', save: 'Enregistrer le rendez-vous', invalid: 'Vérifiez ce champ. Utilisez une date valide et un créneau de 30 minutes entre 08:00 et 19:30.', conflict: 'Ce médecin a déjà un rendez-vous dans ce créneau de 30 minutes. Choisissez une autre heure ou un autre médecin.', disclosure: 'Démonstration uniquement. Utilisez des données fictives. Les modifications disparaissent au rechargement.', cancel: 'Annuler le rendez-vous', statuses: ['En attente', 'Confirmé', 'Annulé', 'Expiré', 'Sans réponse'] },
};
const serviceFr: Record<string, string> = { MRI: 'IRM', Radiography: 'Radiographie', Ultrasound: 'Échographie', 'CT scan': 'Scanner', Mammography: 'Mammographie' };
const statuses = ['pending', 'confirmed', 'cancelled', 'expired', 'no-answer'] as const;

export default function AppointmentEditor({ language, appointment, onClose, onSaved }: { language: 'en' | 'fr'; appointment: Appointment | null; onClose: () => void; onSaved: (appointment: Appointment) => void }) {
  const t = words[language];
  const { appointments, setAppointments, doctors: profiles, patients, staff } = useDemo();
  const doctors = profiles.filter(profile => profile.active || profile.id === appointment?.doctorId).map(profile => `Dr. ${profile.name}`);
  const { register, handleSubmit, setError, setValue, watch, formState: { errors, isSubmitting } } = useForm<AppointmentFields>({ defaultValues: appointment ?? { patient: 'Demo Patient', phone: '0000000000', date: '2026-09-29', time: '08:00', doctor: doctors[0] ?? '', patientId: '', service: services[0], status: 'pending' } });
  const [patientSearch, setPatientSearch] = useState('');
  const selectedPatientId = watch('patientId');
  const visiblePatients = useMemo(() => { const list = patients.filter(profile => (profile.active || profile.id === appointment?.patientId) && (!patientSearch || [profile.name, profile.phone, profile.id].some(value => value.toLowerCase().includes(patientSearch.toLowerCase())))).slice(-50); const selected = patients.find(profile => profile.id === selectedPatientId); return selected && !list.some(profile => profile.id === selected.id) ? [selected, ...list] : list; }, [patients, patientSearch, selectedPatientId, appointment?.patientId]);
  function save(values: AppointmentFields) {
    const result = appointmentSchemaForDoctors(doctors).safeParse(values);
    if (!result.success) { for (const issue of result.error.issues) setError(issue.path[0] as keyof AppointmentFields, { message: t.invalid }); return; }
    if (hasConflict(appointments, result.data, appointment?.id)) { setError('root', { message: t.conflict }); return; }
    const selectedDoctor = profiles.find(profile => `Dr. ${profile.name}` === result.data.doctor);
    const selectedPatient = patients.find(profile => profile.id === result.data.patientId);
    if ((!selectedDoctor?.active || (selectedPatient && !selectedPatient.active)) && ['pending','confirmed'].includes(result.data.status) && result.data.date >= '2026-09-29') { setError('root', { message: language === 'fr' ? 'Restaurez ce profil avant de lui attribuer un rendez-vous actif.' : 'Restore this profile before assigning an active appointment.' }); return; }
    const actor = actingMember(staff);
    const now = new Date().toISOString();
    const next: Appointment = { ...appointment, ...result.data, doctorId: selectedDoctor?.id, id: appointment?.id ?? Math.max(0, ...appointments.map(item => item.id)) + 1, receivedAt: appointment?.receivedAt ?? now,
      ...(appointment && result.data.status !== appointment.status ? { firstActionAt: appointment.firstActionAt ?? now, handledBy: actor, confirmedBy: result.data.status === 'confirmed' ? actor : appointment.confirmedBy } : {}) };
    setAppointments(current => appointment ? current.map(item => item.id === appointment.id ? next : item) : [next, ...current]);
    onSaved(next); onClose();
  }
  const fieldClass = 'w-full rounded-lg border border-white/25 bg-[#243b34] px-3 py-2.5 text-sm text-white';
  return <Modal title={appointment ? t.edit : t.create} closeLabel={t.close} onClose={onClose}>
    <p className="mb-5 text-sm text-white/80">{t.disclosure}</p>
    <form noValidate onSubmit={handleSubmit(save)} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm">{language === 'fr' ? 'Rechercher un profil patient' : 'Find patient profile'}<input value={patientSearch} onChange={event=>setPatientSearch(event.target.value)} className={fieldClass}/></label>
      <label className="flex flex-col gap-1.5 text-sm">{language === 'fr' ? 'Profil patient' : 'Patient profile'}<select aria-label={language === 'fr' ? 'Profil patient' : 'Patient profile'} {...register('patientId')} onChange={event => { const profile = patients.find(item => item.id === event.target.value); setValue('patientId', event.target.value); if (profile) { setValue('patient', profile.name); setValue('phone', profile.phone); } }} className={fieldClass}><option value="">{language === 'fr' ? 'Nouveau patient fictif' : 'New fictional patient'}</option>{visiblePatients.map(profile => <option key={profile.id} value={profile.id}>{profile.name.slice(0,2).toUpperCase()}****** · {profile.id}</option>)}</select></label>
      {selectedPatientId && <p className="text-xs text-white/80">{language === 'fr' ? 'Les coordonnées liées se modifient dans la page Patients.' : 'Edit linked contact details on the Patients page.'}</p>}
      {(['patient', 'phone', 'date', 'time'] as const).map(name => <label key={name} className="flex flex-col gap-1.5 text-sm">{t[name]}<input readOnly={(name === 'patient' || name === 'phone') && Boolean(watch('patientId'))} {...register(name)} step={name === 'time' ? 1800 : undefined} type={name === 'date' || name === 'time' ? name : 'text'} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `appointment-${name}-error` : undefined} className={fieldClass} />{errors[name] && <span id={`appointment-${name}-error`} role="alert" className="text-rose-200 text-xs">{errors[name]?.message}</span>}</label>)}
      <label className="flex flex-col gap-1.5 text-sm">{t.service}<select aria-label={t.service} {...register('service')} className={fieldClass}>{services.map(service => <option key={service} value={service}>{language === 'fr' ? serviceFr[service] : service}</option>)}</select></label>
      <label className="flex flex-col gap-1.5 text-sm">{t.doctor}<select aria-label={t.doctor} {...register('doctor')} className={fieldClass}>{doctors.map((doctor, i) => <option key={doctor} value={doctor}>{profiles.find(profile => `Dr. ${profile.name}` === doctor)?.name.slice(0,2).toUpperCase()}***** · {String(i + 1).padStart(2, '0')}</option>)}</select></label>
      {appointment && <label className="flex flex-col gap-1.5 text-sm">{t.status}<select aria-label={t.status} {...register('status')} className={fieldClass}>{statuses.map((status, i) => <option key={status} value={status}>{t.statuses[i]}</option>)}</select></label>}
      {errors.root && <p role="alert" className="text-sm text-rose-200">{errors.root.message}</p>}
      <button disabled={isSubmitting} className="rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">{t.save}</button>
    </form>
  </Modal>;
}
