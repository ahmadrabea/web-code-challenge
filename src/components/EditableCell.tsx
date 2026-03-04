import React, { useState, useEffect, useCallback } from 'react';
import { useFlightContext } from '../context/FlightContext';

interface EditableCellProps {
  rowId: string;
  columnId: string;
  value: string;
}

export const EditableCell = React.memo(function EditableCell({
  rowId,
  columnId,
  value,
}: EditableCellProps) {
  const { updateCell } = useFlightContext();
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    },
    []
  );

  const handleBlur = useCallback(() => {
    if (localValue !== value) {
      updateCell(rowId, columnId, localValue);
    }
  }, [localValue, value, rowId, columnId, updateCell]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
      }
    },
    []
  );

  return (
    <div style={{ display: 'grid' }}>
      <span
        style={{
          visibility: 'hidden',
          gridArea: '1/1',
          padding: '4px 0',
          fontSize: '0.875rem',
          whiteSpace: 'pre',
        }}
      >
        {localValue || ' '}
      </span>
      <input
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          gridArea: '1/1',
          border: 'none',
          background: 'transparent',
          width: '100%',
          minWidth: 0,
          padding: '4px 0',
          fontSize: '0.875rem',
          fontFamily: 'inherit',
          color: 'inherit',
          outline: 'none',
        }}
      />
    </div>
  );
});
