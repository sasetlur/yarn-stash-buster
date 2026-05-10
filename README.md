# Yarn Stash Buster

A React Native mobile app that helps knitters use up their yarn stash by suggesting knitting patterns from [Ravelry](https://www.ravelry.com) that match the yarn they already own.

## The Problem

Every knitter knows the struggle: your yarn stash grows faster than you can knit through it. You have skeins stuffed in closets and bins, but when you want to start a new project, you browse for patterns without considering what you already have — and end up buying *more* yarn.

**Yarn Stash Buster** flips the process: start from your stash, get patterns that fit.

## How It Works

1. **Log your yarn** — Add yarn to your stash manually or snap a photo and let AI identify it
2. **Get suggestions** — The app searches Ravelry's database of 1M+ patterns filtered to match your specific yarn
3. **Combine yarns** — Toggle multi-yarn mode to find colorwork patterns that pair yarns from your stash
4. **Start knitting** — Tap a pattern to view it on Ravelry and cast on with yarn you already own

## Features

### Stash Management
- Add yarn with color, weight, fiber type, and yardage
- **Ravelry yarn lookup** — search by brand/name to auto-fill weight and yardage per skein, then enter number of skeins for automatic yardage calculation
- Photo support with camera or photo library
- Color swatch grid for quick visual identification
- Edit and delete stash entries

### AI Yarn Detection
- Snap a photo of your yarn and tap "Analyze with AI"
- Uses Claude Vision (Haiku) to identify color, weight, and fiber type from the image
- Reads yarn labels when visible for more accurate results
- AI suggestions pre-fill the form for quick confirmation

### Pattern Suggestions
- Live pattern search powered by the Ravelry API
- Filtered by yarn weight and available yardage
- **Category filters** — Sweaters, Hats, Scarves, Shawls, Socks, Mittens, Blankets, Home Decor, Bags, Toys, Baby & Kids, Tops, Cardigans, Cowls
- **Multi-yarn colorwork matching** — finds patterns that combine two yarns from your stash, pairing across any weight combination
- Free pattern toggle
- Pattern cards with photos, designer, rating, and yardage needed
- Tap to open the pattern on Ravelry
- Pull-to-refresh

## Tech Stack

- **React Native** + **Expo** (SDK 54)
- **TypeScript**
- **React Navigation** (bottom tabs + stack)
- **Zustand** (state management)
- **Ravelry API** (pattern + yarn search)
- **Claude API** (AI yarn detection from photos)
- **AsyncStorage** (local persistence + API response caching)

## Getting Started

### Prerequisites

- Node.js (v18+)
- [Expo Go](https://expo.dev/go) on your phone (or Xcode/Android Studio for simulators)
- A [Ravelry](https://www.ravelry.com) account with API access

### Installation

```bash
git clone https://github.com/sasetlur/yarn-stash-buster.git
cd yarn-stash-buster
npm install
```

### Configuration

Create the local config file with your API credentials:

```bash
cp src/config/local.ts.example src/config/local.ts
```

Then edit `src/config/local.ts` with your keys:

```ts
export const RAVELRY_USERNAME = 'your_ravelry_username';
export const RAVELRY_PASSWORD = 'your_read_only_personal_key';
export const CLAUDE_API_KEY = 'sk-ant-...'; // optional, for AI yarn detection
```

This file is gitignored and will not be committed.

### Getting Ravelry API Credentials (required)

1. Create a [Ravelry](https://www.ravelry.com) account if you don't have one
2. Go to your [Pro/Developer page](https://www.ravelry.com/pro/developer)
3. Create a new app — select **Basic Auth** with **read-only** access
4. Copy your **username** and **personal key** (password) from the apps tab

### Getting a Claude API Key (optional)

The Claude API key enables AI-powered yarn detection from photos. Without it, you can still add yarn manually.

1. Sign up at [console.anthropic.com](https://console.anthropic.com)
2. Go to **Settings > API Keys > Create Key**
3. Copy your key (starts with `sk-ant-`)

### Running the App

```bash
npx expo start
```

Then:
- Scan the QR code with **Expo Go** on your phone
- Press `i` for iOS simulator
- Press `a` for Android emulator

## Usage

### Adding Yarn to Your Stash

1. Tap the **+** button on the **My Stash** tab
2. Either:
   - **Search Ravelry** for your yarn by brand/name to auto-fill details, then set the number of skeins
   - **Take a photo** and tap "Analyze with AI" to auto-detect color, weight, and fiber
   - **Fill in manually** using the color/weight/fiber selector grids
3. Adjust the yardage estimate and tap **Add to Stash**

### Finding Patterns

1. Go to the **Suggestions** tab — patterns matching your stash load automatically
2. Use the **category chips** to filter by garment type
3. Toggle **Multi-Yarn Matching** to find colorwork patterns that combine two of your yarns
4. Tap any pattern card to open it on Ravelry

### Settings

- View Ravelry connection status
- Toggle **free patterns only** filter

## Project Structure

```
src/
├── api/          # Ravelry + Claude API clients with caching
├── config/       # Local credentials (gitignored)
├── constants/    # Theme colors, weight mappings
├── navigation/   # Tab and stack navigators
├── screens/      # All app screens
├── store/        # Zustand stores (yarn + settings)
└── types/        # TypeScript type definitions
```

## Roadmap

- [x] Yarn stash management with Ravelry yarn lookup
- [x] Live pattern suggestions from Ravelry API
- [x] Category filters for pattern types
- [x] AI-powered yarn detection from photos (Claude Vision)
- [x] Multi-yarn colorwork pattern matching
- [ ] Cloud sync with user accounts (Supabase)
- [ ] Pinterest style integration
- [ ] Stash statistics dashboard
- [ ] Community features
- [ ] Web deployment

## License

MIT
