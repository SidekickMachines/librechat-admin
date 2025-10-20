import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  BooleanField,
  FunctionField,
} from 'react-admin';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export const AgentShow = () => (
  <Show>
    <SimpleShowLayout>
      <FunctionField
        label="Agent Information"
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
              <SmartToyIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#2d3748' }}>
                {record.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#718096' }}>
                {record.id}
              </Typography>
            </Box>
          </Box>
        )}
      />
      <TextField source="description" label="Description" />
      <TextField source="provider" label="Provider" />
      <TextField source="model" label="Model" />
      <BooleanField source="is_promoted" label="Promoted" />
      <BooleanField source="end_after_tools" label="End After Tools" />
      <BooleanField source="hide_sequential_outputs" label="Hide Sequential Outputs" />

      <FunctionField
        label="Instructions"
        render={(record: any) => (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
                Agent Instructions
              </Typography>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: '#f7fafc',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.875rem',
                }}
              >
                {record.instructions || 'No instructions provided'}
              </Box>
            </CardContent>
          </Card>
        )}
      />

      <FunctionField
        label="Tools"
        render={(record: any) => (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
                Tools ({record.tools?.length || 0})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {record.tools?.map((tool: string, index: number) => (
                  <Chip
                    key={index}
                    label={tool}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                    }}
                  />
                )) || <Typography variant="body2" color="textSecondary">No tools configured</Typography>}
              </Box>
            </CardContent>
          </Card>
        )}
      />

      <FunctionField
        label="Project IDs"
        render={(record: any) => (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
                Projects ({record.projectIds?.length || 0})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {record.projectIds?.map((projectId: any, index: number) => (
                  <Chip
                    key={index}
                    label={projectId.toString()}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                    }}
                  />
                )) || <Typography variant="body2" color="textSecondary">No projects</Typography>}
              </Box>
            </CardContent>
          </Card>
        )}
      />

      <FunctionField
        label="Conversation Starters"
        render={(record: any) => (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2d3748', mb: 2 }}>
                Conversation Starters ({record.conversation_starters?.length || 0})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {record.conversation_starters?.map((starter: string, index: number) => (
                  <Box key={index} sx={{ p: 1, backgroundColor: '#f7fafc', borderRadius: 1 }}>
                    {starter}
                  </Box>
                )) || <Typography variant="body2" color="textSecondary">No conversation starters</Typography>}
              </Box>
            </CardContent>
          </Card>
        )}
      />

      <DateField source="createdAt" label="Created At" showTime />
      <DateField source="updatedAt" label="Updated At" showTime />
    </SimpleShowLayout>
  </Show>
);
