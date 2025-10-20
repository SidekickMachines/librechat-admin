import {
  Create,
  TextInput,
  BooleanInput,
  required,
  TabbedForm,
  FormTab,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

export const RoleCreate = () => (
  <Create>
    <TabbedForm>
      <FormTab label="Basic Info">
        <TextInput source="name" label="Role Name" validate={[required()]} fullWidth />
      </FormTab>

      <FormTab label="Bookmarks & Prompts">
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            Bookmarks
          </Typography>
          <BooleanInput
            source="permissions.BOOKMARKS.USE"
            label="Use Bookmarks"
            defaultValue={false}
          />

          <Typography variant="h6" gutterBottom sx={{ marginTop: 3 }}>
            Prompts
          </Typography>
          <BooleanInput
            source="permissions.PROMPTS.USE"
            label="Use Prompts"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.PROMPTS.CREATE"
            label="Create Prompts"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.PROMPTS.SHARED_GLOBAL"
            label="Share Prompts Globally"
            defaultValue={false}
          />
        </Box>
      </FormTab>

      <FormTab label="Memories">
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            Memories
          </Typography>
          <BooleanInput
            source="permissions.MEMORIES.USE"
            label="Use Memories"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.MEMORIES.CREATE"
            label="Create Memories"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.MEMORIES.UPDATE"
            label="Update Memories"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.MEMORIES.READ"
            label="Read Memories"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.MEMORIES.OPT_OUT"
            label="Opt Out of Memories"
            defaultValue={false}
          />
        </Box>
      </FormTab>

      <FormTab label="Agents & Marketplace">
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            Agents
          </Typography>
          <BooleanInput
            source="permissions.AGENTS.USE"
            label="Use Agents"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.AGENTS.CREATE"
            label="Create Agents"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.AGENTS.SHARED_GLOBAL"
            label="Share Agents Globally"
            defaultValue={false}
          />

          <Typography variant="h6" gutterBottom sx={{ marginTop: 3 }}>
            Marketplace
          </Typography>
          <BooleanInput
            source="permissions.MARKETPLACE.USE"
            label="Use Marketplace"
            defaultValue={false}
          />
        </Box>
      </FormTab>

      <FormTab label="Chat Features">
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            Chat Features
          </Typography>
          <BooleanInput
            source="permissions.MULTI_CONVO.USE"
            label="Use Multi Conversation"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.TEMPORARY_CHAT.USE"
            label="Use Temporary Chat"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.RUN_CODE.USE"
            label="Run Code"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.WEB_SEARCH.USE"
            label="Use Web Search"
            defaultValue={false}
          />
        </Box>
      </FormTab>

      <FormTab label="Files & People">
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>
            File Features
          </Typography>
          <BooleanInput
            source="permissions.FILE_SEARCH.USE"
            label="Use File Search"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.FILE_CITATIONS.USE"
            label="Use File Citations"
            defaultValue={false}
          />

          <Typography variant="h6" gutterBottom sx={{ marginTop: 3 }}>
            People Picker
          </Typography>
          <BooleanInput
            source="permissions.PEOPLE_PICKER.VIEW_USERS"
            label="View Users"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.PEOPLE_PICKER.VIEW_GROUPS"
            label="View Groups"
            defaultValue={false}
          />
          <BooleanInput
            source="permissions.PEOPLE_PICKER.VIEW_ROLES"
            label="View Roles"
            defaultValue={false}
          />
        </Box>
      </FormTab>
    </TabbedForm>
  </Create>
);
