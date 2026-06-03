'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import KanbanColumn from './KanbanColumn';
import { Deal } from '../types/crm';

const stages = ['Lead', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export default function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const fetchDealsData = async () => {
      try {
        const fetchedDeals = await apiClient.fetchDeals();
        setDeals(fetchedDeals);
      } catch (error) {
        console.error('Error fetching deals:', error);
      }
    };
    fetchDealsData();
  }, []);

  const handleDragStart = (e: React.DragEvent, dealId: number) => {
    e.dataTransfer.setData('dealId', dealId.toString());
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const dealId = parseInt(e.dataTransfer.getData('dealId'));
    const deal = deals.find(d => d.id === dealId);
    if (deal && deal.stage !== newStage) {
      try {
        await apiClient.updateDeal(dealId, { stage: newStage });
        setDeals(deals.map(d => (d.id === dealId ? { ...d, stage: newStage } : d)));
      } catch (error) {
        console.error('Error updating deal stage:', error);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {stages.map(stage => (
        <KanbanColumn
          key={stage}
          stage={stage}
          deals={deals.filter(deal => deal.stage === stage)}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
        />
      ))}
    </div>
  );
}