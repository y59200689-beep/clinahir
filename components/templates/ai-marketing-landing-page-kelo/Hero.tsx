"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  CalendarRange,
  Users,
  MessageSquare,
  Newspaper,
  History,
  Stethoscope,
  UserRound,
  Calendar,
  Settings,
  HelpCircle,
  Search,
  Bell,
  TrendingUp,
  CalendarDays,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  UserPlus
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import AppointmentsPage from "../../../src/AppointmentsPage";
import AgendaPage from "../../../src/AgendaPage";
import PatientsPage from "../../../src/PatientsPage";
import PostsPage from "../../../src/PostsPage";
import ActivityLogPage from "../../../src/ActivityLogPage";
import MessagesPage from "../../../src/MessagesPage";
import DoctorsPage from "../../../src/DoctorsPage";
import StaffPage from "../../../src/StaffPage";
import SettingsPage from "../../../src/SettingsPage";
import SupportPage from "../../../src/SupportPage";
import AnimatedMetricValue from "../../../src/AnimatedMetricValue";

// ============================================================================
// SIDEBAR ITEM
// ============================================================================
function SidebarItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active && onClick ? "page" : undefined}
      className={"w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all " + (active ? "bg-white/10 text-white font-medium" : "text-white/50 hover:text-white hover:bg-white/5")}
    >
      {icon}
      {label}
    </button>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

const examinations = [
  { label: "MRI", count: 146, color: "#5046e8" },
  { label: "Radiography", count: 19, color: "#38bdf8" },
  { label: "Ultrasound", count: 19, color: "#fb923c" },
  { label: "CT scan", count: 15, color: "#2595a9" },
  { label: "Mammography", count: 4, color: "#10b981" },
  { label: "Other", count: 1, color: "#94a3b8" },
  { label: "Interventional radiology", count: 3, color: "#8b5cf6" },
];

function scaleExaminations(total: number) {
  const originalTotal = examinations.reduce((sum, examination) => sum + examination.count, 0);
  const scaled = examinations.map((examination) => examination.count * total / originalTotal);
  const counts = scaled.map(Math.floor);
  const remaining = total - counts.reduce((sum, count) => sum + count, 0);
  const largestRemainders = scaled.map((count, index) => ({ index, remainder: count - counts[index] }))
    .sort((a, b) => b.remainder - a.remainder);
  largestRemainders.slice(0, remaining).forEach(({ index }) => { counts[index] += 1; });
  return examinations.map((examination, index) => ({ ...examination, count: counts[index] }));
}

function ExaminationChart({ examinations }: { examinations: Array<{ label: string; count: number; color: string }> }) {
  const total = examinations.reduce((sum, examination) => sum + examination.count, 0);
  const circumference = 2 * Math.PI * 72;
  let position = 0;

  return (
    <div className="relative w-44 h-44 mx-auto my-6" role="img" aria-label={`Examination breakdown: ${examinations.map(({ count, label }) => `${count} ${label}`).join(", ")}`}>
      <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="90" cy="90" r="72" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="23" />
        {examinations.map((examination) => {
          const length = total ? examination.count / total * circumference : 0;
          const offset = position;
          position += length;
          return (
            <circle
              key={examination.label}
              cx="90" cy="90" r="72" fill="none" stroke={examination.color} strokeWidth="23"
              strokeDasharray={`${Math.max(length - 4, 1)} ${circumference}`}
              strokeDashoffset={-offset}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <strong className="text-3xl leading-none">{total}</strong>
        <span className="text-[10px] tracking-wider font-bold text-white/50 mt-1">TOTAL</span>
      </div>
    </div>
  );
}

function toLocalDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const reportDate = new Date(2026, 8, 29);
const reportDateKey = toLocalDateKey(reportDate);

type AppointmentDay = { date: string; count: number };

function distributeAppointments(year: number, month: number, days: number, total: number) {
  const weights = Array.from({ length: days }, (_, index) => 1 + index * 0.008 + Math.sin(index * 1.7) * 0.12);
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const exact = weights.map((weight) => weight / weightTotal * total);
  const counts = exact.map(Math.floor);
  const remainder = total - counts.reduce((sum, count) => sum + count, 0);
  exact.map((value, index) => ({ index, fraction: value - counts[index] }))
    .sort((a, b) => b.fraction - a.fraction)
    .slice(0, remainder)
    .forEach(({ index }) => { counts[index] += 1; });
  return counts.map((count, index) => ({ date: toLocalDateKey(new Date(year, month, index + 1)), count }));
}

const appointmentDays: AppointmentDay[] = [
  ...distributeAppointments(2026, 6, 31, 100),
  ...distributeAppointments(2026, 7, 31, 350),
  ...distributeAppointments(2026, 8, 28, 850),
  { date: reportDateKey, count: 207 },
];

function getDateBounds(range: string, startDate: string, endDate: string): [string, string] {
  if (range === "Custom date") return [startDate, endDate];
  if (range === "From the start") return [appointmentDays[0].date, reportDateKey];
  if (range === "This month") return ["2026-09-01", reportDateKey];
  if (range === "Last month") return ["2026-08-01", "2026-08-31"];
  if (range === "Last 7 days") return ["2026-09-23", reportDateKey];
  if (range === "Yesterday") return ["2026-09-28", "2026-09-28"];
  return [reportDateKey, reportDateKey];
}

function DateRangeDropdown({ language, range, onRangeChange }: { language: "en" | "fr"; range: string; onRangeChange: (range: string, startDate?: string, endDate?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ranges = ["Today", "Yesterday", "Last 7 days", "This month", "Last month", "From the start"];
  const locale = language === "fr" ? "fr-FR" : "en-US";
  const firstWeekday = (calendarMonth.getDay() + 6) % 7;
  const calendarDays = Array.from({ length: 42 }, (_, index) => new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), index - firstWeekday + 1));
  const formatSelected = (value: string) => value
    ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`))
    : "Select a date";
  const selectDate = (date: Date) => {
    const selected = toLocalDateKey(date);
    if (!startDate || endDate || selected < startDate) {
      setStartDate(selected);
      setEndDate("");
    } else {
      setEndDate(selected);
    }
    if (date.getMonth() !== calendarMonth.getMonth() || date.getFullYear() !== calendarMonth.getFullYear()) {
      setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm flex items-center gap-2 hover:bg-white/10 transition-colors"
      >
        <Calendar size={16} className="text-white/60" />
        <span>{range}</span>
        <ChevronDown size={14} className={"text-white/60 transition-transform " + (open ? "rotate-180" : "")} />
      </button>
      {open && (
        <div role="menu" aria-label="Date range" className={"absolute right-0 top-full mt-2 z-50 p-2 rounded-xl bg-[#1c2824]/95 backdrop-blur-2xl border border-white/20 shadow-2xl " + (showCustom ? "w-[540px] grid grid-cols-[180px_1fr] gap-2" : "w-64")}>
          <div>
          {ranges.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitemradio"
              aria-checked={range === option}
              onClick={() => { onRangeChange(option); setShowCustom(false); setOpen(false); }}
              className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10 transition-colors"
            >
              <span>{option}</span>
              {range === option && <Check size={15} className="text-[var(--brand-primary)]" />}
            </button>
          ))}
          <div className="my-2 border-t border-white/10" />
          <button
            type="button"
            role="menuitem"
            onClick={() => setShowCustom((current) => !current)}
            className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-white/85 hover:bg-white/10 transition-colors"
          >
            <span>Custom date</span>
            <ChevronDown size={14} className={"text-white/60 transition-transform " + (showCustom ? "rotate-180" : "")} />
          </button>
          </div>
          {showCustom && (
            <div className="px-2 pb-2 pt-1 space-y-3 border-l border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 min-w-0">
                  <p className="text-[10px] text-white/50">Start date</p>
                  <p className="text-xs text-white mt-1 truncate">{formatSelected(startDate)}</p>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 min-w-0">
                  <p className="text-[10px] text-white/50">End date</p>
                  <p className="text-xs text-white mt-1 truncate">{formatSelected(endDate)}</p>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-2">
                <div className="flex items-center justify-between mb-2 px-1">
                  <strong className="text-sm font-semibold text-white capitalize">{new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(calendarMonth)}</strong>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label="Previous month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="w-7 h-7 rounded-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"><ChevronLeft size={16} /></button>
                    <button type="button" aria-label="Next month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="w-7 h-7 rounded-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10"><ChevronRight size={16} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-white/45 mb-1">
                  {(language === "fr" ? ["L", "M", "M", "J", "V", "S", "D"] : ["M", "T", "W", "T", "F", "S", "S"]).map((day, index) => <span key={index} className="py-1">{day}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date) => {
                    const key = toLocalDateKey(date);
                    const endpoint = key === startDate || key === endDate;
                    const between = !!(startDate && endDate && key > startDate && key < endDate);
                    const currentMonth = date.getMonth() === calendarMonth.getMonth();
                    const today = key === toLocalDateKey(new Date());
                    return (
                      <button key={key} type="button" aria-label={new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(date)} aria-pressed={endpoint} onClick={() => selectDate(date)} className={"aspect-square rounded-lg text-xs font-medium transition-colors " + (endpoint ? "bg-[var(--brand-primary)] text-white" : between ? "bg-[var(--brand-primary-20)] text-white" : currentMonth ? "text-white/85 hover:bg-white/15" : "text-white/30 hover:bg-white/10") + (today && !endpoint ? " ring-1 ring-[var(--brand-primary)]" : "")}>{date.getDate()}</button>
                    );
                  })}
                </div>
              </div>
              <p className="text-[11px] text-white/50 text-center">{startDate && !endDate ? "Select an end date" : "Select a start and end date"}</p>
              <button type="button" disabled={!startDate || !endDate} onClick={() => { onRangeChange("Custom date", startDate, endDate); setOpen(false); }} className="w-full rounded-lg bg-[var(--brand-primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Apply</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DASHBOARD METRIC CARD
// ============================================================================
function MetricCard({ icon, label, value, badge, tone }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
  tone: "cyan" | "blue" | "green" | "amber";
}) {
  const reducedMotion = useReducedMotion();
  const [entered, setEntered] = useState(false);

  const tones = {
    cyan: "text-cyan-300 bg-cyan-400/10",
    blue: "text-sky-300 bg-sky-400/10",
    green: "text-emerald-300 bg-emerald-400/10",
    amber: "text-orange-300 bg-orange-400/10",
  };
  const badgeTone = tone === "green" ? "text-red-200 bg-red-400/10 border-red-300/20" : tone === "cyan" ? "text-emerald-200 bg-emerald-400/10 border-emerald-300/20" : "text-white/55 bg-white/5 border-white/10";
  return (
    <motion.div variants={itemVariants} onAnimationComplete={() => setEntered(true)} whileHover={reducedMotion ? undefined : { y: -4 }} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 min-w-0 transition-colors hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-2 mb-6">
        <div className={"w-11 h-11 shrink-0 rounded-xl flex items-center justify-center " + tones[tone]}>{icon}</div>
        {badge && <span className={"px-2 py-1 rounded-full border text-[10px] font-semibold whitespace-nowrap " + badgeTone}>{badge}</span>}
      </div>
      <p className="text-white/55 text-[10px] font-semibold uppercase tracking-wider min-h-[28px] leading-tight">{label}</p>
      <p className="text-[36px] leading-none font-bold mt-2"><AnimatedMetricValue value={value} start={entered} /></p>
    </motion.div>
  );
}

function AppointmentTrendChart({ days, language, range }: { days: AppointmentDay[]; language: "en" | "fr"; range: string }) {
  const locale = language === "fr" ? "fr-FR" : "en-US";
  const grouping = days.length > 60 ? "monthly" : days.length > 14 ? "weekly" : "daily";
  const chartDays: AppointmentDay[] = grouping === "monthly"
    ? Array.from(days.reduce((groups, day) => {
        const month = day.date.slice(0, 7);
        const existing = groups.get(month);
        if (existing) existing.count += day.count;
        else groups.set(month, { date: day.date, count: day.count });
        return groups;
      }, new Map<string, AppointmentDay>()).values())
    : grouping === "weekly"
      ? days.reduce<AppointmentDay[]>((groups, day, index) => {
          const week = Math.floor(index / 7);
          if (groups[week]) groups[week].count += day.count;
          else groups.push({ date: day.date, count: day.count });
          return groups;
        }, [])
      : days;
  const maxCount = Math.max(1, ...chartDays.map((day) => day.count));
  const axisMax = Math.max(5, Math.ceil(maxCount / 5) * 5);
  const xFor = (index: number) => chartDays.length === 1 ? 352 : 55 + index * 595 / (chartDays.length - 1);
  const yFor = (count: number) => 395 - count / axisMax * 320;
  const points = chartDays.map((day, index) => ({ ...day, x: xFor(index), y: yFor(day.count) }));
  const line = points.length === 1 ? `M352 395 L352 ${points[0].y.toFixed(1)}` : points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const area = points.length > 1 ? `${line} L${points[points.length - 1].x.toFixed(1)} 395 L${points[0].x.toFixed(1)} 395 Z` : "";
  const labelCount = Math.min(chartDays.length, 7);
  const labelIndexes = [...new Set(Array.from({ length: labelCount }, (_, index) => Math.round(index * (chartDays.length - 1) / Math.max(labelCount - 1, 1))))];
  const formatDate = (date: string) => new Intl.DateTimeFormat(locale, grouping === "monthly" ? { month: "short", year: "numeric" } : { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));

  return (
    <svg className="w-full h-full" viewBox="0 0 680 500" role="img" aria-label={`${range}: ${days.length} days, ${days.reduce((sum, day) => sum + day.count, 0)} appointments, grouped ${grouping}`}>
      <defs>
        <linearGradient id="appointment-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" stopOpacity="0.33" />
          <stop offset="100%" stopColor="#fb923c" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {Array.from({ length: 5 }, (_, index) => {
        const y = 75 + index * 80;
        return <g key={y}>
          <line x1="55" x2="650" y1={y} y2={y} stroke="rgba(255,255,255,0.16)" strokeDasharray="5 6" />
          <text x="35" y={y + 5} fill="rgba(255,255,255,0.55)" fontSize="15" textAnchor="end">{Math.round(axisMax * (4 - index) / 4)}</text>
        </g>;
      })}
      {area && <path d={area} fill="url(#appointment-area)" />}
      {line && <path d={line} fill="none" stroke="#fb923c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />}
      {points.map((point) => <circle key={point.date} cx={point.x} cy={point.y} r="6" fill="rgba(50,36,25,0.9)" stroke="#fb923c" strokeWidth="3"><title>{`${formatDate(point.date)}: ${point.count}`}</title></circle>)}
      {labelIndexes.map((index) => <text key={chartDays[index].date} x={points[index].x} y="440" fill="rgba(255,255,255,0.6)" fontSize="13" textAnchor="middle">{formatDate(chartDays[index].date)}</text>)}
      {days.length === 0 && <text x="352" y="235" fill="rgba(255,255,255,0.6)" fontSize="16" textAnchor="middle">No appointments</text>}
    </svg>
  );
}

// ============================================================================
// DASHBOARD
// ============================================================================
function MobilePageNav({ activePage, onSelect }: { activePage: string; onSelect: (page: string) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: true });
  const updateEdges = () => {
    const element = scrollRef.current;
    if (!element) return;
    setEdges({
      left: element.scrollLeft > 8,
      right: element.scrollLeft + element.clientWidth < element.scrollWidth - 8,
    });
  };

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, []);

  const pages = [
    { label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { label: "Appointments", icon: <CalendarDays size={16} /> },
    { label: "Agenda", icon: <CalendarRange size={16} /> },
    { label: "Patients", icon: <UserRound size={16} /> },
    { label: "Staff", icon: <Users size={16} /> },
    { label: "Messages", icon: <MessageSquare size={16} /> },
    { label: "Doctors", icon: <Stethoscope size={16} /> },
    { label: "Posts & Articles", icon: <Newspaper size={16} /> },
    { label: "Activity Log", icon: <History size={16} /> },
    { label: "Settings", icon: <Settings size={16} /> },
    { label: "Support", icon: <HelpCircle size={16} /> },
  ];

  return <div className="relative lg:hidden">
    <div ref={scrollRef} onScroll={updateEdges} className="mobile-dashboard-nav flex gap-2 overflow-x-auto scroll-smooth pr-10" aria-label="Dashboard pages">
      {pages.map((item) => <button key={item.label} type="button" onClick={() => onSelect(item.label)} aria-current={activePage === item.label ? "page" : undefined} className={"shrink-0 rounded-xl border px-3 py-2 text-xs font-medium inline-flex items-center gap-2 transition-colors " + (activePage === item.label ? "bg-white/20 border-white/25 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.12)]" : "bg-white/[0.06] border-white/10 text-white/65 hover:bg-white/10 hover:text-white")}>{item.icon}{item.label}</button>)}
    </div>
    {edges.left && <button type="button" onClick={() => scrollRef.current?.scrollBy({ left: -240, behavior: "smooth" })} aria-label="Scroll dashboard pages left" className="absolute left-1 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-[#33483e]/90 text-white shadow-lg backdrop-blur-xl"><ChevronLeft size={16} /></button>}
    {edges.right && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-[#33483e]/95 via-[#33483e]/75 to-transparent pl-6 pr-0.5"><button type="button" onClick={() => scrollRef.current?.scrollBy({ left: 240, behavior: "smooth" })} aria-label="Scroll dashboard pages right" className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur-xl hover:bg-white/25"><ChevronRight size={18} /></button></div>}
  </div>;
}

function Dashboard({ language }: { language: "en" | "fr" }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [dateRange, setDateRange] = useState("This month");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });
  const [appointmentsDateRange, setAppointmentsDateRange] = useState("This month");
  const [appointmentsCustomDates, setAppointmentsCustomDates] = useState({ start: "", end: "" });
  const [appointmentsRangeStart, appointmentsRangeEnd] = getDateBounds(appointmentsDateRange, appointmentsCustomDates.start, appointmentsCustomDates.end);
  const [rangeStart, rangeEnd] = getDateBounds(dateRange, customDates.start, customDates.end);
  const selectedDays = appointmentDays.filter((day) => day.date >= rangeStart && day.date <= rangeEnd);
  const totalAppointments = selectedDays.reduce((sum, day) => sum + day.count, 0);
  const totalPatients = dateRange === "Today" ? 195 : Math.round(totalAppointments * 0.92);
  const patientPercentage = totalAppointments ? Math.round(totalPatients / totalAppointments * 100) : 0;
  const examinationCounts = scaleExaminations(totalAppointments);
  const changeDateRange = (range: string, start = "", end = "") => {
    setDateRange(range);
    if (range === "Custom date") setCustomDates({ start, end });
  };
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.4,
        ease: "easeOut" as const,
        staggerChildren: 0.1,
        delayChildren: 0.6
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-6xl mx-auto rounded-[40px] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row text-white/90"
    >
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex-col p-6 hidden lg:flex shrink-0">
        <motion.div variants={itemVariants} className="flex items-center mb-10 px-2">
          <span className="text-xl font-bold tracking-tight text-white" aria-label="Clinahir">Clinahir</span>
        </motion.div>

        <nav className="flex-1 space-y-1">
          {[
            { icon: <LayoutDashboard size={18} />, label: "Dashboard", active: activePage === "Dashboard", onClick: () => setActivePage("Dashboard") },
            { icon: <CalendarDays size={18} />, label: "Appointments", active: activePage === "Appointments", onClick: () => setActivePage("Appointments") },
            { icon: <CalendarRange size={18} />, label: "Agenda", active: activePage === "Agenda", onClick: () => setActivePage("Agenda") },
            { icon: <UserRound size={18} />, label: "Patients", active: activePage === "Patients", onClick: () => setActivePage("Patients") },
            { icon: <Users size={18} />, label: "Staff", active: activePage === "Staff", onClick: () => setActivePage("Staff") },
            { icon: <MessageSquare size={18} />, label: "Messages", active: activePage === "Messages", onClick: () => setActivePage("Messages") },
            { icon: <Stethoscope size={18} />, label: "Doctors", active: activePage === "Doctors", onClick: () => setActivePage("Doctors") },
            { icon: <Newspaper size={18} />, label: "Posts & Articles", active: activePage === "Posts & Articles", onClick: () => setActivePage("Posts & Articles") },
            { icon: <History size={18} />, label: "Activity Log", active: activePage === "Activity Log", onClick: () => setActivePage("Activity Log") },
          ].map((item, i) => (
            <motion.div key={i} variants={itemVariants}>
              <SidebarItem icon={item.icon} label={item.label} active={item.active} onClick={item.onClick} />
            </motion.div>
          ))}
        </nav>

        <motion.div variants={itemVariants} className="pt-6 border-t border-white/10 space-y-1 mt-auto">
          <SidebarItem icon={<HelpCircle size={18} />} label="Support" active={activePage === "Support"} onClick={() => setActivePage("Support")} />
          <SidebarItem icon={<Settings size={18} />} label="Settings" active={activePage === "Settings"} onClick={() => setActivePage("Settings")} />
        </motion.div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Nav */}
        <motion.header variants={itemVariants} className="h-16 border-b border-white/10 flex items-center gap-4 px-4 sm:px-8 shrink-0">
          <div className="relative min-w-0 max-w-96 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-6">
            <button type="button" aria-label="Notifications" className="shrink-0 text-white/60 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[var(--chart-amber)] rounded-full border-2 border-[var(--brand-dark)]" />
            </button>
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">Center Admin</p>
                <p className="text-xs text-white/40">Radiology Center</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border border-white/20"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.header>

        {/* Dashboard Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-8 space-y-6">
          <MobilePageNav activePage={activePage} onSelect={setActivePage} />
          {activePage === "Support" ? (
            <div key="support-page" className="h-[760px] min-w-0 overflow-y-auto overscroll-contain pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent" }}>
              <SupportPage language={language} onNavigate={setActivePage} />
            </div>
          ) : activePage === "Settings" ? (
            <div key="settings-page" className="h-[760px] min-w-0 overflow-y-auto overscroll-contain pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent" }}>
              <SettingsPage language={language} />
            </div>
          ) : activePage === "Staff" ? (
            <div key="staff-page" className="h-[760px] min-w-0 overflow-y-auto overscroll-contain pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent" }}>
              <StaffPage language={language} appointmentDays={appointmentDays} rangeStart={rangeStart} rangeEnd={rangeEnd} dateControl={<DateRangeDropdown language={language} range={dateRange} onRangeChange={changeDateRange} />} onViewActivity={() => setActivePage("Activity Log")} />
            </div>
          ) : activePage === "Doctors" ? (
            <div key="doctors-page" className="h-[760px] min-w-0 overflow-y-auto overscroll-contain pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent" }}>
              <DoctorsPage language={language} appointmentDays={appointmentDays} />
            </div>
          ) : activePage === "Messages" ? (
            <div key="messages-page" className="h-[760px] min-w-0 overflow-y-auto overscroll-contain pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent" }}>
              <MessagesPage language={language} />
            </div>
          ) : activePage === "Activity Log" ? (
            <div key="activity-page" className="h-[760px] min-w-0 overflow-y-auto overscroll-contain pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent" }}>
              <ActivityLogPage language={language} appointmentDays={appointmentDays} rangeStart={rangeStart} rangeEnd={rangeEnd} dateControl={<DateRangeDropdown language={language} range={dateRange} onRangeChange={changeDateRange} />} />
            </div>
          ) : activePage === "Posts & Articles" ? (
            <div key="posts-page" className="h-[760px] min-w-0 overflow-y-auto overscroll-contain pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent" }}>
              <PostsPage language={language} />
            </div>
          ) : activePage === "Patients" ? (
            <div key="patients-page" className="h-[760px] min-w-0 overflow-y-auto overscroll-contain pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent" }}>
              <PatientsPage language={language} appointmentDays={appointmentDays} />
            </div>
          ) : activePage === "Agenda" ? (
            <div key="agenda-page" className="h-[760px] min-w-0 overflow-y-auto overscroll-contain pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent" }}>
              <AgendaPage language={language} appointmentDays={appointmentDays} />
            </div>
          ) : activePage === "Appointments" ? (
            <div key="appointments-page" className="h-[760px] min-w-0 overflow-y-auto overscroll-contain pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.25) transparent" }}>
              <AppointmentsPage
                language={language}
                dateRange={appointmentsDateRange}
                rangeStart={appointmentsRangeStart}
                rangeEnd={appointmentsRangeEnd}
                appointmentDays={appointmentDays}
                dateControl={<DateRangeDropdown language={language} range={appointmentsDateRange} onRangeChange={(range, start = "", end = "") => { setAppointmentsDateRange(range); if (range === "Custom date") setAppointmentsCustomDates({ start, end }); }} />}
                onResetDate={() => setAppointmentsDateRange("This month")}
              />
            </div>
          ) : (
          <>
          <motion.div variants={itemVariants} className="relative z-30 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold">Analytics</h1>
            <div className="flex flex-wrap items-center gap-3">
              <DateRangeDropdown language={language} range={dateRange} onRangeChange={changeDateRange} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[var(--surface)] text-[var(--text-primary)] rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-white/90 transition-colors"
              >
                <UserPlus size={16} />
                New Appointment
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard icon={<CalendarDays size={22} />} label="Total appointments" value={String(totalAppointments)} badge={`${patientPercentage}% patients`} tone="cyan" />
            <MetricCard icon={<Users size={22} />} label="Total patients" value={String(totalPatients)} badge="Registered" tone="blue" />
            <MetricCard icon={<CalendarClock size={22} />} label="Upcoming appointments" value="23" tone="green" />
            <MetricCard icon={<MessageSquare size={22} />} label="Unread messages" value="18" badge="Handled" tone="amber" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Left Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Appointment trend */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex-1 flex flex-col transition-colors hover:bg-white/[0.07]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h3 className="font-semibold">Appointment trends</h3>
                </div>
                <div className="flex-1 min-h-[360px] flex items-center">
                  <AppointmentTrendChart key={`${dateRange}-${rangeStart}-${rangeEnd}`} days={selectedDays} language={language} range={dateRange} />
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Examination breakdown */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 transition-colors hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">Examination breakdown</h3>
                    <p className="text-white/50 text-xs mt-1">{totalAppointments} appointments analyzed</p>
                  </div>
                  <TrendingUp size={18} className="text-white/50 shrink-0" />
                </div>
                <ExaminationChart key={totalAppointments} examinations={examinationCounts} />
                <div className="border-t border-dashed border-white/15 pt-4 flex flex-wrap justify-center gap-2">
                  {[...examinationCounts.filter((examination) => examination.label !== "Other"), ...examinationCounts.filter((examination) => examination.label === "Other")].map((examination) => (
                    <div key={examination.label} className="min-w-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white/75">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: examination.color }} />
                      <span>{examination.label}</span>
                      <span className="px-1 rounded bg-white/10 font-semibold text-white/85">{examination.count}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
          </>
          )}
        </main>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AiMarketingHeroKelo({ className, language = "en" }: { className?: string; language?: "en" | "fr" }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.6;
    }
  }, []);

  return (
    <>
      <section className={"min-h-[110vh] flex flex-col bg-[var(--brand-dark)] relative " + (className || "")}>
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="https://cdn.jiro.build/Kelo/Hero%202%20Video.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-[var(--hero-veil)] z-[1]" />

        {/* Navigation Bar — centering wrapper holds translate, motion handles only the entrance animation */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
          <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" as const }}
          >
            <div className="relative flex items-center justify-between p-[10px] rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
              {/* Left: Logo */}
              <div className="flex items-center pl-3">
                <span className="text-xl font-bold tracking-tight text-white" aria-label="Clinahir">Clinahir</span>
              </div>

              {/* Center: Nav Links — absolutely centered relative to pill */}
              <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                {["Solutions", "Demo", "Process", "About"].map((item, index) => (
                  <a
                    key={item}
                    href={"#" + ["solutions", "interactive-demo", "process", "about"][index]}
                    className="text-[15px] font-medium text-white/70 hover:text-white transition-colors relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--surface)] transition-all group-hover:w-full" />
                  </a>
                ))}
              </div>

              {/* Right: Buttons */}
              <div className="flex items-center gap-3">
                <a href="#book-demo" className="hidden sm:inline-flex text-[15px] font-medium text-white/70 hover:text-white transition-colors px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                  Contact
                </a>
                <a href="#book-demo" className="rounded-full px-5 py-2 text-[15px] font-semibold bg-[var(--surface)] text-[var(--text-primary)] hover:bg-white/90 transition-all hover:scale-105 active:scale-95">
                  Book a Demo
                </a>
              </div>
            </div>
          </motion.nav>
        </div>

        {/* Hero Content */}
        <div className="relative flex-1 flex flex-col items-center text-center px-6 pt-[180px] pb-16 z-10">
          <div className="flex flex-col items-center w-full">

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" as const }}
              className="text-center font-semibold text-4xl sm:text-5xl md:text-6xl lg:text-[62px] leading-[1.1] tracking-[-0.02em] text-white max-w-4xl mt-0 mb-4"
            >
              Turn More Searches Into<br />
              Booked <span className="italic">Appointments</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" as const }}
              className="text-center text-base md:text-lg text-white/90 max-w-[480px] leading-relaxed mb-8"
            >
              Websites, online booking, digital visibility and growth systems built for radiology and medical centers.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" as const }}
              className="flex flex-col items-center gap-3"
            >
              <a href="#book-demo"
                className="rounded-full px-8 py-4 text-base font-semibold bg-white border border-white/70 text-[var(--text-primary)] hover:bg-white/90 transition-all shadow-2xl hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
              >
                Book a Free Demo
              </a>
              <span className="text-sm text-white/60">
                Built to improve the patient journey from Google search to confirmed appointment.
              </span>
            </motion.div>

            {/* Dashboard */}
            <div id="interactive-demo" className="mt-10 w-full scroll-mt-6">
              <p className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-white/80 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_10px_30px_rgba(12,32,42,0.28)]">
                <span className="text-[11px] font-bold tracking-[0.14em] text-teal-700">INTERACTIVE DEMO</span>
                <span className="text-slate-400" aria-hidden="true">·</span>
                <span>Explore the dashboard</span>
                <span className="text-lg leading-none text-teal-700" aria-hidden="true">↓</span>
              </p>
              <p className="mb-4 text-sm font-medium text-white/85">Sample data for exploration · No patient records are shown</p>
              <Dashboard language={language} />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
