import React from 'react';
import { 
  Shield, 
  Users, 
  DollarSign, 
  Activity, 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  FilePlus,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';

export default function DashboardView({ metrics, onNavigate, onOpenNewPolicy, onOpenClaimIntake }) {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const formatCurrency = (val) => {
    if (val == null) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const getLossRatioBadge = (ratio) => {
    if (ratio == null || ratio === 0) return { label: '0.0% (Optimal)', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (ratio < 65) return { label: `${ratio.toFixed(1)}% (Healthy)`, color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    if (ratio < 80) return { label: `${ratio.toFixed(1)}% (Watchlist)`, color: 'text-amber-700 bg-amber-100 border-amber-300' };
    return { label: `${ratio.toFixed(1)}% (Elevated Loss)`, color: 'text-rose-700 bg-rose-100 border-rose-300' };
  };

  const lossBadge = getLossRatioBadge(metrics.portfolioLossRatio);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Executive Policy Portfolio Overview</h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time monitoring across group underwriting risk, renewal schedules, claims processing, and group premium billing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenNewPolicy}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <FilePlus className="w-4 h-4" />
              <span>New Group Policy</span>
            </button>
            <button
              onClick={onOpenClaimIntake}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-sm shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Intake Claim</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Policies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Group Policies</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.totalActivePolicies}</span>
            <span className="text-xs text-slate-500 font-medium">corporate accounts</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium cursor-pointer hover:underline" onClick={() => onNavigate('policies')}>
            <span>View policies & census</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Covered Lives */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Covered Lives</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.totalCoveredLives}</span>
            <span className="text-xs text-slate-500 font-medium">enrolled members</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Active corporate employee census
          </div>
        </div>

        {/* Gross Written Premium */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Written Premium</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{formatCurrency(metrics.totalGrossWrittenPremium)}</span>
          </div>
          <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Annualized contracted premium</span>
          </div>
        </div>

        {/* Portfolio Loss Ratio */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portfolio Loss Ratio</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{metrics.portfolioLossRatio?.toFixed(1) || '0.0'}%</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${lossBadge.color}`}>
              {lossBadge.label}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Settled: {formatCurrency(metrics.totalClaimsSettled)}
          </div>
        </div>
      </div>

      {/* Secondary Operational Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pending Underwriting */}
        <div 
          onClick={() => onNavigate('underwriting')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Underwriting Queue</h4>
                <p className="text-xs text-slate-500">Pending risk assessment</p>
              </div>
            </div>
            <span className="text-2xl font-black text-amber-600">{metrics.pendingUnderwritingCases}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Automated & manual decisioning</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
        </div>

        {/* Open Claims */}
        <div 
          onClick={() => onNavigate('claims')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-rose-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Open Claims In-Review</h4>
                <p className="text-xs text-slate-500">Adjudication pipeline</p>
              </div>
            </div>
            <span className="text-2xl font-black text-rose-600">{metrics.openClaimsCount}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Hospitalization, surgical, outpatient</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div 
          onClick={() => onNavigate('billing')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Outstanding Invoices</h4>
                <p className="text-xs text-slate-500">Uncollected premium</p>
              </div>
            </div>
            <span className="text-xl font-black text-slate-900">{formatCurrency(metrics.totalOutstandingReceivables)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Issued & overdue receivables</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </div>
      </div>

      {/* Product Breakdown & Claims Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Mix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Group Products Portfolio</h3>
          <p className="text-xs text-slate-500 mb-4">Contracted corporate policies by insurance line</p>
          <div className="space-y-3">
            {metrics.policiesByProduct && Object.entries(metrics.policiesByProduct).map(([key, count]) => {
              const display = key.replace('GROUP_', '').toLowerCase().replace(/_/g, ' ');
              const percentage = Math.round((count / (metrics.totalActivePolicies || 1)) * 100);
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="capitalize text-slate-700">{display} Insurance</span>
                    <span className="text-slate-500">{count} {count === 1 ? 'policy' : 'policies'}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, percentage || 25)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Claims Status Mix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Claims Intake & Processing Status</h3>
          <p className="text-xs text-slate-500 mb-4">Adjudication funnel across registered group claims</p>
          <div className="grid grid-cols-2 gap-3">
            {metrics.claimsByStatus && Object.entries(metrics.claimsByStatus).map(([status, count]) => {
              const colors = {
                SUBMITTED: 'bg-blue-50 border-blue-200 text-blue-700',
                UNDER_REVIEW: 'bg-amber-50 border-amber-200 text-amber-700',
                SETTLED: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                APPROVED: 'bg-teal-50 border-teal-200 text-teal-700',
                REJECTED: 'bg-rose-50 border-rose-200 text-rose-700',
              };
              return (
                <div key={status} className={`p-4 rounded-xl border ${colors[status] || 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <div className="text-xs font-semibold uppercase tracking-wider">{status.replace('_', ' ')}</div>
                  <div className="text-2xl font-black mt-1">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
