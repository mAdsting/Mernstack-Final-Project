    // server/server.js
    import express from 'express';
    import dotenv from 'dotenv';
    import cors from 'cors';
    import mongoose from 'mongoose';
    import { Server } from 'socket.io';
    import { createServer } from 'http';
    import User from './models/User.js';
    import bcrypt from 'bcrypt';
    import jwt from 'jsonwebtoken';
    import Property from './models/Property.js';
    import Tenant from './models/Tenant.js';
    import houseRoutes from './routes/houseRoutes.js';
    import tenantRoutes from './routes/tenantRoutes.js';
    import paymentRoutes from './routes/paymentRoutes.js';
    import paymentMpesaRoutes from './routes/paymentMpesaRoutes.js';
    import propertyRoutes from './routes/propertyRoutes.js';
    import rateLimit from 'express-rate-limit';
    import { body, validationResult } from 'express-validator';
    import eventRoutes from './routes/eventRoutes.js';
    import analyticsRoutes from './routes/analyticsRoutes.js';
    import notificationRoutes from './routes/notificationRoutes.js';
    import invoiceRoutes from './routes/invoiceRoutes.js';

    // Load environment variables from .env file
    dotenv.config();

    const app = express();
    const PORT = process.env.PORT || 5000;
    const MONGO_URI = process.env.MONGO_URI;

    // Create HTTP server for Socket.io
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    // Middleware
    app.use(cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }));
    app.use(express.json());

    // Rate limiting middleware for sensitive endpoints
    const authLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 5, // limit each IP to 5 requests per windowMs
      message: { message: 'Too many requests, please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Refactored admin creation logic
    async function ensureAdminUser() {
      try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) {
          console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set in .env. Skipping admin creation.');
          return;
        }
        const existingAdmin = await User.findOne({ email: adminEmail, role: 'admin' });
        if (!existingAdmin) {
          const hashedPassword = await bcrypt.hash(adminPassword, 10);
          await User.create({ email: adminEmail, password: hashedPassword, role: 'admin' });
          console.log('Admin user created:', adminEmail);
        } else {
          console.log('Admin user already exists:', adminEmail);
        }
      } catch (err) {
        console.error('Error creating admin user:', err);
      }
    }

    // MongoDB Connection
    mongoose.connect(MONGO_URI)
      .then(() => {
        console.log('MongoDB connected successfully!');
        ensureAdminUser();
      })
      .catch(err => console.error('MongoDB connection error:', err));

    // Basic Socket.io connection handling
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });

    // Middleware to check JWT and admin role
    function authMiddleware(req, res, next) {
      const authHeader = req.headers['authorization'];
      if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
      const token = authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided.' });
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
        req.user = decoded;
        next();
      } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
      }
    }

    // Role constants
    const ROLES = {
      ADMIN: 'admin',
      LANDLORD: 'landlord',
      AGENT: 'agent',
    };

    // Reusable middleware for role checks
    function requireRole(role) {
      return (req, res, next) => {
        if (req.user.role !== role) {
          return res.status(403).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} privileges required.` });
        }
        next();
      };
    }

    // Helper middleware to handle validation errors
    function handleValidationErrors(req, res, next) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }

    // Auth login endpoint
    app.post(
      '/api/auth/login',
      authLimiter,
      [
        body('email').isEmail().withMessage('Valid email is required.'),
        body('password').notEmpty().withMessage('Password is required.'),
      ],
      handleValidationErrors,
      async (req, res) => {
        console.log('Login attempt received:', { email: req.body.email, hasPassword: !!req.body.password });
        const { email, password } = req.body;
        if (!email || !password) {
          console.log('Missing email or password');
          return res.status(400).json({ message: 'Email and password are required.' });
        }
        try {
          console.log('Looking for user with email:', email);
          const user = await User.findOne({ email });
          if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid credentials.' });
          }
          console.log('User found, checking password for:', email);
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            console.log('Password mismatch for:', email);
            return res.status(401).json({ message: 'Invalid credentials.' });
          }
          console.log('Login successful for:', email);
          // Create JWT
          const token = jwt.sign(
            { userId: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'changeme',
            { expiresIn: '1d' }
          );
          res.json({ token, user: { email: user.email, role: user.role } });
        } catch (err) {
          console.error('Login error:', err);
          res.status(500).json({ message: 'Server error.' });
        }
      }
    );

    // Admin creates landlord/agent
    app.post(
      '/api/users',
      authLimiter,
      authMiddleware,
      requireRole(ROLES.ADMIN),
      [
        body('email').isEmail().withMessage('Valid email is required.'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
        body('role').isIn([ROLES.LANDLORD, ROLES.AGENT]).withMessage('Role must be landlord or agent.'),
      ],
      handleValidationErrors,
      async (req, res) => {
        const { email, password, role } = req.body;
        if (!email || !password || !['landlord', 'agent'].includes(role)) {
          return res.status(400).json({ message: 'Email, password, and valid role are required.' });
        }
        try {
          const existing = await User.findOne({ email });
          if (existing) {
            return res.status(409).json({ message: 'User already exists.' });
          }
          const hashedPassword = await bcrypt.hash(password, 10);
          const newUser = await User.create({ email, password: hashedPassword, role });
          res.status(201).json({ message: `User ${email} (${role}) created.` });
        } catch (err) {
          console.error('User creation error:', err);
          res.status(500).json({ message: 'Server error.' });
        }
      }
    );

    // List all users (admin only, exclude admin accounts)
    app.get('/api/users', authMiddleware, requireRole(ROLES.ADMIN), async (req, res) => {
      try {
        const users = await User.find({ role: { $ne: 'admin' } }, 'email role createdAt');
        res.json(users);
      } catch (err) {
        console.error('User listing error:', err);
        res.status(500).json({ message: 'Server error.' });
      }
    });

    // Debug endpoint to check all users (remove in production)
    app.get('/api/debug/users', async (req, res) => {
      try {
        console.log('Debug: Checking all users in database');
        const users = await User.find({}, 'email role createdAt');
        console.log('Debug: Found users:', users);
        res.json({ count: users.length, users });
      } catch (err) {
        console.error('Debug user listing error:', err);
        res.status(500).json({ message: 'Server error.', error: err.message });
      }
    });

    // Landlord creates a property
    app.post(
      '/api/properties',
      authMiddleware,
      requireRole(ROLES.LANDLORD),
      [
        body('name').notEmpty().withMessage('Name is required.'),
        body('location').notEmpty().withMessage('Location is required.'),
        body('type').notEmpty().withMessage('Type is required.'),
        body('numUnits').isInt({ min: 1 }).withMessage('Number of units must be at least 1.'),
      ],
      handleValidationErrors,
      async (req, res) => {
        const { name, location, type, numUnits, units, defaultRent } = req.body;
        if (!name || !location || !type || !numUnits) {
          return res.status(400).json({ message: 'All fields are required.' });
        }
        try {
          let propertyUnits = units;
          // If units not provided, auto-generate for flats
          if (!propertyUnits && type === 'flat') {
            if (!defaultRent) return res.status(400).json({ message: 'Default rent required for flats.' });
            // Generate unit numbers: 101, 102, ...
            propertyUnits = Array.from({ length: numUnits }, (_, i) => ({
              label: `${100 + i + 1}`,
              type: 'bedsitter',
              rent: defaultRent,
            }));
          }
          const property = await Property.create({
            landlord: req.user.userId,
            name,
            location,
            type,
            numUnits,
            units: propertyUnits,
          });
          res.status(201).json(property);
        } catch (err) {
          console.error('Property creation error:', err);
          res.status(500).json({ message: 'Server error.' });
        }
      }
    );

    // Landlord lists their properties (with tenants for SVG grid)
    app.get('/api/properties', authMiddleware, requireRole(ROLES.LANDLORD), async (req, res) => {
      try {
        // Fetch all properties for landlord
        const properties = await Property.find({ landlord: req.user.userId });
        const propertyIds = properties.map(p => p._id);
        // Fetch all tenants for these properties in one query
        const tenants = await Tenant.find({ property: { $in: propertyIds } });
        // Group tenants by property
        const tenantsByProperty = {};
        tenants.forEach(t => {
          const propId = t.property.toString();
          if (!tenantsByProperty[propId]) tenantsByProperty[propId] = [];
          tenantsByProperty[propId].push(t);
        });
        // Attach tenants and always include units/numUnits to each property
        const results = properties.map(prop => ({
          ...prop.toObject(),
          tenants: tenantsByProperty[prop._id.toString()] || [],
          units: prop.units || [],
          numUnits: prop.numUnits ?? null,
        }));
        res.json(results);
      } catch (err) {
        console.error('Property listing error:', err);
        res.status(500).json({ message: 'Server error.' });
      }
    });

    // Property detail endpoint
    app.get('/api/properties/:id', authMiddleware, requireRole(ROLES.LANDLORD), async (req, res) => {
      try {
        const property = await Property.findOne({ _id: req.params.id, landlord: req.user.userId });
        if (!property) return res.status(404).json({ message: 'Property not found.' });
        // For flats, get all tenants for this property
        let tenants = [];
        if (property.type === 'flat') {
          tenants = await Tenant.find({ property: property._id });
          const units = [];
          for (let i = 1; i <= property.numUnits; i++) {
            let label, floor;
            // Reconstruct the label logic to match frontend
            if (i <= property.units.filter(u => u.floor === 0).length) {
              label = `G${i}`;
              floor = 0;
            } else {
              // Calculate which floor and which house on that floor
              // Assume housesPerFloor is constant for all floors except ground
              const housesPerFloor = property.units.filter(u => u.floor === 1).length;
              const floorIndex = Math.floor((i - property.units.filter(u => u.floor === 0).length - 1) / housesPerFloor) + 1;
              const houseIndex = ((i - property.units.filter(u => u.floor === 0).length - 1) % housesPerFloor) + 1;
              label = `${floorIndex}${houseIndex.toString().padStart(2, '0')}`;
              floor = floorIndex;
            }
            const tenant = tenants.find(t => t.houseNumber === label);
            units.push({
              _id: property._id + '-' + i,
              label,
              type: 'unknown',
              rent: tenant ? tenant.rentAmount : 0,
              floor,
              tenant: tenant ? {
                name: tenant.name,
                email: tenant.email,
                phone: tenant.phone,
                balance: tenant.balance || 0,
                paymentStatus: tenant.paymentStatus,
              } : null,
            });
          }
          return res.json({
            _id: property._id,
            name: property.name,
            location: property.location,
            type: property.type,
            numUnits: property.numUnits,
            units,
          });
        } else {
          tenants = await Tenant.find({ property: property._id });
          return res.json({
            _id: property._id,
            name: property.name,
            location: property.location,
            type: property.type,
            numUnits: property.numUnits,
            tenants,
          });
        }
      } catch (err) {
        console.error('Property detail error:', err);
        res.status(500).json({ message: 'Server error.' });
      }
    });

    // Unit detail endpoint
    app.get('/api/properties/:propertyId/units/:unitId', authMiddleware, requireRole(ROLES.LANDLORD), async (req, res) => {
      try {
        const property = await Property.findOne({ _id: req.params.propertyId, landlord: req.user.userId });
        if (!property) return res.status(404).json({ message: 'Property not found.' });

        // For flats, units are virtual (Unit 1, Unit 2, ...), so find the tenant for this unit
        const unitLabel = `${100 + Number(req.params.unitId.split('-').pop())}`; // e.g., '101'
        const tenant = await Tenant.findOne({ property: property._id, houseNumber: unitLabel });

        // Get payment history for this tenant (if any)
        let payments = [];
        if (tenant) {
          const Payment = (await import('./models/Payment.js')).default;
          payments = await Payment.find({ tenant: tenant._id }).sort({ createdAt: -1 });
        }

        res.json({
          unit: {
            _id: req.params.unitId,
            label: unitLabel,
            type: 'unknown', // Enhance if you store unit type
            rent: tenant ? tenant.rentAmount : 0,
            tenant: tenant
              ? {
                  name: tenant.name,
                  email: tenant.email,
                  phone: tenant.phone,
                  balance: tenant.balance || 0,
                  paymentStatus: tenant.paymentStatus,
                }
              : null,
          },
          payments: payments.map(p => ({
            date: p.createdAt,
            tenantName: tenant ? tenant.name : '',
            amount: p.amount,
            status: p.isFullPayment ? 'Full' : 'Partial',
          })),
        });
      } catch (err) {
        console.error('Unit detail error:', err);
        res.status(500).json({ message: 'Server error.' });
      }
    });

    // Create tenant for a property
    app.post(
      '/api/tenants',
      authMiddleware,
      requireRole(ROLES.LANDLORD),
      [
        body('property').notEmpty().withMessage('Property is required.'),
        body('name').notEmpty().withMessage('Tenant name is required.'),
        body('houseNumber').notEmpty().withMessage('House/unit number is required.'),
        body('rentAmount').isNumeric().withMessage('Rent amount must be a number.'),
      ],
      handleValidationErrors,
      async (req, res) => {
        const { property, name, houseNumber, rentAmount } = req.body;
        if (!property || !name || !houseNumber || !rentAmount) {
          return res.status(400).json({ message: 'All fields are required.' });
        }
        try {
          // Ensure property belongs to landlord
          const prop = await Property.findOne({ _id: property, landlord: req.user.userId });
          if (!prop) return res.status(404).json({ message: 'Property not found.' });
          const tenant = await Tenant.create({ property, name, houseNumber, rentAmount });
          res.status(201).json(tenant);
        } catch (err) {
          console.error('Tenant creation error:', err);
          res.status(500).json({ message: 'Server error.' });
        }
      }
    );

    // List tenants for a property or all tenants for landlord
    app.get('/api/tenants', authMiddleware, requireRole(ROLES.LANDLORD), async (req, res) => {
      const { property } = req.query;
      try {
        if (property) {
          // Ensure property belongs to landlord
          const prop = await Property.findOne({ _id: property, landlord: req.user.userId });
          if (!prop) return res.status(404).json({ message: 'Property not found.' });
          const tenants = await Tenant.find({ property }).populate('property');
          return res.json(tenants);
        } else {
          // Return all tenants for all properties owned by landlord
          const properties = await Property.find({ landlord: req.user.userId });
          const propertyIds = properties.map(p => p._id);
          const tenants = await Tenant.find({ property: { $in: propertyIds } }).populate('property');
          return res.json(tenants);
        }
      } catch (err) {
        console.error('Tenant listing error:', err);
        res.status(500).json({ message: 'Server error.' });
      }
    });

    // Delete tenant
    app.delete('/api/tenants/:id', authMiddleware, requireRole(ROLES.LANDLORD), async (req, res) => {
      try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
        // Ensure property belongs to landlord
        const prop = await Property.findOne({ _id: tenant.property, landlord: req.user.userId });
        if (!prop) return res.status(403).json({ message: 'Not authorized.' });
        await tenant.deleteOne();
        res.json({ message: 'Tenant deleted.' });
      } catch (err) {
        console.error('Tenant deletion error:', err);
        res.status(500).json({ message: 'Server error.' });
      }
    });

    // Mark tenant as paid
    app.put('/api/tenants/:id/pay', authMiddleware, requireRole(ROLES.LANDLORD), async (req, res) => {
      try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
        // Ensure property belongs to landlord
        const prop = await Property.findOne({ _id: tenant.property, landlord: req.user.userId });
        if (!prop) return res.status(403).json({ message: 'Not authorized.' });
        tenant.paymentStatus = 'paid';
        await tenant.save();
        res.json({ message: 'Tenant marked as paid.' });
      } catch (err) {
        console.error('Tenant payment update error:', err);
        res.status(500).json({ message: 'Server error.' });
      }
    });

    // Basic Route (for testing server is running)
    app.get('/', (req, res) => {
      res.send('Landlord Pay Tracker API is running!');
    });

    // Make Socket.io available to routes
    app.set('io', io);

    // API routes
    app.use('/api/houses', houseRoutes);
    app.use('/api/tenants', tenantRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/payments', paymentMpesaRoutes);
    app.use('/api/properties', propertyRoutes);
    app.use('/api/events', eventRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/invoices', invoiceRoutes);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: err.message || 'Server error' });
    });

    // Start the server using httpServer for Socket.io integration
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    