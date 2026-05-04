# Yarn Stash Buster

A React Native mobile app that helps knitters use up their yarn stash by suggesting knitting patterns from [Ravelry](https://www.ravelry.com) that match the yarn they already own.

## The Problem

Every knitter knows the struggle: your yarn stash grows faster than you can knit through it. You have skeins stuffed in closets and bins, but when you want to start a new project, you browse for patterns without considering what you already have — and end up buying *more* yarn.

**Yarn Stash Buster** flips the process: start from your stash, get patterns that fit.

## How It Works

1. **Log your yarn** — Add yarn to your stash with color, weight, fiber type, and estimated yardage
2. **Get suggestions** — The app searches Ravelry's database of 1M+ patterns filtered to match your specific yarn
3. **Start knitting** — Tap a pattern to view it on Ravelry and cast on with yarn you already own

## Features

- Yarn stash management with color swatches and photo support
- Live pattern suggestions powered by the Ravelry API
- Smart filtering by yarn weight and available yardage
- Free pattern toggle
- Pull-to-refresh for new suggestions
- Secure credential storage
- Works on iOS, Android, and web

## Tech Stack

- **React Native** + **Expo** (SDK 54)
- **TypeScript**
- **React Navigation** (bottom tabs + stack)
- **Zustand** (state management)
- **Ravelry API** (pattern search)
- **expo-secure-store** (credential storage)
- **AsyncStorage** (local persistence + API caching)

## Getting Started

### Prerequisites

- Node.js (v18+)
- [Expo Go](https://expo.dev/go) on your phone (or Xcode/Android Studio for simulators)
- A [Ravelry](https://www.ravelry.com) account with API access ([request here](https://www.ravelry.com/pro/developer))

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/yarn-stash-buster.git
cd yarn-stash-buster
npm install
```

### Running the app

```bash
npx expo start
```

Then:
- Scan the QR code with Expo Go on your phone
- Press `w` for web
- Press `i` for iOS simulator

### Configuration

1. Open the app and go to the **Settings** tab
2. Enter your Ravelry username and read-only personal key
3. Toggle "Free patterns only" if desired
4. Add yarn to your stash and check the **Suggestions** tab

## Project Structure

```
src/
├── api/          # Ravelry API client with caching
├── constants/    # Theme colors, weight mappings
├── navigation/   # Tab and stack navigators
├── screens/      # All app screens
├── store/        # Zustand stores (yarn + settings)
└── types/        # TypeScript type definitions
```

## Roadmap

- [ ] AI-powered yarn detection from photos (Claude Vision API)
- [ ] Multi-yarn pattern matching (colorwork, multi-skein projects)
- [ ] Cloud sync with user accounts (Supabase)
- [ ] Stash statistics dashboard
- [ ] Web deployment

## License

MIT
