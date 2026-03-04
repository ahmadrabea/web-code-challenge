import React, { useMemo, useCallback, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
  ColumnOrderState,
} from '@tanstack/react-table';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  InputBase,
  Tooltip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FilterListIcon from '@mui/icons-material/FilterList';
import FlightIcon from '@mui/icons-material/Flight';
import debounce from 'lodash/debounce';
import { FlightRow } from '../types/flightTypes';
import { useFlightContext } from '../context/FlightContext';
import { useFlightSearch } from '../hooks/useFlightSearch';
import { EditableCell } from './EditableCell';
import { DateTimePickerCell } from './DateTimePickerCell';
import { DraggableHeader } from './DraggableHeader';
import { Pagination } from './Pagination';

const columnHelper = createColumnHelper<FlightRow>();

const COLUMN_LABELS: Record<string, string> = {
  origin: 'Origin',
  destination: 'Destination',
  departure: 'Departure',
  arrival: 'Arrival',
  duration: 'Duration',
  stops: 'Stops',
  availableSeats: 'Seats',
};

export function FlightTable() {
  const { state, dispatch, filteredData, saveChanges, setColumnFilter } =
    useFlightContext();
  const { isLoading, isFetching } = useFlightSearch();
  const [showFilters, setShowFilters] = useState(false);
  const busy = isLoading || isFetching;

  const columns = useMemo<ColumnDef<FlightRow, string>[]>(
    () =>
      state.columnOrder.map((key) =>
        columnHelper.accessor(key, {
          id: key,
          header: () => COLUMN_LABELS[key] || key,
          cell: (info) => {
            if (key === 'departure' || key === 'arrival') {
              return (
                <DateTimePickerCell
                  rowId={info.row.original.id}
                  columnId={key}
                  value={info.getValue() ?? ''}
                />
              );
            }
            return (
              <EditableCell
                rowId={info.row.original.id}
                columnId={key}
                value={info.getValue() ?? ''}
              />
            );
          },
          enableColumnFilter: true,
        })
      ),
    [state.columnOrder]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnOrder: state.columnOrder as ColumnOrderState,
    },
    onColumnOrderChange: (updater) => {
      const newOrder =
        typeof updater === 'function'
          ? updater(state.columnOrder as ColumnOrderState)
          : updater;
      dispatch({ type: 'REORDER_COLUMNS', payload: newOrder });
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex: 0, pageSize: 5 },
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = state.columnOrder.indexOf(active.id as string);
      const newIndex = state.columnOrder.indexOf(over.id as string);
      const newOrder = arrayMove(state.columnOrder, oldIndex, newIndex);
      dispatch({ type: 'REORDER_COLUMNS', payload: newOrder });
    },
    [state.columnOrder, dispatch]
  );

  const debouncedFilterHandlers = useMemo(() => {
    const handlers: Record<string, (value: string) => void> = {};
    state.columnOrder.forEach((col) => {
      handlers[col] = debounce((value: string) => {
        setColumnFilter(col, value);
      }, 300);
    });
    return handlers;
  }, [state.columnOrder, setColumnFilter]);

  if (busy) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          borderRadius: 2,
        }}
      >
        <CircularProgress size={36} />
        <Typography variant="h6" color="text.secondary">
          Searching flights...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This may take a few seconds.
        </Typography>
      </Paper>
    );
  }

  if (state.tableData.length === 0) {
    return (
      <Paper
        elevation={1}
        sx={{
          p: 6,
          textAlign: 'center',
          borderRadius: 2,
          color: 'text.secondary',
        }}
      >
        <FlightIcon sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
        <Typography variant="h6" gutterBottom>
          No flight data yet
        </Typography>
        <Typography variant="body2">
          Use the search form above to find available flights.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Typography variant="subtitle2" color="text.secondary">
          {filteredData.length} flight{filteredData.length !== 1 ? 's' : ''} found
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={showFilters ? 'Hide column filters' : 'Show column filters'}>
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              size="small"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters((prev) => !prev)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Filters
            </Button>
          </Tooltip>
          <Tooltip title={state.editedCells.size === 0 ? 'No changes to save' : 'Save all changes'}>
            <span>
              <Button
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={saveChanges}
                disabled={state.editedCells.size === 0}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Save Changes
                {state.editedCells.size > 0 && ` (${state.editedCells.size})`}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 900,
            }}
          >
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <React.Fragment key={headerGroup.id}>
                  <SortableContext
                    items={state.columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    <tr>
                      {headerGroup.headers.map((header) => (
                        <DraggableHeader key={header.id} header={header} />
                      ))}
                    </tr>
                  </SortableContext>
                  {showFilters && (
                    <tr>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={`filter-${header.id}`}
                          style={{
                            padding: '4px 8px 8px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <InputBase
                            placeholder={`Filter...`}
                            onChange={(e) =>
                              debouncedFilterHandlers[header.column.id]?.(e.target.value)
                            }
                            size="small"
                            sx={{
                              fontSize: '0.75rem',
                              width: '100%',
                              px: 1,
                              py: 0.25,
                              border: '1px solid #e2e8f0',
                              borderRadius: 1,
                              '&:hover': { borderColor: '#94a3b8' },
                              '&.Mui-focused': { borderColor: '#1976d2' },
                            }}
                          />
                        </th>
                      ))}
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, rowIdx) => (
                <tr
                  key={row.id}
                  style={{
                    background: rowIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      rowIdx % 2 === 0 ? '#ffffff' : '#f8fafc';
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isEdited = state.editedCells.has(
                      `${row.original.id}-${cell.column.id}`
                    );
                    return (
                      <td
                        key={cell.id}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap',
                          background: isEdited
                            ? '#fff9c4'
                            : undefined,
                          transition: 'background-color 0.2s',
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </DndContext>
      </Box>

      <Pagination table={table} />
    </Paper>
  );
}
