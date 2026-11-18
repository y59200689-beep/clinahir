import { startMonitoring } from './monitoring';
import AppErrorBoundary from './components/AppErrorBoundary';
import { startAnalytics } from './analytics';
import React, {lazy, Suspense} from "react";
const AdminApp=lazy(()=>import("./admin/AdminApp"));
const isAdmin=/^\/admin(?:\/|\.html$|$)/.test(window.location.pathname);
import { createRoot, hydrateRoot } from "react-dom/client";
const PublicApp=lazy(()=>import("./App.jsx").then(module=>({default:module.PublicRoot})));
import "./styles.css";
import EnvironmentBanner from "./components/EnvironmentBanner";

const tree = <React.StrictMode><AppErrorBoundary>
  {import.meta.env.VITE_APP_ENV === "staging" && <EnvironmentBanner />}
  {isAdmin ? <Suspense fallback={<div style={{padding:40}}>Opening Clinahir…</div>}><AdminApp/></Suspense> : <Suspense fallback={<div style={{padding:40}}>Loading Clinahir…</div>}><PublicApp /></Suspense>}
</AppErrorBoundary></React.StrictMode>;
const root = document.getElementById("root");
if (root.dataset.prerendered === (isAdmin?'admin':'public')) hydrateRoot(root, tree);
else createRoot(root).render(tree);

const stopAnalytics = isAdmin ? ()=>{} : startAnalytics();
if (import.meta.hot) import.meta.hot.dispose(stopAnalytics);

void startMonitoring().catch(() => { /* Telemetry must never prevent application use. */ });
