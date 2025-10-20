import {
  Create,
  SimpleForm,
  TextInput,
  BooleanInput,
  ArrayInput,
  SimpleFormIterator,
} from 'react-admin';

export const AgentCreate = () => (
  <Create>
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
      <TextInput source="provider" label="Provider" required defaultValue="azureOpenAI" />
      <TextInput source="model" label="Model" required defaultValue="gpt-4" />

      <ArrayInput source="tools" label="Tools" defaultValue={[]}>
        <SimpleFormIterator>
          <TextInput source="" label="Tool Name" fullWidth />
        </SimpleFormIterator>
      </ArrayInput>

      <ArrayInput source="conversation_starters" label="Conversation Starters" defaultValue={[]}>
        <SimpleFormIterator>
          <TextInput source="" label="Starter" fullWidth multiline />
        </SimpleFormIterator>
      </ArrayInput>

      <BooleanInput source="is_promoted" label="Promoted" defaultValue={false} />
      <BooleanInput source="end_after_tools" label="End After Tools" defaultValue={false} />
      <BooleanInput source="hide_sequential_outputs" label="Hide Sequential Outputs" defaultValue={false} />
    </SimpleForm>
  </Create>
);
