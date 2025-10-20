import type { AuthProvider } from 'react-admin';

/**
 * Auth provider for OAuth2-Proxy authentication
 * OAuth2-Proxy handles authentication via Azure AD and injects headers
 * The actual authentication is managed by the proxy, not the React app
 */
export const authProvider: AuthProvider = {
  // OAuth2-Proxy ensures only authenticated users reach this app
  login: () => Promise.resolve(),

  // Called when checking if user is authenticated
  checkAuth: async () => {
    // OAuth2-Proxy will redirect unauthenticated users to Azure AD
    // If we're here, the user is authenticated
    return Promise.resolve();
  },

  // Called when the user clicks on logout
  logout: () => {
    // Redirect to OAuth2-Proxy's sign out endpoint
    window.location.href = '/admin/oauth2/sign_out';
    return Promise.resolve();
  },

  // Called when the API returns an error
  checkError: ({ status }: { status: number }) => {
    if (status === 401 || status === 403) {
      // Redirect to OAuth2-Proxy which will re-authenticate
      window.location.href = '/admin/oauth2/start';
      return Promise.reject();
    }
    return Promise.resolve();
  },

  // Get user identity from OAuth2-Proxy headers (passed through by API)
  getIdentity: async () => {
    try {
      const response = await fetch('/api/user');
      const user = await response.json();
      return {
        id: user.id || user._id,
        fullName: user.name || user.username || user.email,
        avatar: user.avatar,
      };
    } catch (error) {
      return {
        id: 'unknown',
        fullName: 'Admin User',
      };
    }
  },

  // Get user permissions - check if admin
  getPermissions: async () => {
    try {
      const response = await fetch('/api/user');
      const user = await response.json();
      return user.role === 'ADMIN' ? 'admin' : 'user';
    } catch (error) {
      return 'user';
    }
  },
};
