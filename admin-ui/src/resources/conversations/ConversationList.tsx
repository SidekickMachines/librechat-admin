import {
  List,
  Datagrid,
  DateField,
  DeleteButton,
  FunctionField,
  SearchInput,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';

const conversationFilters = [
  <SearchInput source="search" alwaysOn />,
];

export const ConversationList = () => (
  <List filters={conversationFilters}>
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
        label="Conversation"
        render={(record: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: 1.5,
                p: 0.75,
                display: 'flex',
              }}
            >
              <ChatIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box sx={{ maxWidth: 400 }}>
              <Box sx={{ fontWeight: 600, color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {record.title || 'Untitled Conversation'}
              </Box>
              <Box sx={{ fontSize: '0.75rem', color: '#718096' }}>
                ID: {record.conversationId?.substring(0, 8)}...
              </Box>
            </Box>
          </Box>
        )}
      />
      <FunctionField
        label="Endpoint"
        render={(record: any) => (
          <Chip
            icon={<CodeIcon />}
            label={record.endpoint || record.endpointType || 'N/A'}
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
        )}
      />
      <FunctionField
        label="Model"
        render={(record: any) => (
          <Chip
            icon={<SmartToyIcon />}
            label={record.model || 'N/A'}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
      <DeleteButton />
    </Datagrid>
  </List>
);
