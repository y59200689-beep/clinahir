import AnimatedMetricValue from './AnimatedMetricValue';
import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Clock3, ExternalLink, Eye, EyeOff, FileText, Pin, RotateCw, X } from 'lucide-react';

type Post = { id: number; topic: string; title: string; excerpt: string; date: string; status: 'published' | 'draft'; hidden: boolean };
const topics = [
  ['Prévention', 'Les gestes simples pour préserver votre santé au quotidien', 'Découvrez des habitudes accessibles pour prendre soin de vous chaque jour.'],
  ['Bien-être', 'Sommeil et récupération : comprendre les signes de fatigue', 'Un sommeil régulier contribue à votre équilibre physique et mental.'],
  ['Nutrition', 'Comment composer une assiette équilibrée sans complication', 'Quelques repères pratiques pour varier les aliments et les portions.'],
  ['Santé familiale', 'Préparer la rentrée santé de toute la famille', 'Les points utiles à vérifier avant une nouvelle saison chargée.'],
  ['Conseils médicaux', 'Quand demander un avis médical pour une douleur persistante', 'Apprenez à reconnaître les situations qui méritent une consultation.'],
  ['Mode de vie', 'Bouger davantage pendant une journée de travail', 'De courtes pauses actives peuvent changer votre routine.'],
  ['Dépistage', 'Pourquoi les bilans de santé réguliers comptent', 'Le suivi préventif aide à mieux connaître son état de santé.'],
  ['Hydratation', 'Hydratation : adopter les bons réflexes toute l’année', 'Des conseils concrets pour rester attentif à vos besoins en eau.'],
  ['Santé mentale', 'Mieux gérer le stress dans les périodes intenses', 'Des pistes simples pour retrouver du calme au fil de la journée.'],
  ['Vie active', 'Reprendre une activité physique à son rythme', 'Une progression douce aide à construire une pratique durable.'],
] as const;
const initialPosts: Post[] = Array.from({ length: 24 }, (_, index) => {
  const topic = topics[(index * 7) % topics.length];
  const day = 1 + ((index * 11 + 7) % 28);
  const month = 1 + ((index * 5 + 2) % 9);
  return { id: index + 1, topic: topic[0], title: topic[1], excerpt: topic[2], date: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, status: index < 21 ? 'published' : 'draft', hidden: false };
});
const copy = {
  en: { title: 'Posts & Articles', total: 'Total articles', published: 'Published online', drafts: 'Drafts / Scheduled', site: 'Site articles', new: 'New articles', refresh: 'Refresh', statusPublished: 'Published', statusDraft: 'Draft', hide: 'Hide article', show: 'Show article', schedule: 'Move to drafts', publish: 'Publish article', preview: 'Preview article', close: 'Close', empty: 'No articles here yet.' },
  fr: { title: 'Publications et articles', total: 'Articles au total', published: 'Publiés (en ligne)', drafts: 'Brouillons / Programmés', site: 'Articles du site', new: 'Nouveaux articles', refresh: 'Actualiser', statusPublished: 'Publié', statusDraft: 'Brouillon', hide: 'Masquer l’article', show: 'Afficher l’article', schedule: 'Mettre en brouillon', publish: 'Publier l’article', preview: 'Voir l’article', close: 'Fermer', empty: 'Aucun article pour le moment.' },
};

export default function PostsPage({ language }: { language: 'en' | 'fr' }) {
  const t = copy[language];
  const [posts, setPosts] = useState(initialPosts);
  const [tab, setTab] = useState<'site' | 'new'>('site');
  const [preview, setPreview] = useState<Post | null>(null);
  const published = posts.filter((post) => post.status === 'published').length;
  const drafts = posts.length - published;
  const visible = useMemo(() => posts.filter((post) => tab === 'site' ? post.status === 'published' : post.status === 'draft'), [posts, tab]);
  const dateFormat = new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  const update = (id: number, change: Partial<Post>) => setPosts((current) => current.map((post) => post.id === id ? { ...post, ...change } : post));
  const summary = [
    { value: posts.length, label: t.total, icon: FileText, tone: 'text-cyan-200', surface: 'bg-cyan-400/10' },
    { value: published, label: t.published, icon: CheckCircle2, tone: 'text-emerald-200', surface: 'bg-emerald-400/10' },
    { value: drafts, label: t.drafts, icon: Clock3, tone: 'text-amber-200', surface: 'bg-amber-400/10' },
  ];

  return <div className="min-w-0 space-y-5 text-left text-white/90">
    <h1 className="text-2xl font-bold">{t.title}</h1>
    <div className="grid gap-4 sm:grid-cols-3">{summary.map((card) => <div key={card.label} className="flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/5 backdrop-blur-xl"><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${card.surface} ${card.tone}`}><card.icon size={27} /></span><div className="min-w-0"><p className="text-3xl font-bold leading-none"><AnimatedMetricValue value={card.value} /></p><p className="mt-2 text-xs font-medium text-white/60">{card.label}</p></div></div>)}</div>
    <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">{([{ key: 'site', label: t.site, count: published, icon: Pin }, { key: 'new', label: t.new, count: drafts, icon: FileText }] as const).map((item) => <button key={item.key} type="button" onClick={() => setTab(item.key)} aria-pressed={tab === item.key} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${tab === item.key ? 'border-cyan-300/30 bg-cyan-400/20 text-white' : 'border-white/10 bg-white/5 text-white/55 hover:bg-white/10 hover:text-white'}`}><item.icon size={17} />{item.label}<span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{item.count}</span></button>)}</div>
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2"><h2 className="font-semibold">{tab === 'site' ? t.site : t.new} · {published} {t.statusPublished.toLocaleLowerCase()}, {drafts} {t.statusDraft.toLocaleLowerCase()}</h2><button type="button" onClick={() => setPosts(initialPosts)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-white/75 hover:bg-white/10"><RotateCw size={16} />{t.refresh}</button></div>
    <div className="space-y-3">{visible.map((post, index) => <article key={post.id} className={`flex min-w-0 flex-wrap items-center gap-4 rounded-2xl border border-white/10 border-l-[3px] ${post.status === 'published' ? 'border-l-emerald-400' : 'border-l-amber-400'} ${post.hidden ? 'opacity-50' : ''} bg-white/5 p-4 shadow-lg shadow-black/5 backdrop-blur-xl sm:flex-nowrap`}>
      <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${['from-cyan-300/25 via-teal-300/10 to-emerald-400/20','from-amber-300/25 via-rose-300/10 to-cyan-400/15','from-violet-300/25 via-blue-300/10 to-teal-400/20'][index % 3]}`}><FileText size={30} className="text-white/60" /></div>
      <div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-100">{post.topic}</span><time className="text-xs text-white/50" dateTime={post.date}>{dateFormat.format(new Date(`${post.date}T12:00:00`))}</time></div><h3 className="truncate text-sm font-semibold text-white sm:text-base">{post.title}</h3><p className="mt-1 truncate text-xs text-white/55">{post.excerpt}</p></div>
      <div className="flex shrink-0 items-center gap-2"><span className={`mr-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${post.status === 'published' ? 'bg-emerald-300/15 text-emerald-100' : 'bg-amber-300/15 text-amber-100'}`}><span className={`h-1.5 w-1.5 rounded-full ${post.status === 'published' ? 'bg-emerald-300' : 'bg-amber-300'}`} />{post.status === 'published' ? t.statusPublished : t.statusDraft}</span><button type="button" onClick={() => update(post.id, { hidden: !post.hidden })} aria-label={post.hidden ? t.show : t.hide} title={post.hidden ? t.show : t.hide} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/65 hover:bg-white/10">{post.hidden ? <Eye size={17} /> : <EyeOff size={17} />}</button><button type="button" onClick={() => update(post.id, { status: post.status === 'published' ? 'draft' : 'published' })} aria-label={post.status === 'published' ? t.schedule : t.publish} title={post.status === 'published' ? t.schedule : t.publish} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/65 hover:bg-white/10"><CalendarClock size={17} /></button><button type="button" onClick={() => setPreview(post)} aria-label={t.preview} title={t.preview} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/65 hover:bg-white/10"><ExternalLink size={17} /></button></div>
    </article>)}{visible.length === 0 && <p className="rounded-2xl border border-white/10 bg-white/5 px-5 py-10 text-center text-sm text-white/55">{t.empty}</p>}</div>
    {preview && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreview(null); }}><div role="dialog" aria-modal="true" aria-label={t.preview} className="w-full max-w-lg rounded-2xl border border-white/20 bg-[#1c3029]/95 p-6 shadow-2xl backdrop-blur-2xl"><div className="flex justify-between gap-4"><span className="text-xs font-bold uppercase tracking-widest text-cyan-200">{preview.topic}</span><button type="button" onClick={() => setPreview(null)} aria-label={t.close} className="text-white/65 hover:text-white"><X size={20} /></button></div><h2 className="mt-4 text-xl font-bold">{preview.title}</h2><p className="mt-2 text-sm text-white/65">{preview.excerpt}</p><p className="mt-5 text-xs text-white/45">{dateFormat.format(new Date(`${preview.date}T12:00:00`))}</p></div></div>}
  </div>;
}
