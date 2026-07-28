-- SQLite schema (otomatis kebikin pas bot pertama jalan)
-- Gausah dijalanin manual, udah otomatis di initDB()

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  balance INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  daily_streak INTEGER DEFAULT 0,
  last_work TEXT DEFAULT NULL,
  last_daily TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, guild_id)
);

CREATE TABLE IF NOT EXISTS guilds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id TEXT UNIQUE NOT NULL,
  warns TEXT DEFAULT '{}',
  quest_channel TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quest_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  quest_id TEXT NOT NULL,
  round_id TEXT NOT NULL,
  claimed_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, guild_id, quest_id, round_id)
);
