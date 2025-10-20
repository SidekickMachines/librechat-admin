import {
  List,
  Datagrid,
  DateField,
  FunctionField,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';

export const ProjectList = () => (
  <List perPage={25} sort={{ field: 'updatedAt', order: 'DESC' }}>
    <Datagrid bulkActionButtons={false} rowClick="show">
      <FunctionField
        label="Project"
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
              <FolderIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontWeight: 500, color: '#2d3748' }}>
                {record.name}
              </Box>
              <Box sx={{ fontSize: '0.875rem', color: '#718096', mt: 0.5 }}>
                {record.agentIds?.length || 0} agents
              </Box>
            </Box>
          </Box>
        )}
      />
      <FunctionField
        label="Agents"
        render={(record: any) => (
          <Chip
            label={record.agentIds?.length || 0}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
            }}
          />
        )}
      />
      <FunctionField
        label="Prompt Groups"
        render={(record: any) => (
          <Chip
            label={record.promptGroupIds?.length || 0}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
            }}
          />
        )}
      />
      <DateField source="createdAt" label="Created" showTime />
      <DateField source="updatedAt" label="Updated" showTime />
    </Datagrid>
  </List>
);
