import { FollowUpQueue } from '../components/FollowUpQueue';
import { DeleteRecordButton, type RecordTarget } from '../components/DeleteRecordDialog';
import { useState } from 'react';
import { useAdminLocale } from '../i18n';
import { Users, MessageCircle, ShieldCheck, CheckCircle2, ArrowUpRight, ArrowRight, Activity, Clock, MapPin, BarChart3, CalendarDays, Inbox } from 'lucide-react';
import { StatusPill } from '../components/StatusPill';
import type { Snapshot, Lead } from '../types';
import type { AdminPage } from '../components/AdminShell';
import '../overview.css';
interface OverviewPageProps {
  onDelete: (record: RecordTarget) => void;
  data: Snapshot;
  onNavigate: (page: AdminPage) => void;
  onSelectFollowUp: (lead: Lead) => void;
  onSelectLead: (lead: Lead) => void;
  onFilterStage: (stage: string) => void;
}
export function OverviewPage({ data, onNavigate, onSelectFollowUp, onSelectLead, onFilterStage, onDelete }: OverviewPageProps) {
  const { t, intlLocale } = useAdminLocale();
  const [range, setRange] = useState<7 | 14 | 30>(7);
  const number = (value: number) => new Intl.NumberFormat(intlLocale).format(value);
  const date = (value: string) => new Date(value).toLocaleDateString(intlLocale, { day: 'numeric', month: 'short' });
  const days = data.analytics.slice(-range);
  const total = days.reduce((sum, row) => sum + (Number(row.demo_submissions) || 0), 0);
  const peak = Math.max(1, ...days.map(row => Number(row.demo_submissions) || 0));
  const metrics = [
    { title:'New Inquiries', value:data.summary.new, subtitle:'Awaiting initial response', icon:MessageCircle, action:()=>onFilterStage('new') },
    { title:'Captured Leads', value:data.summary.total, subtitle:'Inbound website requests', icon:Users, action:()=>onNavigate('Leads') },
    { title:'Qualified Centers', value:data.summary.qualified, subtitle:'Business qualification completed', icon:ShieldCheck, action:()=>onFilterStage('qualified') },
    { title:'Clinics Won', value:data.summary.won, subtitle:'Onboarded partners', icon:CheckCircle2, action:()=>onFilterStage('won') },
  ];
  return <section data-i18n-managed className="overview-page">
    <header className="overview-heading"><div><h1>{t('Overview')}</h1><p>{t('Your inquiries, pipeline, and business operations at a glance.')}</p></div><div className="overview-heading-actions"><span><CalendarDays size={14} aria-hidden="true" />{new Date().toLocaleDateString(intlLocale,{day:'numeric',month:'short',year:'numeric'})}</span><button type="button" className="overview-button overview-primary" onClick={()=>onNavigate('Maps')}><MapPin size={15} aria-hidden="true" />{t('Find prospects')}</button></div></header>
    <div className="overview-metrics" aria-label={t('Pipeline summary')}>{metrics.map((metric,index)=>{const Icon=metric.icon;return <button type="button" key={metric.title} onClick={metric.action} className={`overview-metric ${index===0?'overview-metric-primary':''}`}><span className="overview-metric-label"><Icon size={16} aria-hidden="true" />{t(metric.title)}<ArrowUpRight size={15} aria-hidden="true" /></span><strong>{number(metric.value)}</strong><span className="overview-metric-caption">{t(metric.subtitle)}</span></button>;})}</div>
    {data.summary.new>0 && <div className="overview-followup"><span className="overview-followup-icon"><Inbox size={19} aria-hidden="true" /></span><div><strong>{t(data.summary.new===1?'1 inquiry needs your attention':'{{count}} inquiries need your attention',{count:number(data.summary.new)})}</strong><p>{t('Review new requests and keep your pipeline moving.')}</p></div><button type="button" className="overview-text-button" onClick={()=>onFilterStage('new')}>{t('Review leads')}<ArrowRight size={15} aria-hidden="true" /></button></div>}
    <FollowUpQueue onOpen={onSelectFollowUp} onBrowse={() => onNavigate('Leads')} />
    <div className="overview-main-grid">
      <section className="overview-panel overview-inquiries" aria-label={t('Recent Inquiries')}>
        <header className="overview-panel-heading"><div><h2>{t('Recent Inquiries')}<span className="overview-count">{number(Math.min(5,data.leads.length))}</span></h2><p>{t('Latest submissions from the website')}</p></div><button type="button" className="overview-text-button" onClick={()=>onNavigate('Leads')}>{t('View all')}<ArrowRight size={14} aria-hidden="true" /></button></header>
        {data.leads.length ? <div className="overview-table-scroll" role="region" tabIndex={0} aria-label={t('Recent Inquiries')}><table className="overview-table"><thead><tr>{['Clinic','Stage','Received'].map(label=><th scope="col" key={label}>{t(label)}</th>)}<th scope="col" className="sr-only">{t("Action")}</th></tr></thead><tbody>{data.leads.slice(0,5).map(lead=><tr key={lead.external_id}><td><div className="overview-lead"><span className="overview-lead-avatar" aria-hidden="true">{lead.company_name.slice(0,2).toUpperCase()}</span><div><button type="button" onClick={()=>onSelectLead(lead)}>{lead.company_name}</button><span>{lead.city || '—'}<span aria-hidden="true"> · </span>{lead.utm_source || t('Direct')}</span></div></div></td><td><StatusPill value={lead.admin_stage} /></td><td><time dateTime={lead.submitted_at}>{date(lead.submitted_at)}</time><span className="overview-subtext">{new Date(lead.submitted_at).toLocaleTimeString(intlLocale,{hour:'2-digit',minute:'2-digit'})}</span></td><td><DeleteRecordButton onDelete={onDelete}
          record={{ kind: 'lead', id: lead.external_id, name: lead.company_name, detail: lead.phone || lead.email || lead.city }} /></td></tr>)}</tbody></table></div> : <div className="overview-empty"><span className="overview-empty-icon"><Inbox size={24} aria-hidden="true" /></span><h3>{t('No inquiries recorded yet')}</h3><p>{t('Website submissions will appear here automatically.')}</p><button type="button" className="overview-text-button" onClick={()=>onNavigate('Maps')}>{t('Find prospects on Google Maps')}<ArrowRight size={14} aria-hidden="true" /></button></div>}
      </section>
      <section className="overview-panel overview-trend" aria-label={t('Conversion Trend')}>
        <header className="overview-panel-heading"><div><h2>{t('Conversion Trend')}</h2><p>{t('Demo submissions by day')}</p></div><button type="button" className="overview-icon-button" onClick={()=>onNavigate('Analytics')} aria-label={t('View analytics')}><ArrowUpRight size={18} aria-hidden="true" /></button></header>
        <div className="overview-trend-toolbar"><div className="overview-chart-total"><strong>{number(total)}</strong><span>{t(total===1?'request':'requests')}</span></div><div className="overview-range" role="group" aria-label={t('Chart period')}>{([7,14,30] as const).map(value=><button key={value} type="button" aria-pressed={range===value} onClick={()=>setRange(value)}>{t(value===7?'7 Days':value===14?'14 Days':'30 Days')}</button>)}</div></div>
        {total>0 ? <div className="overview-chart"><div className="overview-plot" aria-label={t('Demo submissions by day')}>{days.map((row,index)=>{const value=Number(row.demo_submissions)||0;return <div key={row.day} className="overview-chart-column" role="img" aria-label={`${date(row.day)}: ${number(value)} ${t(value===1?'request':'requests')}`} title={`${date(row.day)}: ${number(value)}`} tabIndex={0}><div style={{height:`${value/peak*100}%`}} className={value===peak?'overview-bar overview-bar-peak':'overview-bar'} />{(days.length<=7 || index===0 || index===days.length-1)&&<span>{new Date(`${row.day}T12:00:00`).toLocaleDateString(intlLocale,{day:'numeric'})}</span>}</div>;})}</div><div className="overview-chart-dates"><span>{date(days[0].day)}</span><span>{date(days.at(-1)!.day)}</span></div></div> : <div className="overview-chart-empty"><BarChart3 size={25} aria-hidden="true" /><h3>{t('No submissions in this period')}</h3><p>{t('Recorded website inquiries will appear here.')}</p></div>}
        <footer className="overview-chart-footer"><span aria-hidden="true" />{t('Recorded website submissions')}</footer>
      </section>
    </div>
    <section className="overview-panel overview-operations" aria-label={t('Deliveries & Outbox')}>
      <header className="overview-panel-heading"><div><h2>{t('Deliveries & Outbox')}</h2><p>{t('Configuration and the latest scheduler signal')}</p></div><button type="button" className="overview-text-button" onClick={()=>onNavigate('Deliveries')}>{t('Manage')}<ArrowRight size={14} aria-hidden="true" /></button></header>
      <div className="overview-services">
        <div className="overview-service"><span className="overview-service-icon"><Activity size={18} aria-hidden="true" /></span><div><h3>{t('Daily Command CRM')}</h3><p>{t('Website lead synchronization')}</p></div><StatusPill value={data.integrations.dailyCommand?'configured':'needs setup'} /></div>
        <div className="overview-service"><span className="overview-service-icon"><MessageCircle size={18} aria-hidden="true" /></span><div><h3>{t('WhatsApp Dispatch')}</h3><p>{t('Automated demo messages')}</p></div><StatusPill value={data.integrations.whatsappConfigured?(data.integrations.whatsappEnabled?'configured':'disabled'):'needs setup'} /></div>
        <div className="overview-service"><span className="overview-service-icon"><Clock size={18} aria-hidden="true" /></span><div><h3>{t('Cron Scheduler')}</h3><p>{data.heartbeat?t('Last signal: {{date}}',{date:date(data.heartbeat)}):t('No scheduler signal recorded')}</p></div><StatusPill value={data.heartbeat?'recorded':'pending'} /></div>
      </div>
    </section>
  </section>;
}
