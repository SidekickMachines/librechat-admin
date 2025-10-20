const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const k8sService = require('./k8s.service');

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo.librechat.svc.cluster.local:27017';
const DB_NAME = process.env.DB_NAME || 'LibreChat';

let db = null;

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`✅ Connected to MongoDB: ${DB_NAME}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mongodb: db ? 'connected' : 'disconnected' });
});

// ==================== USERS ENDPOINTS ====================

// GET /api/users - List all users with pagination
app.get('/api/users', async (req, res) => {
  try {
    const { page = '1', limit = '25', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await db.collection('users')
      .find({})
      .sort({ createdAt: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('users').countDocuments();

    // Format for React-Admin
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      _id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role || 'USER',
      provider: user.provider,
      emailVerified: user.emailVerified || false,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.json({ data: formattedUsers, total });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Get single user
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.params.id) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id.toString(),
      _id: user._id.toString(),
      ...user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { id: _, _id: __, ...userData } = req.body;

    // Add timestamps
    const newUser = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: userData.emailVerified || false,
      role: userData.role || 'USER',
    };

    const result = await db.collection('users').insertOne(newUser);

    const createdUser = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newUser,
    };

    res.status(201).json(createdUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id: _, _id: __, ...updateData } = req.body;

    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: result._id.toString(),
      _id: result._id.toString(),
      ...result,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id - Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CONVERSATIONS ENDPOINTS ====================

// GET /api/convos - List all conversations with pagination
app.get('/api/convos', async (req, res) => {
  try {
    const { page = '1', limit = '25', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversations = await db.collection('conversations')
      .find({})
      .sort({ createdAt: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('conversations').countDocuments();

    // Format for React-Admin
    const formattedConvos = conversations.map(convo => ({
      id: convo.conversationId || convo._id.toString(),
      _id: convo._id.toString(),
      conversationId: convo.conversationId,
      title: convo.title || 'Untitled Conversation',
      user: convo.user,
      endpoint: convo.endpoint,
      model: convo.model,
      createdAt: convo.createdAt,
      updatedAt: convo.updatedAt,
    }));

    res.json({ data: formattedConvos, total });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/convos/:id - Get single conversation
app.get('/api/convos/:id', async (req, res) => {
  try {
    const convo = await db.collection('conversations').findOne({ conversationId: req.params.id });
    if (!convo) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      id: convo.conversationId || convo._id.toString(),
      _id: convo._id.toString(),
      ...convo,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/convos/:id - Delete conversation
app.delete('/api/convos/:id', async (req, res) => {
  try {
    const result = await db.collection('conversations').deleteOne({ conversationId: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ROLES ENDPOINTS ====================

// GET /api/roles - List all roles with pagination
app.get('/api/roles', async (req, res) => {
  try {
    const { page = '1', limit = '25', order = 'asc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const roles = await db.collection('roles')
      .find({})
      .sort({ name: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('roles').countDocuments();

    // Format for React-Admin
    const formattedRoles = roles.map(role => ({
      id: role._id.toString(),
      _id: role._id.toString(),
      name: role.name,
      permissions: role.permissions,
    }));

    res.json({ data: formattedRoles, total });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/roles/:id - Get single role
app.get('/api/roles/:id', async (req, res) => {
  try {
    const role = await db.collection('roles').findOne({ _id: new ObjectId(req.params.id) });
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({
      id: role._id.toString(),
      _id: role._id.toString(),
      ...role,
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/roles - Create new role
app.post('/api/roles', async (req, res) => {
  try {
    const { id: _, _id: __, ...roleData } = req.body;

    // Validate required fields
    if (!roleData.name) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    // Check if role with same name already exists
    const existingRole = await db.collection('roles').findOne({ name: roleData.name });
    if (existingRole) {
      return res.status(400).json({ error: 'Role with this name already exists' });
    }

    // Create new role with default permissions structure if not provided
    const newRole = {
      name: roleData.name,
      permissions: roleData.permissions || {
        BOOKMARKS: { USE: false },
        PROMPTS: { SHARED_GLOBAL: false, USE: false, CREATE: false },
        MEMORIES: { USE: false, CREATE: false, UPDATE: false, READ: false, OPT_OUT: false },
        AGENTS: { SHARED_GLOBAL: false, USE: false, CREATE: false },
        MULTI_CONVO: { USE: false },
        TEMPORARY_CHAT: { USE: false },
        RUN_CODE: { USE: false },
        WEB_SEARCH: { USE: false },
        PEOPLE_PICKER: { VIEW_USERS: false, VIEW_GROUPS: false, VIEW_ROLES: false },
        MARKETPLACE: { USE: false },
        FILE_SEARCH: { USE: false },
        FILE_CITATIONS: { USE: false },
      },
    };

    const result = await db.collection('roles').insertOne(newRole);

    const createdRole = {
      id: result.insertedId.toString(),
      _id: result.insertedId.toString(),
      ...newRole,
    };

    res.status(201).json(createdRole);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/roles/:id - Update role
app.put('/api/roles/:id', async (req, res) => {
  try {
    const { id: _, _id: __, ...updateData } = req.body;

    // If updating name, check if it conflicts with existing role
    if (updateData.name) {
      const existingRole = await db.collection('roles').findOne({
        name: updateData.name,
        _id: { $ne: new ObjectId(req.params.id) }
      });
      if (existingRole) {
        return res.status(400).json({ error: 'Role with this name already exists' });
      }
    }

    const result = await db.collection('roles').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({
      id: result._id.toString(),
      _id: result._id.toString(),
      ...result,
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/roles/:id - Delete role
app.delete('/api/roles/:id', async (req, res) => {
  try {
    // Check if any users are assigned this role
    const role = await db.collection('roles').findOne({ _id: new ObjectId(req.params.id) });
    if (role) {
      const usersWithRole = await db.collection('users').countDocuments({ role: role.name });
      if (usersWithRole > 0) {
        return res.status(400).json({
          error: `Cannot delete role. ${usersWithRole} user(s) are assigned this role.`
        });
      }
    }

    const result = await db.collection('roles').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DASHBOARD/STATS ENDPOINTS ====================

// GET /api/stats - Get dashboard statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [userCount, convoCount, recentUsers, recentConvos] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('conversations').countDocuments(),
      db.collection('users').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('conversations').find({}).sort({ createdAt: -1 }).limit(5).toArray(),
    ]);

    res.json({
      totalUsers: userCount,
      totalConversations: convoCount,
      recentUsers: recentUsers.length,
      recentConversations: recentConvos.length,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== CURRENT USER ENDPOINT ====================

// GET /api/user - Get current authenticated user from OAuth2-Proxy headers
app.get('/api/user', async (req, res) => {
  try {
    // OAuth2-Proxy injects authentication headers
    const userEmail = req.headers['x-forwarded-email'] || req.headers['x-auth-request-email'];

    if (!userEmail) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Find user by email in MongoDB
    const user = await db.collection('users').findOne({ email: userEmail });

    if (!user) {
      // If user not found in database, return basic info from headers
      return res.json({
        id: 'unknown',
        email: userEmail,
        name: req.headers['x-forwarded-user'] || req.headers['x-auth-request-user'] || userEmail,
        role: 'USER',
      });
    }

    // Return user from database
    res.json({
      id: user._id.toString(),
      _id: user._id.toString(),
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role || 'USER',
      provider: user.provider,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== POD MONITORING ENDPOINTS ====================

// GET /api/pods - List all pods across specified namespaces
app.get('/api/pods', async (req, res) => {
  try {
    const { namespaces } = req.query;
    const namespacesArray = namespaces
      ? namespaces.split(',')
      : ['librechat', 'snow-mcp', 'default'];

    const pods = await k8sService.listPods(namespacesArray);

    // Format for React-Admin
    res.json({
      data: pods,
      total: pods.length,
    });
  } catch (error) {
    console.error('Error listing pods:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/pods/:id - Get single pod details
app.get('/api/pods/:id', async (req, res) => {
  try {
    // ID format: namespace::podname
    const parts = req.params.id.split('::');
    if (parts.length !== 2) {
      return res.status(400).json({ error: 'Invalid pod ID format. Expected: namespace::podname' });
    }

    const [namespace, podName] = parts;

    if (!namespace || !podName) {
      return res.status(400).json({ error: 'Invalid pod ID format. Expected: namespace::podname' });
    }

    const pod = await k8sService.getPod(namespace, podName);
    res.json({
      id: pod.id,
      ...pod,
    });
  } catch (error) {
    console.error('Error fetching pod:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/pods/:namespace/:podName/logs - Get pod logs
app.get('/api/pods/:namespace/:podName/logs', async (req, res) => {
  try {
    const { namespace, podName } = req.params;
    const { tailLines = '100', timestamps = 'true', container } = req.query;

    const logs = await k8sService.getPodLogs(namespace, podName, {
      tailLines: parseInt(tailLines),
      timestamps: timestamps === 'true',
      container: container || null,
    });

    res.json({ logs });
  } catch (error) {
    console.error(`Error fetching logs for ${req.params.namespace}/${req.params.podName}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function start() {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Admin API server running on port ${PORT}`);
    console.log(`📊 MongoDB: ${MONGODB_URI}`);
    console.log(`📦 Database: ${DB_NAME}`);
  });
}

start();
