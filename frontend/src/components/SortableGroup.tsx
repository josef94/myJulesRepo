import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Gruppe } from '../data/types';

interface SortableGroupProps {
  gruppe: Gruppe;
  children: React.ReactNode;
}

const SortableGroup: React.FC<SortableGroupProps> = ({ gruppe, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: gruppe.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="gruppe">
        <h2>{gruppe.name}</h2>
        {children}
      </div>
    </div>
  );
};

export default SortableGroup;
