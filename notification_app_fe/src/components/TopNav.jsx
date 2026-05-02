import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const isCurrent = (path) => pathname === path;

  return (
    <AppBar position="sticky" elevation={0} sx={{ 
      background: 'rgba(15, 23, 42, 0.8)', 
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      color: 'text.primary',
    }}>
      <Toolbar sx={{ minHeight: '70px !important' }}>
        <Typography variant="h6" sx={{ 
          flexGrow: 1, 
          fontWeight: 800, 
          letterSpacing: '-0.5px',
          background: 'linear-gradient(to right, #c4b5fd, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          CampusFeed
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            onClick={() => router.push('/')}
            sx={{ 
              fontWeight: isCurrent('/') ? 700 : 500,
              color: isCurrent('/') ? '#fff' : 'text.secondary',
              position: 'relative',
              '&::after': isCurrent('/') ? {
                content: '""', position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2, bgcolor: 'primary.main', borderRadius: 1
              } : {}
            }}
          >
            Feed
          </Button>
          <Button 
            onClick={() => router.push('/priority')}
            sx={{ 
              fontWeight: isCurrent('/priority') ? 700 : 500,
              color: isCurrent('/priority') ? '#fff' : 'text.secondary',
              position: 'relative',
              '&::after': isCurrent('/priority') ? {
                content: '""', position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2, bgcolor: 'error.main', borderRadius: 1
              } : {}
            }}
          >
            Urgent
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
