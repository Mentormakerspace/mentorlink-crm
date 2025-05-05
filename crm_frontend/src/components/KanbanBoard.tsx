import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { fetchDeals, updateDeal } from '../lib/apiClient';
import { Deal } from '../types/crm';
import DealCard from './DealCard';
import KanbanColumn from './KanbanColumn';

// Define stages - In a real app, these might be fetched or configurable
const STAGES = ['Lead', 'Prospect', 'Proposal', 'Contract', 'Deposit', 'Staged Payments', 'Project Delivery', 'Final Payment'];

const KanbanBoard = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Group deals by stage
  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter(deal => deal.stage === stage);
    return acc;
  }, {} as Record<string, Deal[]>);

  // Fetch deals on component mount
  useEffect(() => {
    const loadDeals = async () => {
      try {
        setLoading(true);
        const fetchedDeals = await fetchDeals();
        setDeals(fetchedDeals || []);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch deals:", err);
        setError("Failed to load deals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadDeals();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before starting a drag
      // Helps prevent accidental drags on click
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return; // Dropped outside a valid target

    const activeId = active.id;
    const overId = over.id;

    // Find the deal being dragged
    const draggedDeal = deals.find(deal => `deal-${deal.id}` === activeId);
    if (!draggedDeal) return;

    // Determine the target stage
    // 'over.id' could be a column ID (e.g., 'column-Lead') or a deal ID if dropped onto another deal
    let targetStage: string | null = null;
    if (String(overId).startsWith('column-')) {
        targetStage = String(overId).replace('column-', '');
    } else if (String(overId).startsWith('deal-')) {
        const targetDeal = deals.find(deal => `deal-${deal.id}` === overId);
        targetStage = targetDeal?.stage ?? null;
    }

    if (!targetStage || targetStage === draggedDeal.stage) {
      // Handle reordering within the same column if needed (not implemented here)
      console.log("No stage change or invalid target");
      return;
    }

    // Optimistic UI Update
    const originalDeals = [...deals];
    setDeals(prevDeals => {
        return prevDeals.map(deal =>
            deal.id === draggedDeal.id ? { ...deal, stage: targetStage! } : deal
        );
    });

    // API Call to update the deal stage
    try {
        await updateDeal(draggedDeal.id, { stage: targetStage });
        // Optionally re-fetch or confirm update
    } catch (error) {
        console.error("Failed to update deal stage:", error);
        setError("Failed to move deal. Please try again.");
        // Revert optimistic update on error
        setDeals(originalDeals);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading deals...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-600">{error}</div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 p-4 overflow-x-auto bg-gray-100 rounded-lg">
        {STAGES.map((stage) => (
          <KanbanColumn key={stage} id={`column-${stage}`} title={stage} deals={dealsByStage[stage] || []} />
        ))}
      </div>
    </DndContext>
  );
};

export default KanbanBoard;
