import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Header, flexRender } from '@tanstack/react-table';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { FlightRow } from '../types/flightTypes';

interface DraggableHeaderProps {
  header: Header<FlightRow, unknown>;
}

export function DraggableHeader({ header }: DraggableHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: header.column.id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative',
    whiteSpace: 'nowrap',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#475569',
    background: isDragging ? '#e3f2fd' : '#f8fafc',
    border: '1px solid #e2e8f0',
    borderBottom: '2px solid #cbd5e1',
    cursor: isDragging ? 'grabbing' : 'default',
    userSelect: 'none',
  };

  return (
    <th ref={setNodeRef} style={style} colSpan={header.colSpan}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <DragIndicatorIcon
          {...attributes}
          {...listeners}
          sx={{
            fontSize: 18,
            color: '#94a3b8',
            cursor: 'grab',
            '&:hover': { color: '#1976d2' },
            '&:active': { cursor: 'grabbing' },
          }}
        />
        {flexRender(header.column.columnDef.header, header.getContext())}
      </div>
    </th>
  );
}
