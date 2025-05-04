import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Deal } from '@/types/crm';
import DealCard from './DealCard';

interface KanbanColumnProps {
  id: string; // Unique ID for the droppable column (e.g., 'column-Lead')
  title: string;
  deals: Deal[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, deals }) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  // Create an array of deal IDs for SortableContext
  const dealIds = deals.map(deal => `deal-${deal.id}`);

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-200 rounded-lg p-3 w-72 flex-shrink-0 flex flex-col h-full"
      style={{ minHeight: '300px' }} // Ensure columns have a minimum height
    >
      <h2 className="font-semibold mb-3 text-lg text-gray-700 px-1">{title}</h2>
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 flex-grow overflow-y-auto">
          {deals.length > 0 ? (
            deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))
          ) : (
            <div className="text-center text-gray-500 text-sm pt-4">No deals in this stage</div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;

