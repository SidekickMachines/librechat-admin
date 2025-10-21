import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { CustomLayout } from './components/CustomLayout';
import { Dashboard } from './resources/dashboard/Dashboard';
import { CostDashboard } from './resources/costs/CostDashboard';
import { UserList } from './resources/users/UserList';
import { UserEdit } from './resources/users/UserEdit';
import { UserCreate } from './resources/users/UserCreate';
import { ConversationList } from './resources/conversations/ConversationList';
import { RoleList } from './resources/roles/RoleList';
import { RoleEdit } from './resources/roles/RoleEdit';
import { RoleCreate } from './resources/roles/RoleCreate';
import { PodList } from './resources/pods/PodList';
import { PodShow } from './resources/pods/PodShow';
import { MessageList } from './resources/messages/MessageList';
import { AgentList } from './resources/agents/AgentList';
import { AgentShow } from './resources/agents/AgentShow';
import { AgentEdit } from './resources/agents/AgentEdit';
import { AgentCreate } from './resources/agents/AgentCreate';
import { FileList } from './resources/files/FileList';
import { SessionList } from './resources/sessions/SessionList';
import { TokenList } from './resources/tokens/TokenList';
import { TransactionList } from './resources/transactions/TransactionList';
import { ProjectList } from './resources/projects/ProjectList';
import { AuditList } from './resources/audit/AuditList';
import { ClusterManagement } from './resources/cluster/ClusterManagement';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import MessageIcon from '@mui/icons-material/Message';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import TokenIcon from '@mui/icons-material/Token';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FolderIcon from '@mui/icons-material/Folder';
import AssessmentIcon from '@mui/icons-material/Assessment';

function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={Dashboard}
      layout={CustomLayout}
      title="LibreChat Admin"
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
        name="roles"
        list={RoleList}
        edit={RoleEdit}
        create={RoleCreate}
        icon={SecurityIcon}
        options={{ label: 'Roles' }}
      />
      <Resource
        name="convos"
        list={ConversationList}
        icon={ChatIcon}
        options={{ label: 'Conversations' }}
      />
      <Resource
        name="pods"
        list={PodList}
        show={PodShow}
        icon={StorageIcon}
        options={{ label: 'Pods' }}
      />
      <Resource
        name="messages"
        list={MessageList}
        icon={MessageIcon}
        options={{ label: 'Messages' }}
      />
      <Resource
        name="agents"
        list={AgentList}
        show={AgentShow}
        edit={AgentEdit}
        create={AgentCreate}
        icon={SmartToyIcon}
        options={{ label: 'Agents' }}
      />
      <Resource
        name="files"
        list={FileList}
        icon={AttachFileIcon}
        options={{ label: 'Files' }}
      />
      <Resource
        name="sessions"
        list={SessionList}
        icon={VpnKeyIcon}
        options={{ label: 'Sessions' }}
      />
      <Resource
        name="tokens"
        list={TokenList}
        icon={TokenIcon}
        options={{ label: 'Tokens' }}
      />
      <Resource
        name="transactions"
        list={TransactionList}
        icon={ReceiptIcon}
        options={{ label: 'Transactions' }}
      />
      <Resource
        name="projects"
        list={ProjectList}
        icon={FolderIcon}
        options={{ label: 'Projects' }}
      />
      <Resource
        name="audit-logs"
        list={AuditList}
        icon={AssessmentIcon}
        options={{ label: 'Audit Logs' }}
      />
      <Resource name="deployments" />
      <CustomRoutes>
        <Route path="/costs" element={<CostDashboard />} />
        <Route path="/cluster" element={<ClusterManagement />} />
      </CustomRoutes>
    </Admin>
  );
}

export default App;
