# LibreChat Admin Panel - Deployment Summary

## ✅ Completed

All code has been written and pushed to GitHub:
- **Repository**: https://github.com/SidekickMachines/librechat-admin
- **Branch**: main
- **Commit**: 2be524d

### What's Been Built

1. **React-Admin UI** with Material-UI
   - User Management (list, create, edit, delete, roles)
   - Conversation Management (view, search, delete)
   - Analytics Dashboard (user/conversation stats)

2. **Production Docker Build**
   - Multi-stage build with nginx
   - Optimized static asset serving
   - Health checks included

3. **Kubernetes Deployment**
   - Admin UI deployment & service
   - OAuth2-Proxy deployment & service
   - Ingress with SSL and OAuth buffer configs

4. **GitHub Actions CI/CD**
   - Automated Docker build & push to GHCR
   - Automated Kubernetes deployment
   - Uses GitHub secrets for all credentials

## 🔧 Next Steps (Your Tasks)

### 1. Create Azure AD App Registration

Go to Azure Portal: https://portal.azure.com

**Steps:**
1. Azure Active Directory → App registrations → New registration
2. **Name**: LibreChat Admin Panel
3. **Redirect URI**:
   - Type: **Web**
   - URL: **https://chat.sidekickmachines.com/admin/oauth2/callback**
4. Click "Register"
5. **Copy these values** (you'll need them):
   - Application (client) ID
   - Directory (tenant) ID
6. **Create client secret**:
   - Certificates & secrets → New client secret
   - Copy the secret **VALUE** immediately
7. **Enable ID tokens**:
   - Authentication → Enable "ID tokens"
   - Click Save

### 2. Add GitHub Secrets

Go to: https://github.com/SidekickMachines/librechat-admin/settings/secrets/actions

**Required secrets** (click "New repository secret" for each):

| Secret Name | Value | Status |
|------------|-------|--------|
| K3S_KUBE_CONFIG | Base64-encoded kubeconfig | ✅ Already added |
| TENANT_ID | Azure Tenant/Directory ID | ✅ Already added |
| AZURE_CLIENT_ID | Azure Application (client) ID | ⏳ Add from step 1.5 |
| AZURE_CLIENT_SECRET | Azure client secret value | ⏳ Add from step 1.6 |

### 3. Trigger Deployment

**Option A: Automatic (push to main)**
```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

**Option B: Manual (GitHub UI)**
1. Go to: https://github.com/SidekickMachines/librechat-admin/actions
2. Click "Build and Deploy LibreChat Admin"
3. Click "Run workflow" → Run workflow

### 4. Monitor Deployment

**Watch GitHub Actions:**
- https://github.com/SidekickMachines/librechat-admin/actions

**Expected duration:** 5-10 minutes

**Check pods after deployment:**
```bash
kubectl get pods -n librechat -l app=librechat-admin-ui
kubectl get pods -n librechat -l app=oauth2-proxy-admin
```

### 5. Access Admin Panel

Once deployed, access at:
```
https://chat.sidekickmachines.com/admin/
```

You'll be redirected to Azure AD for authentication.

## 📋 GitHub Secrets Configuration Summary

The workflow automatically:
- ✅ Creates OAuth2-Proxy Kubernetes secret from GitHub secrets
- ✅ Generates secure cookie secret (32-char hex)
- ✅ Replaces TENANT_ID placeholders in deployment
- ✅ Builds and pushes Docker image to GHCR
- ✅ Deploys all Kubernetes resources
- ✅ Restarts deployments to pick up changes

## 🔍 Troubleshooting

### View logs
```bash
# OAuth2-Proxy logs
kubectl logs -n librechat -l app=oauth2-proxy-admin -f

# Admin UI logs
kubectl logs -n librechat -l app=librechat-admin-ui -f
```

### Common issues

**Build fails:**
- Check GitHub Actions logs
- Ensure all secrets are set correctly

**502 Bad Gateway:**
- Check OAuth2-Proxy logs
- Verify Azure credentials are correct
- Ensure redirect URI matches exactly

**Authentication loop:**
- Verify TENANT_ID is correct
- Check that ID tokens are enabled in Azure AD
- Confirm redirect URI in Azure matches exactly

### Get deployment status
```bash
kubectl get all -n librechat -l app=librechat-admin-ui
kubectl get all -n librechat -l app=oauth2-proxy-admin
kubectl describe ingress librechat-admin-ingress -n librechat
```

## 📚 Documentation

- **Setup Guide**: [SETUP.md](./SETUP.md) - Detailed setup instructions
- **README**: [README.md](./README.md) - Overview and architecture
- **STATUS**: [STATUS.md](./STATUS.md) - Implementation progress tracker

## 🎯 What Happens on Deployment

1. GitHub Actions triggers on push to main
2. Builds Docker image from source
3. Pushes to GitHub Container Registry
4. Connects to K3s cluster using K3S_KUBE_CONFIG
5. Creates/updates OAuth2-Proxy secret with Azure credentials
6. Applies all Kubernetes manifests
7. Restarts deployments to pull latest
8. Waits for rollout to complete
9. Shows pod status

## ✨ Features Available After Deployment

- **User Management**: Create, edit, delete users; assign admin roles
- **Conversation Management**: View, search, delete conversations
- **Analytics Dashboard**: View total users, conversations, activity
- **Azure AD Auth**: Secure authentication via OAuth2-Proxy
- **Role-Based Access**: Restrict to specific users/groups (optional)

## 🔐 Security Features

- OAuth2-Proxy handles all authentication
- No direct access without Azure AD login
- HTTPS enforced by nginx ingress
- Secure cookies (HttpOnly, Secure, SameSite)
- Cookie secret auto-generated per deployment
- All secrets stored in Kubernetes secrets
- Buffer sizes configured to prevent OAuth errors

## 📦 Container Images

Images are pushed to GitHub Container Registry:
```
ghcr.io/sidekickmachines/librechat-admin:latest
ghcr.io/sidekickmachines/librechat-admin:main
ghcr.io/sidekickmachines/librechat-admin:sha-<commit>
```

## 🎉 Ready to Deploy!

Once you've completed steps 1-3 above, the admin panel will be live at:
**https://chat.sidekickmachines.com/admin/**

---

**Questions or issues?** Check the logs first, then review SETUP.md for detailed troubleshooting.
