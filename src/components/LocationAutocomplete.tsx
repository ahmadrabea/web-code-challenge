import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import debounce from 'lodash/debounce';
import { LocationSuggestion } from '../types/flightTypes';
import { useLocationSearch } from '../hooks/useLocationSearch';

function getAirportName(label: string): string {
  return label.replace(/\s*\([^)]*\)\s*$/, '');
}

interface LocationAutocompleteProps {
  label: string;
  placeholder?: string;
  value: LocationSuggestion | null;
  onChange: (value: LocationSuggestion | null) => void;
}

export function LocationAutocomplete({
  label,
  placeholder,
  value,
  onChange,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [focused, setFocused] = useState(false);

  const { data: options = [], isLoading: loading } = useLocationSearch(debouncedKeyword);

  const updateKeyword = useRef(
    debounce((keyword: string) => {
      setDebouncedKeyword(keyword);
    }, 300)
  ).current;

  useEffect(() => {
    return () => {
      updateKeyword.cancel();
    };
  }, [updateKeyword]);

  const handleInputChange = useCallback(
    (_: React.SyntheticEvent, newInput: string, reason: string) => {
      setInputValue(newInput);
      if (reason === 'input') {
        updateKeyword(newInput);
      }
    },
    [updateKeyword]
  );

  const showOverlay = value && !focused;

  return (
    <Box sx={{ position: 'relative', width: 260 }}>
      <Autocomplete
        sx={{ width: '100%' }}
        options={options}
        value={value}
        inputValue={inputValue}
        onChange={(_, newValue) => onChange(newValue)}
        onInputChange={handleInputChange}
        getOptionLabel={(opt) => opt.label}
        isOptionEqualToValue={(opt, val) => opt.iataCode === val.iataCode}
        filterOptions={(x) => x}
        loading={loading}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        noOptionsText={inputValue.length < 2 ? 'Type to search...' : 'No locations found'}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            required
            size="small"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress size={16} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.iataCode + option.subType}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {option.subType === 'AIRPORT' ? (
                <FlightIcon sx={{ fontSize: 18, color: '#64748b' }} />
              ) : (
                <LocationCityIcon sx={{ fontSize: 18, color: '#64748b' }} />
              )}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {option.iataCode}
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {getAirportName(option.label)}
                  </Typography>
                </Box>
                {option.countryCode && (
                  <Typography variant="caption" color="text.secondary">
                    {option.cityName ? `${option.cityName}, ` : ''}{option.countryCode}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
      />
      {showOverlay && (
        <Box
          sx={{
            position: 'absolute',
            top: '1px',
            left: '1px',
            right: '1px',
            bottom: '1px',
            display: 'flex',
            alignItems: 'center',
            px: 1.75,
            pointerEvents: 'none',
            bgcolor: '#fff',
            borderRadius: 1,
          }}
        >
          <Typography component="span" sx={{ fontWeight: 700, fontSize: '1rem', color: 'primary.main', mr: 0.75 }}>
            {value.iataCode}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: '0.7rem',
              color: 'text.secondary',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {getAirportName(value.label)}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
