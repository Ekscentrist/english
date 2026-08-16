# Interview Prep Tracker

A desktop app for practicing **English IT interviews**, focused on Laravel backend roles. It is a personal trainer for speaking: warm-ups, timed sessions, ratings, notes, and a searchable Q&A knowledge base — all stored locally on your machine.

You work through a curriculum of voice-mode sessions with an AI interviewer (ChatGPT or similar). The app tracks progress, cheatsheets, daily habits, and answers you want to recall later.

## Features

- **Today** — next session, overall progress, and quick actions
- **Practice** — timer, prompts, self-ratings, and session notes
- **Curriculum** — full plan by stage, at your own pace
- **Cheatsheets** — all session notes in one place, with search and highlight
- **Q&A** — your own question/answer database (for example “What is dependency injection?”), searchable by title and body
- **Habits** — warm-up, shadowing, homework, readiness checklist
- **Settings** — export/import JSON backup; reset progress without wiping Q&A

Progress and Q&A entries live in a local SQLite file (`progress.db` in the app user data folder). Nothing is sent to a server.

## Run locally

```bash
npm install
npm run dev
```

Windows installer / portable build:

```bash
npm run dist
```

## Stack

Vue 3, Electron, SQLite (`better-sqlite3`).
