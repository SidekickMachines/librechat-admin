import {
  Create,
  SimpleForm,
  TextInput,
  PasswordInput,
  SelectInput,
  BooleanInput,
  required,
  email,
  minLength,
} from 'react-admin';

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="username" validate={[required()]} />
      <TextInput source="email" validate={[required(), email()]} />
      <TextInput source="name" />
      <PasswordInput source="password" validate={[required(), minLength(8)]} />
      <SelectInput
        source="role"
        choices={[
          { id: 'USER', name: 'User' },
          { id: 'ADMIN', name: 'Admin' },
        ]}
        defaultValue="USER"
        validate={[required()]}
      />
      <BooleanInput source="emailVerified" label="Email Verified" defaultValue={false} />
    </SimpleForm>
  </Create>
);
