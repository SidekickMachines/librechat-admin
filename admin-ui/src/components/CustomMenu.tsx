import { Menu, MenuItemLink, useResourceDefinitions, DashboardMenuItem } from 'react-admin';
import { Box, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import ChatIcon from '@mui/icons-material/Chat';
import MessageIcon from '@mui/icons-material/Message';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FolderIcon from '@mui/icons-material/Folder';
import StorageIcon from '@mui/icons-material/Storage';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import TokenIcon from '@mui/icons-material/Token';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CloudIcon from '@mui/icons-material/Cloud';

const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 2 }}>
    <Typography
      variant="caption"
      sx={{
        px: 2,
        py: 1,
        display: 'block',
        color: 'text.secondary',
        fontWeight: 600,
        textTransform: 'uppercase',
        fontSize: '0.75rem',
        letterSpacing: '0.08em',
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

export const CustomMenu = () => {
  const resources = useResourceDefinitions();

  return (
    <Menu
      sx={{
        '& .RaMenuItemLink-root, & .RaDashboardMenuItem-root': {
          borderRadius: 2,
          mx: 1,
          my: 0.5,
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: 'action.hover',
            transform: 'translateX(4px)',
          },
          '&.RaMenuItemLink-active, &.RaDashboardMenuItem-active': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 600,
            '& .MuiListItemIcon-root': {
              color: 'primary.contrastText',
            },
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          },
        },
      }}
    >
      <DashboardMenuItem sx={{ borderRadius: 2, mx: 1, my: 0.5 }} />

      <MenuSection title="User Management">
        {resources.users && (
          <MenuItemLink
            to="/users"
            primaryText="Users"
            leftIcon={<PeopleIcon />}
          />
        )}
        {resources.roles && (
          <MenuItemLink
            to="/roles"
            primaryText="Roles"
            leftIcon={<SecurityIcon />}
          />
        )}
        {resources.sessions && (
          <MenuItemLink
            to="/sessions"
            primaryText="Sessions"
            leftIcon={<VpnKeyIcon />}
          />
        )}
      </MenuSection>

      <MenuSection title="Content & AI">
        {resources.convos && (
          <MenuItemLink
            to="/convos"
            primaryText="Conversations"
            leftIcon={<ChatIcon />}
          />
        )}
        {resources.messages && (
          <MenuItemLink
            to="/messages"
            primaryText="Messages"
            leftIcon={<MessageIcon />}
          />
        )}
        {resources.agents && (
          <MenuItemLink
            to="/agents"
            primaryText="Agents"
            leftIcon={<SmartToyIcon />}
          />
        )}
        {resources.projects && (
          <MenuItemLink
            to="/projects"
            primaryText="Projects"
            leftIcon={<FolderIcon />}
          />
        )}
      </MenuSection>

      <MenuSection title="Storage">
        {resources.files && (
          <MenuItemLink
            to="/files"
            primaryText="Files"
            leftIcon={<AttachFileIcon />}
          />
        )}
        {resources.pods && (
          <MenuItemLink
            to="/pods"
            primaryText="Pods"
            leftIcon={<StorageIcon />}
          />
        )}
      </MenuSection>

      <MenuSection title="Billing & Usage">
        <MenuItemLink
          to="/costs"
          primaryText="Cost Dashboard"
          leftIcon={<AttachMoneyIcon />}
        />
        {resources.tokens && (
          <MenuItemLink
            to="/tokens"
            primaryText="Tokens"
            leftIcon={<TokenIcon />}
          />
        )}
        {resources.transactions && (
          <MenuItemLink
            to="/transactions"
            primaryText="Transactions"
            leftIcon={<ReceiptIcon />}
          />
        )}
      </MenuSection>

      <MenuSection title="Administration">
        <MenuItemLink
          to="/cluster"
          primaryText="Cluster Management"
          leftIcon={<CloudIcon />}
        />
        {resources['audit-logs'] && (
          <MenuItemLink
            to="/audit-logs"
            primaryText="Audit Logs"
            leftIcon={<AssessmentIcon />}
          />
        )}
      </MenuSection>
    </Menu>
  );
};
