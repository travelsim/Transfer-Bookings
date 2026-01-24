# Alpine Shuttle - Private Mountain Transfers

## Overview

Alpine Shuttle is a booking and landing page application for a private shuttle transfer service based in Victoria, Australia. The service provides door-to-door transportation to ski resorts (Mount Hotham, Falls Creek, Mount Buller), winery tours, and airport pickups.

The application is a full-stack TypeScript project with a React frontend and Express backend. Users can browse destinations, learn about services, read testimonials, and submit booking enquiries through a multi-step form.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

The frontend follows a component-based architecture with:
- Page components in `client/src/pages/`
- Reusable UI components in `client/src/components/ui/`
- Feature components in `client/src/components/`
- Shared utilities and hooks in `client/src/lib/` and `client/src/hooks/`

### Backend Architecture
- **Framework**: Express 5 running on Node.js
- **API Pattern**: RESTful JSON API
- **Validation**: Zod schemas with zod-validation-error for user-friendly messages
- **Development**: Vite middleware for HMR during development
- **Production**: Static file serving from built assets

The server exposes endpoints under `/api/` for booking enquiries and serves the SPA for all other routes.

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migrations**: Drizzle Kit with migrations output to `./migrations`
- **Current Storage**: In-memory storage implementation exists (`MemStorage` class) for development; database integration uses PostgreSQL when `DATABASE_URL` is configured

Key database tables:
- `users` - Basic user authentication (id, username, password)
- `booking_enquiries` - Customer booking requests with trip details, passenger info, and contact information

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- Database schema definitions
- Zod validation schemas
- TypeScript types
- Static data (destinations, testimonials, partners, location options)

### Build System
- **Client Build**: Vite outputs to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.cjs`
- **Bundling Strategy**: Common dependencies are bundled to reduce cold start times; others are externalized

## External Dependencies

### Database
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **connect-pg-simple**: Session storage for PostgreSQL

### UI/Component Libraries
- **Radix UI**: Accessible UI primitives (dialog, dropdown, select, tabs, etc.)
- **shadcn/ui**: Pre-built component patterns using Radix
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel/slider functionality
- **Vaul**: Drawer component
- **cmdk**: Command palette component

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Zod integration with React Hook Form

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Variant-based component styling
- **tailwind-merge**: Intelligent class merging

### Development Tools
- **Vite**: Build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **Drizzle Kit**: Database migration tooling
- **@replit/vite-plugin-***: Replit-specific development plugins