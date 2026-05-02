"use client";

import React, { useState, useEffect } from 'react';
import { Container, Typography, Select, MenuItem, Box, CircularProgress, Alert, SelectChangeEvent } from '@mui/material';
import { usePriorityQueue } from '../../hooks/usePriorityQueue';
import NoticeCard from '../../components/NoticeCard';
import { Log } from '../../api/notifications';

export default function PriorityView() {
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState('');

  const { urgentItems, isFetching, errorStatus, reload } = usePriorityQueue({ limit, category: filter });

  useEffect(() => {
    Log('frontend', 'info', 'page', 'PriorityView rendered');
  }, []);

  const onLimitChange = (e: SelectChangeEvent<number>) => {
    setLimit(Number(e.target.value));
    Log('frontend', 'debug', 'state', `Priority limit changed to ${e.target.value}`);
  };

  const onFilterChange = (e: SelectChangeEvent<string>) => {
    setFilter(e.target.value);
    Log('frontend', 'debug', 'state', `Priority category filter set to ${e.target.value || 'None'}`);
  };

  const onCardInteraction = () => {
    reload();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight="700" color="error.main">Urgent Action Required</Typography>
        <Box display="flex" gap={2}>
          <Select
            value={filter}
            onChange={onFilterChange}
            displayEmpty
            size="small"
            sx={{ minWidth: 140, bgcolor: 'background.paper' }}
          >
            <MenuItem value=""><em>Any Category</em></MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
          
          <Select
            value={limit}
            onChange={onLimitChange}
            size="small"
            sx={{ minWidth: 100, bgcolor: 'background.paper' }}
          >
            <MenuItem value={10}>Top 10</MenuItem>
            <MenuItem value={15}>Top 15</MenuItem>
            <MenuItem value={20}>Top 20</MenuItem>
          </Select>
        </Box>
      </Box>

      {isFetching && (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress size={32} color="error" />
        </Box>
      )}

      {errorStatus && (
        <Alert severity="error" sx={{ mt: 2 }}>{errorStatus}</Alert>
      )}

      {!isFetching && !errorStatus && urgentItems.length === 0 && (
        <Alert severity="success" sx={{ mt: 2 }}>Awesome! No urgent updates pending.</Alert>
      )}

      {!isFetching && !errorStatus && (
        <Box>
          {urgentItems.map((item: any) => (
            <NoticeCard key={item.ID} data={item} onInteract={onCardInteraction} />
          ))}
        </Box>
      )}
    </Container>
  );
}
