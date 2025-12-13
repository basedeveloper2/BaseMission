# Base Mission (Base Odyssey)

## Overview
Base Mission (formerly Base Odyssey) is an interactive, gamified platform designed to onboard and engage users with the Base blockchain ecosystem. Through a structured 110-day journey, users complete daily quests across various categories to earn XP, climb leaderboards, and win rewards.

## Key Features

### 🎯 Quest System
- **110-Day Journey**: A comprehensive schedule of daily activities ranging from simple onboarding tasks to complex DeFi strategies.
- **Categories**:
  - **Newcomer**: For beginners to get started (e.g., wallet setup, bridging).
  - **Builder**: For developers to deploy contracts and build dApps.
  - **Creator**: For content creators to engage the community.
  - **DeFi**: For exploring financial protocols (swapping, lending, liquidity).
- **Quest Tracking**: Automated verification of onchain and offchain actions.

### 🏆 Gamification
- **XP & Leveling**: Users earn XP for completing quests.
- **Leaderboards**: 
  - **Global Leaderboard**: Individual rankings based on XP and quests completed.
  - **Squad Leaderboard**: Team-based competition to encourage social coordination.
- **Streaks**: Incentives for daily engagement.

### 💰 Rewards & Incentives
- **Lottery System**: Periodic draws for eligible active users.
- **Badges**: Digital collectibles for milestones (e.g., "7-Day Streak", "DeFi Master").

### 🛠 Tech Stack
- **Frontend**: React (v19), Vite, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Fastify.
- **Database**: Supabase (PostgreSQL).
- **Blockchain**: Base Mainnet interaction via `@coinbase/wallet-sdk` and `wagmi`.
- **Deployment**: Vercel (Frontend), Railway/Render (Backend - implied).

## Project Structure
- `/pages`: React components for main views (Dashboard, Leaderboard, Lottery, etc.).
- `/server`: Backend API and database logic.
- `/services`: API clients and blockchain interaction services.
- `/constants`: Static assets and configuration.

## Getting Started
1. **Connect Wallet**: Supports Coinbase Wallet and other standard connectors.
2. **Choose Your Path**: Select a category (Newcomer, Builder, etc.) or mix and match.
3. **Complete Quests**: Follow the daily guides to execute transactions or social actions.
4. **Track Progress**: Watch your XP grow and compete on the leaderboard.
