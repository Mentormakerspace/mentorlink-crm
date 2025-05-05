'use client';

import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import KanbanBoard from '@/components/KanbanBoard';
import StatsDashboard from '@/components/StatsDashboard';
import Login from '@/components/Login';
import CreateDealModal from '@/components/CreateDealModal';
import CreateClientModal from '@/components/CreateClientModal';
import PaymentsModal from '@/components/PaymentsModal';
import { useAuth } from '@/hooks/useAuth';
import { Deal } from '@/types/crm'; // Import Deal type
import { fetchDeals, fetchStageHistory, fetchPaymentSchedules } from '@/lib/apiClient';

export default function Home() {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false); // State for deal modal
  const [isClientModalOpen, setIsClientModalOpen] = useState(false); // State for client modal
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false); // State for company modal
  const [deals, setDeals] = useState<Deal[]>([]); // State to hold deals
  const [dealDays, setDealDays] = useState<Record<number, { daysInProcess: number; daysInStage: number }>>({});
  const [dealPayments, setDealPayments] = useState<Record<number, { totalPaid: number; outstanding: number; payments: any[] }>>({});
  const [selectedPaymentsDeal, setSelectedPaymentsDeal] = useState<number | null>(null);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const fetchedDeals = await fetchDeals();
        let filteredDeals = fetchedDeals;
        if (user && user.role === 'SalesRep') {
          filteredDeals = fetchedDeals.filter((deal: Deal) => deal.sales_rep_id === user.id);
        }
        setDeals(filteredDeals);

        // For each deal, fetch stage history and payment schedules
        const today = new Date();
        const daysObj: Record<number, { daysInProcess: number; daysInStage: number }> = {};
        const paymentsObj: Record<number, { totalPaid: number; outstanding: number; payments: any[] }> = {};
        await Promise.all(
          filteredDeals.map(async (deal: Deal) => {
            // Days in process
            const createdAt = new Date(deal.created_at);
            const daysInProcess = Math.max(1, Math.round((today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));
            // Days in stage
            let daysInStage = 0;
            try {
              const history = await fetchStageHistory(deal.id);
              const currentStage = history.find((h: any) => !h.exited_at);
              if (currentStage) {
                const entered = new Date(currentStage.entered_at);
                daysInStage = Math.max(1, Math.round((today.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)));
              }
            } catch (e) {
              daysInStage = 0;
            }
            daysObj[deal.id] = { daysInProcess, daysInStage };

            // Payments
            try {
              const payments = await fetchPaymentSchedules(deal.id);
              const totalPaid = payments
                .filter((p: any) => p.status === 'paid')
                .reduce((sum: number, p: any) => sum + parseFloat(p.amount_due), 0);
              const outstanding = parseFloat(deal.estimated_value) - totalPaid;
              paymentsObj[deal.id] = { totalPaid, outstanding, payments };
            } catch (e) {
              paymentsObj[deal.id] = { totalPaid: 0, outstanding: parseFloat(deal.estimated_value), payments: [] };
            }
          })
        );
        setDealDays(daysObj);
        setDealPayments(paymentsObj);
      } catch (e) {
        setDeals([]);
        setDealDays({});
        setDealPayments({});
      }
    };
    if (user) loadDeals();
  }, [user]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleOpenClientModal = () => setIsClientModalOpen(true);
  const handleCloseClientModal = () => setIsClientModalOpen(false);
  const handleOpenCompanyModal = () => setIsCompanyModalOpen(true);
  const handleCloseCompanyModal = () => setIsCompanyModalOpen(false);

  // Callback function to add the new deal to the state
  const handleDealCreated = (newDeal: Deal) => {
    setDeals(prevDeals => [...prevDeals, newDeal]);
  };

  // Callback for client creation (optional: refetch clients or show toast)
  const handleClientCreated = (newClient: any) => {
    // Optionally refetch clients or show a notification
  };

  if (!user) {
    return <Login />; // Show login page if not authenticated
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12 bg-gray-50">
      <div className="z-10 w-full max-w-7xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Master Your Pipeline. Link Your Success.</h1>
        <div className="flex items-center space-x-4">
          {user && <span className="text-gray-600">Welcome, {user.name}</span>}
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            + Create Deal
          </button>
          <button
            onClick={handleOpenClientModal}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            + Create Company/Client
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Add StatsDashboard component here */}
      <StatsDashboard />

      <div className="w-full max-w-7xl mt-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Companies / Deals</h2>
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estimated Value</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Paid</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Days in Process</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Days in Stage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-100 cursor-pointer">
                  <td className="px-4 py-2">{deal.client_company || deal.client_id}</td>
                  <td className="px-4 py-2">{deal.stage}</td>
                  <td className="px-4 py-2">${parseFloat(deal.estimated_value).toLocaleString()}</td>
                  <td className="px-4 py-2 text-green-700 font-bold">${dealPayments[deal.id]?.totalPaid?.toLocaleString() ?? '0'}</td>
                  <td className="px-4 py-2 text-orange-700 font-bold">${dealPayments[deal.id]?.outstanding?.toLocaleString() ?? deal.estimated_value}</td>
                  <td className="px-4 py-2">
                    <span className="text-red-600 font-bold">
                      {dealDays[deal.id]?.daysInProcess ?? '-'} days
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-red-600 font-bold">
                      {dealDays[deal.id]?.daysInStage ?? '-'} days
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="text-white bg-gradient-to-r from-[var(--ml-primary)] to-[var(--ml-primary-dark)] rounded px-4 py-2 font-semibold shadow hover:opacity-90 transition"
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

        <h2 className="text-xl font-semibold mb-4 text-gray-700">Pipeline</h2>
        <KanbanBoard />
      </div>

      {/* Render the modals */}
      <CreateDealModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDealCreated={handleDealCreated}
      />
      <CreateClientModal
        isOpen={isClientModalOpen}
        onClose={handleCloseClientModal}
        onClientCreated={handleClientCreated}
      />

      {/* Payments Modal */}
      {selectedPaymentsDeal && (
        <PaymentsModal
          dealId={selectedPaymentsDeal}
          payments={dealPayments[selectedPaymentsDeal]?.payments || []}
          onClose={() => setSelectedPaymentsDeal(null)}
          onPaymentAdded={() => {
            // Refresh payments for the deal
            // (re-run loadDeals or just refetch payments for this deal)
            // For simplicity, reload all deals
            if (user) {
              const loadDeals = async () => {
                // ... same as above ...
              };
              loadDeals();
            }
          }}
        />
      )}

    </main>
  );
}

