import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '@/types/crm';

interface DealCardProps {
  deal: Deal;
}

const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `deal-${deal.id}`,
    data: { // Pass deal data for use in drag events if needed
      type: 'Deal',
      deal,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded shadow cursor-grab mb-2 border border-gray-200 hover:shadow-md"
    >
      <p className="font-medium text-sm mb-1">{deal.client_company || `Client ID: ${deal.client_id}`}</p>
      {/* TODO: Add inline editing for estimated_value */}
      <p className="text-xs text-gray-600">Value: ${parseFloat(deal.estimated_value).toLocaleString()}</p>
      {/* TODO: Add inline editing for probability */}
      <p className="text-xs text-gray-500">Prob: {deal.probability * 100}%</p>
      <p className="text-xs text-gray-500 mt-1">Rep: {deal.sales_rep_name || `ID: ${deal.sales_rep_id}`}</p>
      {/* Add more details or actions as needed */}
    </div>
  );
};

export default DealCard;
