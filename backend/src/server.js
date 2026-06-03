require('dotenv').config();
require('express-async-errors');
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');

const connectDB       = require('./config/db');
const errorHandler    = require('./middleware/errorHandler');
const { startAllCronJobs } = require('./utils/cronJobs');
const { generalLimiter }   = require('./middleware/rateLimiter');

// Route imports
const authRoutes         = require('./routes/auth');
const tenantConfigRoutes = require('./routes/tenantConfig');
const tenantSettingsRoutes = require('./routes/tenantSettings');
const superAdminRoutes   = require('./routes/superAdmin');
const tenantAuthRoutes   = require('./routes/tenantAuth');
const subscriptionRoutes = require('./routes/subscription');
const categoryRoutes     = require('./routes/category');
const productRoutes      = require('./routes/product');
const publicShopRoutes   = require('./routes/publicShop');
const { publicRouter: queryPublicRouter, tenantRouter: queryTenantRouter } = require('./routes/query');
const inboxRoutes        = require('./routes/inbox');
const taskRoutes         = require('./routes/tasks');
const quizRoutes        = require('./routes/quiz');
const blogRoutes = require('./routes/blog');
const analyticsRoutes = require('./routes/analytics');
const { getPublicBlogList, getPublicBlogPost } = require('./controllers/blog.controller');
const { getPublicQuiz } = require('./controllers/quiz.controller');   

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some((p) =>
      p instanceof RegExp ? p.test(origin) : p === origin
    );
    if (allowed) callback(null, true);
    else callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-slug'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/api', generalLimiter);

app.get('/api/health', (_req, res) =>
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV })
);

// Routes
app.use('/api/auth',               authRoutes);
app.use('/api/tenant/settings',    tenantSettingsRoutes);
app.use('/api/tenant',             tenantConfigRoutes);
app.use('/api/superadmin',         superAdminRoutes);
app.use('/api/tenantauth',         tenantAuthRoutes);
app.use('/api/subscription',       subscriptionRoutes);
app.use('/api/tenant/categories',  categoryRoutes);
app.use('/api/tenant/products',    productRoutes);
app.use('/api/public',             publicShopRoutes);
app.use('/api/public',             queryPublicRouter);
app.use('/api/tenant/queries',     queryTenantRouter);
app.use('/api/tenant/inbox',       inboxRoutes);
app.use('/api/tenant/tasks',       taskRoutes);     
app.use('/api/tenant/quiz',  quizRoutes);
app.get('/api/public/:slug/quiz', getPublicQuiz);
app.use('/api/tenant/blog', blogRoutes);
app.use('/api/tenant/analytics', analyticsRoutes);
app.get('/api/public/:slug/blog', getPublicBlogList);
app.get('/api/public/:slug/blog/:postSlug', getPublicBlogPost);

app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  startAllCronJobs();
});

module.exports = app;