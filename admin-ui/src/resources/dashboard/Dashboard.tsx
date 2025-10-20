import { Box, Typography, Paper, IconButton, CircularProgress, Chip, Tooltip } from '@mui/material';
import { Title, useNavigate } from 'react-admin';
import { useEffect, useState } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChatIcon from '@mui/icons-material/Chat';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'down';
  reason: string;
  pods: Array<{
    name: string;
    namespace: string;
    status: string;
    ready: string;
    restarts: number;
  }>;
}

interface SystemStatus {
  librechat: ServiceStatus;
  mongodb: ServiceStatus;
  mcp: ServiceStatus;
  timestamp: string;
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'healthy':
      return <CheckCircleIcon sx={{ color: '#10b981', fontSize: 32 }} />;
    case 'degraded':
      return <WarningIcon sx={{ color: '#f59e0b', fontSize: 32 }} />;
    case 'down':
      return <ErrorIcon sx={{ color: '#ef4444', fontSize: 32 }} />;
    default:
      return <CircularProgress size={32} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return { bg: '#10b981', border: '#059669' };
    case 'degraded':
      return { bg: '#f59e0b', border: '#d97706' };
    case 'down':
      return { bg: '#ef4444', border: '#dc2626' };
    default:
      return { bg: '#6b7280', border: '#4b5563' };
  }
};

const ServiceBox = ({
  title,
  icon,
  status,
  reason,
  pods,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  status: string;
  reason: string;
  pods: ServiceStatus['pods'];
  onClick: () => void;
}) => {
  const colors = getStatusColor(status);

  return (
    <Paper
      onClick={onClick}
      sx={{
        minWidth: '220px',
        background: 'white',
        borderRadius: 3,
        border: `3px solid ${colors.border}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 8,
          borderColor: colors.bg,
        },
      }}
    >
      {/* Status Indicator Bar */}
      <Box
        sx={{
          height: 8,
          background: colors.bg,
          width: '100%',
        }}
      />

      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                background: `${colors.bg}22`,
                borderRadius: 2,
                p: 1,
                display: 'flex',
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
              {title}
            </Typography>
          </Box>
          <StatusIcon status={status} />
        </Box>

        {/* Status Info */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={status.toUpperCase()}
            size="small"
            sx={{
              background: colors.bg,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 1, fontSize: '0.85rem' }}>
            {reason}
          </Typography>
        </Box>

        {/* Pod Count */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 600 }}>
            {pods.length} Pod{pods.length !== 1 ? 's' : ''}
          </Typography>
          <ArrowForwardIcon sx={{ color: colors.bg, fontSize: 20 }} />
        </Box>

        {/* Pod Details Tooltip */}
        {pods.length > 0 && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e5e7eb' }}>
            {pods.map((pod, idx) => (
              <Typography
                key={idx}
                variant="caption"
                sx={{
                  display: 'block',
                  color: '#6b7280',
                  fontSize: '0.7rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {pod.name} • {pod.ready} • ↻ {pod.restarts}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const ConnectionLine = ({ color }: { color: string }) => (
  <Box
    sx={{
      width: 80,
      height: 3,
      background: color,
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        right: -6,
        top: -3,
        width: 0,
        height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: `10px solid ${color}`,
      },
    }}
  />
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/admin/api/system-status');
      const data = await response.json();
      setSystemStatus(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching system status:', error);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSystemStatus();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSystemStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setLoading(true);
    fetchSystemStatus();
  };

  const handleServiceClick = (serviceName: string, pods: ServiceStatus['pods']) => {
    if (pods.length > 0) {
      const pod = pods[0];
      const podId = `${pod.namespace}::${pod.name}`;
      navigate(`/pods/${encodeURIComponent(podId)}/show`);
    }
  };

  if (loading && !systemStatus) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, background: '#f9fafb', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Title title="System Status Dashboard" />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {lastUpdate && (
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
          <Tooltip title="Refresh Status">
            <IconButton
              onClick={handleManualRefresh}
              disabled={loading}
              sx={{
                background: '#3b82f6',
                color: 'white',
                '&:hover': {
                  background: '#2563eb',
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* System Architecture Diagram */}
      {systemStatus && (
        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'white',
            boxShadow: 3,
            mb: 4,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937', mb: 4, textAlign: 'center' }}>
            LibreChat System Architecture
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3,
              flexWrap: 'wrap',
            }}
          >
            {/* LibreChat Service */}
            <ServiceBox
              title="LibreChat"
              icon={<ChatIcon sx={{ color: '#3b82f6', fontSize: 28 }} />}
              status={systemStatus.librechat.status}
              reason={systemStatus.librechat.reason}
              pods={systemStatus.librechat.pods}
              onClick={() => handleServiceClick('librechat', systemStatus.librechat.pods)}
            />

            {/* Connection Arrow */}
            <ConnectionLine color={getStatusColor(systemStatus.mongodb.status).bg} />

            {/* MongoDB Service */}
            <ServiceBox
              title="MongoDB"
              icon={<StorageIcon sx={{ color: '#10b981', fontSize: 28 }} />}
              status={systemStatus.mongodb.status}
              reason={systemStatus.mongodb.reason}
              pods={systemStatus.mongodb.pods}
              onClick={() => handleServiceClick('mongodb', systemStatus.mongodb.pods)}
            />

            {/* Connection Arrow to MCP */}
            <ConnectionLine color={getStatusColor(systemStatus.mcp.status).bg} />

            {/* MCP Service */}
            <ServiceBox
              title="MCP"
              icon={<CloudIcon sx={{ color: '#8b5cf6', fontSize: 28 }} />}
              status={systemStatus.mcp.status}
              reason={systemStatus.mcp.reason}
              pods={systemStatus.mcp.pods}
              onClick={() => handleServiceClick('mcp', systemStatus.mcp.pods)}
            />
          </Box>

          {/* Legend */}
          <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', gap: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                Healthy
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                Degraded
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorIcon sx={{ color: '#ef4444', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#6b7280', fontWeight: 600 }}>
                Down
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Info Message */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
        }}
      >
        <Typography variant="body2" sx={{ color: '#1e40af', textAlign: 'center' }}>
          💡 Click on any service box to view detailed pod logs. Status refreshes automatically every 30 seconds.
        </Typography>
      </Paper>
    </Box>
  );
};
