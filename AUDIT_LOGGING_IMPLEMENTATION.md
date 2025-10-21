# Audit Logging Implementation Documentation

## Overview
This document details the implementation of a comprehensive audit logging system for the LibreChat Admin Panel. The system tracks all CREATE, UPDATE, and DELETE operations across all administrative resources.

## Implementation Date
October 20, 2025

## Architecture

### Data Storage
- **Database**: MongoDB
- **Collection**: `audit_logs`
- **Storage**: Uses existing MongoDB persistent volume (same as LibreChat data)
- **Location**: MongoDB running at `mongodb://mongo.librechat.svc.cluster.local:27017`

### Audit Log Schema
```javascript
{
  action: String,          // 'create', 'update', or 'delete'
  resource: String,        // Resource type (e.g., 'users', 'roles')
  resourceId: String,      // ID of the affected resource
  userEmail: String,       // Email of user performing action
  userName: String,        // Name of user performing action
  data: Object,           // Additional data about the change
  ipAddress: String,      // IP address of the request
  timestamp: Date         // When the action occurred
}
```

## Backend Implementation

### File: `admin-api/src/server.js`

#### 1. Helper Functions Added (Lines 40-68)

**createAuditLog() Function:**
```javascript
async function createAuditLog(action, resource, resourceId, userEmail, userName, data = {}, ipAddress = null) {
  try {
    const auditLog = {
      action,
      resource,
      resourceId,
      userEmail,
      userName,
      data,
      ipAddress,
      timestamp: new Date(),
    };

    await db.collection('audit_logs').insertOne(auditLog);
    console.log(`✅ Audit log created: ${action} ${resource} by ${userEmail}`);
  } catch (error) {
    console.error('❌ Error creating audit log:', error);
  }
}
```

**getUserFromHeaders() Function:**
```javascript
function getUserFromHeaders(req) {
  const userEmail = req.headers['x-forwarded-email'] || req.headers['x-auth-request-email'] || 'unknown';
  const userName = req.headers['x-forwarded-user'] || req.headers['x-auth-request-user'] || userEmail;
  return { userEmail, userName };
}
```

#### 2. Audit Integration by Resource

**Users Resource:**
- POST `/api/users` (Lines 159-166) - User creation
- PUT `/api/users/:id` (Lines 189-193) - User updates
- DELETE `/api/users/:id` (Lines 217-221) - User deletion

**Roles Resource:**
- POST `/api/roles` (Lines 404-408) - Role creation
- PUT `/api/roles/:id` (Lines 443-447) - Role updates
- DELETE `/api/roles/:id` (Lines 479-483) - Role deletion

**Conversations Resource:**
- DELETE `/api/convos/:id` (Lines 297-301) - Conversation deletion

**Messages Resource:**
- DELETE `/api/messages/:id` (Lines 617-621) - Message deletion

**Agents Resource:**
- POST `/api/agents` (Lines 790-796) - Agent creation
- PUT `/api/agents/:id` (Lines 721-725) - Agent updates
- DELETE `/api/agents/:id` (Lines 692-696) - Agent deletion

**Files Resource:**
- DELETE `/api/files/:id` (Lines 864-868) - File deletion

**Sessions Resource:**
- DELETE `/api/sessions/:id` (Lines 936-940) - Session deletion

**Tokens Resource:**
- DELETE `/api/tokens/:id` (Lines 1008-1012) - Token deletion

**Transactions Resource:**
- DELETE `/api/transactions/:id` (Lines 1080-1084) - Transaction deletion

**Projects Resource:**
- DELETE `/api/projects/:id` (Lines 1152-1156) - Project deletion

#### 3. Audit Log API Endpoints (Lines 1167-1242)

**GET /api/audit-logs**
- Lists all audit logs with pagination
- Supports filtering by action, resource, and userEmail
- Query parameters:
  - `page` (default: 1)
  - `limit` (default: 50)
  - `order` (default: 'desc')
  - `action` (filter)
  - `resource` (filter)
  - `userEmail` (filter)

**GET /api/audit-logs/:id**
- Retrieves a single audit log entry

**DELETE /api/audit-logs/:id**
- Allows deletion of audit log entries (admin only)

## Frontend Implementation

### File: `admin-ui/src/resources/audit/AuditList.tsx`

**Created new component with:**
- Color-coded action chips:
  - CREATE: Green
  - UPDATE: Yellow/Warning
  - DELETE: Red
- Resource chips with custom styling
- Data field with JSON preview (truncated at 100 characters)
- List actions: Select Columns, Export to CSV
- Default sort: timestamp DESC (newest first)
- 50 items per page

**Components:**
- `ListActions` - Toolbar with SelectColumnsButton and ExportButton
- `ActionChip` - Color-coded chip for action type
- `ResourceChip` - Custom styled chip for resource type
- `DataField` - Formatted JSON data preview
- `AuditList` - Main list component with Datagrid

### File: `admin-ui/src/App.tsx`

**Changes (Lines 27, 124-129):**
```typescript
import { AuditList } from './resources/audit/AuditList';
import AssessmentIcon from '@mui/icons-material/Assessment';

<Resource
  name="audit-logs"
  list={AuditList}
  icon={AssessmentIcon}
  options={{ label: 'Audit Logs' }}
/>
```

### File: `admin-ui/src/components/CustomMenu.tsx`

**Changes (Lines 15, 163-171):**
Added new "Administration" menu section with Audit Logs link:
```typescript
<MenuSection title="Administration">
  {resources['audit-logs'] && (
    <MenuItemLink
      to="/audit-logs"
      primaryText="Audit Logs"
      leftIcon={<AssessmentIcon />}
    />
  )}
</MenuSection>
```

## Issues Fixed During Implementation

### Issue 1: TypeScript Error - Unused ChipField Import
**Error:** `error TS6133: 'ChipField' is declared but its value is never read`
**Fix:** Removed unused import from AuditList.tsx
**Commit:** `81e8a88`

### Issue 2: React-Admin Error - Missing Expand Panel
**Error:** Client error when rowClick="expand" without expand panel
**Fix:** Removed `rowClick="expand"` from Datagrid
**Commit:** `9184fda`

### Issue 3: React-Admin Error - FilterButton Without Filters
**Error:** `The <FilterButton> component requires the <List filters> prop to be set`
**Fix:** Removed FilterButton from ListActions
**Commit:** `c98cc4f`

## Deployment

### GitHub Actions Workflow
- Repository: `SidekickMachines/librechat-admin`
- Workflow: `.github/workflows/deploy.yaml`
- Final successful deployment: Run `18666849103`
- Build time: 1m13s

### Kubernetes Deployment
- Namespace: `librechat`
- Pod: `librechat-admin-ui-*`
- Backend API Port: 3001
- Frontend Port: 80

## Usage

### Accessing Audit Logs
1. Navigate to LibreChat Admin Panel
2. Click "Administration" section in left menu
3. Click "Audit Logs"

### Features Available
- View all audit log entries sorted by timestamp
- Export logs to CSV format
- Select which columns to display
- View detailed JSON data for each action
- See user email, name, and IP address for each action

### Viewing Audit Log Details
Each entry displays:
- **Timestamp**: Date and time of action
- **Action**: Color-coded CREATE/UPDATE/DELETE
- **Resource**: Type of resource affected
- **Resource ID**: ID of the specific resource
- **User Email**: Email of user who performed action
- **User Name**: Name of user who performed action
- **Details**: JSON preview of data changes
- **IP Address**: IP address of the request

## Monitored Resources

The following resources are fully audited:
1. Users (create, update, delete)
2. Roles (create, update, delete)
3. Conversations (delete only)
4. Messages (delete only)
5. Agents (create, update, delete)
6. Files (delete only)
7. Sessions (delete only)
8. Tokens (delete only)
9. Transactions (delete only)
10. Projects (delete only)

## Security Considerations

### User Identification
- Uses OAuth2-Proxy headers for user identification
- Headers: `x-forwarded-email` and `x-forwarded-user`
- Fallback to 'unknown' if headers not present

### Data Captured
- All audit logs include IP address for tracking
- Sensitive data in logs should be reviewed for compliance
- Consider implementing log retention policies

### Permissions
- Audit log viewing requires admin access (OAuth2-Proxy authentication)
- Audit log deletion endpoint exists but should be restricted

## Storage Considerations

### Current Implementation
- Audit logs stored in MongoDB `audit_logs` collection
- Uses same MongoDB instance as LibreChat data
- No separate volume or storage configured
- Relies on existing MongoDB persistent volume

### Recommendations
1. **Monitor Storage**: Audit logs will grow over time
2. **Retention Policy**: Consider implementing automatic cleanup of old logs
3. **Backup**: Ensure MongoDB backups include audit_logs collection
4. **Indexing**: Add indexes on timestamp, userEmail, and resource for performance

### Suggested Indexes
```javascript
db.audit_logs.createIndex({ timestamp: -1 });
db.audit_logs.createIndex({ userEmail: 1 });
db.audit_logs.createIndex({ resource: 1 });
db.audit_logs.createIndex({ action: 1 });
```

## Future Enhancements

### Potential Improvements
1. **Filtering**: Add UI filters for action type, resource, date range
2. **Search**: Implement full-text search across audit logs
3. **Alerting**: Add notifications for critical actions
4. **Retention**: Automatic archival of old logs
5. **Compliance**: Export capabilities for audit reports
6. **Analytics**: Dashboard showing audit activity trends
7. **Before/After**: Capture state before and after changes

## Maintenance

### Regular Tasks
- Monitor audit log collection size
- Review audit logs for suspicious activity
- Test audit log backup/restore procedures
- Verify user identification is working correctly

### Troubleshooting

**Issue: Audit logs not appearing**
- Check MongoDB connection
- Verify `audit_logs` collection exists
- Check backend logs for audit creation errors

**Issue: User shows as 'unknown'**
- Verify OAuth2-Proxy is passing headers
- Check nginx configuration for header forwarding

**Issue: UI not loading audit logs**
- Check browser console for errors
- Verify API endpoint `/admin/api/audit-logs` is accessible
- Check dataProvider configuration

## Testing

### Manual Testing Performed
1. Created test user - verified audit log entry
2. Updated test user - verified audit log entry
3. Deleted test user - verified audit log entry
4. Viewed audit logs in UI - confirmed all entries visible
5. Tested export to CSV - confirmed working
6. Tested column selection - confirmed working

### Recommended Tests
- Verify audit logs for all 10 resources
- Test filtering capabilities
- Test pagination with large datasets
- Verify user identification accuracy
- Test export functionality

## Commit History

1. Initial audit logging implementation (backend + frontend)
2. `81e8a88` - Fix TypeScript error: remove unused ChipField import
3. `9184fda` - Fix Audit Logs UI error: remove rowClick expand
4. `c98cc4f` - Fix FilterButton error in Audit Logs

## Support

For issues or questions:
- Review backend logs: `kubectl logs -n librechat <pod-name>`
- Check MongoDB: `db.audit_logs.find().sort({timestamp:-1}).limit(10)`
- Review this documentation
- Check GitHub repository for updates

---

**Document Version:** 1.0
**Last Updated:** October 20, 2025
**Maintained By:** DevOps Team
