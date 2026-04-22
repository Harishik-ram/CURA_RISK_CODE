This file path was: 'app/dashboard/risk-profile/page.js'


"use client";
import { useState, useEffect } from "react";
import DashboardSidebar from "../../Components/DashboardSidebar";
import { RefreshCw, Heart, Activity, Zap, Wind, Shield, Dumbbell, Droplets, Eye, Lock, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Stethoscope, Baby, Dna, AlertCircle, ShieldAlert, Ear } from "lucide-react";
import Link from "next/link";

// ── Category colors ───────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  "Age":         "#6366f1", "Vaccine":  "#0ea5e9", "Gender":    "#8b5cf6",
  "Blood Group": "#ec4899", "Ethnicity":"#f59e0b", "Residence": "#10b981",
  "Travel":      "#14b8a6", "BMI":      "#f97316", "Occupation":"#64748b",
  "Comorbidity": "#3b82f6", "Surgery":  "#a855f7", "Medication":"#0284c7",
  "Allergy":     "#fb923c", "Addiction":"#d946ef", "Injury":    "#78716c",
  "Coliving":    "#0891b2", "Diet":     "#84cc16", "Pet":       "#a3e635",
  "Family":      "#6366f1",
};

// ── Body systems ──────────────────────────────────────────────────────────────
const BODY_SYSTEMS = [
  { key: 'heart',      name: 'Heart & Circulation',    icon: Heart,    domains: ['Cardiovascular'],                              color: { bg: 'bg-blue-50 dark:bg-blue-500/10',    icon: 'text-blue-500',    border: 'border-blue-100 dark:border-blue-500/20'    } },
  { key: 'brain',      name: 'Brain & Mind',           icon: Activity, domains: ['Neurology', 'Mental Health', 'Sleep Medicine'], color: { bg: 'bg-violet-50 dark:bg-violet-500/10', icon: 'text-violet-500',  border: 'border-violet-100 dark:border-violet-500/20' } },
  { key: 'metabolism', name: 'Metabolism & Hormones',  icon: Zap,      domains: ['Endocrine/Metabolic'],                         color: { bg: 'bg-yellow-50 dark:bg-yellow-500/10', icon: 'text-yellow-500',  border: 'border-yellow-100 dark:border-yellow-500/20' } },
  { key: 'lungs',      name: 'Lungs & Breathing',      icon: Wind,     domains: ['Respiratory'],                                 color: { bg: 'bg-sky-50 dark:bg-sky-500/10',      icon: 'text-sky-500',     border: 'border-sky-100 dark:border-sky-500/20'       } },
  { key: 'immunity',   name: 'Immunity & Infections',  icon: Shield,   domains: ['Infectious', 'Immunology'],                    color: { bg: 'bg-amber-50 dark:bg-amber-500/10',  icon: 'text-amber-500',   border: 'border-amber-100 dark:border-amber-500/20'   } },
  { key: 'bones',      name: 'Bones & Joints',         icon: Dumbbell, domains: ['MSK/Rheumatology'],                            color: { bg: 'bg-teal-50 dark:bg-teal-500/10',    icon: 'text-teal-500',    border: 'border-teal-100 dark:border-teal-500/20'     } },
  { key: 'digestion',  name: 'Digestion & Gut',        icon: Droplets, domains: ['Gastroenterology'],                            color: { bg: 'bg-lime-50 dark:bg-lime-500/10',    icon: 'text-lime-600',    border: 'border-lime-100 dark:border-lime-500/20'     } },
  { key: 'cell',       name: 'Cell Health',            icon: Eye,      domains: ['Oncology'],                                    color: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', icon: 'text-indigo-500',  border: 'border-indigo-100 dark:border-indigo-500/20' } },
  { key: 'urinary',    name: 'Kidneys & Urinary',      icon: Droplets, domains: ['Genitourinary'],                               color: { bg: 'bg-pink-50 dark:bg-pink-500/10',    icon: 'text-pink-500',    border: 'border-pink-100 dark:border-pink-500/20'     } },
  { key: 'blood',      name: 'Blood & Immunity',       icon: Shield,   domains: ['Hematology'],                                  color: { bg: 'bg-rose-50 dark:bg-rose-500/10',    icon: 'text-rose-400',    border: 'border-rose-100 dark:border-rose-500/20'     } },
  { key: 'skin',       name: 'Skin & Hair',            icon: Eye,      domains: ['Dermatology'],                                 color: { bg: 'bg-orange-50 dark:bg-orange-500/10', icon: 'text-orange-500', border: 'border-orange-100 dark:border-orange-500/20' } },
  { key: 'womens',     name: "Women's Health",         icon: Heart,    domains: ['Obstetrics', 'Sexual Health'],                 color: { bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10',  icon: 'text-fuchsia-500',  border: 'border-fuchsia-100 dark:border-fuchsia-500/20'  } },
  { key: 'eyes',       name: 'Eye Health',             icon: Eye,      domains: ['Ophthalmology'],                               color: { bg: 'bg-cyan-50 dark:bg-cyan-500/10',        icon: 'text-cyan-500',     border: 'border-cyan-100 dark:border-cyan-500/20'        } },
  { key: 'ent',        name: 'Ear, Nose & Throat',     icon: Ear,      domains: ['ENT'],                                         color: { bg: 'bg-purple-50 dark:bg-purple-500/10',    icon: 'text-purple-500',   border: 'border-purple-100 dark:border-purple-500/20'    } },
  { key: 'injury',     name: 'Injury & Toxins',        icon: AlertCircle, domains: ['Injury/Toxicology'],                        color: { bg: 'bg-red-50 dark:bg-red-500/10',          icon: 'text-red-500',      border: 'border-red-100 dark:border-red-500/20'          } },
  { key: 'genetics',   name: 'Genetics & Inherited',   icon: Dna,      domains: ['Congenital/Genetics'],                         color: { bg: 'bg-emerald-50 dark:bg-emerald-500/10',  icon: 'text-emerald-500',  border: 'border-emerald-100 dark:border-emerald-500/20'  } },
  { key: 'general',    name: 'General Health',         icon: Stethoscope, domains: ['Undifferentiated Clinical Findings'],       color: { bg: 'bg-slate-50 dark:bg-slate-500/10',      icon: 'text-slate-500',    border: 'border-slate-100 dark:border-slate-500/20'      } },
  { key: 'prevention', name: 'Safety & Prevention',    icon: ShieldAlert, domains: ['External Causes / Prevention'],               color: { bg: 'bg-orange-50 dark:bg-orange-500/10',    icon: 'text-orange-600',   border: 'border-orange-100 dark:border-orange-500/20'    } },
  { key: 'neonatal',   name: 'Neonatal Health',        icon: Baby,     domains: ['Neonatology'],                                 color: { bg: 'bg-pink-50 dark:bg-pink-500/10',        icon: 'text-pink-400',     border: 'border-pink-100 dark:border-pink-500/20'        } },
];

// ── Category → plain English ──────────────────────────────────────────────────
const CATEGORY_PLAIN = {
  'Age':         'your age group',
  'Family':      'your family history',
  'BMI':         'your body weight',
  'Gender':      'your biological sex',
  'Blood Group': 'your blood type',
  'Ethnicity':   'your ethnic background',
  'Comorbidity': 'existing health conditions',
  'Medication':  'medications you take',
  'Addiction':   'lifestyle habits',
  'Occupation':  'your work environment',
  'Diet':        'your diet',
  'Coliving':    'your living situation',
  'Vaccine':     'vaccination history',
  'Residence':   'where you live',
  'Travel':      'travel history',
  'Surgery':     'past surgeries',
  'Allergy':     'known allergies',
  'Injury':      'past injuries',
  'Pet':         'pets at home',
};

function getCategoryBreakdown(categoryBreakdown) {
  return Object.entries(categoryBreakdown || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, pct]) => ({ cat, pct }));
}

function getTopReasons(categoryBreakdown) {
  return Object.entries(categoryBreakdown || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => CATEGORY_PLAIN[cat] || cat.toLowerCase());
}

// ── System card ───────────────────────────────────────────────────────────────
function SystemCard({ system, domainData, isPaid, expanded, onToggle }) {
  const isMonitored = !!domainData;
  const reasons = getTopReasons(domainData?.category_breakdown);
  const breakdown = getCategoryBreakdown(domainData?.category_breakdown);
  const Icon = system.icon;

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-200 ${system.color.bg} ${system.color.border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/70 dark:bg-white/10 flex items-center justify-center shrink-0">
            <Icon size={20} className={system.color.icon} />
          </div>
          <div>
            <p className="text-[14px] font-bold text-neutral-800 dark:text-neutral-100">{system.name}</p>
            {isMonitored ? (
              <span className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                Worth monitoring
              </span>
            ) : (
              <span className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">
                Looking good
              </span>
            )}
          </div>
        </div>

        {isMonitored && (
          <button onClick={() => isPaid && onToggle()} className="shrink-0 mt-1">
            {isPaid
              ? (expanded ? <ChevronUp size={18} strokeWidth={2.5} className="text-gray-600 dark:text-neutral-300" /> : <ChevronDown size={18} strokeWidth={2.5} className="text-gray-600 dark:text-neutral-300" />)
              : <Lock size={14} className="text-gray-300 dark:text-neutral-600" />
            }
          </button>
        )}
      </div>

      {/* Expanded detail — paid only */}
      {isPaid && expanded && isMonitored && (
        <div className="mt-4 pt-4 border-t border-white/50 dark:border-white/10 space-y-4">
          {reasons.length > 0 && (
            <p className="text-[13px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
              The main reasons this showed up for you are{' '}
              <span className="font-semibold text-neutral-800 dark:text-neutral-100">
                {reasons.length === 1
                  ? reasons[0]
                  : reasons.slice(0, -1).join(', ') + ' and ' + reasons[reasons.length - 1]}
              </span>.
              {' '}This is a good topic to bring up at your next doctor's visit.
            </p>
          )}
          {breakdown.length > 0 && (
            <div className="space-y-2">
              {breakdown.map(({ cat, pct }) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 w-24 shrink-0">{cat}</span>
                  <div className="flex-1 h-2 bg-white/40 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat] || '#3b82f6' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upgrade nudge — free users */}
      {!isPaid && isMonitored && (
        <div className="mt-3 pt-3 border-t border-white/50 dark:border-white/10">
          <p className="text-[12px] text-gray-500 dark:text-neutral-400">
            <Link href="/dashboard/subscription" className="font-semibold text-blue-600 dark:text-blue-400 underline">
              Upgrade
            </Link>{' '}
            to see why this area showed up for you.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RiskProfilePage() {
  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPaid, setIsPaid]         = useState(false);
  const [patientId, setPatientId]   = useState(null);

  useEffect(() => {
    const pid = localStorage.getItem("userId");
    if (!pid) { setLoading(false); return; }
    setPatientId(pid);
    fetch(`/api/subscription?patientId=${pid}`)
      .then(r => r.json()).then(d => setIsPaid(!!d.plan)).catch(() => {});
    loadProfile(pid);
  }, []);

  function loadProfile(pid) {
    const id = pid || patientId;
    setLoading(true);
    fetch(`/api/risk-profile?patientId=${id}`)
      .then(r => r.json())
      .then(d => { setProfile(d.profile || null); setLoading(false); })
      .catch(() => setLoading(false));
  }

  async function refresh() {
    if (!patientId) return;
    setRefreshing(true);
    try {
      await fetch('/api/risk-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      });
      loadProfile(patientId);
    } finally { setRefreshing(false); }
  }

  const [expandedKey, setExpandedKey] = useState(null);
  const domainScores = profile?.domain_scores || [];

  // Use excess_score (patient score minus age/gender baseline) for threshold.
  // This ensures domains only show as "worth monitoring" when the patient has
  // genuine risk factors specific to that domain — not just because a domain
  // is large or naturally dominant for their age/gender.
  const excessScores = domainScores.map(d => d.excess_score ?? d.avg_score);
  const mean = excessScores.length ? excessScores.reduce((a, b) => a + b, 0) / excessScores.length : 0;
  const sd = excessScores.length ? Math.sqrt(excessScores.reduce((a, b) => a + (b - mean) ** 2, 0) / excessScores.length) : 0;
  const threshold = mean + 0.5 * sd;
  const worthMonitoring = new Set(domainScores.filter(d => (d.excess_score ?? d.avg_score) >= threshold).map(d => d.domain));
  const gender = (profile?.gender || '').toLowerCase();
  const ageRange = (profile?.age_range || '').toLowerCase();
  const isInfant = ageRange.includes('28 days') || ageRange.includes('29 days to 1 year');

  const systemData = BODY_SYSTEMS.filter(sys => {
    if (sys.key === 'womens' && gender === 'male') return false;
    if (sys.key === 'neonatal' && !isInfant) return false;
    return true;
  }).map(sys => {
    const matchedEntry = sys.domains
      .map(dom => domainScores.find(ds => ds.domain === dom && worthMonitoring.has(ds.domain)))
      .find(Boolean) || null;
    return { ...sys, domainData: matchedEntry };
  });

  const monitoredCount = systemData.filter(s => s.domainData).length;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full flex gap-0 lg:gap-8">
        <DashboardSidebar />
        <div className="flex-1 min-w-0 space-y-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-2">
                Health Insights
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Your Health Overview
              </h1>
              <p className="text-gray-500 dark:text-neutral-400 text-sm mt-2 max-w-lg">
                Based on your health profile — areas worth keeping an eye on. This is not a diagnosis.
              </p>
            </div>
            <button
              onClick={refresh}
              disabled={refreshing || loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/8 text-sm font-semibold text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-900 transition-all disabled:opacity-50 shrink-0"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Recalculate
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-neutral-900 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : !profile || domainScores.length === 0 ? (
            <div className="border border-gray-200 dark:border-white/8 rounded-2xl p-10 text-center">
              <AlertTriangle size={32} className="mx-auto mb-4 text-gray-300 dark:text-neutral-600" />
              <p className="text-base font-semibold text-gray-600 dark:text-neutral-400">No health data yet</p>
              <p className="text-sm text-gray-400 dark:text-neutral-500 mt-1 mb-4">
                Complete your personal details first, then we'll generate your health overview.
              </p>
              <Link
                href="/dashboard/personal-details"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E4E8C] text-white text-sm font-semibold"
              >
                Fill Personal Details
              </Link>
            </div>
          ) : (
            <>
              {/* Summary strip */}
              <div className="rounded-2xl p-5 bg-gradient-to-br from-[#1E4E8C] to-[#2d6cc0] text-white flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-1">Your Summary</p>
                  <p className="text-lg font-bold leading-snug">
                    {monitoredCount === 0
                      ? 'All areas looking good 🎉'
                      : `${monitoredCount} area${monitoredCount > 1 ? 's' : ''} worth monitoring`}
                  </p>
                  <p className="text-[12px] opacity-60 mt-0.5">
                    {profile.computed_at
                      ? `Last updated ${new Date(profile.computed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : 'Based on your saved profile'}
                  </p>
                </div>
                <Stethoscope size={36} className="opacity-20" />
              </div>

              {/* Body system grid — monitored first, then looking good */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {[...systemData.filter(s => s.domainData), ...systemData.filter(s => !s.domainData)].map(sys => (
                  <div key={sys.key} className={expandedKey === sys.key ? 'sm:col-span-2 lg:col-span-3' : ''}>
                    <SystemCard
                      system={sys}
                      domainData={sys.domainData}
                      isPaid={isPaid}
                      expanded={expandedKey === sys.key}
                      onToggle={() => setExpandedKey(expandedKey === sys.key ? null : sys.key)}
                    />
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 dark:text-neutral-600 leading-relaxed text-center max-w-xl mx-auto">
                These signals are based on population-level health data and your profile. They are not a diagnosis.
                Always speak to a qualified doctor before making any health decisions.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
