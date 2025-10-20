import {
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  ArrayInput,
  SimpleFormIterator,
} from 'react-admin';

export const AgentEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Name" required fullWidth />
      <TextInput source="description" label="Description" fullWidth multiline rows={2} />
      <TextInput
        source="instructions"
        label="Instructions"
        fullWidth
        multiline
        rows={8}
        helperText="Detailed instructions for the agent's behavior"
      />
      <TextInput source="provider" label="Provider" required />
      <TextInput source="model" label="Model" required />

      <ArrayInput source="tools" label="Tools">
        <SimpleFormIterator>
          <TextInput source="" label="Tool Name" fullWidth />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="conversation_starters" label="Conversation Starters">
        <SimpleFormIterator>
          <TextInput source="" label="Starter" fullWidth multiline />
        </SimpleFormIterator>
      </ArrayInput>

      <BooleanInput source="is_promoted" label="Promoted" />
      <BooleanInput source="end_after_tools" label="End After Tools" />
      <BooleanInput source="hide_sequential_outputs" label="Hide Sequential Outputs" />
    </SimpleForm>
  </Edit>
);
