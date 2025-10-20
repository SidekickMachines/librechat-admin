import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  FunctionField,
} from 'react-admin';
import { Chip, Box } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const RoleList = () => (
  <List>
    <Datagrid
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
        label="Role Name"
        render={(record: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                background: record.name === 'ADMIN'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: 1.5,
                p: 0.75,
                display: 'flex',
              }}
            >
              <SecurityIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Box sx={{ fontWeight: 600, color: '#2d3748' }}>{record.name}</Box>
              <Box sx={{ fontSize: '0.75rem', color: '#718096' }}>
                {record.name === 'ADMIN' ? 'Full Access' : 'Limited Access'}
              </Box>
            </Box>
          </Box>
        )}
      />
      <FunctionField
        label="Permissions"
        render={(record: any) => {
          if (!record.permissions) return (
            <Chip label="0 enabled" size="small" color="default" />
          );
          const count = Object.values(record.permissions).reduce((acc: number, category: any) => {
            return acc + Object.values(category).filter(Boolean).length;
          }, 0);
          return (
            <Chip
              icon={<CheckCircleIcon />}
              label={`${count} enabled`}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 500,
                '& .MuiChip-icon': {
                  color: 'white',
                },
              }}
            />
          );
        }}
      />
      <EditButton />
      <DeleteButton
        confirmTitle="Delete Role"
        confirmContent="Are you sure you want to delete this role? This action cannot be undone."
      />
    </Datagrid>
  </List>
);
