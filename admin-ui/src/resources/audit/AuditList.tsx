import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  FilterButton,
  TopToolbar,
  ExportButton,
  SelectColumnsButton,
  useRecordContext,
} from 'react-admin';
import { Box, Chip } from '@mui/material';

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <SelectColumnsButton />
    <ExportButton />
  </TopToolbar>
);

const ActionChip = () => {
  const record = useRecordContext();
  if (!record) return null;

  const actionColors: { [key: string]: 'success' | 'error' | 'warning' } = {
    create: 'success',
    update: 'warning',
    delete: 'error',
  };

  return (
    <Chip
      label={record.action.toUpperCase()}
      color={actionColors[record.action] || 'default'}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
};

const ResourceChip = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Chip
      label={record.resource}
      size="small"
      sx={{
        background: '#e0e7ff',
        color: '#3730a3',
        fontWeight: 600,
      }}
    />
  );
};

const DataField = () => {
  const record = useRecordContext();
  if (!record || !record.data) return <span>-</span>;

  const dataPreview = JSON.stringify(record.data);
  const truncated = dataPreview.length > 100 ? dataPreview.substring(0, 100) + '...' : dataPreview;

  return (
    <Box
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        color: '#6b7280',
        maxWidth: 400,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
      title={dataPreview}
    >
      {truncated}
    </Box>
  );
};

export const AuditList = () => {
  return (
    <List
      actions={<ListActions />}
      sort={{ field: 'timestamp', order: 'DESC' }}
      perPage={50}
      sx={{
        '& .RaList-content': {
          boxShadow: 3,
          borderRadius: 2,
        },
      }}
    >
      <Datagrid
        bulkActionButtons={false}
        sx={{
          '& .RaDatagrid-headerCell': {
            fontWeight: 700,
            background: '#f3f4f6',
          },
          '& .RaDatagrid-row:hover': {
            background: '#f9fafb',
          },
        }}
      >
        <DateField source="timestamp" label="Timestamp" showTime />
        <FunctionField label="Action" render={() => <ActionChip />} />
        <FunctionField label="Resource" render={() => <ResourceChip />} />
        <TextField source="resourceId" label="Resource ID" />
        <TextField source="userEmail" label="User Email" />
        <TextField source="userName" label="User Name" />
        <FunctionField label="Details" render={() => <DataField />} />
        <TextField source="ipAddress" label="IP Address" />
      </Datagrid>
    </List>
  );
};
