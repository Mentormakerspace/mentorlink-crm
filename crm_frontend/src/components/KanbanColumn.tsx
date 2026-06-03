'use client';

import React from 'react';
import DealCard from './DealCard';
import { Deal } from '../types/crm';

interface KanbanColumnProps {
  stage: string;
  deals: Deal[];
  onDrop: (e: React.DragEvent, stage: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, dealId: number) => void;
}

export default function KanbanColumn({ stage, deals, onDrop, onDragOver, onDragStart }: KanbanColumnProps) {
  const totalValue = deals.reduce((sum, d) => sum + parseFloat(d.estimated_value || '0'), 0);

  return (
    <div
      className="flex-1 min-w-[220px] max-w-[280px] flex flex-col bg-gray-50 rounded-lg border border-gray-200"
      onDrop={(e) => onDrop(e, stage)}
      onDragOver={onDragOver}
    >
      <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{stage}</span>
          <span className="text-xs bg-gray-200 text-gray-600 font-medium px-1.5 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        {deals.length > 0 && (
          <span className="text-xs text-gray-500 font-medium">
            ${totalValue.toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex-1 p-2 overflow-y-auto min-h-[80px]">
        {deals.length > 0 ? (
          deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onDragStart={onDragStart} />
          ))
        ) : (
          <div className="flex items-center justify-center h-16 text-xs text-gray-400">
            No deals
          </div>
        )}
      </div>
    </div>
  );
}
