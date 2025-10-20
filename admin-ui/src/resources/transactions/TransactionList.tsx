import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  ReferenceField,
  NumberField,
} from 'react-admin';
import { Box, Chip } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';

export const TransactionList = () => (
  <List perPage={25} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid>
      <FunctionField
        label="Transaction"
        render={(record: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                background:
                  record.tokenValue < 0
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                borderRadius: 2,
                p: 1,
                display: 'flex',
              }}
            >
              <ReceiptIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontWeight: 500, color: '#2d3748' }}>
                {record.tokenType} • {record.context}
              </Box>
              <Box sx={{ fontSize: '0.875rem', color: '#718096', mt: 0.5 }}>
                {record.model}
              </Box>
            </Box>
          </Box>
        )}
      />
      <ReferenceField
        source="user"
        reference="users"
        label="User"
        link="show"
      >
        <TextField source="name" />
      </ReferenceField>
      <NumberField source="rawAmount" label="Tokens" />
      <FunctionField
        label="Value"
        render={(record: any) => (
          <Chip
            label={record.tokenValue > 0 ? `+${record.tokenValue}` : record.tokenValue}
            size="small"
            sx={{
              background:
                record.tokenValue < 0
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              color: 'white',
            }}
          />
        )}
      />
      <NumberField source="rate" label="Rate" />
      <DateField source="createdAt" label="Created" showTime />
    </Datagrid>
  </List>
);
