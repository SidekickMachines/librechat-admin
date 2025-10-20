const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

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
