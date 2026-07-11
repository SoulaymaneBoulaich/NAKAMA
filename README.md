# NAKAMA

An anime community web platform built with modern TypeScript, React, and Express. NAKAMA is a full-stack monorepo application designed to bring anime enthusiasts together with features for community engagement, discussion, and shared content discovery.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database](#database)
- [Running the Application](#running-the-application)
- [Development](#development)
- [Building](#building)
- [Testing](#testing)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Overview

NAKAMA is a monorepo application comprising a modern React frontend and Express backend, creating a seamless anime community experience. The platform leverages Socket.IO for real-time communication, Prisma for database management, and modern web technologies for an optimized user experience.

## Features

- Real-time messaging and notifications via Socket.IO
- User authentication with JWT tokens
- Community forums and discussion threads
- Anime content sharing and curation
- User profiles and community interactions
- File uploads with Cloudinary integration
- Rate limiting and security features
- Responsive design with Tailwind CSS
- Dark mode support with next-themes
- Type-safe database operations with Prisma ORM

## Technology Stack

### Frontend (Client)
- React 19.2.4
- TypeScript 6.0.2
- Vite 8.0.4 - Fast build tool and development server
- Tailwind CSS 4.2.2 - Utility-first CSS framework
- React Query (TanStack Query) - Server state management
- React Router v7 - Client-side routing
- Socket.IO Client - Real-time communication
- Framer Motion - Animation library
- Recharts - Charting library
- Radix UI - Headless UI components
- Lucide React - Icon library
- DnD Kit - Drag and drop functionality

### Backend (Server)
- Node.js with TypeScript
- Express.js 5.2.1 - Web framework
- Prisma 6.2.1 - ORM and database toolkit
- PostgreSQL 15 - Database
- Socket.IO - Real-time bidirectional communication
- JWT - Authentication
- bcryptjs - Password hashing
- Multer - File upload handling
- Cloudinary - Cloud-based image storage
- Helmet - Security headers
- CORS - Cross-origin resource sharing
- Winston - Logging
- Zod - Schema validation
- Vitest - Unit testing framework
- Supertest - HTTP assertion library

## Project Structure

```
NAKAMA/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API client services
│   │   ├── store/             # State management
│   │   ├── lib/               # Utilities and helpers
│   │   ├── styles/            # Global styles
│   │   └── App.tsx            # Main application component
│   ├── public/                # Static assets
│   ├── index.html             # HTML entry point
│   ├── package.json           # Client dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── vite.config.ts         # Vite configuration
│   └── README.md              # Client documentation
│
├── server/                    # Express backend application
│   ├── src/
│   │   ├── routes/            # API route definitions
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Express middleware
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   ├── sockets/           # Socket.IO event handlers
│   │   └── index.ts           # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeding script
│   ├── tests/                 # Test files
│   ├── package.json           # Server dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   └── vitest.config.ts       # Vitest configuration
│
├── infra/                     # Infrastructure configuration
│   ├── db/                    # Database initialization scripts
│   ├── scripts/               # Setup and utility scripts
│   └── docker/                # Docker-related files
│
├── docker-compose.yml         # Docker Compose configuration
├── .env.example               # Environment variables template
├── package.json               # Root package configuration
└── README.md                  # This file
```

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn package manager
- Docker and Docker Compose (for database)
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/SoulaymaneBoulaich/NAKAMA.git
cd NAKAMA
```

2. Install dependencies for all workspaces:
```bash
npm install:all
```

This command will install dependencies for both the root, client, and server packages.

## Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:

```env
# Database Configuration
DB_USER=nakama_user
DB_PASSWORD=your_secure_password
DB_NAME=nakama_db
DB_PORT=5432
DATABASE_URL="postgresql://DB_USER:DB_PASSWORD@localhost:DB_PORT/DB_NAME?schema=public"

# Authentication
JWT_ACCESS_SECRET=your_min_32_chars_access_secret
JWT_REFRESH_SECRET=your_min_32_chars_refresh_secret

# Client URL (CORS Configuration)
CLIENT_URL="http://localhost:5173"

# Server Configuration
PORT=5000

# File Upload Configuration
UPLOAD_PATH="uploads"
MAX_FILE_SIZE=5242880

# Additional Configuration (as needed)
# Cloudinary credentials
# API keys
# Third-party service tokens
```

Ensure that all secrets are at least 32 characters long for security purposes.

## Database

### Starting the Database

The project uses PostgreSQL running in Docker. Start the database:

```bash
npm run db:up
```

This command will:
- Pull the PostgreSQL 15 Alpine image
- Create and start the `nakama_db` container
- Wait for the database to be healthy

### Database Management Commands

```bash
# View database logs
npm run db:logs

# Stop the database
npm run db:down

# Reset database (removes data and recreates)
npm run db:reset

# Push schema changes to database (without migration files)
npm run prisma:push

# Create and run migrations
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

### Prisma Operations

- Generate Prisma client: `npm run prisma:generate`
- Open Prisma Studio GUI: `npx prisma studio`

## Running the Application

### Development Mode - Concurrent (Recommended)

Run both client and server simultaneously:

```bash
npm run dev
```

This command uses `concurrently` to start:
- Frontend on http://localhost:5173
- Backend API on http://localhost:5000

### Development Mode - Individual Services

Run only the client:
```bash
npm run client
```

Run only the server:
```bash
npm run server
```

## Building

### Build All Packages

```bash
npm run build
```

This builds both client and server for production.

### Client Build

```bash
npm run build --workspace=@nakama/client
```

Output is generated in `client/dist/`

### Server Build

```bash
npm run build --workspace=@nakama/server
```

Output is generated in `server/dist/`

### Preview Production Build

```bash
npm run preview --workspace=@nakama/client
```

## Testing

### Run All Tests

```bash
npm run test --workspace=@nakama/server
```

### Watch Mode (Auto-rerun on changes)

```bash
npm run test:watch --workspace=@nakama/server
```

### Coverage Report

```bash
npm run test:coverage --workspace=@nakama/server
```

### Integration Tests

```bash
npm run test:integration --workspace=@nakama/server
```

### Prepare Integration Tests

```bash
npm run test:integration:push --workspace=@nakama/server
```

## Architecture

### Frontend Architecture

The frontend follows a modular component-based architecture:

- **Pages**: Top-level route components
- **Components**: Reusable UI components with clear responsibilities
- **Hooks**: Custom React hooks for logic reuse
- **Services**: Axios-based API client for backend communication
- **Store**: State management using React Query for server state
- **Lib**: Utility functions and helpers

Real-time features are handled through Socket.IO client integration for live updates and notifications.

### Backend Architecture

The backend implements a clean layered architecture:

- **Routes**: Define API endpoints and HTTP methods
- **Controllers**: Handle request/response logic
- **Services**: Encapsulate business logic
- **Middleware**: Process requests and responses
- **Types**: Centralized TypeScript interfaces
- **Sockets**: Handle WebSocket events for real-time communication
- **Utils**: Helper functions and constants

Database operations are managed through Prisma ORM with type-safe queries.

### Real-Time Communication

Socket.IO enables:
- Live notifications
- Real-time chat messaging
- Presence tracking
- Activity updates
- Collaborative features

## API Documentation

API endpoints follow RESTful conventions with the base URL: `http://localhost:5000/api`

Common endpoints include:

- Authentication: `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/refresh`
- Users: `/users`, `/users/:id`, `/users/:id/profile`
- Posts/Content: `/posts`, `/posts/:id`, `/posts/:id/comments`
- Community: `/community`, `/community/:id`, `/community/:id/members`
- Real-time Events: Managed via Socket.IO namespaces

For detailed API documentation, refer to the API specification document or explore the code in `server/src/routes/`.

## Security

The application implements multiple security layers:

1. **Authentication & Authorization**
   - JWT-based token authentication
   - Access and refresh tokens
   - Secure password hashing with bcryptjs

2. **Request Validation**
   - Zod schema validation
   - Input sanitization with sanitize-html

3. **HTTP Security**
   - Helmet.js for security headers
   - CORS configuration for cross-origin requests
   - Rate limiting to prevent abuse

4. **Data Protection**
   - Password hashing and salting
   - Secure token generation
   - HPP (HTTP Parameter Pollution) protection

5. **File Upload Security**
   - Cloudinary integration for secure image storage
   - File type validation
   - Size restrictions (5MB default)

6. **Logging & Monitoring**
   - Winston logger for application events
   - Error tracking and debugging

## Contributing

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test thoroughly

3. Commit with meaningful messages:
```bash
git commit -m "Add feature: description"
```

4. Push to your branch:
```bash
git push origin feature/your-feature-name
```

5. Submit a pull request for review

## Development Workflow

1. Start the database: `npm run db:up`
2. Run migrations if needed: `npm run prisma:migrate`
3. Seed data: `npm run prisma:seed`
4. Start development servers: `npm run dev`
5. Make code changes
6. Run tests: `npm run test --workspace=@nakama/server`
7. Build and verify: `npm run build`

## Performance Optimization

- Vite provides fast HMR (Hot Module Replacement)
- React Query caches server state efficiently
- Socket.IO reduces polling overhead
- Tailwind CSS with PostCSS for optimized styling
- Lazy loading and code splitting for frontend performance

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:
1. Verify Docker is running: `docker ps`
2. Check database logs: `npm run db:logs`
3. Ensure `.env` DATABASE_URL is correct
4. Reset database if needed: `npm run db:reset`

### Port Already in Use

If ports 5000 or 5173 are already in use:
1. Change the port in `.env` (SERVER) or vite config (CLIENT)
2. Kill the process using the port
3. Or use a different machine/VM

### Node Modules Issues

If you experience dependency issues:
1. Delete node_modules and lock file: `rm -rf node_modules package-lock.json`
2. Clear npm cache: `npm cache clean --force`
3. Reinstall: `npm install:all`

### TypeScript Compilation Errors

1. Ensure TypeScript version matches: `npm install --save-dev typescript@6.0.2`
2. Clear TypeScript cache
3. Regenerate Prisma client: `npm run prisma:generate --workspace=@nakama/server`

## License

ISC License - See LICENSE file for details

## Repository Information

- Created: April 13, 2026
- Default Branch: main
- Status: Active
- Privacy: Private
- Language: TypeScript 100%

---

For more information or questions, please refer to the individual README files in the `client/` and `server/` directories, or open an issue on GitHub.
