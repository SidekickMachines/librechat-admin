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

// ==================== MESSAGES ENDPOINTS ====================

// GET /api/messages - List all messages with pagination
app.get('/api/messages', async (req, res) => {
  try {
    const { page = '1', limit = '25', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await db.collection('messages')
      .find({})
      .sort({ createdAt: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('messages').countDocuments();

    const formattedMessages = messages.map(msg => ({
      id: msg._id.toString(),
      _id: msg._id.toString(),
      ...msg,
    }));

    res.json({ data: formattedMessages, total });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/:id - Get single message
app.get('/api/messages/:id', async (req, res) => {
  try {
    const message = await db.collection('messages').findOne({ _id: new ObjectId(req.params.id) });
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({
      id: message._id.toString(),
      _id: message._id.toString(),
      ...message,
    });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/messages/:id - Delete message
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const result = await db.collection('messages').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== AGENTS ENDPOINTS ====================

// GET /api/agents - List all agents with pagination
app.get('/api/agents', async (req, res) => {
  try {
    const { page = '1', limit = '25', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const agents = await db.collection('agents')
      .find({})
      .sort({ createdAt: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('agents').countDocuments();

    const formattedAgents = agents.map(agent => ({
      id: agent._id.toString(),
      _id: agent._id.toString(),
      ...agent,
    }));

    res.json({ data: formattedAgents, total });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/:id - Get single agent
app.get('/api/agents/:id', async (req, res) => {
  try {
    // Agents use a custom 'id' field, not MongoDB _id
    const agent = await db.collection('agents').findOne({ id: req.params.id });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      id: agent.id,
      _id: agent._id.toString(),
      ...agent,
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/agents/:id - Delete agent
app.delete('/api/agents/:id', async (req, res) => {
  try {
    // Agents use a custom 'id' field, not MongoDB _id
    const result = await db.collection('agents').deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/agents/:id - Update agent
app.put('/api/agents/:id', async (req, res) => {
  try {
    const { id: _reqId, _id: __, ...updateData } = req.body;

    // Agents use a custom 'id' field, not MongoDB _id
    const result = await db.collection('agents').findOneAndUpdate(
      { id: req.params.id },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json({
      id: result.id,
      _id: result._id.toString(),
      ...result,
    });
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/agents - Create new agent
app.post('/api/agents', async (req, res) => {
  try {
    const { id: _, _id: __, ...agentData } = req.body;

    // Generate custom agent ID (format: agent_<random>)
    const generateAgentId = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = 'agent_';
      for (let i = 0; i < 21; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Ensure required fields
    if (!agentData.name) {
      return res.status(400).json({ error: 'Agent name is required' });
    }

    // Create new agent with defaults
    const newAgent = {
      id: generateAgentId(),
      name: agentData.name,
      description: agentData.description || '',
      instructions: agentData.instructions || '',
      provider: agentData.provider || 'azureOpenAI',
      model: agentData.model || 'gpt-4',
      artifacts: agentData.artifacts || '',
      tools: agentData.tools || [],
      tool_kwargs: agentData.tool_kwargs || [],
      agent_ids: agentData.agent_ids || [],
      conversation_starters: agentData.conversation_starters || [],
      projectIds: agentData.projectIds || [],
      category: agentData.category || 'general',
      support_contact: agentData.support_contact || { name: '', email: '' },
      is_promoted: agentData.is_promoted || false,
      end_after_tools: agentData.end_after_tools || false,
      hide_sequential_outputs: agentData.hide_sequential_outputs || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      versions: [],
    };

    const result = await db.collection('agents').insertOne(newAgent);

    const createdAgent = {
      id: newAgent.id,
      _id: result.insertedId.toString(),
      ...newAgent,
    };

    res.status(201).json(createdAgent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== FILES ENDPOINTS ====================

// GET /api/files - List all files with pagination
app.get('/api/files', async (req, res) => {
  try {
    const { page = '1', limit = '25', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const files = await db.collection('files')
      .find({})
      .sort({ createdAt: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('files').countDocuments();

    const formattedFiles = files.map(file => ({
      id: file._id.toString(),
      _id: file._id.toString(),
      ...file,
    }));

    res.json({ data: formattedFiles, total });
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/files/:id - Get single file
app.get('/api/files/:id', async (req, res) => {
  try {
    const file = await db.collection('files').findOne({ _id: new ObjectId(req.params.id) });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      id: file._id.toString(),
      _id: file._id.toString(),
      ...file,
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/files/:id - Delete file
app.delete('/api/files/:id', async (req, res) => {
  try {
    const result = await db.collection('files').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SESSIONS ENDPOINTS ====================

// GET /api/sessions - List all sessions with pagination
app.get('/api/sessions', async (req, res) => {
  try {
    const { page = '1', limit = '25', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sessions = await db.collection('sessions')
      .find({})
      .sort({ expiration: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('sessions').countDocuments();

    const formattedSessions = sessions.map(session => ({
      id: session._id.toString(),
      _id: session._id.toString(),
      ...session,
    }));

    res.json({ data: formattedSessions, total });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/sessions/:id - Get single session
app.get('/api/sessions/:id', async (req, res) => {
  try {
    const session = await db.collection('sessions').findOne({ _id: new ObjectId(req.params.id) });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      id: session._id.toString(),
      _id: session._id.toString(),
      ...session,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sessions/:id - Delete session
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const result = await db.collection('sessions').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TOKENS ENDPOINTS ====================

// GET /api/tokens - List all tokens with pagination
app.get('/api/tokens', async (req, res) => {
  try {
    const { page = '1', limit = '25', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tokens = await db.collection('tokens')
      .find({})
      .sort({ createdAt: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('tokens').countDocuments();

    const formattedTokens = tokens.map(token => ({
      id: token._id.toString(),
      _id: token._id.toString(),
      ...token,
    }));

    res.json({ data: formattedTokens, total });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tokens/:id - Get single token
app.get('/api/tokens/:id', async (req, res) => {
  try {
    const token = await db.collection('tokens').findOne({ _id: new ObjectId(req.params.id) });
    if (!token) {
      return res.status(404).json({ error: 'Token not found' });
    }

    res.json({
      id: token._id.toString(),
      _id: token._id.toString(),
      ...token,
    });
  } catch (error) {
    console.error('Error fetching token:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/tokens/:id - Delete token
app.delete('/api/tokens/:id', async (req, res) => {
  try {
    const result = await db.collection('tokens').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting token:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== TRANSACTIONS ENDPOINTS ====================

// GET /api/transactions - List all transactions with pagination
app.get('/api/transactions', async (req, res) => {
  try {
    const { page = '1', limit = '25', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await db.collection('transactions')
      .find({})
      .sort({ createdAt: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('transactions').countDocuments();

    const formattedTransactions = transactions.map(txn => ({
      id: txn._id.toString(),
      _id: txn._id.toString(),
      ...txn,
    }));

    res.json({ data: formattedTransactions, total });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/transactions/:id - Get single transaction
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await db.collection('transactions').findOne({ _id: new ObjectId(req.params.id) });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      id: transaction._id.toString(),
      _id: transaction._id.toString(),
      ...transaction,
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/transactions/:id - Delete transaction
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const result = await db.collection('transactions').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROJECTS ENDPOINTS ====================

// GET /api/projects - List all projects with pagination
app.get('/api/projects', async (req, res) => {
  try {
    const { page = '1', limit = '25', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await db.collection('projects')
      .find({})
      .sort({ updatedAt: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('projects').countDocuments();

    const formattedProjects = projects.map(project => ({
      id: project._id.toString(),
      _id: project._id.toString(),
      ...project,
    }));

    res.json({ data: formattedProjects, total });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/projects/:id - Get single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await db.collection('projects').findOne({ _id: new ObjectId(req.params.id) });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      id: project._id.toString(),
      _id: project._id.toString(),
      ...project,
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/projects/:id - Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const result = await db.collection('projects').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ id: req.params.id });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== POD MONITORING ENDPOINTS ====================

// GET /api/system-status - Get comprehensive system status
app.get('/api/system-status', async (req, res) => {
  try {
    // Get all pods from relevant namespaces
    const allPods = await k8sService.listPods(['librechat', 'snow-mcp', 'default']);

    // Filter pods by service
    const librechatPods = allPods.filter(p =>
      p.namespace === 'librechat' && p.name.includes('librechat')
    );
    const mongoPods = allPods.filter(p =>
      (p.namespace === 'librechat' && p.name.includes('mongo')) ||
      (p.labels && p.labels.app === 'mongodb')
    );
    const mcpPods = allPods.filter(p =>
      p.namespace === 'snow-mcp' || (p.labels && p.labels.app && p.labels.app.includes('mcp'))
    );

    // Determine service status
    const getServiceStatus = (pods) => {
      if (!pods || pods.length === 0) return { status: 'down', reason: 'No pods found' };
      const runningPods = pods.filter(p => p.status === 'Running');
      if (runningPods.length === 0) return { status: 'down', reason: 'No running pods' };
      if (runningPods.length < pods.length) return { status: 'degraded', reason: 'Some pods not running' };
      return { status: 'healthy', reason: 'All pods running' };
    };

    // Check MongoDB connectivity
    let mongoStatus = getServiceStatus(mongoPods);
    try {
      if (db) {
        await db.admin().ping();
        mongoStatus = { status: 'healthy', reason: 'Connected and responsive' };
      }
    } catch (err) {
      mongoStatus = { status: 'down', reason: `Connection error: ${err.message}` };
    }

    const systemStatus = {
      librechat: {
        ...getServiceStatus(librechatPods),
        pods: librechatPods.map(p => ({
          name: p.name,
          namespace: p.namespace,
          status: p.status,
          ready: p.ready,
          restarts: p.restarts,
        })),
      },
      mongodb: {
        ...mongoStatus,
        pods: mongoPods.map(p => ({
          name: p.name,
          namespace: p.namespace,
          status: p.status,
          ready: p.ready,
          restarts: p.restarts,
        })),
      },
      mcp: {
        ...getServiceStatus(mcpPods),
        pods: mcpPods.map(p => ({
          name: p.name,
          namespace: p.namespace,
          status: p.status,
          ready: p.ready,
          restarts: p.restarts,
        })),
      },
      timestamp: new Date().toISOString(),
    };

    res.json(systemStatus);
  } catch (error) {
    console.error('Error fetching system status:', error);
    res.status(500).json({ error: error.message });
  }
});

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
