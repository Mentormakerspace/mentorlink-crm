'use client';

import React, { useState, useEffect, useCallback } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import StatsDashboard from '@/components/StatsDashboard';
import Login from '@/components/Login';
import CreateDealModal from '@/components/CreateDealModal';
import CreateClientModal from '@/components/CreateClientModal';
import PaymentsModal from '@/components/PaymentsModal';
import { useAuth } from '@/hooks/useAuth';
import { Deal } from '@/types/crm';
import { fetchDeals, fetchStageHistory, fetchPaymentSchedules } from '@/lib/apiClient';

type DealDays = Record<number, { daysInProcess: number; daysInStage: number }>;
type DealPayments = Record<number, { totalPaid: number; outstanding: number; payments: any[] }>;

export default function Home() {
  const { user, logout } = useAuth();
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealDays, setDealDays] = useState<DealDays>({});
  const [dealPayments, setDealPayments] = useState<DealPayments>({});
  const [selectedPaymentsDeal, setSelectedPaymentsDeal] = useState<number | null>(null);

  const loadDeals = useCallback(async () => {
    if (!user) return;
    try {
      const fetched = await fetchDeals();
      const filtered = user.role === 'SalesRep'
        ? fetched.filter((d: Deal) => d.sales_rep_id === user.id)
        : fetched;
      setDeals(filtered);

      const today = new Date();
      const daysObj: DealDays = {};
      const paymentsObj: DealPayments = {};

      await Promise.all(
        filtered.map(async (deal: Deal) => {
          const daysInProcess = Math.max(1, Math.round(
            (today.getTime() - new Date(deal.created_at).getTime()) / 86400000
          ));
          let daysInStage = 0;
          try {
            const history = await fetchStageHistory(deal.id);
            const current = history.find((h: any) => !h.exited_at);
            if (current) {
              daysInStage = Math.max(1, Math.round(
                (today.getTime() - new Date(current.entered_at).getTime()) / 86400000
              ));
            }
          } catch { /* ignore */ }
          daysObj[deal.id] = { daysInProcess, daysInStage };

          try {
            const payments = await fetchPaymentSchedules(deal.id);
            const totalPaid = payments
              .filter((p: any) => p.status === 'paid')
              .reduce((sum: number, p: any) => sum + parseFloat(p.amount_due), 0);
            paymentsObj[deal.id] = {
              totalPaid,
              outstanding: parseFloat(deal.estimated_value) - totalPaid,
              payments,
            };
          } catch {
            paymentsObj[deal.id] = { totalPaid: 0, outstanding: parseFloat(deal.estimated_value), payments: [] };
          }
        })
      );

      setDealDays(daysObj);
      setDealPayments(paymentsObj);
    } catch {
      setDeals([]);
    }
  }, [user]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const handleDealCreated = (newDeal: Deal) => {
    setDeals(prev => [...prev, newDeal]);
  };

  const handlePaymentAdded = async () => {
    if (selectedPaymentsDeal) {
      try {
        const payments = await fetchPaymentSchedules(selectedPaymentsDeal);
        const deal = deals.find(d => d.id === selectedPaymentsDeal);
        if (deal) {
          const totalPaid = payments
            .filter((p: any) => p.status === 'paid')
            .reduce((sum: number, p: any) => sum + parseFloat(p.amount_due), 0);
          setDealPayments(prev => ({
            ...prev,
            [selectedPaymentsDeal]: {
              totalPaid,
              outstanding: parseFloat(deal.estimated_value) - totalPaid,
              payments,
            },
          }));
        }
      } catch { /* ignore */ }
    }
  };

  const stageColor = (stage: string) => {
    const map: Record<string, string> = {
      Lead: 'bg-gray-100 text-gray-600',
      Qualification: 'bg-blue-50 text-blue-700',
      Proposal: 'bg-purple-50 text-purple-700',
      Negotiation: 'bg-amber-50 text-amber-700',
      'Closed Won': 'bg-green-50 text-green-700',
      'Closed Lost': 'bg-red-50 text-red-600',
      Prospect: 'bg-blue-50 text-blue-700',
      Contract: 'bg-indigo-50 text-indigo-700',
      Deposit: 'bg-teal-50 text-teal-700',
    };
    return map[stage] || 'bg-gray-100 text-gray-600';
  };

  const daysBadge = (days: number) => {
    if (days <= 7) return 'text-green-700';
    if (days <= 21) return 'text-amber-700';
    return 'text-red-600';
  };

  if (!user) return <Login />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MentorLink" className="h-7 w-7 object-contain" />
            <span className="font-bold text-gray-900 text-sm tracking-tight">MentorLink CRM</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {user.name}
              {user.role !== 'SalesRep' && (
                <span className="ml-1.5 text-xs bg-purple-50 text-purple-700 font-medium px-1.5 py-0.5 rounded-full">
                  {user.role}
                </span>
              )}
            </span>
            {user.role === 'Admin' || user.role === 'Owner' ? (
              <a
                href="/admin"
                className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-2.5 py-1.5 rounded-md transition-colors"
              >
                Admin
              </a>
            ) : null}
            <button
              onClick={logout}
              className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-2.5 py-1.5 rounded-md transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">
        {/* Action bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-gray-900">Pipeline</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="text-sm font-medium text-gray-700 border border-gray-200 bg-white px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
            >
              + Client
            </button>
            <button
              onClick={() => setIsDealModalOpen(true)}
              className="text-sm font-semibold text-white px-3 py-1.5 rounded-md bg-[#6C63FF] hover:bg-[#5A52E0] transition-colors"
            >
              + New Deal
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatsDashboard />

        {/* Deals table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">All Deals</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Company</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Stage</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Value</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Paid</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Outstanding</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">In Process</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">In Stage</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deals.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">
                      No deals yet. Create your first deal to get started.
                    </td>
                  </tr>
                )}
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {deal.client_company || `Client #${deal.client_id}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stageColor(deal.stage)}`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ${parseFloat(deal.estimated_value).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-green-700 font-medium">
                      ${(dealPayments[deal.id]?.totalPaid ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 font-medium">
                      ${(dealPayments[deal.id]?.outstanding ?? parseFloat(deal.estimated_value)).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold text-xs ${daysBadge(dealDays[deal.id]?.daysInProcess ?? 0)}`}>
                        {dealDays[deal.id]?.daysInProcess ?? '—'} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold text-xs ${daysBadge(dealDays[deal.id]?.daysInStage ?? 0)}`}>
                        {dealDays[deal.id]?.daysInStage ?? '—'} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className="text-xs font-medium text-[#6C63FF] hover:text-[#5A52E0] transition-colors"
                        onClick={() => setSelectedPaymentsDeal(deal.id)}
                      >
                        Payments
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kanban */}
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Kanban View</h2>
        <KanbanBoard />
      </main>

      <CreateDealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        onDealCreated={handleDealCreated}
      />
      <CreateClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={() => {}}
      />
      {selectedPaymentsDeal !== null && (
        <PaymentsModal
          dealId={selectedPaymentsDeal}
          payments={dealPayments[selectedPaymentsDeal]?.payments || []}
          onClose={() => setSelectedPaymentsDeal(null)}
          onPaymentAdded={handlePaymentAdded}
        />
      )}
    </div>
  );
}
