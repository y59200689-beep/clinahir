import { lazy, Suspense, type ComponentProps } from 'react';
import type AppointmentEditorType from './AppointmentEditor';
const Editor = lazy(() => import('./AppointmentEditor'));
export default function LazyAppointmentEditor(props: ComponentProps<typeof AppointmentEditorType>) {
  return <Suspense fallback={<p role="status">{props.language === 'fr' ? 'Ouverture du rendez-vous…' : 'Opening appointment…'}</p>}><Editor {...props} /></Suspense>;
}
