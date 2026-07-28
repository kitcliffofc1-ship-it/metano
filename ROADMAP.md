# Metano — Roadmap

Identitas: Bot Discord multifungsi dengan tema calm but strict — *"tenang tapi asin"* (santai tapi pedas kalau dilanggar).

---

## Phase 1: Core Setup
- [x] Inisialisasi project (package.json, .env)
- [x] Struktur folder & command handler
- [x] Slash command registration
- [x] Event handler (ready, interactionCreate)
- [x] Koneksi Supabase

## Phase 2: Economy System
- [ ] `/balance` — Cek saldo sendiri / user lain
- [ ] `/work` — Kerja dapet uang random
- [ ] `/daily` — Daily reward
- [ ] `/shop` — Lihat item yang tersedia
- [ ] `/buy` — Beli item dari shop
- [ ] `/transfer` — Transfer uang ke user lain
- [ ] `/leaderboard economy` — Top kaya

## Phase 3: Moderation System
- [ ] `/kick` — Kick member
- [ ] `/ban` — Ban member
- [ ] `/unban` — Unban member
- [ ] `/warn` — Warn member
- [ ] `/warnings` — Lihat warn user
- [ ] `/timeout` — Mute sementara
- [ ] `/purge` — Hapus pesan massal
- [ ] Moderation log (channel khusus)

## Phase 4: Leveling / Rank System
- [ ] XP gain per message (cooldown)
- [ ] `/rank` — Cek level sendiri / user lain
- [ ] `/leaderboard level` — Top level
- [ ] Level role reward (otomatis)

## Phase 5: Utility
- [ ] `/ping` — Cek bot latency
- [ ] `/userinfo` — Info user
- [ ] `/serverinfo` — Info server
- [ ] `/help` — Daftar semua command

## Phase 6: Hosting & Polish
- [ ] Deploy ke Wisp
- [ ] Setup Supabase production
- [ ] Error handling & logging
- [ ] Testing & bug fix

---

**Tech Stack:**
- **Runtime:** Node.js (discord.js v14)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Wisp (free tier, 24/7)
- **Commands:** Slash command only
