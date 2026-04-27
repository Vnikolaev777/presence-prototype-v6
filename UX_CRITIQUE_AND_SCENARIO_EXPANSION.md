# Presence Assistant — UX Critique & Scenario Expansion

> Benchmark in this doc: **Claude** (claude.ai) as a reference for how a modern AI chat UI behaves. When a convention is called out as "Claude-style," the intent is to adopt a familiar, well-tested pattern, not to copy the brand.

---

## TL;DR

The current `AiWorkspaceView` is a **scripted slide-deck disguised as a chat**. It looks like Claude, but it behaves like a linear demo wizard — no text input, no history, no way out of the canvas, and 5 of 7 "quick action" cards silently do nothing. The four flaws you listed are the tip of the iceberg; the deeper problem is that every element of the UI pretends to be interactive but is actually on rails. The fix isn't another tab or button — it's committing to the chat metaphor end-to-end and letting the scripted parts feel like *agent-proposed* steps inside a real conversation.

---

## 1. Flaws You Called Out — Expanded

### 1.1 Chat has no history or dialogue — it's a one-shot demo
**Where it lives:** `AiWorkspaceView.tsx`, lines 911–913 (`chatMessages` is a local `useState`, wiped on every `startScenario()` / `startMonitoringScenario()`).

**What a user sees today:**
- Open Presence Assistant → greeting + 7 action cards.
- Pick "Migrate" → chat starts.
- Pick "Setup Internet Monitoring" instead → **the migration chat is wiped with no warning**.
- Refresh the page → all chat state is gone; you land back on `idle`.
- There is no sidebar, no "New chat," no "Recent threads," no way to return to a finished scenario to re-read what the agent said.

**Why it breaks the metaphor:** A chat implies continuity. The current UI is a single ephemeral thread that resets when you click another suggestion. Claude, ChatGPT, every modern chat has persistent threads in a left sidebar. Even if the backend is fake, the *UI* has to behave like a thread-based product.

**Specific smells in the code:**
- `setChatMessages([{ role: 'user', content: 'Migrate our existing website' }])` at line 991 — starting a scenario wipes the array.
- No `conversationId`, no list of past conversations, no storage layer.
- `App.tsx` has `hasHiredAgents` / `hasMonitoringSetup` booleans as proxy state, but the conversations that produced those booleans are unrecoverable.

### 1.2 Quick-action cards don't read as chat suggestions
**Where it lives:** `AiWorkspaceView.tsx`, lines 24–32 (`QUICK_ACTIONS`), rendered at 1235–1246.

**What's wrong visually:**
- They sit *below* the greeting in a separate "Quick Actions" section with its own eyebrow label — visually they're a menu, not prompts.
- Each card is a full-width chunky pill with a colored icon square; they compete with the agent bubble above.
- They are imperative verbs ("Create a website") rather than phrased as things the user might say.
- They all show at once, all the time — no progressive disclosure, no context-sensitive narrowing.

**What's wrong behaviorally:**
- **5 of 7 cards are dead buttons.** They render `cursor-pointer`, hover-lift on hover, show a `MoveRight` arrow affordance — all signals that say "I'll do something." They do nothing. That's the single worst UX moment in the prototype, because every user who doesn't pick the right card will feel the UI is broken and lose trust.
- They can't be dismissed. Once you've used the app five times, you still see the same suggestion tower.

**Claude's convention:** Claude shows up to ~4 prompt chips as *examples of things to ask*, phrased in first-person ("Help me write…", "Explain…"). They're subtle, reshuffle, and shrink when you start typing. Crucially, **every chip works** — if a feature isn't built, it isn't shown.

### 1.3 The canvas tabs can't be opened, closed, or toggled
**Where it lives:** `AiWorkspaceView.tsx` lines 1340–1528 — the center column is a conditional tower keyed on `scenarioStep`, `auditTab`, `centerTab`, `connectionStep`, and `siteApproved`.

**What's wrong:**
- The center column is ~50% of the screen and is *always on*. There's no way to collapse it to give the chat more room — so even during purely conversational steps the user stares at a placeholder "sparkle" icon.
- The Website/Audit tabs appear and disappear based on scenario step, not user intent. You can switch between them but you cannot close either.
- When a new canvas (e.g., `SchoolAfterMagic`) mounts, the old audit view is instantly replaced — you can't compare side-by-side, can't pin the audit for reference while looking at the new site.
- There is no full-screen toggle for the canvas either (useful when you actually want to scrutinize the generated site).
- `connectionStep` screens (SIS picker, PowerSchool auth) hijack the canvas with modal-like UI but aren't actual modals — `Esc` doesn't close them, there's no back-arrow.

**What a real agent canvas looks like (Claude artifacts, ChatGPT canvas, Cursor):**
- Canvas is a *toggleable pane*, not a fixed column.
- Every opened artifact has an explicit `×` and an `⤢` (fullscreen).
- The chat references the canvas with a clickable pill ("→ Audit report") that re-opens it if closed.
- Multiple canvases coexist as tabs the user can close one-by-one, not state-machine-controlled.

### 1.4 "Any other UX flaws you can find" — see §2

---

## 2. Additional UX Flaws I Found

Grouped by severity.

### 🔴 Critical — these make it feel like a demo, not a product

| # | Flaw | Where | Fix direction |
|---|------|-------|---------------|
| C1 | **No text input.** There is no composer at the bottom of the chat. The user cannot type *anything* — the only inputs are pre-scripted button clicks. This is the #1 thing that breaks the illusion of AI. | Missing from `AiWorkspaceView.tsx` entirely | Add a composer with `<textarea>`, Send button, `Enter` to send, `Shift+Enter` newline. Even if the handler just echoes "I can only run demo flows right now" for freeform input, the presence of the composer is what makes it a chat. |
| C2 | **5 of 7 quick actions are dead.** Clicking "Create a website," "Make a website audit," "Improve accessibility," "Create a Family Hub," or "Create event pages" does literally nothing — no toast, no disabled state, no "coming soon" — just silent click. | `QUICK_ACTIONS` lines 24–32 | Either (a) implement stub responses so each action at least opens a placeholder chat, or (b) mark them clearly as "Coming soon" with a `disabled` state and reduced opacity, or (c) remove them until they work. |
| C3 | **Pre-filled `typedUrl` is not editable.** `typedUrl` is a state variable but there's no input field bound to it; the user can't actually paste their real URL in. | Lines 915, 1003 | Render an `<input>` in the chat that's pre-filled with the example, let the user edit it, then submit. |
| C4 | **No way to start a new chat.** Once a scenario has started, the only way to reset is to reload the browser or pick the opposite scenario (which destroys the current one). | Missing | Add "+ New chat" button in a sidebar (or in the chat header). Store completed conversations in the sidebar as threads. |
| C5 | **Scenario state leaks cross-tab.** If the user navigates to Automations mid-scenario and returns, the chat is preserved in component state — but the scenario progress bar has re-animated and any in-flight timeouts may have double-fired. There's no persistence; only memoryless presence-while-mounted. | `useEffect` at 949–973 | Persist scenario state to a thread object; hydrate on remount. Guard timers with cleanup. |

### 🟡 Moderate — friction and inconsistency

| # | Flaw | Where | Fix direction |
|---|------|-------|---------------|
| M1 | **Scripted `setTimeout` delays feel fake.** Every agent message appears after a hardcoded 600–2500ms gap. No streaming, no "thinking" indicator, no partial text. | `confirmUrl` lines 998–1020, `advanceToGeneration` 1052–1075, etc. | Swap static delays for a typing indicator (three-dot pulse in an agent bubble) followed by streamed characters. Even a mocked ~30ms/char streamer will 5× the perceived intelligence. |
| M2 | **No "thinking" / reasoning trace.** The agent makes claims ("Visitors struggle to navigate it on mobile") with no visible evidence of how it got there. | Throughout | Add a collapsible "Thinking…" block (like Claude's `<thinking>` in extended thinking mode) that shows the reasoning steps before the conclusion. For the audit step specifically, list the checks it ran. |
| M3 | **No citations / sources in agent replies.** The audit asserts "invisible in Google SEO" without linking the Lighthouse/audit canvas as a source. | Lines 1011–1014 | Add inline source chips: "[Lighthouse audit ↗]" that open the corresponding tab in the canvas. Your brand is data-driven automation — prove it per sentence. |
| M4 | **Action buttons are inside the chat scroll, not pinned.** The "Submit link →", "Proceed with migration →" buttons scroll with the messages — on long chats they disappear up into history. | Lines 1264–1334 | Pin the current CTA to the bottom of the chat panel (above the composer), inside a `sticky` bar. |
| M5 | **No ability to go back one step.** The scenario is a one-way flow. If the user says "Submit link" by mistake, the only escape is to switch scenarios (and lose everything). | State machine 15 | Add a back/undo affordance after irreversible steps, or at minimum allow editing of the last user message (Claude-style). |
| M6 | **Two scenarios can't coexist.** Starting monitoring wipes migration and vice-versa. | Lines 980–996 vs. 1128–1139 | Each scenario should be its own thread in the sidebar. Starting a new one creates a new thread rather than overwriting. |
| M7 | **Right panel is two things at once.** It hosts the Workflow progress *and* the Integrations card. They compete for attention and have no visual separation. | Lines 1532–1644 | Collapse to one scrollable column with a clear section header + subtle divider; or tab them ("Workflow" / "Integrations"). |
| M8 | **Workflow progress steps are not clickable.** They look like a vertical stepper but tapping them does nothing. | `ScenarioProgressBar` lines 465–536 | Either make past steps clickable (jump back to read), or make them obviously non-interactive (remove hover, no cursor pointer). |
| M9 | **Empty / idle state uses the same "sparkle" icon as loading.** A large sparkle icon is shown both in idle mode and after URL submitted but before scan — feels redundant. | Lines 1344–1353 | Use distinct empty states: idle = "Pick a starter above" with a compact card; submitted = skeleton preview of the site being scanned. |
| M10 | **Fake PowerSchool OAuth jumps in/out of the canvas without persistence.** After `handleAuthorize`, the connection screen disappears and agent says "PowerSchool connected!" but there's no artifact left in the UI to reopen and look at the granted scopes. | `ConnectPowerSchoolScreen` 371–441 | Leave a compact "Integrations → PowerSchool (Connected)" card in the chat as a message, and in the right-panel Integrations list, that can be clicked to view what permissions were granted. |
| M11 | **Canned user utterances are too clean.** `"Connections look good. Deploy the new framework."` / `"Amazing — let's set it all up."` read like a pitch-deck script, not how a principal talks. Undercuts authenticity. | User messages throughout | Rephrase as shorter, realistic replies: "Looks good. Go.", "OK — publish it." Better: let the user choose from 2–3 reply chips with different tones. |
| M12 | **No stop / interrupt affordance.** Once the orchestrator starts auto-ticking, there's no way to pause — you just wait. | `useEffect` 949–959 | Add a "Stop" button while the agent is "working" (or during the orchestrator auto-tick). Same pattern as Claude's stop button. |
| M13 | **No file / attachment input.** A real onboarding would let the school upload their logo, PDF of their handbook, brand guide, existing content. | Missing | Add `📎` attach icon to the composer. MVP can accept images/PDFs and show them as chat attachments; parsing can be faked. |
| M14 | **Mobile: canvas disappears entirely.** Both the center canvas and the right panel are `hidden md:*` — on mobile you get chat only, meaning you never see the audit, the site preview, or the progress bar. | Lines 1340, 1532 | Either surface the canvas as a full-screen takeover on mobile (bottom sheet that expands), or render it below the chat with sticky tabs. |

### 🟢 Minor — polish

| # | Flaw | Fix |
|---|------|-----|
| P1 | Status sub-text "Ready to help" / "Migrating website" is static and doesn't stream with progress | Tie to scenario sub-step with more granular phrasing |
| P2 | Agent avatar is a generic `Bot` icon — no brand identity, no initials | Use the Presence logo / mark |
| P3 | User avatar is only shown via header "JD" badge — not next to user messages | Add small avatar bubble next to user messages |
| P4 | "You" and "Presence Assistant" attribution labels are *below* every bubble | Show only on first message in a run, or on hover (Claude shows once per run) |
| P5 | Submit-link button's copy uses `&rarr;` inline, looks like "Submit link →" | Use a proper SVG arrow icon for weight consistency |
| P6 | `hasHiredAgents` + `hasMonitoringSetup` are two separate booleans with no shared shape | Collapse to a single `completedScenarios: Set<ScenarioId>` |
| P7 | Quick actions have `scenario: true`, `monitoringScenario: true` as *two boolean flags* rather than a single discriminant | Refactor to `kind: 'migrate' \| 'monitor' \| 'coming-soon'` |
| P8 | No visible cursor in the mocked chat — the agent appears to type instantly after a spinner | Add blinking caret during the streaming stub |
| P9 | Preview banner says "Example — for illustration purposes only" but it's on an `amber-50` warning color — conflicts with WCAG audit tone | Switch to a neutral `slate-50` info banner |
| P10 | The scenario preview link opens a hardcoded GitHub Pages URL in production, which can break when repos are renamed | Drive from `import.meta.env` with a single `PREVIEW_BASE_URL` constant |
| P11 | The `auditTab` / `centerTab` state is two variables that effectively mirror each other | Consolidate into one canvas-tab controller |
| P12 | `MonitoringSetupCanvas` auto-ticks with `520ms` per item — no affordance to skip the animation | Add a "Skip animation" link for repeat demos |

---

## 3. Expanded Scenarios (Revised Specs)

Below each scenario is specified as: (a) **dialog script** in chat-transcript form with proposed agent voice, (b) **state scheme** (ASCII flow), (c) **canvas/side-panel behavior**, and (d) **what's different from today**.

### 3.1 Migration Scenario — Revised

#### Dialog script (chat transcript)

```
[AGENT avatar]
Hi — I'm Presence. I can set up, migrate, or monitor a school site.
What should we do?

  [↘ suggestion chips, max 3 at a time, shuffle every load]
   [Migrate my current site]   [Audit my site]   [Start from scratch]

[USER types or taps "Migrate my current site"]

[AGENT — streaming, with typing dots first]
Sure. Paste the URL of the site you want to migrate.

  [ inline input:  https://oakwoodhigh.org  ]  [Analyze ↵]
  (editable, placeholder "e.g. https://your-school.org")

[USER clicks Analyze]

[AGENT — typing dots → streams]
Scanning oakwoodhigh.org now. Pulling structure, content, and performance.

  [ inline progress chip: ◐ 23 pages found · 1.2MB HTML · Lighthouse in progress ]

[AGENT — after ~4s, streams]
I pulled a baseline. The site scores 4/10 — the biggest issues are
mobile usability, low contrast, and poor discoverability.

  [→ Open audit report]  ← clickable pill, opens canvas tab

  Want me to fix these while migrating to Presence?
   [Yes, migrate & improve]   [Show me the issues first]   [Not now]

[USER: "Yes, migrate & improve"]

[AGENT]
Great. To keep your new site in sync automatically, I'll connect your
data sources. You can skip this and do it later if you'd rather.

  [→ Connect a data source]  ← opens connector picker as a canvas tab

   Which would you like to start with?
   [PowerSchool]   [FACTS SIS]   [Google Drive]   [Skip for now]

[USER: "PowerSchool"]
  → Canvas opens PowerSchool auth tab (closable, Esc-able)
  → On success, the tab becomes a permanent "PowerSchool · Connected" card in chat

[AGENT]
Connected. I'm generating your new site now.

  [→ View build]  ← opens canvas tab with live-streaming preview

  (background: ticks through build stages with streaming log lines)

[AGENT — after build]
Your new site is ready. Take a look.

  [→ Open preview]  [→ New audit: 9.6/10]  ← both open as canvas tabs

  Happy to publish to a temporary Presence URL, or wait for your review?
   [Publish to temp URL]   [Let me review first]

[USER: "Publish to temp URL"]

[AGENT]
Published to oakwoodhigh.presence.app. Now, three things I set up
that will keep your site current:

  [card: Auto-sync from PowerSchool]
  [card: News & newsletter drafts for your approval]
  [card: Accessibility monitoring (WCAG)]

  [→ Go to Automations]   [Connect a custom domain later]
```

#### State scheme

```
┌─ NEW CHAT ──────────────────────────────────────────────┐
│                                                         │
│  greeting                                               │
│  [chip] [chip] [chip]         ← rotating suggestions    │
│                                                         │
│  ▾ text composer                                        │
└─────────────────────────────────────────────────────────┘
        │  user picks "Migrate"
        ▼
┌─ MIGRATE thread ────────────────────────────────────────┐
│  agent: ask for URL                                     │
│    └─ inline input (editable, pre-filled example)       │
│  user: submits URL                                      │
│    └─ agent streams scan progress                       │
│  agent: audit result + [→ Open audit] pill              │
│    └─ canvas tab 1: Audit                 [closable]    │
│  user: "migrate & improve" / "review first" / "not now" │
│         ↓                          ↓                ↓   │
│    continue                   show findings        exit │
│                                                         │
│  agent: ask for connector (chips)                       │
│    └─ canvas tab 2: Connector picker     [closable]    │
│         └─ PowerSchool auth              [Esc closes]  │
│  user: authorizes                                       │
│    └─ chat message "Connected: PowerSchool" (pinned)    │
│                                                         │
│  agent: build + stream                                  │
│    └─ canvas tab 3: Build log             [closable]    │
│  agent: preview + new audit                             │
│    └─ canvas tab 4: Preview              [closable]    │
│    └─ canvas tab 5: New audit             [closable]    │
│  user: publish                                          │
│    └─ agent lists 3 automations as cards                │
│    └─ [Go to Automations] CTA pinned above composer     │
└─────────────────────────────────────────────────────────┘
```

#### Canvas & side-panel behavior (what changes)

- **Canvas is a pane, not a column.** Default width ~55%; user can collapse it to a rail with a `<<` button or maximize to full screen.
- **Each opened artifact is a closable tab.** Closing removes the tab; the chat message that produced it keeps its `→ Open` pill so the user can re-open.
- **Tabs persist for the whole thread.** When the user comes back to the thread days later, all tabs are still there.
- **Right side panel (Workflow)** is collapsible too. On narrow screens it's an inline chat card ("Step 3 of 6: Connect") instead of a fixed column.

#### What's different from today

| Today | Revised |
|---|---|
| 7 full-width action cards below greeting | 3 rotating prompt chips, small, inline |
| URL pre-filled, not editable | Editable input, validated |
| Agent messages instant after fixed delay | Typing indicator → streamed text |
| Audit replaces old site in canvas | Audit opens as a new tab next to site |
| SIS picker hijacks canvas | SIS picker opens as a closable canvas tab |
| Approve = single click, no confirmation | Explicit "Publish to temp URL" with clear scope |
| "Agents hired" is agent's claim | Three distinct cards land in chat as deliverables |

---

### 3.2 Monitoring Scenario — Revised

#### Dialog script

```
[AGENT]
I can set up daily monitoring across topics that matter to your school —
sports, district announcements, legal news, and so on. Shall I start?

  [Pick topics]   [Import from my district]   [Monitor a URL]

[USER: "Pick topics"]

[AGENT]
Here are 6 topics most Oakwood-size schools track. Toggle off any
you don't need, or add your own.

  [→ Open topic picker]  ← opens canvas tab

  ▾ canvas:
    ☑ Sports     ☑ Science competitions   ☑ Open Days
    ☑ District   ☑ Legal / Policy         ☑ WCAG / Compliance
    ☐ [+ Add topic]
    [Apply 6 topics]

[USER applies]

[AGENT — streams]
Connecting feeds… 6 topics active. Want me to watch any specific URLs too?
(district page, local news, competitor schools, etc.)

  [ inline input ]  [+ Add URL]  [Not now]

[USER adds a URL or skips]

[AGENT]
Monitoring is live. I'll scan every 24h and draft content when
something relevant shows up. First results are already in — I found 4.

  [→ Today's discoveries (4)]  ← opens canvas tab
  [→ Go to Automations]
```

#### State scheme

```
idle
 └─ "Monitor" chip
     └─ topic picker (canvas tab, closable)
         ├─ [Apply] → setup animation in canvas
         │                └─ live feed in right panel + chat summary
         ├─ [+ Add topic] → inline form
         └─ [Cancel] → thread ends, no side-effects

 ┌─ optional branch ────────────────┐
 │ add custom URL                   │
 │   └─ fetch preview in canvas tab │
 └──────────────────────────────────┘
```

#### What's different from today

| Today | Revised |
|---|---|
| 6 topics pre-selected, can only toggle off | Can toggle, plus add custom topic |
| URL question is a single "Yes/No" with a canned site | Free-form URL input, supports multiple URLs |
| Setup animation blocks for fixed ~3–5s | Runs in background; user can continue chatting |
| Discovery appears only when user goes to Automations | First discoveries surface as a chat message too |

---

### 3.3 Cross-scenario: the shell (sidebar + header + composer)

This is the biggest missing piece. Proposed layout:

```
┌──────────────────┬─────────────────────────────────┬──────────────────┐
│ SIDEBAR          │ CHAT                            │ CANVAS (pane)    │
│                  │ ┌─ header ─────────────────┐    │ ┌─ tabs ──────┐ │
│ [+ New chat]     │ │ Presence · Migrating    ⋯│    │ │Audit Preview│ │
│                  │ └──────────────────────────┘    │ │Build log  ▫ │ │
│ Today            │                                 │ └─────────────┘ │
│  ▸ Migrate oak…  │   [agent bubbles...]           │                  │
│  ▸ Monitor top…  │   [user bubbles...]            │  (artifact       │
│                  │                                 │   content        │
│ Yesterday        │   [→ Open audit] pill          │   here)          │
│  ▸ Audit mytest  │   [→ Open preview] pill        │                  │
│                  │                                 │                  │
│ ▽ Archived       │  ─ pinned CTA row ─             │                  │
│                  │  [ Migrate & improve → ]        │                  │
│ ─ integrations ─ │                                 │                  │
│ PowerSchool ●    │  ┌─ composer ─────────────┐    │                  │
│ + Add            │  │ 📎 [ type here… ]   ▶  │    │                  │
│                  │  └─────────────────────────┘    │                  │
└──────────────────┴─────────────────────────────────┴──────────────────┘
                                                     ^^^
                                              close / fullscreen buttons
                                              on each tab
```

- **Sidebar:** New chat, thread list (today / yesterday / archived), integration status pills, user avatar at bottom.
- **Chat header:** thread title (editable), scenario status, `⋯` menu with Archive / Rename / Export transcript.
- **Pinned CTA row:** when the agent offers a decision (`Proceed with migration?`), the action chips dock above the composer so they never scroll off-screen.
- **Composer:** always present, even when the agent is "thinking." Attach, voice input, send. `Stop` button replaces `Send` while agent streams.
- **Canvas pane:** collapsible rail when empty; tabs can be dragged, closed, fullscreened; re-open via the inline pill in the chat.

---

## 4. Priority Recommendations (if you only ship 5 things)

1. **Ship a text composer + typing indicator + streamed agent replies.** Single biggest upgrade in perceived quality. Even if freeform input just returns a friendly "demo-only" reply, the bar at the bottom of the chat is what makes this feel like chat. *(Addresses C1, M1.)*
2. **Build a thread sidebar.** Persist `chatMessages` per scenario, give every "Go to Automations" a saved thread you can return to, add a `+ New chat` button. Removes the single worst behavior (wiping a chat when you click the other scenario). *(Addresses Flaw 1.1, C4, M6.)*
3. **Fix the 5 dead quick actions.** Either implement stubs or mark them `Coming soon` with a disabled state. Silent no-ops are the worst possible failure mode — they trigger the "this product is broken" reflex. *(Addresses C2.)*
4. **Reshape quick actions into 3 rotating prompt chips** (not 7 cards), phrased in first-person, and make them dismiss/collapse once the user starts typing. Also replace the pre-filled URL with an actual editable input. *(Addresses Flaw 1.2, C3.)*
5. **Make the canvas a pane with closable tabs.** Each audit / preview / connector screen opens as a named, closable tab. The chat shows a `→ Open audit` pill that re-opens the tab if closed. Support collapsing the pane entirely to give the chat full width. *(Addresses Flaw 1.3, M10.)*

Everything in the 🟢 Minor column can wait, but 1–5 should ship together or the fixes will feel half-done.

---

## 5. What Works Well Today

So the critique doesn't leave you with only red ink:

- The **Workflow progress stepper** (right column) is a genuinely good pattern — it gives spatial context that most chat UIs lack. Keep it, just make it collapsible and clickable.
- The **before → after site preview** swap is a strong "wow" moment that lands well in a demo. The idea of letting the user *watch* the canvas transform is worth doubling down on.
- The **scripted script** itself is well-written — the agent's turn phrasing is mostly on-tone. The issue is delivery (no streaming, no input) not the words themselves.
- The **V2 audit canvas** (Lighthouse-style scoring) is strong; it deserves to be re-openable as a persistent artifact.
- The **connector screens** (ConnectionType → SISSelect → PowerSchoolAuth) are visually tight — they just need to live inside a real tab rather than hijacking the canvas.
- The separation of `hasHiredAgents` / `hasMonitoringSetup` as scenario-completion flags is the right architectural instinct; it just needs a thread-based UI to surface it.

---

## 6. Appendix: Claude-as-benchmark cheat sheet

Specific conventions worth cribbing straight from claude.ai:

- **Typing indicator:** three pulsing dots in an agent bubble for ~300–800ms before text starts.
- **Streaming:** characters arrive at ~30–50ms with a blinking caret; the bubble grows in place.
- **Stop button:** replaces Send while streaming; interrupts gracefully.
- **Prompt chips:** 3–4 suggestions, first-person, disappear on focus, refresh on reload.
- **Artifact panel:** side pane that slides in when the agent creates something; has `×` and `⤢`; the chat message keeps a re-open pill.
- **Thinking trace:** collapsible block above the answer ("Thought for 4s …") — a transparency win that also covers latency.
- **Edit last message:** hover over user bubble → pencil icon → re-submit.
- **Thread sidebar:** date-grouped, renameable, archiveable, searchable.
- **Attachments:** paperclip in composer; drag-drop anywhere.
- **Empty states:** ambient, not instructional — a subtle prompt, not a help screen.

---

*Doc generated 2026-04-24 · based on a read of `AiWorkspaceView.tsx` (1651 lines), `App.tsx`, `MIGRATE_SCENARIO_DOCS.md`, and `tasks.json` (104 tasks).*
