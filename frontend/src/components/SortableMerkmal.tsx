import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Merkmal } from '../data/types';

interface SortableMerkmalProps {
  merkmal: Merkmal;
  children: React.ReactNode;
}

const SortableMerkmal: React.FC<SortableMerkmalProps> = ({ merkmal, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: merkmal.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="merkmal">
        {children}
      </div>
    </div>
  );
};

export default SortableMerkmal;
