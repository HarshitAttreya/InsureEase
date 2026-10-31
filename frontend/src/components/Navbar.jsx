import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileText, 
  FileCheck, 
  RefreshCw, 
  Stethoscope, 
  CreditCard, 
  Database,
  RotateCcw
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onResetData, isResetting, pendingUnderwriting, openClaims }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'policies', label: 'Group Policies & Census', icon: FileText },
    { 
      id: 'underwriting', 
      label: 'Underwriting Hub', 
      icon: FileCheck,
      badge: pendingUnderwriting > 0 ? pendingUnderwriting : null,
      badgeColor: 'bg-amber-500'
    },
    { id: 'renewals', label: 'Renewals Desk', icon: RefreshCw },
    { 
      id: 'claims', 
      label: 'Claims Processing', 
      icon: Stethoscope,
      badge: openClaims > 0 ? openClaims : null,
      badgeColor: 'bg-rose-500'
    },
    { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
  ];

  const getH2ConsoleUrl = () => {
    const rawApi = import.meta.env.VITE_API_URL;
    if (rawApi && rawApi.startsWith('http')) {
      try {
        const url = new URL(rawApi);
        return `${url.origin}/h2-console`;
      } catch (e) {
        // fallback
      }
    }
    return 'http://localhost:8080/h2-console';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  InsureEase
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  InsureGroup Platform
                </span>
              </div>
              <p className="text-xs text-slate-400">Enterprise Group Policy Administration</p>
            </div>
          </div>

          {/* Quick Actions & System Info */}
          <div className="flex items-center gap-3">
            {/* Database indicator */}
            <a
              href={getH2ConsoleUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all group"
              title="Open H2 Database Web Console in a new tab"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <Database className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              <span>H2 DB Console</span>
            </a>

            {/* Reset Demo Data Button */}
            <button
              onClick={onResetData}
              disabled={isResetting}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-200 transition-all disabled:opacity-50"
              title="Reset sample corporate data"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
              <span>{isResetting ? 'Resetting...' : 'Reset Demo Data'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
