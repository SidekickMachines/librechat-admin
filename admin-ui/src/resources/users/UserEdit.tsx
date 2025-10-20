import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  DateField,
  required,
  email,
} from 'react-admin';

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="id" disabled />
      <TextInput source="username" validate={[required()]} />
      <TextInput source="email" validate={[required(), email()]} />
      <TextInput source="name" />
      <SelectInput
        source="role"
        choices={[
          { id: 'USER', name: 'User' },
          { id: 'ADMIN', name: 'Admin' },
        ]}
        validate={[required()]}
      />
      <BooleanInput source="emailVerified" label="Email Verified" />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleForm>
  </Edit>
);
