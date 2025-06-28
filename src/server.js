const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Fundis & Freelancers Booking Bot',
    version: '1.0.0'
  });
});

// API routes placeholder
app.get('/api', (req, res) => {
  res.json({
    message: 'Fundis & Freelancers Booking Bot API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      webhook: '/api/webhook/whatsapp',
      auth: '/api/auth/*',
      bookings: '/api/bookings/*',
      providers: '/api/providers/*',
      payments: '/api/payments/*'
    }
  });
});

// WhatsApp webhook endpoint placeholder
app.post('/api/webhook/whatsapp', (req, res) => {
  console.log('WhatsApp webhook received:', req.body);
  res.status(200).json({ status: 'received' });
});

// Authentication routes placeholder
app.get('/api/auth', (req, res) => {
  res.json({ message: 'Authentication endpoints' });
});

// Bookings routes placeholder
app.get('/api/bookings', (req, res) => {
  res.json({ 
    message: 'Bookings API',
    bookings: [
      {
        id: 1,
        client: 'John Doe',
        provider: 'Jane Smith',
        service: 'Plumbing',
        status: 'confirmed',
        date: '2024-01-15',
        amount: 2500
      },
      {
        id: 2,
        client: 'Mary Johnson',
        provider: 'Peter Kamau',
        service: 'House Cleaning',
        status: 'pending',
        date: '2024-01-16',
        amount: 1500
      }
    ]
  });
});

// Service providers routes placeholder
app.get('/api/providers', (req, res) => {
  res.json({ 
    message: 'Service Providers API',
    providers: [
      {
        id: 1,
        name: 'Jane Smith',
        service: 'Plumbing',
        rating: 4.8,
        location: 'Nairobi',
        available: true
      },
      {
        id: 2,
        name: 'Peter Kamau',
        service: 'House Cleaning',
        rating: 4.6,
        location: 'Kiambu',
        available: true
      }
    ]
  });
});

// Payments routes placeholder
app.get('/api/payments', (req, res) => {
  res.json({ message: 'M-Pesa Payment Integration' });
});

// Admin dashboard route
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fundis & Freelancers - Admin Dashboard</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100">
        <div class="min-h-screen">
            <header class="bg-blue-600 text-white p-4">
                <h1 class="text-2xl font-bold">Fundis & Freelancers Admin Dashboard</h1>
            </header>
            <main class="container mx-auto p-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h3 class="text-lg font-semibold text-gray-700">Total Bookings</h3>
                        <p class="text-3xl font-bold text-blue-600">156</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h3 class="text-lg font-semibold text-gray-700">Active Providers</h3>
                        <p class="text-3xl font-bold text-green-600">42</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h3 class="text-lg font-semibold text-gray-700">Revenue (KES)</h3>
                        <p class="text-3xl font-bold text-purple-600">125,000</p>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-xl font-bold mb-4">Recent Bookings</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full table-auto">
                            <thead>
                                <tr class="bg-gray-50">
                                    <th class="px-4 py-2 text-left">ID</th>
                                    <th class="px-4 py-2 text-left">Client</th>
                                    <th class="px-4 py-2 text-left">Provider</th>
                                    <th class="px-4 py-2 text-left">Service</th>
                                    <th class="px-4 py-2 text-left">Status</th>
                                    <th class="px-4 py-2 text-left">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b">
                                    <td class="px-4 py-2">001</td>
                                    <td class="px-4 py-2">John Doe</td>
                                    <td class="px-4 py-2">Jane Smith</td>
                                    <td class="px-4 py-2">Plumbing</td>
                                    <td class="px-4 py-2"><span class="bg-green-100 text-green-800 px-2 py-1 rounded">Confirmed</span></td>
                                    <td class="px-4 py-2">KES 2,500</td>
                                </tr>
                                <tr class="border-b">
                                    <td class="px-4 py-2">002</td>
                                    <td class="px-4 py-2">Mary Johnson</td>
                                    <td class="px-4 py-2">Peter Kamau</td>
                                    <td class="px-4 py-2">House Cleaning</td>
                                    <td class="px-4 py-2"><span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span></td>
                                    <td class="px-4 py-2">KES 1,500</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    </body>
    </html>
  `);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: ['/health', '/api', '/admin']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Fundis & Freelancers Booking Bot server running on port ${PORT}`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/admin`);
  console.log(`🔗 API Endpoints: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;