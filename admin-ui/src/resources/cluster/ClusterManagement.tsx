import React, { useState } from 'react';
import {
  useDataProvider,
  useNotify,
  useRefresh,
  Loading,
  Title,
} from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Deployment {
  id: string;
  name: string;
  namespace: string;
  status: string;
  replicas: string;
  age: string;
  images: string[];
}

interface CommandResult {
  command: string;
  namespace: string;
  output: string;
  error: string;
  exitCode: number;
  timestamp: string;
}

export const ClusterManagement = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState<string | null>(null);

  // Command executor state
  const [command, setCommand] = useState('get pods');
  const [namespace, setNamespace] = useState('librechat');
  const [executing, setExecuting] = useState(false);
  const [commandResult, setCommandResult] = useState<CommandResult | null>(null);
  const [allowedCommands, setAllowedCommands] = useState<any[]>([]);

  // Load deployments on mount
  React.useEffect(() => {
    loadDeployments();
    loadAllowedCommands();
  }, []);

  const loadDeployments = async () => {
    try {
      setLoading(true);
      const { data } = await dataProvider.getList('deployments', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'name', order: 'ASC' },
        filter: {},
      });
      setDeployments(data as Deployment[]);
    } catch (error: any) {
      notify(`Error loading deployments: ${error.message}`, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadAllowedCommands = async () => {
    try {
      const response = await fetch('/admin/api/kubectl/commands');
      const data = await response.json();
      setAllowedCommands(data.allowedCommands || []);
    } catch (error: any) {
      console.error('Error loading allowed commands:', error);
    }
  };

  const handleRestartDeployment = async (deploymentId: string, deploymentName: string) => {
    try {
      setRestarting(deploymentId);
      const response = await fetch(`/admin/api/deployments/${deploymentId}/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to restart deployment');
      }

      const result = await response.json();
      notify(`Deployment ${deploymentName} restarted successfully`, { type: 'success' });

      // Reload deployments after a short delay
      setTimeout(() => {
        loadDeployments();
      }, 2000);
    } catch (error: any) {
      notify(`Error restarting deployment: ${error.message}`, { type: 'error' });
    } finally {
      setRestarting(null);
    }
  };

  const handleExecuteCommand = async () => {
    if (!command.trim()) {
      notify('Please enter a command', { type: 'warning' });
      return;
    }

    try {
      setExecuting(true);
      setCommandResult(null);

      const response = await fetch('/admin/api/kubectl/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command.trim(),
          namespace: namespace,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute command');
      }

      const result = await response.json();
      setCommandResult(result);

      if (result.exitCode === 0) {
        notify('Command executed successfully', { type: 'success' });
      } else {
        notify('Command executed with errors', { type: 'warning' });
      }
    } catch (error: any) {
      notify(`Error executing command: ${error.message}`, { type: 'error' });
      setCommandResult({
        command: command,
        namespace: namespace,
        output: '',
        error: error.message,
        exitCode: 1,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setExecuting(false);
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'Ready':
        return 'success';
      case 'Not Ready':
        return 'error';
      case 'Partial':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Title title="Cluster Management" />

      {/* Deployments Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Deployments
            </Typography>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadDeployments}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f3f4f6' }}>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Namespace</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Replicas</strong></TableCell>
                  <TableCell><strong>Age</strong></TableCell>
                  <TableCell><strong>Images</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deployments.map((deployment) => (
                  <TableRow key={deployment.id} hover>
                    <TableCell>{deployment.name}</TableCell>
                    <TableCell>
                      <Chip label={deployment.namespace} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={deployment.status}
                        color={getStatusColor(deployment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{deployment.replicas}</TableCell>
                    <TableCell>{deployment.age}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', maxWidth: 300 }}>
                        {deployment.images.join(', ')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={restarting === deployment.id ? <CircularProgress size={16} /> : <RefreshIcon />}
                        onClick={() => handleRestartDeployment(deployment.id, deployment.name)}
                        disabled={restarting === deployment.id}
                        sx={{ minWidth: 100 }}
                      >
                        {restarting === deployment.id ? 'Restarting...' : 'Restart'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {deployments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No deployments found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Kubectl Command Executor Section */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Kubectl Command Executor
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            Only read-only commands are allowed: <strong>get, describe, logs, top, explain</strong>
          </Alert>

          {/* Command Reference */}
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>📖 Command Reference</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                {allowedCommands.map((cmd, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {cmd.command}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cmd.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      Examples:
                      {cmd.examples.map((example: string, i: number) => (
                        <Box key={i} component="span" sx={{ display: 'block', ml: 2 }}>
                          • {example}
                        </Box>
                      ))}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Command Input */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Namespace</InputLabel>
              <Select
                value={namespace}
                label="Namespace"
                onChange={(e) => setNamespace(e.target.value)}
                disabled={executing}
              >
                <MenuItem value="librechat">librechat</MenuItem>
                <MenuItem value="snow-mcp">snow-mcp</MenuItem>
                <MenuItem value="default">default</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="get pods"
              disabled={executing}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleExecuteCommand();
                }
              }}
            />

            <Button
              variant="contained"
              startIcon={executing ? <CircularProgress size={16} /> : <PlayArrowIcon />}
              onClick={handleExecuteCommand}
              disabled={executing || !command.trim()}
              sx={{ minWidth: 120 }}
            >
              {executing ? 'Running...' : 'Execute'}
            </Button>
          </Box>

          {/* Command Result */}
          {commandResult && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Result:
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: commandResult.exitCode === 0 ? '#f0f9ff' : '#fef2f2',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto',
                  maxHeight: 400,
                  overflowY: 'auto',
                }}
              >
                {commandResult.output && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Output:
                    </Typography>
                    <Box component="pre" sx={{ m: 0, mt: 1 }}>
                      {commandResult.output}
                    </Box>
                  </Box>
                )}
                {commandResult.error && (
                  <Box sx={{ mt: commandResult.output ? 2 : 0 }}>
                    <Typography variant="caption" color="error">
                      Error:
                    </Typography>
                    <Box component="pre" sx={{ m: 0, mt: 1, color: 'error.main' }}>
                      {commandResult.error}
                    </Box>
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Exit Code: {commandResult.exitCode} | Executed at: {new Date(commandResult.timestamp).toLocaleString()}
                </Typography>
              </Paper>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
