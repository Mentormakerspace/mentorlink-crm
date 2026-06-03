import React, { useEffect, useState } from 'react';
import { fetchDeals, fetchStageHistory } from '../lib/apiClient';
import { Deal, StageHistory } from '../types/crm';

const STAGES = [
  'Lead',
  'Prospect',
  'Proposal',
  'Contract',
  'Deposit',
  'Staged Payments',
  'Project Delivery',
  'Final Payment',
];

const contractedStages = ['Contract', 'Deposit', 'Staged Payments', 'Project Delivery', 'Final Payment'];

const StatsDashboard = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [averageTimeInStage, setAverageTimeInStage] = useState<string>('N/A');

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const fetchedDeals = await fetchDeals();
        setDeals(fetchedDeals || []);
        setError(null);

        const allStageHistories: StageHistory[] = [];
        await Promise.all(
          (fetchedDeals || []).map(async (deal: Deal) => {
            try {
              const histories = await fetchStageHistory(deal.id);
              allStageHistories.push(...histories);
            } catch {
              // ignore individual deal errors
            }
          })
        );

        if (allStageHistories.length > 0) {
          const today = new Date();
          let totalDays = 0;
          allStageHistories.forEach((history) => {
            const entered = new Date(history.entered_at);
            const exited = history.exited_at ? new Date(history.exited_at) : today;
            const diffDays = Math.max(1, Math.round((exited.getTime() - entered.getTime()) / (1000 * 60 * 60 * 24)));
            totalDays += diffDays;
          });
          setAverageTimeInStage(`${(totalDays / allStageHistories.length).toFixed(1)} days`);
        } else {
          setAverageTimeInStage('N/A');
        }
      } catch {
        setError('Failed to load stats.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const totalPipelineValue = deals.reduce((sum, d) => sum + parseFloat(d.estimated_value || '0'), 0);
  const contractedDeals = deals.filter(d => contractedStages.includes(d.stage));
  const totalContractedValue = contractedDeals.reduce((sum, d) => sum + parseFloat(d.estimated_value || '0'), 0);
  const averageDealSize = deals.length > 0 ? totalPipelineValue / deals.length : 0;
  const depositDeals = deals.filter(d => d.stage === 'Deposit');
  const totalDeposits = depositDeals.reduce((sum, d) => sum + parseFloat(d.estimated_value || '0'), 0);
  const currentReceivables = totalPipelineValue - totalDeposits;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-3 bg-gray-200 rounded mb-3 w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-red-600 mb-6">{error}</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full mb-6">
      <StatCard label="Pipeline Value" value={`$${totalPipelineValue.toLocaleString()}`} accent />
      <StatCard label="Contracted Value" value={`$${totalContractedValue.toLocaleString()}`} />
      <StatCard label="Receivables" value={`$${currentReceivables.toLocaleString()}`} />
      <StatCard label="Avg Deal Size" value={`$${averageDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
      <StatCard label="Total Deals" value={deals.length.toString()} />
      <StatCard label="Avg Time in Stage" value={averageTimeInStage} />
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, accent }) => (
  <div className={`rounded-lg border p-4 ${accent ? 'bg-[#6C63FF] border-[#6C63FF] text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
    <p className={`text-xs font-medium mb-1 ${accent ? 'text-purple-100' : 'text-gray-500'}`}>{label}</p>
    <p className="text-lg font-bold leading-tight">{value}</p>
  </div>
);

export default StatsDashboard;
