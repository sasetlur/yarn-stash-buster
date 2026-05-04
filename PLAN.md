# Yarn Stash Buster — Implementation Plan

A mobile app that helps knitters use up their yarn stash by identifying what they have and suggesting matching patterns.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React Native + Expo | Cross-platform, zero cost to develop/test with Expo Go |
| Navigation | React Navigation | Standard for React Native |
| State | Zustand | Lightweight, simple — good for a project this size |
| Storage (MVP) | AsyncStorage | Local-first, no backend cost |
| Backend (later) | Supabase (free tier) | Auth, Postgres DB, storage — generous free tier |
| AI Vision (later) | Claude API or Google Cloud Vision | Free tier credits for yarn photo analysis |
| Pattern Data | Ravelry API | The definitive knitting pattern database |

## Prerequisites

- [x] **Apply for Ravelry API access** — Done! Read-only Basic Auth access secured.
- [ ] Install Node.js (LTS), Expo CLI (`npx create-expo-app`), and Xcode (for iOS simulator)
- [ ] Set up an Expo account (free) for Expo Go testing on your physical iPhone

---

## Phase 1: MVP — Yarn Stash + Ravelry Pattern Suggestions

**Goal:** A working app where users log their yarn and get live pattern suggestions from Ravelry. Ship a polished MVP to GitHub fast.

### 1.1 Project Setup
- Initialize Expo project with TypeScript template
- Set up ESLint, Prettier
- Configure React Navigation (bottom tabs: Stash, Suggestions, Settings)

### 1.2 Data Model

```
YarnEntry {
  id: string
  name: string              // user label, e.g. "Blue merino from grandma"
  colorFamily: enum         // red, orange, yellow, green, blue, purple, pink, white, black, gray, brown, multicolor
  weight: enum              // lace, fingering, sport, DK, worsted, aran, bulky, super-bulky
  fiberType: enum           // wool, merino, cotton, acrylic, alpaca, silk, blend, unknown
  yardageEstimate: number   // approximate yards available
  photoUri?: string         // local photo path (optional in MVP)
  addedAt: timestamp
}
```

### 1.3 Stash Management Screens
- **Stash List Screen** — grid/list of yarn entries with color swatches and key info
- **Add Yarn Screen** — form with color picker, weight/fiber dropdowns, yardage input, optional photo
- **Yarn Detail Screen** — view/edit/delete an entry

### 1.4 Ravelry API Integration
- API client with Basic Auth (credentials stored via expo-secure-store)
- Key endpoints:
  - `GET /patterns/search.json` — search by weight, yardage, craft, availability
  - `GET /patterns/{id}.json` — full pattern details
- Request caching with AsyncStorage to minimize API calls
- Smart matching: for each yarn, query Ravelry filtered by weight + max yardage + craft=knitting

### 1.5 Suggestions Screen
- Pattern cards matched to user's stash, powered by Ravelry
- Each card: pattern photo, name, designer, rating, yardage needed, matched yarn
- Tapping opens the Ravelry pattern page
- Filters: by yarn entry, by category, by free/paid
- Pull-to-refresh for new suggestions

### 1.6 Settings Screen
- Ravelry API credentials input (username + personal key)
- Default filters (free patterns only, preferred categories)

### 1.7 Polish
- Empty states with friendly messages
- Consistent color theme
- Loading states and error handling for API calls

**Milestone: Working app with live Ravelry suggestions, demoable in Expo Go.**

---

## Phase 2: AI-Powered Yarn Detection from Photos

**Goal:** Users photograph their yarn and the app automatically identifies attributes.

### 2.1 Camera Integration
- Full camera screen using `expo-camera`
- Guide overlay ("Place yarn in the center, ensure good lighting")
- Option to pick from photo library

### 2.2 AI Vision Integration

**Option A — Claude API (recommended):**
- Send photo to Claude's vision endpoint with a structured prompt
- Free tier: $5 API credit for new accounts

**Option B — Google Cloud Vision + custom logic:**
- Label detection + dominant color extraction
- Free tier (1K/month)

### 2.3 Review & Confirm Flow
- Show AI's guess: "I see a bulky blue wool — does this look right?"
- User confirms or corrects
- Pre-fill the Add Yarn form with AI's suggestions

---

## Phase 3: Multi-Yarn Pattern Matching

**Goal:** Suggest patterns that combine multiple yarns from the stash.

- Colorwork patterns using two contrasting colors the user owns
- Multi-skein projects that use up partial skeins together
- This is a differentiating feature — most tools don't do this

---

## Phase 4: Backend + User Accounts

**Goal:** Cloud sync, sharing, and multi-device support.

- Supabase backend (free tier: 500MB DB, 1GB storage)
- User auth (email/password + social login)
- Cloud storage for yarn photos
- Offline-first sync with conflict resolution

---

## Phase 5: Community & Social Features

- Public stash profiles with shareable links
- Stash stats dashboard (total yardage, color distribution, weight breakdown)
- Pattern queue / project tracking
- Destash marketplace (stretch goal)

---

## Phase 6: Polish & Portfolio Optimization

- Unit + component + E2E tests
- GitHub Actions CI/CD
- Polished README with screenshots, architecture diagram, setup instructions
- Web version via Expo web, deployed to Vercel/Netlify

---

## Recommended Build Order

```
Phase 1 (MVP + Ravelry)  ██████████░░░░░░░░░░  Weeks 1-3
Phase 6.2 (README)        ░░░░░░░░░░██░░░░░░░░  Week 3 (do before job apps!)
Phase 2 (AI Vision)       ░░░░░░░░░░░░████░░░░  Weeks 4-5
Phase 3 (Multi-Yarn)      ░░░░░░░░░░░░░░██░░░░  Week 6
Phase 4 (Backend)         ░░░░░░░░░░░░░░░░██░░  Weeks 7-8
Phase 5 (Social)          ░░░░░░░░░░░░░░░░░░██  Weeks 9+
Phase 6 (Full Polish)     ░░░░░░░░░░░░░░░░░░██  Ongoing
```

## Cost Summary

| Item | Cost | When Needed |
|------|------|-------------|
| Expo / React Native | Free | Phase 1 |
| Ravelry API | Free (non-commercial) | Phase 1 |
| Claude API | $5 free credit | Phase 2 |
| Supabase | Free tier | Phase 4 |
| Apple Developer Account | $99/year | Only if publishing to App Store |
| Vercel/Netlify | Free tier | Phase 6 (web deploy) |

**Total cost through Phase 4: $0**
