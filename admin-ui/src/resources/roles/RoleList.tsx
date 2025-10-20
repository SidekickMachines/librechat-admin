import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  FunctionField,
} from 'react-admin';

export const RoleList = () => (
  <List>
    <Datagrid>
      <TextField source="name" label="Role Name" />
      <FunctionField
        label="Permissions"
        render={(record: any) => {
          if (!record.permissions) return '0';
          // Count total enabled permissions
          const count = Object.values(record.permissions).reduce((acc: number, category: any) => {
            return acc + Object.values(category).filter(Boolean).length;
          }, 0);
          return `${count} enabled`;
        }}
      />
      <EditButton />
      <DeleteButton
        confirmTitle="Delete Role"
        confirmContent="Are you sure you want to delete this role? This action cannot be undone."
      />
    </Datagrid>
  </List>
);
