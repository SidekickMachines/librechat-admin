import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  FunctionField,
  ArrayField,
  ChipField,
  SingleFieldList,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export const AgentList = () => (
  <List perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid bulkActionButtons={false} rowClick="show">
      <FunctionField
        label="Agent"
        render={(record: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                p: 1,
                display: 'flex',
              }}
            >
              <SmartToyIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontWeight: 500, color: '#2d3748' }}>
                {record.name}
              </Box>
              <Box sx={{ fontSize: '0.875rem', color: '#718096', mt: 0.5 }}>
                {record.description || 'No description'}
              </Box>
            </Box>
          </Box>
        )}
      />
      <TextField source="provider" label="Provider" />
      <TextField source="model" label="Model" />
      <FunctionField
        label="Tools"
        render={(record: any) => (
          <Chip
            label={record.tools?.length || 0}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
            }}
          />
        )}
      />
      <BooleanField source="is_promoted" label="Promoted" />
      <DateField source="createdAt" label="Created" showTime />
    </Datagrid>
  </List>
);
