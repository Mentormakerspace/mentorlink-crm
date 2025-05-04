import React, { useEffect, useState } from 'react';
import { fetchDeals, fetchStageHistory } from '@/lib/apiClient';
import { Deal, StageHistory } from '@/types/crm';

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

        // Fetch all stage histories in parallel
        const allStageHistories: StageHistory[] = [];
        await Promise.all(
          (fetchedDeals || []).map(async (deal: Deal) => {
            try {
              const histories = await fetchStageHistory(deal.id);
              allStageHistories.push(...histories);
            } catch (e) {
              // Ignore errors for individual deals
            }
          })
        );

        // Calculate average time in stage
        if (allStageHistories.length > 0) {
          const today = new Date();
          let totalDays = 0;
          allStageHistories.forEach((history) => {
            const entered = new Date(history.entered_at);
            const exited = history.exited_at ? new Date(history.exited_at) : today;
            const diffTime = exited.getTime() - entered.getTime();
            const diffDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
            totalDays += diffDays;
          });
          const avg = totalDays / allStageHistories.length;
          setAverageTimeInStage(`${avg.toFixed(1)} days`);
        } else {
          setAverageTimeInStage('N/A');
        }
      } catch (err: any) {
        setError('Failed to load stats.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Calculate stats
  const totalPipelineValue = deals.reduce((sum, deal) => sum + parseFloat(deal.estimated_value || '0'), 0);
  const contractedDeals = deals.filter(deal => contractedStages.includes(deal.stage));
  const totalContractedValue = contractedDeals.reduce((sum, deal) => sum + parseFloat(deal.estimated_value || '0'), 0);
  const averageDealSize = deals.length > 0 ? totalPipelineValue / deals.length : 0;

  // Receivables = Total Pipeline Value - Total Deposits (Deposit stage)
  const depositDeals = deals.filter(deal => deal.stage === 'Deposit');
  const totalDeposits = depositDeals.reduce((sum, deal) => sum + parseFloat(deal.estimated_value || '0'), 0);
  const currentReceivables = totalPipelineValue - totalDeposits;

  // Placeholder for lead time (not implemented)
  const averageLeadTimePerStage = 'N/A';

  if (loading) {
    return <div className="text-center p-4">Loading stats...</div>;
  }
  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-7xl mb-8">
      <StatCard title="Total Pipeline Value" value={`$${totalPipelineValue.toLocaleString()}`} />
      <StatCard title="Total Contracted Value" value={`$${totalContractedValue.toLocaleString()}`} />
      <StatCard title="Current Receivables" value={`$${currentReceivables.toLocaleString()}`} />
      <StatCard title="Average Deal Size" value={`$${averageDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
      <StatCard title="Avg. Lead Time Per Stage" value={averageLeadTimePerStage} />
      <StatCard title="Avg. Time In Stage" value={averageTimeInStage} />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
};

export default StatsDashboard;
