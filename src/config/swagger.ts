import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Omnichannel Social Commerce Hub — API Documentation',
    version: '1.0.0',
    description:
      'RESTful API documentation for the Omnichannel Social Commerce Hub system. ' +
      'Manages multi-channel selling (Facebook Messenger & Shopee), automatic payment via PayOS VietQR, ' +
      'shipping via GHN Express, inventory sync, and Business Intelligence analytics with WMA forecasting.',
    contact: {
      name: 'Huynh Van Sang',
      email: 'skillsanh@gmail.com',
    },
  },
  servers: [
    {
      url: '/api',
      description: 'API Server (proxied through /api prefix)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from POST /api/auth/login',
      },
    },
    schemas: {
      // ─── Auth ───
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'skillsanh@gmail.com' },
          password: { type: 'string', example: 'admin123' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', example: 'newstaff@company.com' },
          password: { type: 'string', example: 'securePass123' },
          name: { type: 'string', example: 'Nhân Viên Mới' },
          role: { type: 'string', enum: ['ADMIN', 'STAFF'], default: 'STAFF' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'STAFF'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      // ─── Product ───
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          sku: { type: 'string', example: 'SP-001' },
          name: { type: 'string', example: 'Tai Nghe Bluetooth' },
          description: { type: 'string' },
          price: { type: 'number', example: 250000 },
          stock: { type: 'integer', example: 50 },
          weight: { type: 'integer', example: 500, description: 'Grams for GHN shipping calculation' },
          shopeeItemMapping: { $ref: '#/components/schemas/ShopeeMapping' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateProductRequest: {
        type: 'object',
        required: ['sku', 'name', 'price', 'stock'],
        properties: {
          sku: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          stock: { type: 'integer' },
          weight: { type: 'integer', default: 500 },
          shopeeItemId: { type: 'integer', description: 'Shopee Item ID for cross-platform mapping' },
          shopeePrice: { type: 'number', description: 'Price configured on Shopee platform' },
        },
      },
      ShopeeMapping: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          productId: { type: 'string', format: 'uuid' },
          shopeeItemId: { type: 'integer' },
          shopeePrice: { type: 'number' },
        },
      },
      // ─── Customer ───
      Customer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          fbUserId: { type: 'string', description: 'Facebook PSID' },
          name: { type: 'string' },
          phone: { type: 'string' },
          address: { type: 'string' },
          districtId: { type: 'integer', description: 'GHN District ID' },
          wardCode: { type: 'string', description: 'GHN Ward Code' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      // ─── Order ───
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          orderCode: { type: 'integer' },
          channel: { type: 'string', enum: ['FACEBOOK', 'SHOPEE'] },
          status: { type: 'string', enum: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'] },
          totalAmount: { type: 'number' },
          shippingFee: { type: 'number' },
          payosPaymentId: { type: 'string' },
          ghnOrderCode: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          customer: { $ref: '#/components/schemas/Customer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          productId: { type: 'string', format: 'uuid' },
          quantity: { type: 'integer' },
          price: { type: 'number' },
        },
      },
      // ─── API Response ───
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
    },
  },
  paths: {
    // ═══════ AUTH ═══════
    '/auth/login': {
      post: {
        tags: ['Auth & Users'],
        summary: 'Login to get JWT token',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
        responses: { 200: { description: 'Login successful, returns JWT token and user info' } },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth & Users'],
        summary: 'Register new user (Admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: { 201: { description: 'User created successfully' }, 403: { description: 'Only ADMIN role can create users' } },
      },
    },
    '/auth/profile': {
      get: {
        tags: ['Auth & Users'],
        summary: 'Get current authenticated user profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'User profile data' } },
      },
    },
    // ═══════ PRODUCTS ═══════
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'List all products (search, pagination)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by product name or SKU' },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Product list' } },
      },
      post: {
        tags: ['Products'],
        summary: 'Create new product (Admin only)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductRequest' } } } },
        responses: { 201: { description: 'Product created with optional Shopee mapping' } },
      },
    },
    '/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product detail by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product detail' } },
      },
      put: {
        tags: ['Products'],
        summary: 'Update product (Admin only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProductRequest' } } } },
        responses: { 200: { description: 'Product updated' } },
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product (Admin only, cascades Shopee mapping)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product deleted' } },
      },
    },
    // ═══════ CUSTOMERS ═══════
    '/customers': {
      get: {
        tags: ['Customers'],
        summary: 'List all customers',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Customer list' } },
      },
      post: {
        tags: ['Customers'],
        summary: 'Create new customer',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Customer created' } },
      },
    },
    '/customers/{id}': {
      get: {
        tags: ['Customers'],
        summary: 'Get customer detail by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Customer detail' } },
      },
      put: {
        tags: ['Customers'],
        summary: 'Update customer information',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Customer updated' } },
      },
    },
    // ═══════ CHAT ═══════
    '/chat/conversations': {
      get: {
        tags: ['Chat'],
        summary: 'List all Messenger conversations',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Conversation list' } },
      },
    },
    '/chat/conversations/{id}/messages': {
      get: {
        tags: ['Chat'],
        summary: 'Get message history for a conversation',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Message list' } },
      },
    },
    '/chat/messages': {
      post: {
        tags: ['Chat'],
        summary: 'Send message from Shop to customer via Facebook Messenger',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['conversationId', 'content'],
                properties: {
                  conversationId: { type: 'string' },
                  content: { type: 'string' },
                  messageType: { type: 'string', enum: ['TEXT', 'IMAGE', 'QR_CODE'], default: 'TEXT' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Message sent' } },
      },
    },
    // ═══════ ORDERS ═══════
    '/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders (filterable by status)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'] } }],
        responses: { 200: { description: 'Order list' } },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create new order → Calculate GHN shipping → Generate PayOS VietQR → Send to Facebook Messenger',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Order created with full workflow triggered' } },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order detail by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Order detail with items and customer info' } },
      },
    },
    // ═══════ ANALYTICS BI ═══════
    '/analytics/kpi-overview': {
      get: {
        tags: ['Analytics BI'],
        summary: 'KPI Overview: Revenue, Net Profit, Orders, New Customers (with % comparison)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'period', in: 'query', schema: { type: 'string', enum: ['today', '7d', '30d', '90d'] }, description: 'Time period' }],
        responses: { 200: { description: 'KPI overview data' }, 403: { description: 'Admin only' } },
      },
    },
    '/analytics/revenue-trend': {
      get: {
        tags: ['Analytics BI'],
        summary: 'Revenue trend line chart data (daily, split by Facebook vs Shopee)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'period', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Revenue trend data with labels and datasets' } },
      },
    },
    '/analytics/channel-performance': {
      get: {
        tags: ['Analytics BI'],
        summary: 'Channel comparison (Facebook vs Shopee) with auto-generated strategic insights',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'period', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Channel metrics and AI insight text' } },
      },
    },
    '/analytics/profit-breakdown': {
      get: {
        tags: ['Analytics BI'],
        summary: 'Profit breakdown: Revenue − Shipping − Platform Fee − COGS = Net Profit',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'period', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Profit breakdown chart data and totals' } },
      },
    },
    '/analytics/top-products': {
      get: {
        tags: ['Analytics BI'],
        summary: 'Top selling products ranked by quantity, revenue, or profit',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'period', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 5 } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['quantity', 'revenue', 'profit'] } },
        ],
        responses: { 200: { description: 'Ranked product list' } },
      },
    },
    '/analytics/inventory-alerts': {
      get: {
        tags: ['Analytics BI'],
        summary: 'Inventory alerts: Critical (≤5), Low (≤20), Overstock (>90 days) & Shopee sync check',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Inventory alert categories and Shopee sync status' } },
      },
    },
    '/analytics/inventory-forecast': {
      get: {
        tags: ['Analytics BI'],
        summary: 'Inventory forecast using Weighted Moving Average (WMA) algorithm for 30-day prediction',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'productId', in: 'query', required: true, schema: { type: 'string' }, description: 'Product UUID' },
          { name: 'forecastDays', in: 'query', schema: { type: 'integer', default: 30 } },
        ],
        responses: { 200: { description: 'Daily forecast slots, out-of-stock date, and reorder point' } },
      },
    },
    '/analytics/chat-conversion': {
      get: {
        tags: ['Analytics BI'],
        summary: 'Chat-to-Order conversion funnel & average staff response time',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'period', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Funnel counts, conversion rates, and auto insight' } },
      },
    },
  },
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [], // We define paths inline above, no need for file scanning
});

/**
 * Registers Swagger UI at /api-docs
 */
export function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Omnichannel Commerce Hub — API Docs',
  }));
}
