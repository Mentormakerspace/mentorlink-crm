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
  return (
    <div
      className="flex-1 min-w-[200px] bg-gray-100 p-4 rounded-lg"
      onDrop={(e) => onDrop(e, stage)}
      onDragOver={onDragOver}
    >
      <h3 className="text-lg font-semibold mb-4">{stage}</h3>
      {deals.length > 0 ? (
        deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))
      ) : (
        <div className="text-center text-gray-500 text-sm pt-4">No deals in this stage</div>
      )}
    </div>
  );
}
