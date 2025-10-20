import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  ReferenceField,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import TokenIcon from '@mui/icons-material/Token';

export const TokenList = () => (
  <List perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid>
      <FunctionField
        label="Token"
        render={(record: any) => {
          const isExpired = record.expiresAt && new Date(record.expiresAt) < new Date();
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  background: isExpired
                    ? 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                }}
              >
                <TokenIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ fontWeight: 500, color: '#2d3748' }}>
                  {record.type}
                </Box>
                <Box sx={{ fontSize: '0.875rem', color: '#718096', mt: 0.5 }}>
                  {record.identifier}
                </Box>
              </Box>
            </Box>
          );
        }}
      />
      <ReferenceField
        source="userId"
        reference="users"
        label="User"
        link="show"
      >
        <TextField source="name" />
      </ReferenceField>
      <DateField source="createdAt" label="Created" showTime />
      <DateField source="expiresAt" label="Expires" showTime />
      <FunctionField
        label="Status"
        render={(record: any) => {
          const isExpired = record.expiresAt && new Date(record.expiresAt) < new Date();
          return (
            <Chip
              label={isExpired ? 'Expired' : 'Valid'}
              size="small"
              sx={{
                background: isExpired
                  ? 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)'
                  : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                color: 'white',
              }}
            />
          );
        }}
      />
    </Datagrid>
  </List>
);
