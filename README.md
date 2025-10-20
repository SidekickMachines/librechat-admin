# LibreChat Admin Panel

A web-based admin panel for managing LibreChat users, conversations, and system settings. Built with React-Admin and Material-UI, secured with Azure AD authentication via OAuth2-Proxy.

## Features

- **User Management**: Create, edit, delete users and assign admin roles
- **Conversation Management**: View and delete conversations
- **Analytics Dashboard**: Monitor total users, conversations, and activity
- **Secure Authentication**: Azure AD (Entra ID) authentication via OAuth2-Proxy
- **Role-Based Access**: Restrict admin panel access to specific users or groups

## Architecture

```
User → Nginx Ingress → OAuth2-Proxy (Azure AD) → React Admin UI → LibreChat API
```

## Prerequisites

- Kubernetes cluster with nginx-ingress-controller
- cert-manager for SSL certificates
- Azure AD (Entra ID) tenant
- LibreChat instance running in the same namespace
- kubectl configured with cluster access
- GitHub account (for CI/CD)

## Setup Instructions

### 1. Azure AD Application Registration

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click "New registration"
3. Name: `LibreChat Admin Panel`
4. Redirect URI: `https://chat.sidekickmachines.com/admin/oauth2/callback`
5. Click "Register"
6. Note the **Application (client) ID** and **Directory (tenant) ID**
7. Go to "Certificates & secrets" → "New client secret"
8. Note the **client secret value** (copy immediately, it won't be shown again)
9. Go to "API permissions" → Add "User.Read" (optional, for user info)
10. Go to "Authentication" → Enable "ID tokens"

### 2. Create Kubernetes Secret

```bash
# Generate cookie secret
COOKIE_SECRET=$(openssl rand -hex 16)

# Create secret
kubectl create secret generic oauth2-proxy-admin \
  -n librechat \
  --from-literal=OAUTH2_PROXY_CLIENT_ID="your-azure-client-id" \
  --from-literal=OAUTH2_PROXY_CLIENT_SECRET="your-azure-client-secret" \
  --from-literal=OAUTH2_PROXY_COOKIE_SECRET="$COOKIE_SECRET"
```

### 3. Update OAuth2-Proxy Configuration

Edit `k8s/oauth2-proxy/deployment.yaml` and replace:
- `YOUR_TENANT_ID` with your Azure Tenant ID (2 occurrences)

Optional: Restrict access to specific Azure AD groups:
```yaml
- name: OAUTH2_PROXY_ALLOWED_GROUPS
  value: "group-id-1,group-id-2"
```

To get Azure AD group IDs:
```bash
az ad group list --query "[?displayName=='Your Group Name'].objectId" -o tsv
```

### 4. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/admin-ui/deployment.yaml
kubectl apply -f k8s/admin-ui/service.yaml
kubectl apply -f k8s/oauth2-proxy/service.yaml
kubectl apply -f k8s/oauth2-proxy/deployment.yaml
kubectl apply -f k8s/ingress.yaml

# Check deployment status
kubectl get pods -n librechat -l app=librechat-admin-ui
kubectl get pods -n librechat -l app=oauth2-proxy-admin
```

### 5. Set Up GitHub Actions (Optional)

For automated CI/CD:

1. Create a new GitHub repository for this project
2. Push code to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/librechat-admin.git
   git push -u origin main
   ```

3. Add kubeconfig as GitHub secret:
   ```bash
   # Base64 encode your kubeconfig
   cat ~/.kube/config | base64 | pbcopy  # macOS
   # or
   cat ~/.kube/config | base64 | xclip -selection clipboard  # Linux
   ```

4. Go to GitHub repo → Settings → Secrets → Actions → New repository secret
   - Name: `KUBECONFIG`
   - Value: Paste the base64-encoded kubeconfig

5. Push to main branch to trigger deployment

## Local Development

```bash
cd admin-ui

# Install dependencies
npm install

# Start dev server (proxies to LibreChat API at localhost:3080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Accessing the Admin Panel

Once deployed, access at:
```
https://chat.sidekickmachines.com/admin/
```

You'll be redirected to Azure AD for authentication, then back to the admin panel.

## Configuration

### Environment Variables (Dev)

For local development, you can configure the API proxy in `admin-ui/vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3080',  // Your LibreChat API URL
    changeOrigin: true,
  },
}
```

### Nginx Configuration

The production Docker image uses nginx to serve the React app. Configuration is in `nginx.conf`.

Key settings:
- Serves app at `/admin/` path
- Caches static assets for 1 year
- Proxies `/api/` requests to LibreChat backend

### OAuth2-Proxy Configuration

Key settings in `k8s/oauth2-proxy/deployment.yaml`:
- **Provider**: azure
- **Cookie expiry**: 7 days
- **Session refresh**: 1 hour
- **Buffer sizes**: 16k (to handle large OAuth cookies)

## Troubleshooting

### 502 Bad Gateway after OAuth callback

This is usually caused by OAuth cookie size exceeding nginx buffer limits. The ingress includes increased buffer sizes:

```yaml
nginx.ingress.kubernetes.io/proxy-buffer-size: "16k"
nginx.ingress.kubernetes.io/proxy-buffers-number: "8"
```

If issues persist, consider using Redis session storage for OAuth2-Proxy.

### OAuth "code already redeemed" error

This happens when nginx retries requests. Ensure buffer sizes are sufficient (see above).

### Cannot access admin panel

Check:
1. OAuth2-Proxy pod is running: `kubectl get pods -n librechat -l app=oauth2-proxy-admin`
2. Admin UI pod is running: `kubectl get pods -n librechat -l app=librechat-admin-ui`
3. Ingress is configured: `kubectl describe ingress librechat-admin-ingress -n librechat`
4. Azure AD redirect URI matches exactly (including https://)

### View logs

```bash
# OAuth2-Proxy logs
kubectl logs -n librechat -l app=oauth2-proxy-admin -f

# Admin UI logs
kubectl logs -n librechat -l app=librechat-admin-ui -f
```

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Admin Framework**: React-Admin
- **UI Library**: Material-UI
- **Build Tool**: Vite
- **Data Provider**: Custom LibreChat REST API provider
- **Authentication**: OAuth2-Proxy + Azure AD
- **Container**: Docker + nginx
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions

## Security Considerations

1. **OAuth2-Proxy** handles all authentication - no unauthenticated access possible
2. **HTTPS only** - enforced by nginx ingress
3. **Secure cookies** - HttpOnly, Secure, SameSite=Lax
4. **Azure AD groups** - restrict access to specific groups
5. **No exposed secrets** - all secrets in Kubernetes Secret objects
6. **Read-only by default** - admin UI only shows data user has permission to see

## API Endpoints Used

The admin panel consumes these LibreChat API endpoints:

- `GET /api/user` - Get current user info
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)
- `GET /api/convos` - List conversations
- `DELETE /api/convos/:id` - Delete conversation

Note: Some endpoints may need to be added to LibreChat backend if they don't exist yet.

## Future Enhancements

- [ ] System settings management
- [ ] Advanced analytics (usage over time, model usage, etc.)
- [ ] User activity logs
- [ ] Bulk user operations
- [ ] Export user/conversation data
- [ ] Redis session storage for OAuth2-Proxy
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Custom branding

## Contributing

Contributions are welcome! Please open an issue or PR.

## License

MIT License

## Support

For issues and questions, please open a GitHub issue or contact the maintainer.

## Acknowledgments

- Built with [React-Admin](https://marmelab.com/react-admin/)
- Authentication by [OAuth2-Proxy](https://oauth2-proxy.github.io/oauth2-proxy/)
- Inspired by the [mongo-admin](../mongo-admin) setup

---

**Note**: This admin panel is designed specifically for LibreChat and relies on LibreChat's API endpoints and authentication system.
