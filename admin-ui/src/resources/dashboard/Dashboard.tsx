import { Card, CardContent, Box, Typography, Paper, CircularProgress } from '@mui/material';
import { Title } from 'react-admin';
import { useEffect, useState } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';

interface Stats {
  totalUsers: number;
  totalConversations: number;
  activeUsers: number;
}

const StatCard = ({
  title,
  value,
  icon,
  gradient,
  loading
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  loading: boolean;
}) => (
  <Paper
    elevation={3}
    sx={{
      minWidth: '280px',
      flex: 1,
      background: gradient,
      color: 'white',
      borderRadius: 3,
      overflow: 'hidden',
      position: 'relative',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 6,
      },
    }}
  >
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ opacity: 0.9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1 }}>
          {title}
        </Typography>
        <Box sx={{
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 2,
          p: 1,
          backdropFilter: 'blur(10px)',
        }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
        {loading ? <CircularProgress size={40} sx={{ color: 'white' }} /> : value.toLocaleString()}
      </Typography>
    </Box>
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        opacity: 0.1,
        fontSize: '120px',
        lineHeight: 0,
        mr: -2,
        mb: -2,
      }}
    >
      {icon}
    </Box>
  </Paper>
);

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalConversations: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/admin/api/users?limit=1').then((r) => r.json()),
      fetch('/admin/api/convos?limit=1').then((r) => r.json()),
    ])
      .then(([usersData, convosData]) => {
        setStats({
          totalUsers: usersData.total || 0,
          totalConversations: convosData.total || convosData.conversations?.length || 0,
          activeUsers: usersData.total || 0,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching stats:', error);
        setLoading(false);
      });
  }, []);

  return (
    <Box sx={{ p: 3, background: '#f5f7fa', minHeight: '100vh' }}>
      <Title title="Dashboard" />

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 4 }}>
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<PeopleIcon sx={{ fontSize: 32 }} />}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          loading={loading}
        />
        <StatCard
          title="Conversations"
          value={stats.totalConversations}
          icon={<ChatIcon sx={{ fontSize: 32 }} />}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          loading={loading}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          loading={loading}
        />
      </Box>

      {/* Welcome Card */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 3,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                p: 1.5,
                mr: 2,
                display: 'flex',
              }}
            >
              <SecurityIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
              Welcome to LibreChat Admin
            </Typography>
          </Box>

          <Typography variant="body1" sx={{ color: '#4a5568', mb: 3, lineHeight: 1.7 }}>
            This powerful admin panel provides comprehensive management capabilities for your LibreChat instance.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
            {[
              { icon: <PeopleIcon />, title: 'Users', desc: 'Manage user accounts, roles, and permissions' },
              { icon: <SecurityIcon />, title: 'Roles', desc: 'Configure role-based access control' },
              { icon: <ChatIcon />, title: 'Conversations', desc: 'Browse and manage user conversations' },
              { icon: <TrendingUpIcon />, title: 'Analytics', desc: 'Monitor usage statistics and system health' },
            ].map((item, i) => (
              <Box
                key={i}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#667eea',
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ color: '#667eea', mr: 1 }}>{item.icon}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2d3748' }}>
                    {item.title}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: '#718096' }}>
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
