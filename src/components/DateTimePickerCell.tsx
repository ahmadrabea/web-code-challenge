import React, { useState, useEffect, useCallback } from 'react';
import { useFlightContext } from '../context/FlightContext';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';
import { styled } from '@mui/material/styles';

interface DateTimePickerCellProps {
  rowId: string;
  columnId: string;
  value: string;
}

const StyledDateTimePicker = styled(DateTimePicker)({
  '& .MuiInputBase-input': {
    padding: '4px 0',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    color: 'inherit',
    minWidth: '160px',
  },
  '& .MuiInputBase-root': {
    '&:before, &:after': {
      display: 'none',
    },
  },
  '& .MuiIconButton-root': {
    padding: 4,
  },
});

export const DateTimePickerCell = React.memo(function DateTimePickerCell({
  rowId,
  columnId,
  value,
}: DateTimePickerCellProps) {
  const { updateCell } = useFlightContext();
  const [localValue, setLocalValue] = useState<Dayjs | null>(dayjs(value));

  useEffect(() => {
    // Attempt to parse the incoming date string
    const parsed = dayjs(value);
    setLocalValue(parsed.isValid() ? parsed : null);
  }, [value]);

  const handleChange = useCallback(
    (newValue: Dayjs | null) => {
      setLocalValue(newValue);
      if (newValue && newValue.isValid()) {
        const formatted = newValue.toDate().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        updateCell(rowId, columnId, formatted);
      }
    },
    [rowId, columnId, updateCell]
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
          pointerEvents: 'none',
        }}
      >
        {value || ' '}
      </span>
      <div style={{ gridArea: '1/1', display: 'flex' }}>
        <StyledDateTimePicker
          value={localValue}
          onChange={handleChange}
          slotProps={{
            textField: {
              variant: 'standard',
              fullWidth: true,
            },
          }}
        />
      </div>
    </div>
  );
});
