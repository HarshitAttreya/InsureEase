import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import PoliciesView from './components/PoliciesView';
import UnderwritingView from './components/UnderwritingView';
import RenewalsView from './components/RenewalsView';
import ClaimsView from './components/ClaimsView';
import BillingView from './components/BillingView';
import Toast from './components/Toast';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [claims, setClaims] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadAllData = useCallback(async () => {
    try {
      const [
        metricsRes,
        policiesRes,
        orgsRes,
        assessmentsRes,
        renewalsRes,
        claimsRes,
        invoicesRes,
      ] = await Promise.all([
        api.getDashboardSummary(),
        api.getPolicies(),
        api.getOrganizations(),
        api.getUnderwritingAssessments(),
        api.getRenewals(),
        api.getClaims(),
        api.getInvoices(),
      ]);

      setMetrics(metricsRes);
      setPolicies(policiesRes || []);
      setOrganizations(orgsRes || []);
      setAssessments(assessmentsRes || []);
      setRenewals(renewalsRes || []);
      setClaims(claimsRes || []);
      setInvoices(invoicesRes || []);
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
      showToast('Backend connection error. Make sure Spring Boot backend is running on port 8080.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await api.resetDemoData();
      showToast('Demo corporate data successfully re-seeded!', 'success');
      await loadAllData();
    } catch (err) {
      showToast('Error resetting data: ' + err.message, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        isResetting={isResetting}
        pendingUnderwriting={metrics?.pendingUnderwritingCases || 0}
        openClaims={metrics?.openClaimsCount || 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-sm font-semibold text-slate-500">Connecting to InsureEase Core Engine...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                metrics={metrics}
                onNavigate={setActiveTab}
                onOpenNewPolicy={() => setActiveTab('policies')}
                onOpenClaimIntake={() => setActiveTab('claims')}
              />
            )}

            {activeTab === 'policies' && (
              <PoliciesView
                policies={policies}
                organizations={organizations}
                onRefresh={loadAllData}
                onCreatePolicy={api.createPolicy}
                onAddMember={api.addCensusMember}
                onFetchCensus={api.getCensusMembers}
                showToast={showToast}
              />
            )}

            {activeTab === 'underwriting' && (
              <UnderwritingView
                policies={policies}
                assessments={assessments}
                onEvaluateRisk={api.evaluateRisk}
                onSubmitDecision={api.submitUnderwritingDecision}
                onRefresh={loadAllData}
                showToast={showToast}
              />
            )}

            {activeTab === 'renewals' && (
              <RenewalsView
                policies={policies}
                renewals={renewals}
                onGenerateQuote={api.generateRenewalQuote}
                onBindRenewal={api.bindRenewal}
                onRefresh={loadAllData}
                showToast={showToast}
              />
            )}

            {activeTab === 'claims' && (
              <ClaimsView
                claims={claims}
                policies={policies}
                onIntakeClaim={api.intakeClaim}
                onAdjudicateClaim={api.adjudicateClaim}
                onFetchCensus={api.getCensusMembers}
                onRefresh={loadAllData}
                showToast={showToast}
              />
            )}

            {activeTab === 'billing' && (
              <BillingView
                invoices={invoices}
                policies={policies}
                onCreateInvoice={api.createInvoice}
                onRecordPayment={api.recordPayment}
                onRefresh={loadAllData}
                showToast={showToast}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} <strong>InsureEase</strong> — InsureGroup Management Platform</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Spring Boot 4.1 + JPA</span>
            <span>&bull;</span>
            <span>H2 In-Memory Database</span>
            <span>&bull;</span>
            <span>React + Tailwind CSS</span>
          </div>
        </div>
      </footer>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
