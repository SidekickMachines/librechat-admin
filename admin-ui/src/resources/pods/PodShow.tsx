import { useState, useEffect } from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  FunctionField,
  useRecordContext,
  useDataProvider,
} from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

const LogViewer = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const [tailLines, setTailLines] = useState(100);
  const [selectedContainer, setSelectedContainer] = useState('');

  useEffect(() => {
    if (record?.containers?.length > 0 && !selectedContainer) {
      setSelectedContainer(record.containers[0].name);
    }
  }, [record, selectedContainer]);

  const fetchLogs = async () => {
    if (!record) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/admin/api/pods/${record.namespace}/${record.name}/logs?` +
        new URLSearchParams({
          tailLines: tailLines.toString(),
          timestamps: 'true',
          ...(selectedContainer && { container: selectedContainer }),
        })
      );

      const data = await response.json();
      setLogs(data.logs || 'No logs available');
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs('Error fetching logs: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [record, tailLines, selectedContainer]);

  const downloadLogs = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.namespace}-${record.name}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (!record) return null;

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748' }}>
            Container Logs
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {record.containers?.length > 1 && (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Container</InputLabel>
                <Select
                  value={selectedContainer}
                  onChange={(e) => setSelectedContainer(e.target.value)}
                  label="Container"
                >
                  {record.containers.map((container: any) => (
                    <MenuItem key={container.name} value={container.name}>
                      {container.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Lines</InputLabel>
              <Select
                value={tailLines}
                onChange={(e) => setTailLines(Number(e.target.value))}
                label="Lines"
              >
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
                <MenuItem value={500}>500</MenuItem>
                <MenuItem value={1000}>1000</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchLogs}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadLogs}
            >
              Download
            </Button>
          </Box>
        </Box>
        <Paper
          sx={{
            p: 2,
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.875rem',
            maxHeight: '600px',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#2d2d30',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#3e3e42',
              borderRadius: '4px',
            },
          }}
        >
          {loading ? (
            <Typography>Loading logs...</Typography>
          ) : (
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {logs}
            </pre>
          )}
        </Paper>
      </CardContent>
    </Card>
  );
};

const ContainerStatus = () => {
  const record = useRecordContext();

  if (!record?.containers) return null;

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
          Containers
        </Typography>
        <Box sx={{ display: 'grid', gap: 2 }}>
          {record.containers.map((container: any) => (
            <Paper key={container.name} sx={{ p: 2, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: '#2d3748' }}>
                    {container.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096', mt: 0.5 }}>
                    {container.image}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={container.ready ? 'Ready' : 'Not Ready'}
                    size="small"
                    sx={{
                      background: container.ready
                        ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                        : 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
                      color: 'white',
                    }}
                  />
                  <Chip
                    icon={<RefreshIcon />}
                    label={`Restarts: ${container.restartCount}`}
                    size="small"
                    sx={{
                      background: container.restartCount > 0
                        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      '& .MuiChip-icon': {
                        color: 'white',
                      },
                    }}
                  />
                  <Chip
                    label={container.state}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export const PodShow = () => (
  <Show>
    <SimpleShowLayout>
      <FunctionField
        label="Pod Information"
        render={(record: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
              }}
            >
              <StorageIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748' }}>
                {record.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#718096' }}>
                Namespace: {record.namespace}
              </Typography>
            </Box>
          </Box>
        )}
      />
      <TextField source="status" label="Status" />
      <TextField source="phase" label="Phase" />
      <TextField source="ready" label="Ready" />
      <TextField source="restarts" label="Restarts" />
      <TextField source="age" label="Age" />
      <TextField source="ip" label="IP Address" />
      <TextField source="node" label="Node" />
      <ContainerStatus />
      <LogViewer />
    </SimpleShowLayout>
  </Show>
);
