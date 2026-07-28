import Database from 'better-sqlite3'
import { join } from 'node:path'
import { app } from 'electron'

const RATING_KEYS = [
  'grammar',
  'fluency',
  'technical',
  'confidence',
  'structure',
  'naturalness',
]

let db

function emptyRatings() {
  return Object.fromEntries(RATING_KEYS.map((k) => [k, 0]))
}

export function getDbPath() {
  return join(app.getPath('userData'), 'progress.db')
}

export function openDatabase() {
  if (db) return db
  db = new Database(getDbPath())
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  migrate(db)
  return db
}

function migrate(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_progress (
      session_id TEXT PRIMARY KEY,
      done INTEGER NOT NULL DEFAULT 0,
      cheatsheet TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_ratings (
      session_id TEXT NOT NULL,
      rating_key TEXT NOT NULL,
      value INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (session_id, rating_key),
      FOREIGN KEY (session_id) REFERENCES session_progress(session_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS homework (
      item_id TEXT PRIMARY KEY,
      done INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS shadowing_days (
      day TEXT PRIMARY KEY,
      done INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS readiness (
      item_id TEXT PRIMARY KEY,
      done INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS session_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      duration_sec INTEGER,
      notes TEXT NOT NULL DEFAULT ''
    );
  `)

  const version = getMeta('schema_version')
  if (!version) {
    setMeta('schema_version', '1')
  }
}

export function getMeta(key) {
  const row = openDatabase().prepare('SELECT value FROM meta WHERE key = ?').get(key)
  return row ? row.value : null
}

export function setMeta(key, value) {
  openDatabase()
    .prepare(
      `INSERT INTO meta (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    )
    .run(key, String(value))
}

function ensureSessionRow(sessionId) {
  const id = String(sessionId)
  const now = new Date().toISOString()
  openDatabase()
    .prepare(
      `INSERT INTO session_progress (session_id, done, cheatsheet, updated_at)
       VALUES (?, 0, '', ?)
       ON CONFLICT(session_id) DO NOTHING`,
    )
    .run(id, now)
  return id
}

export function getProgress() {
  const database = openDatabase()

  const sessions = {}
  for (const row of database.prepare('SELECT * FROM session_progress').all()) {
    const ratings = emptyRatings()
    for (const r of database
      .prepare('SELECT rating_key, value FROM session_ratings WHERE session_id = ?')
      .all(row.session_id)) {
      ratings[r.rating_key] = r.value
    }
    sessions[row.session_id] = {
      done: Boolean(row.done),
      ratings,
      cheatsheet: row.cheatsheet || '',
    }
  }

  const homework = { '30s': false, '1m': false, '3m': false }
  for (const row of database.prepare('SELECT * FROM homework').all()) {
    homework[row.item_id] = Boolean(row.done)
  }

  const shadowing = {}
  for (const row of database.prepare('SELECT * FROM shadowing_days').all()) {
    shadowing[row.day] = Boolean(row.done)
  }

  const readiness = {}
  for (const row of database.prepare('SELECT * FROM readiness').all()) {
    readiness[row.item_id] = Boolean(row.done)
  }

  return {
    sessions,
    homework,
    shadowing,
    readiness,
    lastSessionId: getMeta('last_session_id'),
    migratedV1: getMeta('migrated_v1') === '1',
  }
}

export function setSessionDone(sessionId, done) {
  const id = ensureSessionRow(sessionId)
  const now = new Date().toISOString()
  openDatabase()
    .prepare(
      `UPDATE session_progress SET done = ?, updated_at = ? WHERE session_id = ?`,
    )
    .run(done ? 1 : 0, now, id)
  setMeta('last_session_id', id)
}

export function setRating(sessionId, key, value) {
  const id = ensureSessionRow(sessionId)
  openDatabase()
    .prepare(
      `INSERT INTO session_ratings (session_id, rating_key, value)
       VALUES (?, ?, ?)
       ON CONFLICT(session_id, rating_key) DO UPDATE SET value = excluded.value`,
    )
    .run(id, key, Number(value) || 0)
  touchSession(id)
}

export function setCheatsheet(sessionId, cheatsheet) {
  const id = ensureSessionRow(sessionId)
  const now = new Date().toISOString()
  openDatabase()
    .prepare(
      `UPDATE session_progress SET cheatsheet = ?, updated_at = ? WHERE session_id = ?`,
    )
    .run(String(cheatsheet ?? ''), now, id)
}

function touchSession(sessionId) {
  openDatabase()
    .prepare(`UPDATE session_progress SET updated_at = ? WHERE session_id = ?`)
    .run(new Date().toISOString(), sessionId)
}

export function setHomework(itemId, done) {
  openDatabase()
    .prepare(
      `INSERT INTO homework (item_id, done) VALUES (?, ?)
       ON CONFLICT(item_id) DO UPDATE SET done = excluded.done`,
    )
    .run(String(itemId), done ? 1 : 0)
}

export function setShadowing(day, done) {
  openDatabase()
    .prepare(
      `INSERT INTO shadowing_days (day, done) VALUES (?, ?)
       ON CONFLICT(day) DO UPDATE SET done = excluded.done`,
    )
    .run(String(day), done ? 1 : 0)
}

export function setReadiness(itemId, done) {
  openDatabase()
    .prepare(
      `INSERT INTO readiness (item_id, done) VALUES (?, ?)
       ON CONFLICT(item_id) DO UPDATE SET done = excluded.done`,
    )
    .run(String(itemId), done ? 1 : 0)
}

export function startRun(sessionId) {
  const id = String(sessionId)
  setMeta('last_session_id', id)
  const result = openDatabase()
    .prepare(
      `INSERT INTO session_runs (session_id, started_at) VALUES (?, ?)`,
    )
    .run(id, new Date().toISOString())
  return Number(result.lastInsertRowid)
}

export function finishRun(runId, { durationSec = null, notes = '' } = {}) {
  openDatabase()
    .prepare(
      `UPDATE session_runs
       SET ended_at = ?, duration_sec = ?, notes = ?
       WHERE id = ?`,
    )
    .run(new Date().toISOString(), durationSec, String(notes ?? ''), Number(runId))
}

export function resetAll() {
  const database = openDatabase()
  const wipe = database.transaction(() => {
    database.exec(`
      DELETE FROM session_ratings;
      DELETE FROM session_progress;
      DELETE FROM homework;
      DELETE FROM shadowing_days;
      DELETE FROM readiness;
      DELETE FROM session_runs;
    `)
    setMeta('last_session_id', '')
  })
  wipe()
}

export function importProgress(raw) {
  if (!raw || typeof raw !== 'object') return getProgress()

  const database = openDatabase()
  const apply = database.transaction(() => {
    database.exec(`
      DELETE FROM session_ratings;
      DELETE FROM session_progress;
      DELETE FROM homework;
      DELETE FROM shadowing_days;
      DELETE FROM readiness;
      DELETE FROM session_runs;
    `)

    const sessions = raw.sessions || {}
    for (const [sessionId, data] of Object.entries(sessions)) {
      const id = ensureSessionRow(sessionId)
      const now = new Date().toISOString()
      database
        .prepare(
          `UPDATE session_progress SET done = ?, cheatsheet = ?, updated_at = ? WHERE session_id = ?`,
        )
        .run(data?.done ? 1 : 0, String(data?.cheatsheet ?? ''), now, id)

      const ratings = data?.ratings || {}
      for (const key of RATING_KEYS) {
        if (ratings[key] == null) continue
        database
          .prepare(
            `INSERT INTO session_ratings (session_id, rating_key, value)
             VALUES (?, ?, ?)
             ON CONFLICT(session_id, rating_key) DO UPDATE SET value = excluded.value`,
          )
          .run(id, key, Number(ratings[key]) || 0)
      }
    }

    for (const [itemId, done] of Object.entries(raw.homework || {})) {
      database
        .prepare(
          `INSERT INTO homework (item_id, done) VALUES (?, ?)
           ON CONFLICT(item_id) DO UPDATE SET done = excluded.done`,
        )
        .run(String(itemId), done ? 1 : 0)
    }
    for (const [day, done] of Object.entries(raw.shadowing || {})) {
      database
        .prepare(
          `INSERT INTO shadowing_days (day, done) VALUES (?, ?)
           ON CONFLICT(day) DO UPDATE SET done = excluded.done`,
        )
        .run(String(day), done ? 1 : 0)
    }
    for (const [itemId, done] of Object.entries(raw.readiness || {})) {
      database
        .prepare(
          `INSERT INTO readiness (item_id, done) VALUES (?, ?)
           ON CONFLICT(item_id) DO UPDATE SET done = excluded.done`,
        )
        .run(String(itemId), done ? 1 : 0)
    }

    setMeta('last_session_id', raw.lastSessionId ? String(raw.lastSessionId) : '')
    setMeta('migrated_v1', '1')
  })
  apply()
  return getProgress()
}

export function exportProgress() {
  const progress = getProgress()
  return {
    sessions: progress.sessions,
    homework: progress.homework,
    shadowing: progress.shadowing,
    readiness: progress.readiness,
    lastSessionId: progress.lastSessionId || null,
  }
}

export function markMigrated() {
  setMeta('migrated_v1', '1')
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
