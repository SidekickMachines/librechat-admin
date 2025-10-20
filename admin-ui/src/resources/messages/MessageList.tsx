import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  FunctionField,
  ReferenceField,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';

export const MessageList = () => (
  <List perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid bulkActionButtons={false} rowClick="show">
      <FunctionField
        label="Message"
        render={(record: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                background: record.isCreatedByUser
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: 2,
                p: 1,
                display: 'flex',
              }}
            >
              <MessageIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontWeight: 500, color: '#2d3748' }}>
                {record.text?.substring(0, 60)}
                {record.text?.length > 60 ? '...' : ''}
              </Box>
              <Box sx={{ fontSize: '0.875rem', color: '#718096', mt: 0.5 }}>
                {record.sender} • {record.model || 'No model'}
              </Box>
            </Box>
          </Box>
        )}
      />
      <TextField source="endpoint" label="Endpoint" />
      <FunctionField
        label="Tokens"
        render={(record: any) => (
          <Chip
            label={record.tokenCount || 0}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
            }}
          />
        )}
      />
      <BooleanField source="error" label="Error" />
      <DateField source="createdAt" label="Created" showTime />
    </Datagrid>
  </List>
);
