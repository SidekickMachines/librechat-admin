import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  NumberField,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';

export const FileList = () => (
  <List perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid bulkActionButtons={false} rowClick="show">
      <FunctionField
        label="File"
        render={(record: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                background: record.type?.startsWith('image/')
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: 2,
                p: 1,
                display: 'flex',
              }}
            >
              {record.type?.startsWith('image/') ? (
                <ImageIcon sx={{ color: 'white', fontSize: 20 }} />
              ) : (
                <AttachFileIcon sx={{ color: 'white', fontSize: 20 }} />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontWeight: 500, color: '#2d3748' }}>
                {record.filename}
              </Box>
              <Box sx={{ fontSize: '0.875rem', color: '#718096', mt: 0.5 }}>
                {record.type} • {(record.bytes / 1024).toFixed(2)} KB
              </Box>
            </Box>
          </Box>
        )}
      />
      <TextField source="context" label="Context" />
      <TextField source="source" label="Source" />
      <FunctionField
        label="Dimensions"
        render={(record: any) =>
          record.width && record.height
            ? `${record.width}x${record.height}`
            : 'N/A'
        }
      />
      <NumberField source="usage" label="Usage" />
      <DateField source="createdAt" label="Created" showTime />
    </Datagrid>
  </List>
);
