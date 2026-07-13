# ROADMAP — Petualangan Gigi Sehat (Dental Health Adventure)

**Project:** sigit4715/petualangan-gigi-sehat · GitHub Pages · Indonesian kids 6–12
**Current version:** v4 (single-file HTML ~107KB + `v4_script.js` ~18KB + `v4_css.css` ~9KB)
**Document purpose:** 3-version forward plan (v5 → v6 → v7) defining what makes the site a
*complete*, *viral*, *shareable*, *engaging*, and *accessible* dental-health education experience.

---

## 0. Current State (v4) — Feature Inventory

| Area | What exists in v4 |
|------|-------------------|
| Story | 10 scenes scrollytelling, animated progress map |
| Combat / play | Boss battle (5 heroes, 1000 HP), canvas brush game, floss timing game, food-sorting game |
| Assessment | Quiz (5 questions) |
| Progression | XP / level system, badge collection (10) |
| Education | Anatomy modal, cavity timeline |
| Habit loop | Daily streak, certificate |
| Polish | Background music, sound effects, particle effects |
| Locale | Indonesian only |
| Tech | Client-side only, `localStorage`, no backend, no analytics, no PWA/offline |

**Constraint inherited from v4:** everything is local. No accounts, no server, no data export,
online-only (GitHub Pages static). This shapes what is cheap (client features) vs. expensive
(anything needing a backend, real leaderboards, class data).

---

## 1. Strategic Analysis — Five Questions Answered

### (1) What's missing for a COMPLETE educational dental-health experience?
- **Hygiene routine depth:** v4 shows *how* to brush (brush game) but no **full 2-minute timer with quadrant guidance**, flossing *technique* tutorial, tongue cleaning, rinsing. A complete routine = brush + floss + tongue + diet + dentist visit.
- **Preventive depth:** fluoride, sealants, why sugar at night is worst, "sugar bugs" microbiology — currently only a food-sorting game.
- **Reinforcement over time:** no **review/recall loops** (spaced repetition) so knowledge actually sticks.
- **Parent/teacher visibility:** no way for adults to *see* what the child learned or their habit streak.
- **Offline resilience:** breaks the habit loop the moment the connection drops.
- **Assessment breadth:** 5 questions is a token quiz; no per-topic mastery tracking.

### (2) What features would make this site GONE VIRAL among Indonesian kids?
- **Kid-vs-kid competition:** local + shareable leaderboards, classroom "Gigi Sehat Cup".
- **Collectible & cosmetic hype:** hero skins, tooth-pet/companion that evolves, sticker packs (Indonesian-flavored: badak, komodo, naga gigi).
- **Daily challenge + streak flames:** TikTok-style "don't break the chain" with shareable streak cards.
- **UGC / self-expression:** design-your-own hero, name your tooth-pet, decorate a virtual bathroom.
- **Meme-able moments:** funny boss-defeat animations, "Gigi Sehat" dance, shareable victory screens.
- **AR tooth scan:** point camera at your smile → see plaque/health score (novelty = screenshots shared to WhatsApp/IG).

### (3) What would make teachers/parents want to share it?
- **Class mode + teacher dashboard:** assign scenes, see class completion, export progress (XLS/PDF).
- **Printable materials:** coloring pages, brushing charts, lesson plans aligned to Indonesian curriculum (kurikulum merdeka).
- **Evidence of learning:** certificate already exists; add **skill report card** per topic.
- **Safe & ad-free:** explicitly COPPA/Kids-Online-Safety compliant, no external tracking — a selling point for schools.
- **Bahasa Indonesia + local context:** already a strength; lean into regional dental-health stats.

### (4) What monetization / engagement features could be added?
- **Ethical, kid-safe monetization only** (no ads to children):
  - *Optional* cosmetic packs (hero skins, sticker packs) — one-time IAP, no pay-to-win.
  - School/District **premium tier**: teacher dashboard, unlimited classes, printable library, analytics.
  - Donation / sponsor model (e.g., dental associations, CSR "Gigi Sehat Indonesia").
  - Grant-funded / NGO partnership route (WHO/IDI aligned public-health messaging).
- **Engagement loops:** daily challenge, streak rewards, weekly class tournament, seasonal events.

### (5) What accessibility features are needed?
- **Motor:** larger tap targets, single-switch / keyboard navigation, reduced-motion mode.
- **Visual:** high-contrast theme, scalable text (A+-A-), colorblind-safe badges/palette.
- **Auditory:** full **text-to-speech / narration** (already has SFX; add spoken story + read-aloud quiz), captions for all audio, mute-by-default option.
- **Cognitive:** simpler "easy mode" (fewer choices, slower timers), clear icons + text labels, consistent layout.
- **Language:** Bahasa Indonesia (done) + English toggle + local dialects later; RTL not needed.
- **Low-bandwidth:** offline mode, compressed assets, no heavy CDN dependency.

---

## 2. Version Themes & Milestones

| Version | Theme | Headline goal | Ships |
|---------|-------|---------------|-------|
| **v5 — "Lengkap & Cerita"** | Completeness + Story | Finish the *educational* loop & make it shareable for free | Full routine, animated story mode, accessibility pass, PWA/offline, parent/teacher share cards, printable pack |
| **v6 — "Viral & Kompetitif"** | Virality + Social | Turn play into shareable competition | Leaderboards, daily challenges, class mode, teacher dashboard, cosmetic collectibles, AR tooth scan (experimental) |
| **v7 — "Pintar & Berkelanjutan"** | Intelligence + Sustainability | AI feedback, monetization, global scale | AI brushing feedback, multi-language, adaptive learning, premium tier, analytics, school partnerships |

---

## 3. DETAILED FEATURE PLAN

Legend: **Priority** P0 (must, blocks launch) · P1 (high value, ship this version) · P2 (nice, if time) · P3 (future/experimental).
**Complexity** S (<1wk) · M (1–3wk) · L (1–2mo) · XL (2mo+ / needs backend).
**Impact** low / medium / high (on learning + engagement + sharing).

---

### ▶ v5 — "Lengkap & Cerita" (Completeness + Story)

**Milestone M5.1 — Complete Hygiene Routine (educational completeness)**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| Full 2-minute brush timer w/ 4-quadrant guidance | P0 | M | high | Extends existing brush game into real habit tool |
| Flossing *technique* tutorial (step mini-game) | P0 | M | high | Currently only floss-timing; add how-to |
| Tongue-cleaning + rinse steps in routine | P1 | S | medium | Completes the routine loop |
| "Sugar bugs" microbiology mini-scene | P1 | M | medium | Explains *why* (cavity timeline exists; add cause) |
| Fluoride & sealant explainer scene | P2 | S | medium | Preventive depth |
| Spaced-repetition review loop (recall cards) | P1 | M | high | Makes knowledge stick — key education gap |

**Milestone M5.2 — Animated Story Mode (engagement + shareability)**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| Branching animated story (choose-your-hero path) | P1 | L | high | Reuses scenes; adds replay value |
| Voice-narrated story (TTS, ID + EN) | P1 | M | high | Doubles as accessibility (see M5.4) |
| Story completion → unlocked "Director's Cut" badge | P2 | S | low | Reward |

**Milestone M5.3 — Shareability for Parents/Teachers (free viral vector)**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| Parent/teacher share card (child's badges + streak) | P0 | S | high | WhatsApp/IG-ready image from canvas |
| Printable pack v1 (brushing chart, 3 coloring pages) | P0 | S | medium | Schools love printable |
| Curriculum-aligned lesson note (Kurikulum Merdeka) | P1 | M | medium | Teacher adoption driver |

**Milestone M5.4 — Accessibility Pass (inclusivity + compliance)**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| Full narration / read-aloud (all scenes + quiz) | P0 | M | high | Major for non-readers & low-vision |
| High-contrast theme + scalable text (A-/A+) | P1 | S | medium | |
| Reduced-motion mode | P1 | S | medium | Photosensitive / focus |
| Colorblind-safe palette + icon labels | P2 | S | medium | |
| Keyboard / single-switch nav | P2 | M | medium | |

**Milestone M5.5 — Technical Foundation (enables v6/v7)**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| PWA + service worker (installable) | P0 | M | high | "Add to home screen" = habit |
| Offline mode (cache assets + progress) | P0 | M | high | Keeps streak alive w/o wifi |
| Lightweight analytics (privacy-first, local-first) | P1 | M | medium | Foundation for v7 dashboards |
| Refactor to modular JS (prep for backend) | P1 | L | medium | v4 is single-file; needed before v6 |

---

### ▶ v6 — "Viral & Kompetitif" (Virality + Social)

**Milestone M6.1 — Gamification Engine (competition hooks)**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| Daily challenge (1 mini-task/day) | P0 | M | high | Core viral loop |
| Streak flames + milestone rewards (7/30/100 days) | P0 | S | high | TikTok-style retention |
| Local leaderboard (device + shareable code) | P0 | M | high | No backend needed for v1 |
| Global leaderboard (backend/Serverless) | P1 | XL | high | Needs Firebase/Supabase — biggest cost |
| Weekly class tournament | P1 | L | high | Teacher-driven sharing |

**Milestone M6.2 — Class Mode + Teacher Dashboard (B2B sharing)**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| Class code (join a class, no PII) | P0 | M | high | COPPA-safe: nickname only |
| Teacher dashboard (completion, streaks, weak topics) | P1 | L | high | Export XLS/PDF |
| Assign scenes / set weekly goal | P2 | M | medium | |
| Printable pack v2 (per-class progress report) | P1 | S | medium | |

**Milestone M6.3 — Collectibles & Self-Expression (UGC hype)**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| Tooth-pet companion that evolves w/ streak | P0 | M | high | Emotional attachment |
| Hero skins / sticker packs (ID-themed) | P1 | M | high | Shareable, cosmetic |
| Design-your-own hero (colors/name) | P2 | M | medium | UGC → screenshots |
| Virtual bathroom decorator | P3 | L | medium | |

**Milestone M6.4 — AR Tooth Scan (novelty viral feature)**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| Camera AR overlay: "scan smile" → fun health score | P2 | XL | high | WebRTC + face/object detect; flagged experimental |
| Shareable AR result card | P2 | S | medium | WhatsApp-ready |
| Fallback "draw your smile" if no camera | P2 | S | low | Inclusivity |

---

### ▶ v7 — "Pintar & Berkelanjutan" (Intelligence + Sustainability)

**Milestone M7.1 — AI-Powered Feedback (personalization)**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| AI brushing feedback (analyze drawn/recorded stroke) | P1 | XL | high | On-device ML or light API; privacy-first |
| Adaptive difficulty (weak-topic detection) | P1 | L | high | From v5 analytics |
| AI story narrator w/ expressive voice (ID dialects) | P2 | M | medium | |
| Personalized tip-of-the-day | P1 | S | medium | |

**Milestone M7.2 — Content Expansion & Localization**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| Multi-language (EN, then regional ID dialects) | P0 | L | high | Export potential |
| Seasonal themes (Ramadan, back-to-school, caries-awareness month) | P1 | M | medium | Replay hooks |
| Expanded scene library (20+ scenes) | P1 | L | high | Depth |
| Printable library v3 (full lesson plans) | P1 | M | medium | |

**Milestone M7.3 — Monetization (ethical, kid-safe)**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| Cosmetic IAP packs (one-time, no pay-to-win) | P1 | L | medium | Must stay ad-free to kids |
| School/District premium tier (dashboards + analytics) | P1 | XL | high | Sustainable funding |
| Sponsor/CSR integration (dental assoc., "Gigi Sehat Indonesia") | P2 | M | medium | Grant/NGO route |
| Donation model | P3 | S | low | |

**Milestone M7.4 — Analytics & Scale**
| Feature | Priority | Complexity | Impact | Notes |
|---------|----------|-----------|--------|-------|
| Privacy-first learning analytics dashboard (anon, aggregate) | P1 | L | medium | Public-health insight |
| A/B test framework for scenes | P2 | M | low | |
| Performance budget + Lighthouse CI | P1 | M | medium | Keep it fast on low-end Android |
| Multi-region CDN / asset optimization | P2 | M | medium | Indonesia 3G resilience |

---

## 4. Cross-Cutting Recommendations

- **Never break the streak loop** — offline mode (v5) + retry grace are the single highest-ROI retention features.
- **Ad-free forever for children** — monetize via cosmetics + school tier + sponsorship, not ads. This is both ethical and a *shareability* selling point for schools.
- **Backend is the v6/v7 cliff** — local leaderboards (v6 M6.1) ship without a server; global leaderboard + teacher dashboard (v6 M6.2) require Serverless (Supabase/Firebase) and a privacy/consent layer. Budget accordingly.
- **Modularize now (v5 M5.5)** — v4's single-file architecture will bottleneck every v6/v7 feature. Refactor before adding social.
- **Accessibility is a v5 deliverable, not an afterthought** — narration + offline also power low-bandwidth and low-literacy reach (core Indonesian market reality).
- **Localization is a v7 unlock** — but design all copy behind a string table in v5 so v7 is translation, not rewrite.

---

## 5. Suggested Sequencing (dependencies)

```
v5: [M5.5 refactor] → [M5.1 routine] → [M5.4 a11y + narration] → [M5.2 story] → [M5.3 share + print] → [PWA/offline]
                         │
v6:  depends on v5 refactor + offline
      [M6.1 gamification (local first)] → [M6.3 collectibles] → [M6.2 class + teacher (needs backend)] → [M6.4 AR (experimental)]
                         │
v7:  depends on v6 analytics + backend
      [M7.2 localization + content] → [M7.1 AI feedback] → [M7.3 monetization] → [M7.4 analytics/scale]
```

**Risk flags:** Global leaderboard, teacher dashboard, and AI feedback are the three XL/backend items —
sequence them last within their version and prototype the privacy/consent model early.

---

*Prepared as a forward-planning document. All priorities/complexity are estimates to be validated against
the v4 codebase (`index.html`, `v4_script.js`, `v4_css.css`) and real device testing on low-end Android.*
