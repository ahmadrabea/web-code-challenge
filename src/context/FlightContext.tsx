import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { FlightRow, FlightAvailabilityRequest } from '../types/flightTypes';

interface FlightState {
  tableData: FlightRow[];
  originalData: FlightRow[];
  editedCells: Set<string>;
  columnOrder: string[];
  columnFilters: Record<string, string>;
  searchParams: FlightAvailabilityRequest | null;
  airportNames: Record<string, string>;
}

type FlightAction =
  | { type: 'SET_DATA'; payload: FlightRow[] }
  | { type: 'UPDATE_CELL'; payload: { rowId: string; columnId: string; value: string } }
  | { type: 'SAVE_CHANGES' }
  | { type: 'SET_COLUMN_FILTER'; payload: { column: string; value: string } }
  | { type: 'REORDER_COLUMNS'; payload: string[] }
  | { type: 'SET_SEARCH_PARAMS'; payload: { request: FlightAvailabilityRequest; airportNames: Record<string, string> } };

const DEFAULT_COLUMNS: string[] = [
  'origin', 'destination', 'departure', 'arrival',
  'duration', 'stops', 'availableSeats',
];

const initialState: FlightState = {
  tableData: [],
  originalData: [],
  editedCells: new Set(),
  columnOrder: DEFAULT_COLUMNS,
  columnFilters: {},
  searchParams: null,
  airportNames: {},
};

function flightReducer(state: FlightState, action: FlightAction): FlightState {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        tableData: action.payload,
        originalData: action.payload.map((row) => ({ ...row })),
        editedCells: new Set(),
      };

    case 'UPDATE_CELL': {
      const { rowId, columnId, value } = action.payload;
      const newData = state.tableData.map((row) =>
        row.id === rowId ? { ...row, [columnId]: value } : row
      );
      const newEdited = new Set(state.editedCells);
      newEdited.add(`${rowId}-${columnId}`);
      return { ...state, tableData: newData, editedCells: newEdited };
    }

    case 'SAVE_CHANGES':
      localStorage.setItem('flightTableData', JSON.stringify(state.tableData));
      return {
        ...state,
        originalData: state.tableData.map((row) => ({ ...row })),
        editedCells: new Set(),
      };

    case 'SET_COLUMN_FILTER':
      return {
        ...state,
        columnFilters: {
          ...state.columnFilters,
          [action.payload.column]: action.payload.value,
        },
      };

    case 'REORDER_COLUMNS':
      return { ...state, columnOrder: action.payload };

    case 'SET_SEARCH_PARAMS':
      return {
        ...state,
        searchParams: action.payload.request,
        airportNames: { ...state.airportNames, ...action.payload.airportNames },
      };

    default:
      return state;
  }
}

interface FlightContextValue {
  state: FlightState;
  dispatch: React.Dispatch<FlightAction>;
  updateCell: (rowId: string, columnId: string, value: string) => void;
  saveChanges: () => void;
  setColumnFilter: (column: string, value: string) => void;
  filteredData: FlightRow[];
}

const FlightContext = createContext<FlightContextValue | null>(null);

export function FlightProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(flightReducer, initialState);

  const updateCell = useCallback(
    (rowId: string, columnId: string, value: string) => {
      dispatch({ type: 'UPDATE_CELL', payload: { rowId, columnId, value } });
    },
    []
  );

  const saveChanges = useCallback(() => {
    dispatch({ type: 'SAVE_CHANGES' });
  }, []);

  const setColumnFilter = useCallback(
    (column: string, value: string) => {
      dispatch({ type: 'SET_COLUMN_FILTER', payload: { column, value } });
    },
    []
  );

  const filteredData = useMemo(() => {
    const filters = Object.entries(state.columnFilters).filter(
      ([, v]) => v.length > 0
    );
    if (filters.length === 0) return state.tableData;
    return state.tableData.filter((row) =>
      filters.every(([col, filterVal]) => {
        const cellValue = row[col];
        return cellValue != null && cellValue.toLowerCase().includes(filterVal.toLowerCase());
      })
    );
  }, [state.tableData, state.columnFilters]);

  const value = useMemo(
    () => ({ state, dispatch, updateCell, saveChanges, setColumnFilter, filteredData }),
    [state, updateCell, saveChanges, setColumnFilter, filteredData]
  );

  return (
    <FlightContext.Provider value={value}>{children}</FlightContext.Provider>
  );
}

export function useFlightContext(): FlightContextValue {
  const context = useContext(FlightContext);
  if (!context) {
    throw new Error('useFlightContext must be used within a FlightProvider');
  }
  return context;
}

export { DEFAULT_COLUMNS };
export type { FlightState, FlightAction };
