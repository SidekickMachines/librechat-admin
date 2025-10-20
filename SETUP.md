# LibreChat Admin Panel - Setup Guide

## Step-by-Step Setup Instructions

### 1. Azure AD Application Registration

1. Go to [Azure Portal](https://portal.azure.com) → Azure Active Directory → App registrations
2. Click "New registration"
3. **Name**: `LibreChat Admin Panel`
4. **Redirect URI**:
   - Type: Web
   - URL: `https://chat.sidekickmachines.com/admin/oauth2/callback`
5. Click "Register"

6. **Note the credentials** (you'll need these for GitHub secrets):
   - **Application (client) ID** - Copy this
   - **Directory (tenant) ID** - Copy this

7. **Create a client secret**:
   - Go to "Certificates & secrets" → "New client secret"
   - Description: `LibreChat Admin Secret`
   - Expires: Choose your expiration (recommended: 12-24 months)
   - Click "Add"
   - **Copy the secret VALUE immediately** (it won't be shown again)

8. **Configure authentication**:
   - Go to "Authentication"
   - Under "Implicit grant and hybrid flows", enable:
     - ✅ ID tokens (used for implicit and hybrid flows)
   - Click "Save"

9. **API Permissions** (Optional, for user info):
   - Go to "API permissions"
   - Microsoft Graph permissions should include:
     - User.Read (usually added by default)
   - Click "Grant admin consent" if you have admin rights

### 2. Update Kubernetes Deployment with Tenant ID

Edit the file: `k8s/oauth2-proxy/deployment.yaml`

Replace `YOUR_TENANT_ID` with your actual Azure Tenant ID in these two lines:
```yaml
- name: OAUTH2_PROXY_AZURE_TENANT
  value: "YOUR_TENANT_ID"  # Replace with your Azure Tenant ID
- name: OAUTH2_PROXY_OIDC_ISSUER_URL
  value: "https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0"  # Replace YOUR_TENANT_ID
```

Commit and push the changes:
```bash
git add k8s/oauth2-proxy/deployment.yaml
git commit -m "Update OAuth2-Proxy with Azure Tenant ID"
git push
```

### 3. Configure GitHub Repository Secrets

Go to your GitHub repository:
`https://github.com/SidekickMachines/librechat-admin`

Navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these three secrets:

#### Secret 1: K3S_KUBE_CONFIG
- **Name**: `K3S_KUBE_CONFIG`
- **Value**: Base64-encoded kubeconfig file
- Status: ✅ Already added by you

#### Secret 2: AZURE_CLIENT_ID
- **Name**: `AZURE_CLIENT_ID`
- **Value**: The Application (client) ID from Azure AD (Step 1.6)

#### Secret 3: AZURE_CLIENT_SECRET
- **Name**: `AZURE_CLIENT_SECRET`
- **Value**: The client secret value from Azure AD (Step 1.7)

### 4. Deploy the Application

The deployment happens automatically via GitHub Actions on push to main branch.

To trigger a deployment:
```bash
# Make a small change or trigger workflow manually
git commit --allow-empty -m "Trigger deployment"
git push
```

Or trigger manually from GitHub:
- Go to **Actions** tab
- Select "Build and Deploy LibreChat Admin"
- Click "Run workflow"

### 5. Verify Deployment

Check GitHub Actions:
- Go to **Actions** tab
- Watch the build and deploy workflow
- Should complete in ~5-10 minutes

Check Kubernetes pods:
```bash
kubectl get pods -n librechat -l app=librechat-admin-ui
kubectl get pods -n librechat -l app=oauth2-proxy-admin
```

Check ingress:
```bash
kubectl get ingress librechat-admin-ingress -n librechat
```

### 6. Access the Admin Panel

Once deployed, access at:
```
https://chat.sidekickmachines.com/admin/
```

You'll be redirected to Azure AD for authentication, then back to the admin panel.

## Restricting Access to Specific Users/Groups

### Option A: Restrict by Email Domain
In `k8s/oauth2-proxy/deployment.yaml`:
```yaml
- name: OAUTH2_PROXY_EMAIL_DOMAINS
  value: "sidekickmachines.com"  # Only allow this domain
```

### Option B: Restrict by Azure AD Group (Recommended)

1. **Create an Azure AD group** for admin users:
   - Azure Portal → Azure Active Directory → Groups
   - Create group: "LibreChat Admins"
   - Add authorized users

2. **Get the group Object ID**:
   ```bash
   az ad group list --query "[?displayName=='LibreChat Admins'].objectId" -o tsv
   ```
   Or find it in Azure Portal → Groups → LibreChat Admins → Overview → Object ID

3. **Update OAuth2-Proxy deployment**:
   ```yaml
   - name: OAUTH2_PROXY_ALLOWED_GROUPS
     value: "12345678-1234-1234-1234-123456789abc"  # Your group Object ID
   ```

4. **Commit and push**:
   ```bash
   git add k8s/oauth2-proxy/deployment.yaml
   git commit -m "Restrict admin access to specific Azure AD group"
   git push
   ```

## Troubleshooting

### OAuth2-Proxy logs
```bash
kubectl logs -n librechat -l app=oauth2-proxy-admin -f
```

### Admin UI logs
```bash
kubectl logs -n librechat -l app=librechat-admin-ui -f
```

### Common Issues

**502 Bad Gateway after login**:
- Check OAuth2-Proxy logs
- Verify buffer sizes in ingress are set (should be 16k)
- Ensure cookie secret is exactly 32 characters (hex)

**"OAuth code already redeemed" error**:
- This is usually transient due to nginx retries
- Buffer sizes in ingress.yaml should fix this

**Cannot access admin panel**:
- Verify ingress is created: `kubectl get ingress -n librechat`
- Check OAuth2-Proxy pod is running
- Verify Azure AD redirect URI matches exactly (including https://)

**Authentication loop**:
- Check Azure Tenant ID is correct in deployment
- Verify client ID and secret are correct in GitHub secrets
- Ensure ID tokens are enabled in Azure AD app authentication settings

## Architecture

```
User Request
    ↓
Nginx Ingress (chat.sidekickmachines.com/admin)
    ↓
OAuth2-Proxy (port 4180)
    ├─ Not authenticated → Redirect to Azure AD
    └─ Authenticated → Pass to Admin UI
           ↓
    Admin UI (nginx on port 80)
           ↓
    LibreChat API (librechatlocal-librechatlocal:3080)
```

## Next Steps

After successful deployment:

1. **Test user management**: Create/edit/delete test users
2. **Test conversation viewing**: Browse conversations
3. **Check analytics dashboard**: Verify stats are loading
4. **Set up Azure AD group restrictions** (recommended for production)
5. **Monitor logs** for any errors or issues

## Support

For issues:
- Check GitHub Actions logs
- Check Kubernetes pod logs
- Review Azure AD sign-in logs (Azure Portal → Azure AD → Sign-in logs)
- Open an issue in the repository
