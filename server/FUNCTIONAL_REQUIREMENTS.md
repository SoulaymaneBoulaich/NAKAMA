# NAKAMA Functional Requirements & Security Threat Model

## 1. System Overview
NAKAMA is a community-driven anime social platform and competitive ecosystem focusing on real-time engagement, data-driven recommendations, and user-generated content.

## 2. Functional Requirements

### 2.1 User Lifecycle & Social
- **Authentication**: Secure signup, login, and password reset. JWT-based session management with refresh tokens.
- **Profiles**: Personalized user profiles with customizable themes, typography, and accent colors.
- **Social Graph**: Following/Followers system, activity feeds, and notifications.
- **Messaging**: Real-time direct messaging and group conversations.

### 2.2 Content Manifestation
- **AniShots**: Short-lived (ephemeral) thought sharing with media attachments.
- **Stories**: Multi-chapter user-generated narratives with collaboration support.
- **Posts & Polls**: Rich community posts with interactive polls.
- **Playlists**: Collaborative anime collection sharing.

### 2.3 Competitive & Community (AniQuiz)
- **Gauntlet**: Endless quiz mode with mistake-based thresholds and ELO tracking.
- **Competitive Battles**: Real-time 1v1 matchmaking managed via WebSockets.
- **Submissions**: Community-driven question creation with peer-review voting thresholds.
- **Hall of Fame**: Global leaderboards for top-tier competitors.

---

## 3. Security Threat Model

### 3.1 Identity & Access
- **Threat**: Brute-force/Credential stuffing on login.
- **Mitigation**: Implemented `express-rate-limit` on `/api/auth`.
- **Threat**: Sensitive token leakage in logs.
- **Mitigation**: Redacting tokens in Winston/Console output.

### 3.2 Data Privacy
- **Threat**: Stack trace exposure in production.
- **Mitigation**: Implemented global `errorHandler` with environment-aware redaction.
- **Threat**: Unauthorized media access.
- **Mitigation**: Role-based access control (RBAC) on creation/deletion endpoints.

### 3.3 System Resilience
- **Threat**: Excessive payload attacks.
- **Mitigation**: Applied `express.json({ limit: '10kb' })` body limits.
- **Threat**: Insecure response headers.
- **Mitigation**: Integrated `helmet` for CSP and HSTS enforcement.
