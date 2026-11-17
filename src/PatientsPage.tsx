import ProfileDirectory from './demo/ProfileDirectory';
import type { AppointmentDay } from './demo/appointments';
export default function PatientsPage({language}:{language:'en'|'fr';appointmentDays:AppointmentDay[]}) { return <ProfileDirectory kind="patient" language={language}/>; }
