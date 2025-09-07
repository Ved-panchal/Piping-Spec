# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Piping-Spec is a full-stack web application for managing piping specifications in industrial settings. The system allows users to create projects, configure piping specifications, and generate Piping Material Specifications (PMS) with detailed component data.

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Ant Design + Recharts
- **Backend**: Node.js + Express + TypeScript + Sequelize ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with cookie-based session management
- **Charts & Analytics**: Recharts for interactive data visualizations
- **Documentation**: Swagger API docs available at `/api-docs`

## Architecture Overview

### Client-Side (React/TypeScript)
The frontend follows a component-based architecture:

- **Entry Point**: `src/main.tsx` → `App.tsx` → Router system
- **Routing**: React Router with nested routes in `src/routes/index.tsx`
- **Core Pages**: 
  - `Home.tsx` - Landing page with authentication
  - `PipingSpecCreation.tsx` - Main application interface
- **Component Structure**: Organized by feature in `src/components/`
  - Project management (ProjectTable, CreateProjectModal)
  - Specifications (Specs, SpecsCreation, PMSCreation)
  - Configuration components (Rating, Schedule, Size, Material, etc.)
  - Authentication (Login, Register, UserDropDown)

### Server-Side (Express/TypeScript)
The backend follows MVC architecture with clear separation:

- **Entry Point**: `server.ts` → `app.ts`
- **Models**: Sequelize models with associations in `models/`
- **Controllers**: Business logic handlers in `controllers/`
- **Routes**: Express route definitions in `routes/`
- **Middleware**: Authentication, validation, and request processing
- **Database**: PostgreSQL with Sequelize ORM, includes default data seeding

### Key Data Models
- **User**: User management with industry-specific fields
- **Project**: Project containers for piping specifications
- **Spec**: Individual piping specifications within projects
- **PMS Components**: Size ranges, materials, ratings, schedules, components
- **Item Output**: Generated PMS item specifications

## Development Commands

### Client Development
```bash
cd client

# Development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Server Development
```bash
cd server

# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Production server (requires build first)
npm run start
```

### Full Stack Development
To run both client and server simultaneously:

1. **Terminal 1 (Server)**:
   ```bash
   cd server
   npm run dev
   ```

2. **Terminal 2 (Client)**:
   ```bash
   cd client
   npm run dev
   ```

The client dev server (port 5173) will proxy API requests to the server (port 3000).

## Environment Setup

### Required Environment Variables (Server)
Create `server/.env` with:
- `DB_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 3000)
- Email configuration variables for password reset functionality

### Database Setup
The application uses PostgreSQL with automatic table creation via Sequelize:
- Models are synchronized on startup via `syncDatabase()` in `models/index.ts`
- Default/seed data is handled through Default models

## Testing and Quality

### Running Tests
Currently, no test framework is configured. To add testing:

**For Client (recommended)**:
```bash
cd client
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom
```

**For Server (recommended)**:
```bash
cd server
npm install --save-dev jest @types/jest ts-jest supertest
```

### Linting
- Client uses ESLint with React-specific rules
- Server currently has no linting configured

## Key Development Workflows

### Adding New PMS Configuration Types
1. Create model in `server/models/`
2. Add controller in `server/controllers/`
3. Define routes in `server/routes/`
4. Create React component in `client/src/components/`
5. Add to Specs navigation in `Specs.tsx`

### API Integration Pattern
- API utilities in `client/src/utils/api/`
- Centralized API configuration in `config.ts`
- Consistent error handling with toast notifications
- JWT authentication handled automatically via axios interceptors

### Authentication Flow
1. Login/Register through modals on home page
2. JWT stored in localStorage with user data
3. Protected routes check for valid token
4. Automatic redirect to home if not authenticated

## Database Schema Key Points

- **Soft Deletes**: User model includes `isDeleted` flag
- **Associations**: Projects belong to Users, Specs belong to Projects
- **Default Data**: Separate models for default/seed data (materials, components, etc.)
- **Specifications**: Complex relationships between sizes, schedules, ratings, materials

## API Documentation

Swagger documentation is automatically generated and available at:
- `http://localhost:3000/api-docs` when server is running
- API routes are documented with JSDoc comments in route files

## Production Considerations

- **CORS**: Configured for both localhost:5173 (dev) and piping-spec.vercel.app (production)
- **Build Process**: Client builds static assets, server compiles TypeScript to `dist/`
- **Database**: Uses connection pooling via Sequelize
- **Security**: JWT authentication, bcrypt password hashing, request validation

## Admin Panel

The application includes a comprehensive admin panel with advanced analytics and user management features:

### Dashboard & Analytics
- **Visual Analytics**: Interactive charts showing user registration trends, subscription status distribution
- **Industry Insights**: Bar charts displaying user distribution across different industries
- **Plan Analytics**: Visual representation of subscription plan popularity
- **Real-time Metrics**: Overview cards showing total users, active/inactive/cancelled subscriptions
- **Time-series Data**: 30-day trends for user registrations and new subscriptions

### User Management
- **Complete CRUD Operations**: Create, Read, Update, Delete users
- **Advanced Search & Filtering**: Search users by name, email, company
- **Pagination**: Efficient handling of large user datasets
- **Detailed User Profiles**: View complete user information including subscription details
- **Subscription Validity Tracking**: Monitor subscription start/end dates and status

### Subscription Management
- **Subscription CRUD**: Full management of user subscriptions
- **Plan Management**: View and assign different subscription plans
- **Status Management**: Update subscription status (active/inactive/cancelled)
- **Validity Control**: Set and modify subscription start/end dates
- **Project/Spec Limits**: Configure allowed projects and specs per subscription

### Admin Access
- **Admin Login URL**: `/login/admin-panel`
- **Admin Dashboard URL**: `/admin/dashboard`
- **Default Credentials**: 
  - Email: `admin@pipingspec.com`
  - Password: `admin123`

### Creating Admin User
To create the initial admin user, run:
```bash
cd server
npm run create-admin
```

### Admin API Endpoints

#### Authentication
- `POST /admin/auth/login` - Admin login

#### User Management
- `GET /admin/users` - Get all users (with pagination/search)
- `GET /admin/users/analytics` - Get comprehensive user analytics with charts data
- `GET /admin/users/:userId` - Get specific user with subscription details
- `POST /admin/users` - Create new user
- `PUT /admin/users/:userId` - Update user information
- `DELETE /admin/users/:userId` - Delete user (soft delete)

#### Subscription Management
- `GET /admin/subscriptions` - Get all subscriptions (with pagination/filtering)
- `GET /admin/subscriptions/:subscriptionId` - Get specific subscription
- `POST /admin/subscriptions` - Create new subscription for user
- `PUT /admin/subscriptions/:subscriptionId` - Update subscription details
- `DELETE /admin/subscriptions/:subscriptionId` - Delete subscription
- `GET /admin/subscriptions/plans` - Get all available plans

## Common Issues and Solutions

### Database Connection Issues
- Ensure PostgreSQL is running and accessible
- Check `DB_URL` environment variable format
- Database tables are created automatically via Sequelize sync

### Frontend Build Issues
- Clear node_modules and package-lock.json if dependency conflicts occur
- Ensure TypeScript compilation passes before Vite build

### Authentication Issues
- Check JWT_SECRET is set consistently
- Verify localStorage contains valid token and user data
- Authentication state managed in PipingSpecCreation component
- Admin authentication uses separate localStorage keys (`admin_user`, `admin_token`)

### Admin Panel Issues
- Ensure admin user exists in database (run `npm run create-admin`)
- Admin routes are protected and require valid admin JWT token
- Only users with `role: 'admin'` can access admin endpoints
