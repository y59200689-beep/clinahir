import ProfileDirectory from './demo/ProfileDirectory';
import type { AppointmentDay } from './demo/appointments';
export default function DoctorsPage({language}:{language:'en'|'fr';appointmentDays:AppointmentDay[]}) { return <ProfileDirectory kind="doctor" language={language}/>; }
