const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')
const logger = require('./logger')

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'metano.db')

let db = null

async function initDB() {
  const SQL = await initSqlJs()

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(buffer)
    logger.info('Loaded existing database')
  } else {
    db = new SQL.Database()
    logger.info('Created new database')
  }

  db.run(`CREATE TABLE IF NOT EXISTS users (
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
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS guilds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT UNIQUE NOT NULL,
    warns TEXT DEFAULT '{}',
    quest_channel TEXT DEFAULT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`)

  db.run(`CREATE TABLE IF NOT EXISTS quest_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    quest_id TEXT NOT NULL,
    round_id TEXT NOT NULL,
    claimed_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, guild_id, quest_id, round_id)
  )`)

  saveDB()
  logger.info('Database tables ready')
}

function saveDB() {
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(DB_PATH, buffer)
}

const dbUtil = {
  initDB,

  getUser(userId, guildId) {
    const stmt = db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?')
    stmt.bind([userId, guildId])
    let data = null
    if (stmt.step()) data = stmt.getAsObject()
    stmt.free()

    if (!data) {
      db.run('INSERT INTO users (user_id, guild_id) VALUES (?, ?)', [userId, guildId])
      saveDB()
      return this.getUser(userId, guildId)
    }
    return data
  },

  updateUser(userId, guildId, updates) {
    const keys = Object.keys(updates)
    const values = Object.values(updates)
    const setStr = keys.map(k => `${k} = ?`).join(', ')
    const sql = `UPDATE users SET ${setStr} WHERE user_id = ? AND guild_id = ?`
    db.run(sql, [...values, userId, guildId])
    saveDB()

    const stmt = db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?')
    stmt.bind([userId, guildId])
    stmt.step()
    const data = stmt.getAsObject()
    stmt.free()
    return data
  },

  getGuild(guildId) {
    const stmt = db.prepare('SELECT * FROM guilds WHERE guild_id = ?')
    stmt.bind([guildId])
    let data = null
    if (stmt.step()) {
      data = stmt.getAsObject()
      if (data.warns && typeof data.warns === 'string') {
        data.warns = JSON.parse(data.warns)
      }
    }
    stmt.free()

    if (!data) {
      db.run('INSERT INTO guilds (guild_id) VALUES (?)', [guildId])
      saveDB()
      return this.getGuild(guildId)
    }
    return data
  },

  updateGuild(guildId, updates) {
    const data = updates
    if (data.warns && typeof data.warns === 'object') {
      data.warns = JSON.stringify(data.warns)
    }
    const keys = Object.keys(data)
    const values = Object.values(data)
    const setStr = keys.map(k => `${k} = ?`).join(', ')
    const sql = `UPDATE guilds SET ${setStr} WHERE guild_id = ?`
    db.run(sql, [...values, guildId])
    saveDB()

    return this.getGuild(guildId)
  },

  getTopBalance(guildId, limit = 10) {
    const stmt = db.prepare(
      'SELECT * FROM users WHERE guild_id = ? ORDER BY balance DESC LIMIT ?'
    )
    stmt.bind([guildId, limit])
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    return rows
  },

  getTopLevel(guildId, limit = 10) {
    const stmt = db.prepare(
      'SELECT * FROM users WHERE guild_id = ? ORDER BY level DESC, xp DESC LIMIT ?'
    )
    stmt.bind([guildId, limit])
    const rows = []
    while (stmt.step()) rows.push(stmt.getAsObject())
    stmt.free()
    return rows
  },

  addQuestLog(userId, guildId, questId, roundId) {
    db.run(
      'INSERT INTO quest_logs (user_id, guild_id, quest_id, round_id) VALUES (?, ?, ?, ?)',
      [userId, guildId, questId, roundId]
    )
    saveDB()
  },

  hasQuestLog(userId, guildId, questId, roundId) {
    const stmt = db.prepare(
      'SELECT id FROM quest_logs WHERE user_id = ? AND guild_id = ? AND quest_id = ? AND round_id = ?'
    )
    stmt.bind([userId, guildId, questId, roundId])
    const exists = stmt.step()
    stmt.free()
    return exists
  }
}

module.exports = dbUtil
