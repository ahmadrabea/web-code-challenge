import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlightProvider, useFlightContext } from '../context/FlightContext';
import { FlightRow } from '../types/flightTypes';

const mockRows: FlightRow[] = [
  {
    id: '1',
    origin: 'BOS',
    destination: 'MAD',
    departure: 'Nov 14, 2026, 08:25 PM',
    arrival: 'Nov 15, 2026, 01:00 PM',
    duration: '10h 35m',
    carrier: '6X',
    flightNumbers: '214 → 9931',
    aircraft: '772, 320',
    stops: '1',
    availableSeats: '9',
    source: 'GDS',
  },
  {
    id: '2',
    origin: 'BOS',
    destination: 'CDG',
    departure: 'Nov 14, 2026, 08:25 PM',
    arrival: 'Nov 15, 2026, 03:00 PM',
    duration: '16h 35m',
    carrier: '6X',
    flightNumbers: '214 → 116',
    aircraft: '772, 321',
    stops: '1',
    availableSeats: '9',
    source: 'GDS',
  },
];

function TestConsumer() {
  const { state, dispatch, updateCell, saveChanges, filteredData, setColumnFilter } =
    useFlightContext();

  return (
    <div>
      <span data-testid="count">{filteredData.length}</span>
      <span data-testid="edited">{state.editedCells.size}</span>
      <button
        data-testid="load"
        onClick={() => dispatch({ type: 'SET_DATA', payload: mockRows })}
      >
        Load
      </button>
      <button
        data-testid="edit"
        onClick={() => updateCell('1', 'origin', 'JFK')}
      >
        Edit
      </button>
      <button data-testid="save" onClick={saveChanges}>
        Save
      </button>
      <button
        data-testid="filter"
        onClick={() => setColumnFilter('origin', 'BOS')}
      >
        Filter
      </button>
    </div>
  );
}

function renderTestConsumer() {
  return render(
    <FlightProvider>
      <TestConsumer />
    </FlightProvider>
  );
}

describe('FlightContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty data', () => {
    renderTestConsumer();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('loads data via SET_DATA', () => {
    renderTestConsumer();
    fireEvent.click(screen.getByTestId('load'));
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('tracks edited cells after UPDATE_CELL', () => {
    renderTestConsumer();
    fireEvent.click(screen.getByTestId('load'));
    fireEvent.click(screen.getByTestId('edit'));
    expect(screen.getByTestId('edited')).toHaveTextContent('1');
  });

  it('clears edited cells after SAVE_CHANGES', () => {
    renderTestConsumer();
    fireEvent.click(screen.getByTestId('load'));
    fireEvent.click(screen.getByTestId('edit'));
    fireEvent.click(screen.getByTestId('save'));
    expect(screen.getByTestId('edited')).toHaveTextContent('0');
  });

  it('persists data to localStorage on save', () => {
    renderTestConsumer();
    fireEvent.click(screen.getByTestId('load'));
    fireEvent.click(screen.getByTestId('save'));
    const saved = JSON.parse(localStorage.getItem('flightTableData')!);
    expect(saved).toHaveLength(2);
  });

  it('filters data by column value', () => {
    renderTestConsumer();
    fireEvent.click(screen.getByTestId('load'));
    fireEvent.click(screen.getByTestId('edit'));
    fireEvent.click(screen.getByTestId('filter'));
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
});
