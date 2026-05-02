import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { hasRead, markAsRead } from '../state/readTracker.js';
import { Log } from '../api/notifications';

// Dynamic gradients for categories
const getTypeStyles = (type) => {
  switch (type?.toLowerCase()) {
    case 'placement':
      return {
        bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0) 100%)',
        border: 'rgba(139, 92, 246, 0.5)',
        chipBg: 'rgba(139, 92, 246, 0.15)',
        chipColor: '#c4b5fd',
      };
    case 'result':
      return {
        bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 100%)',
        border: 'rgba(16, 185, 129, 0.5)',
        chipBg: 'rgba(16, 185, 129, 0.15)',
        chipColor: '#6ee7b7',
      };
    case 'event':
      return {
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0) 100%)',
        border: 'rgba(245, 158, 11, 0.5)',
        chipBg: 'rgba(245, 158, 11, 0.15)',
        chipColor: '#fcd34d',
      };
    default:
      return {
        bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(148, 163, 184, 0) 100%)',
        border: 'rgba(148, 163, 184, 0.3)',
        chipBg: 'rgba(148, 163, 184, 0.1)',
        chipColor: '#cbd5e1',
      };
  }
};

export default function NoticeCard({ data, onInteract }) {
  const [isSeen, setIsSeen] = React.useState(false);

  React.useEffect(() => {
    setIsSeen(hasRead(data.ID));
  }, [data.ID]);

  const handleCardClick = () => {
    if (!isSeen) {
      markAsRead(data.ID);
      setIsSeen(true);
      Log('frontend', 'info', 'component', `Notification ${data.ID} marked as read`);
      if (onInteract) onInteract();
    }
  };

  const formattedDate = new Date(data.Timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const styles = getTypeStyles(data.Type);

  return (
    <Card 
      onClick={handleCardClick}
      sx={{ 
        mb: 2.5, 
        cursor: isSeen ? 'default' : 'pointer',
        opacity: isSeen ? 0.7 : 1,
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${styles.border}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: styles.bg,
          zIndex: 0,
          pointerEvents: 'none',
        }
      }}
    >
      {!isSeen && (
        <Box 
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            boxShadow: '0 0 10px #3b82f6',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)' },
              '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(59, 130, 246, 0)' },
              '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(59, 130, 246, 0)' },
            }
          }} 
        />
      )}
      
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3, '&:last-child': { pb: 3 } }}>
        <Box display="flex" alignItems="center" gap={1.5} mb={2}>
          <Chip 
            label={data.Type} 
            size="small" 
            sx={{ 
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              backgroundColor: styles.chipBg,
              color: styles.chipColor,
              border: `1px solid ${styles.border}`,
            }} 
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {formattedDate}
          </Typography>
        </Box>
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: isSeen ? 400 : 600,
            color: isSeen ? 'text.secondary' : 'text.primary',
            fontSize: '1.05rem',
            lineHeight: 1.5,
          }}
        >
          {data.Message}
        </Typography>
      </CardContent>
    </Card>
  );
}
