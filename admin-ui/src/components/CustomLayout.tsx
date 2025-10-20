import { Layout, type LayoutProps } from 'react-admin';
import { CustomMenu } from './CustomMenu';

export const CustomLayout = (props: LayoutProps) => (
  <Layout {...props} menu={CustomMenu} />
);
