import { Admin, Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { Dashboard } from './resources/dashboard/Dashboard';
import { UserList } from './resources/users/UserList';
import { UserEdit } from './resources/users/UserEdit';
import { UserCreate } from './resources/users/UserCreate';
import { ConversationList } from './resources/conversations/ConversationList';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';

function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={Dashboard}
      title="LibreChat Admin"
      basename="/admin"
    >
      <Resource
        name="users"
        list={UserList}
        edit={UserEdit}
        create={UserCreate}
        icon={PeopleIcon}
        options={{ label: 'Users' }}
      />
      <Resource
        name="convos"
        list={ConversationList}
        icon={ChatIcon}
        options={{ label: 'Conversations' }}
      />
    </Admin>
  );
}

export default App;
