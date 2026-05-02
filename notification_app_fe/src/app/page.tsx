"use client";

import React, { useState, useEffect } from 'react';
import { Container, Typography, Select, MenuItem, Pagination, Box, CircularProgress, Alert, SelectChangeEvent } from '@mui/material';
import { useNoticeFeed } from '../hooks/useNoticeFeed';
import NoticeCard from '../components/NoticeCard';
import { Log } from '../api/notifications';

export default function InboxView() {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('');
  const PAGE_SIZE = 10;

  const { notices, isLoading, errorMsg, totalItems } = useNoticeFeed({ 
    page: currentPage, 
    size: PAGE_SIZE, 
    filter: activeFilter 
  });

  useEffect(() => {
    Log('frontend', 'info', 'page', 'InboxView rendered');
  }, []);

  const onPageSwap = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setCurrentPage(newPage);
    Log('frontend', 'debug', 'state', `Swapped to page ${newPage}`);
  };

  const onFilterSelect = (e: SelectChangeEvent<string>) => {
    setActiveFilter(e.target.value);
    setCurrentPage(1); // Jump back to page 1
    Log('frontend', 'debug', 'state', `Filter swapped to ${e.target.value || 'None'}`);
  };

  const maxPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="700">Campus Updates</Typography>
        <Select
          value={activeFilter}
          onChange={onFilterSelect}
          displayEmpty
          size="small"
          sx={{ minWidth: 160, bgcolor: 'background.paper' }}
        >
          <MenuItem value=""><em>All Categories</em></MenuItem>
          <MenuItem value="Placement">Placement</MenuItem>
          <MenuItem value="Result">Result</MenuItem>
          <MenuItem value="Event">Event</MenuItem>
        </Select>
      </Box>

      {isLoading && (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress size={32} />
        </Box>
      )}

      {errorMsg && (
        <Alert severity="error" sx={{ mt: 2 }}>{errorMsg}</Alert>
      )}

      {!isLoading && !errorMsg && notices.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>Inbox is clear. No updates to show.</Alert>
      )}

      {!isLoading && !errorMsg && (
        <Box>
          {notices.map((item: any) => (
            <NoticeCard key={item.ID} data={item} />
          ))}
          
          {totalItems > PAGE_SIZE && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination 
                count={maxPages} 
                page={currentPage} 
                onChange={onPageSwap} 
                color="primary" 
                shape="rounded"
              />
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}
