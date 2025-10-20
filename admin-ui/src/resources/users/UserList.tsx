import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  EditButton,
  DeleteButton,
  BooleanField,
  FunctionField,
} from 'react-admin';
import { Chip } from '@mui/material';

export const UserList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="username" />
      <EmailField source="email" />
      <FunctionField
        label="Role"
        render={(record: any) => (
          <Chip
            label={record.role || 'USER'}
            color={record.role === 'ADMIN' ? 'secondary' : 'default'}
            size="small"
          />
        )}
      />
      <BooleanField source="emailVerified" label="Verified" />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
