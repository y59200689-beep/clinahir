import {Suspense} from 'react';import {renderToString} from 'react-dom/server';import {PublicRoot} from './App.jsx';import EnvironmentBanner from './components/EnvironmentBanner';
// Build-time public shell only. No credentials, remote requests, private routes or clinical data.
export function renderPublicShell(){return renderToString(<>{import.meta.env.VITE_APP_ENV==='staging'&&<EnvironmentBanner/>}<Suspense fallback={<div style={{padding:40}}>Loading Clinahir…</div>}><PublicRoot/></Suspense></>);}

import AdminApp from './admin/AdminApp';
export function renderAdminSessionShell(){return renderToString(<>{import.meta.env.VITE_APP_ENV==='staging'&&<EnvironmentBanner/>}<Suspense fallback={<div style={{padding:40}}>Opening Clinahir…</div>}><AdminApp/></Suspense></>);}
