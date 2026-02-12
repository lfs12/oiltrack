# OilTrack - Oil Change Tracker App

## Overview
Mobile app for registering oil changes with vehicle plate, vehicle name, filter, oil, viscosity, time, customer phone, and responsible person. Shows history by vehicle plate.

## Recent Changes
- Feb 2026: Initial build - full CRUD oil change tracking with AsyncStorage

## Architecture
- **Frontend**: Expo Router with tabs (Registros, Nuevo, Historial)
- **Backend**: Express server on port 5000 (landing page only)
- **Storage**: AsyncStorage for local persistence
- **Fonts**: Inter (Google Fonts)
- **Colors**: Dark navy + amber gold theme

## Project Structure
- `app/(tabs)/index.tsx` - Records list (home tab)
- `app/(tabs)/new.tsx` - New oil change form
- `app/(tabs)/history.tsx` - Search history by plate
- `lib/storage.ts` - AsyncStorage CRUD operations
- `components/RecordCard.tsx` - Oil change record card
- `components/FormInput.tsx` - Styled form input

## User Preferences
- Language: Spanish (app UI in Spanish)
