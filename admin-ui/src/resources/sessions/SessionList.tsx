import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  ReferenceField,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

export const SessionList = () => (
  <List perPage={25} sort={{ field: 'expiration', order: 'DESC' }}>
    <Datagrid>
      <FunctionField
        label="Session"
        render={(record: any) => {
          const isExpired = new Date(record.expiration) < new Date();
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  background: isExpired
                    ? 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)'
                    : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                }}
              >
                <VpnKeyIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ fontWeight: 500, color: '#2d3748' }}>
                  Session {record._id?.toString().substring(0, 12)}...
                </Box>
                <Box sx={{ fontSize: '0.875rem', color: '#718096', mt: 0.5 }}>
                  {isExpired ? 'Expired' : 'Active'}
                </Box>
              </Box>
            </Box>
          );
        }}
      />
      <ReferenceField
        source="user"
        reference="users"
        label="User"
        link="show"
      >
        <TextField source="name" />
      </ReferenceField>
      <DateField source="expiration" label="Expires" showTime />
      <FunctionField
        label="Status"
        render={(record: any) => {
          const isExpired = new Date(record.expiration) < new Date();
          return (
            <Chip
              label={isExpired ? 'Expired' : 'Active'}
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
