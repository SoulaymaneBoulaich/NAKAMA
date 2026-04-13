# NAKAMA Platform: Technical Documentation

## 1. Overview
NAKAMA is a high-performance web platform designed for the anime community. It features a cinematic "Modern-Mono" aesthetic and provides tools for exploring anime, managing personal lists, participating in community discussions, creating playlists, and writing/reading fan fiction stories.

## 2. Architecture
The platform is built using a **Monorepo** structure:
- **Client**: React (Vite 5), TypeScript, Tailwind CSS 3, Framer Motion.
- **Server**: Node.js, Express, TypeScript.
- **Shared**: Type-safe shared contracts (Interfaces, Enums) between Client and Server.
- **Database**: PostgreSQL with Prisma ORM.

## 3. Core Features

### 📖 Stories & Fan Fiction
- **Writer Dashboard**: Comprehensive management for story metadata, covers, and chapters.
- **Rich Editor**: Optimized chapter editor with auto-save and word count.
- **Cinematic Reading**: Performance-tuned reader with progressive layout and drop-caps.
- **Collaboration**: Multi-author support with granular credit labels.

### 👥 Communities
- **Management**: User-generated communities with custom branding.
- **Social Interaction**: Threaded discussions, polling, and media sharing.
- **Validation**: High-integrity background validation for community integrity.

### 📂 Playlists & Discovery
- **Anime Lists**: Personalized tracking for "Plan to Watch", "Watching", and "Completed".
- **Playlists**: User-curated collections with collaboration and sharing features.
- **Search**: Advanced debounced search for anime, users, and communities.

## 4. API & Communication Layer

### 🚀 Unified API Transport
The platform utilizes a centrally configured `api` instance (powered by Axios) located in `client/src/api/axios.ts`. This layer provides:
- **BaseURL Discovery**: Automatic resolution of the API endpoint via environment variables.
- **Authentication**: Automatic injection of the `accessToken` from `localStorage` into all request headers.
- **Interceptor Logic**: Global error handling and response normalization.
- **Credentials**: Standardized `withCredentials: true` for secure cookie-based session persistence.

### 🛡️ Defensive Stability Measures
To ensure a "zero-crash" user experience, the following patterns are enforced:
- **Array Guards**: Precise use of `Array.isArray()` before mapping API responses to prevent crashes on 401 redirects or 500 errors.
- **Logic Guards**: Null-checks and optional chaining (`?.`) on all deeply nested objects (e.g., `post._count?.likes`).
- **Loading States**: Consistent use of skeletons and spinners to manage asynchronous UI transitions.

## 5. Security & Persistence
- **Auth Flow**: Secure JWT architecture with refresh token rotation.
- **Type Safety**: End-to-end TypeScript enforcement, reducing runtime errors.
- **Data Integrity**: Prisma-managed migrations and relational constraints.

## 6. Development Guidelines
- **API usage**: Always use `import api from '@/api/axios'`—never raw `axios`.
- **Styling**: Adhere to the "Modern-Mono" system using documented CSS variables.
- **Linting**: Strict ESLint/Prettier configuration for consistent code quality.

---
*NAKAMA V1.5 - Stability & Performance Certified*
