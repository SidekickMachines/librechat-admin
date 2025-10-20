import { Box, Typography, Paper, Card, CardContent, CircularProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Title } from 'react-admin';
import { useEffect, useState } from 'react';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import TokenIcon from '@mui/icons-material/Token';

interface TopConsumer {
  userId: string;
  username: string;
  email: string;
  totalTokens: number;
  totalValue: number;
  transactionCount: number;
  estimatedCost: string;
}

interface CostStats {
  period: {
    start: string;
    end: string;
    month: string;
  };
  overall: {
    totalTokens: number;
    totalValue: number;
    transactionCount: number;
    estimatedCost: string;
  };
  topConsumers: TopConsumer[];
  timestamp: string;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}) => {
  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 3,
        boxShadow: 4,
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: 8,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export const CostDashboard = () => {
  const [costStats, setCostStats] = useState<CostStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCostStats = async () => {
    try {
      const response = await fetch('/admin/api/cost-stats');
      const data = await response.json();
      setCostStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cost stats:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostStats();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCostStats();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !costStats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <Box sx={{ p: 3, background: '#f9fafb', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Title title="Cost Dashboard" />
        <Typography variant="h6" sx={{ color: '#6b7280', mt: 1 }}>
          {costStats.period.month}
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Total Tokens"
          value={formatNumber(costStats.overall.totalTokens)}
          subtitle="Tokens used this month"
          icon={<TokenIcon sx={{ fontSize: 32 }} />}
          color="#667eea"
        />
        <StatCard
          title="Estimated Cost"
          value={`$${costStats.overall.estimatedCost}`}
          subtitle="Approximate monthly cost"
          icon={<AttachMoneyIcon sx={{ fontSize: 32 }} />}
          color="#f093fb"
        />
        <StatCard
          title="Transactions"
          value={formatNumber(costStats.overall.transactionCount)}
          subtitle="Total API calls"
          icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
          color="#4facfe"
        />
        <StatCard
          title="Active Users"
          value={costStats.topConsumers.length}
          subtitle="Users with usage"
          icon={<PeopleIcon sx={{ fontSize: 32 }} />}
          color="#43e97b"
        />
      </Box>

      {/* Top Consumers Table */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'white',
          boxShadow: 3,
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <PeopleIcon sx={{ color: '#667eea', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937' }}>
            Top Token Consumers
          </Typography>
        </Box>

        {costStats.topConsumers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: '#6b7280' }}>
              No usage data for this month
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Email</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#374151' }}>
                    Tokens Used
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#374151' }}>
                    Transactions
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#374151' }}>
                    Est. Cost
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {costStats.topConsumers.map((consumer, index) => (
                  <TableRow
                    key={consumer.userId}
                    sx={{
                      '&:hover': {
                        background: '#f9fafb',
                      },
                      borderLeft: index === 0 ? '4px solid #667eea' : index === 1 ? '4px solid #f093fb' : index === 2 ? '4px solid #4facfe' : 'none',
                    }}
                  >
                    <TableCell>
                      <Chip
                        label={`#${index + 1}`}
                        size="small"
                        sx={{
                          background:
                            index === 0
                              ? '#667eea'
                              : index === 1
                              ? '#f093fb'
                              : index === 2
                              ? '#4facfe'
                              : '#e5e7eb',
                          color: index < 3 ? 'white' : '#374151',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{consumer.username}</TableCell>
                    <TableCell sx={{ color: '#6b7280' }}>{consumer.email}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#667eea' }}>
                      {formatNumber(consumer.totalTokens)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#6b7280' }}>
                      {formatNumber(consumer.transactionCount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#10b981' }}>
                      ${consumer.estimatedCost}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Info Message */}
      <Paper
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 3,
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
        }}
      >
        <Typography variant="body2" sx={{ color: '#1e40af' }}>
          Costs are estimated based on average token pricing ($0.03 per 1K tokens). Actual costs may vary based on
          the specific model and pricing tier. Data auto-refreshes every 60 seconds.
        </Typography>
      </Paper>
    </Box>
  );
};
