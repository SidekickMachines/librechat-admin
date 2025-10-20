import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  ShowButton,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import RefreshIcon from '@mui/icons-material/Refresh';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Running':
      return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
    case 'Pending':
      return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    case 'Failed':
    case 'Error':
      return 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)';
    default:
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Running':
      return <CheckCircleIcon />;
    case 'Pending':
      return <PendingIcon />;
    case 'Failed':
    case 'Error':
      return <ErrorIcon />;
    default:
      return <PendingIcon />;
  }
};

export const PodList = () => (
  <List>
    <Datagrid
      bulkActionButtons={false}
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
        label="Pod"
        render={(record: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 1.5,
                p: 0.75,
                display: 'flex',
              }}
            >
              <StorageIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box sx={{ maxWidth: 400 }}>
              <Box sx={{ fontWeight: 600, color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {record.name}
              </Box>
              <Box sx={{ fontSize: '0.75rem', color: '#718096' }}>
                Namespace: {record.namespace}
              </Box>
            </Box>
          </Box>
        )}
      />
      <FunctionField
        label="Status"
        render={(record: any) => (
          <Chip
            icon={getStatusIcon(record.status)}
            label={record.status}
            size="small"
            sx={{
              background: getStatusColor(record.status),
              color: 'white',
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: 'white',
              },
            }}
          />
        )}
      />
      <TextField source="ready" label="Ready" />
      <FunctionField
        label="Restarts"
        render={(record: any) => (
          <Chip
            icon={<RefreshIcon />}
            label={record.restarts}
            size="small"
            sx={{
              background: record.restarts > 0
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
      <TextField source="age" label="Age" />
      <TextField source="ip" label="IP Address" />
      <TextField source="node" label="Node" />
      <ShowButton />
    </Datagrid>
  </List>
);
