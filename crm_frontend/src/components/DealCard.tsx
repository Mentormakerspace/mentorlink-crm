import React from 'react';
import { Deal } from '../types/crm';

interface DealCardProps {
  deal: Deal;
  onDragStart: (e: React.DragEvent, dealId: number) => void;
}

const stageColors: Record<string, string> = {
  Lead: 'bg-gray-100 text-gray-600',
  Qualification: 'bg-blue-50 text-blue-700',
  Proposal: 'bg-purple-50 text-purple-700',
  Negotiation: 'bg-amber-50 text-amber-700',
  'Closed Won': 'bg-green-50 text-green-700',
  'Closed Lost': 'bg-red-50 text-red-600',
  Prospect: 'bg-blue-50 text-blue-700',
  Contract: 'bg-indigo-50 text-indigo-700',
  Deposit: 'bg-teal-50 text-teal-700',
  'Staged Payments': 'bg-cyan-50 text-cyan-700',
  'Project Delivery': 'bg-orange-50 text-orange-700',
  'Final Payment': 'bg-green-50 text-green-700',
};

const DealCard: React.FC<DealCardProps> = ({ deal, onDragStart }) => {
  const value = parseFloat(deal.estimated_value || '0');
  const probability = Math.round((deal.probability || 0) * 100);
  const stageColor = stageColors[deal.stage] || 'bg-gray-100 text-gray-600';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing mb-2 hover:border-[#6C63FF] hover:shadow-sm transition-all select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-sm text-gray-900 leading-tight">
          {deal.client_company || `Client #${deal.client_id}`}
        </p>
        <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${stageColor}`}>
          {deal.stage}
        </span>
      </div>
      <p className="text-base font-bold text-gray-900 mb-1">
        ${value.toLocaleString()}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{probability}% probability</span>
        <span>{deal.sales_rep_name || `Rep #${deal.sales_rep_id}`}</span>
      </div>
    </div>
  );
};

export default DealCard;
