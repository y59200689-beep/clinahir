import { startAnalytics } from './analytics';
import React, {lazy, Suspense} from "react";
import {SiteContentProvider} from "./content/SiteContent";
const AdminApp=lazy(()=>import("./admin/AdminApp"));
const isAdmin=window.location.pathname.replace(/\/$/,"")==="/admin";
import { createRoot } from "react-dom/client";
const PublicApp=lazy(()=>import("./App.jsx").then(module=>({default:module.App})));
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAdmin ? <Suspense fallback={<div style={{padding:40}}>Opening Clinahir…</div>}><AdminApp/></Suspense> : <SiteContentProvider><Suspense fallback={<div style={{padding:40}}>Loading Clinahir…</div>}><PublicApp /></Suspense></SiteContentProvider>}
  </React.StrictMode>,
);

const stopAnalytics = isAdmin ? ()=>{} : startAnalytics();
if (import.meta.hot) import.meta.hot.dispose(stopAnalytics);
