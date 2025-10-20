import {
  List,
  Datagrid,
  DateField,
  EditButton,
  DeleteButton,
  FunctionField,
} from 'react-admin';
import { Chip, Box, Avatar } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VerifiedIcon from '@mui/icons-material/Verified';

export const UserList = () => (
  <List>
    <Datagrid
      rowClick="edit"
      sx={{
        '& .RaDatagrid-headerCell': {
          backgroundColor: '#f7fafc',
          fontWeight: 600,
          color: '#2d3748',
        },
        '& .RaDatagrid-row:hover': {
          backgroundColor: '#f7fafc',
        },
      }}
    >
      <FunctionField
        label="User"
        render={(record: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                width: 36,
                height: 36,
              }}
            >
              {record.username?.[0]?.toUpperCase() || record.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Box sx={{ fontWeight: 600, color: '#2d3748' }}>
                {record.username || 'No username'}
              </Box>
              <Box sx={{ fontSize: '0.75rem', color: '#718096' }}>
                {record.email}
              </Box>
            </Box>
          </Box>
        )}
      />
      <FunctionField
        label="Role"
        render={(record: any) => (
          <Chip
            icon={record.role === 'ADMIN' ? <AdminPanelSettingsIcon /> : <PersonIcon />}
            label={record.role || 'USER'}
            size="small"
            sx={{
              background: record.role === 'ADMIN'
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
        )}
      />
      <FunctionField
        label="Status"
        render={(record: any) => (
          <Chip
            icon={<VerifiedIcon />}
            label={record.emailVerified ? 'Verified' : 'Unverified'}
            size="small"
            sx={{
              background: record.emailVerified
                ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                : 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
              color: 'white',
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
        )}
      />
      <DateField source="createdAt" showTime label="Created" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
