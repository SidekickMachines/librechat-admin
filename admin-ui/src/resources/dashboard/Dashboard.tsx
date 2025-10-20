import { Card, CardContent, CardHeader } from '@mui/material';
import { Title } from 'react-admin';
import { useEffect, useState } from 'react';

interface Stats {
  totalUsers: number;
  totalConversations: number;
  activeUsers: number;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalConversations: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch statistics from the API
    Promise.all([
      fetch('/api/users?limit=1').then((r) => r.json()),
      fetch('/api/convos?limit=1').then((r) => r.json()),
    ])
      .then(([usersData, convosData]) => {
        setStats({
          totalUsers: usersData.total || 0,
          totalConversations: convosData.total || convosData.conversations?.length || 0,
          activeUsers: usersData.total || 0, // Placeholder - needs actual active user endpoint
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching stats:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Title title="Dashboard" />
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '20px' }}>
        <Card style={{ minWidth: '300px', flex: 1 }}>
          <CardHeader title="Total Users" />
          <CardContent>
            <div style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center' }}>
              {loading ? '...' : stats.totalUsers}
            </div>
          </CardContent>
        </Card>

        <Card style={{ minWidth: '300px', flex: 1 }}>
          <CardHeader title="Total Conversations" />
          <CardContent>
            <div style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center' }}>
              {loading ? '...' : stats.totalConversations}
            </div>
          </CardContent>
        </Card>

        <Card style={{ minWidth: '300px', flex: 1 }}>
          <CardHeader title="Active Users" />
          <CardContent>
            <div style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center' }}>
              {loading ? '...' : stats.activeUsers}
            </div>
          </CardContent>
        </Card>
      </div>

      <div style={{ padding: '20px' }}>
        <Card>
          <CardHeader title="Welcome to LibreChat Admin" />
          <CardContent>
            <p>
              This admin panel provides management capabilities for your LibreChat instance.
            </p>
            <ul>
              <li>
                <strong>Users:</strong> View, create, edit, and delete user accounts
              </li>
              <li>
                <strong>Conversations:</strong> Browse and manage user conversations
              </li>
              <li>
                <strong>Analytics:</strong> Monitor usage statistics and system health
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
