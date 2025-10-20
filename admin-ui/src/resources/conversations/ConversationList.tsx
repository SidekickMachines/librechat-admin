import {
  List,
  Datagrid,
  TextField,
  DateField,
  DeleteButton,
  FunctionField,
  SearchInput,
} from 'react-admin';

const conversationFilters = [
  <SearchInput source="search" alwaysOn />,
];

export const ConversationList = () => (
  <List filters={conversationFilters}>
    <Datagrid bulkActionButtons={false}>
      <TextField source="conversationId" label="ID" />
      <TextField source="title" />
      <FunctionField
        label="Endpoint"
        render={(record: any) => record.endpoint || record.endpointType || 'N/A'}
      />
      <FunctionField
        label="Model"
        render={(record: any) => record.model || 'N/A'}
      />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
      <DeleteButton />
    </Datagrid>
  </List>
);
