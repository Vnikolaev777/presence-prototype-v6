# Briefing for agents working on this prototype

Paste this at the top of a new agent's first message so it knows what's already in place.

---

## What this project is

React + Vite + TypeScript prototype at `/Users/vitalinikolaev/Presence Prototype`. **Fully internationalized**: English (en) and German (de), region-aware (US and DACH). Default locale is `en/US`. The user picks region and language independently from two dropdowns in the top header.

## Don't touch

- **The school site** lives in `src/pages/SchoolAfter*.tsx`, `src/pages/SchoolBefore.tsx`, `src/pages/Academics/Athletics/TeamPage.tsx`, `src/components/SchoolWebsitePreview.tsx`, and `src/data/schoolData.ts`. A different agent owns those — leave them alone unless the user explicitly asks. The `CLAUDE.md` at the project root spells out the boundaries.

## i18n architecture (already built — don't redesign it)

| File | Purpose |
|---|---|
| `src/i18n/locales/en.json` | 877 English strings, flat keys |
| `src/i18n/locales/de.json` | 877 German strings, parity locked |
| `src/i18n/locales/{en,de}-{US,DACH}.json` | Empty stubs for region-specific overrides |
| `src/i18n/regions.ts` | US/DACH configs (connectors, consents, currency, intlLocale) |
| `src/lib/i18n.tsx` | `LocaleProvider`, `useLocale`, `useT`, `useRegion` |
| `src/components/LocaleSwitchers.tsx` | The two dropdowns in the App header |
| `src/i18n/README.md` | Translator-friendly doc — non-engineers can edit JSON directly |

Resolution chain: `${lang}-${region}` → `${lang}` → `en` → key.

## Strict rules — read before changing anything

1. **NEVER** add hardcoded user-facing English text to any `.tsx` file. Every visible string goes through `t()`.
2. **Every new key in `en.json` MUST also exist in `de.json`** with a German translation. Parity is enforced and must hold after every change.
3. When changing existing visible text, edit the **JSON value**, not the component.
4. **Brand names stay literal** in components (not in JSON): `PowerSchool`, `IServ`, `Sdui`, `WebUntis`, `Canvas LMS`, `Calcularis`, `WordPress`, `Mr. Davis`, `Frau Schmidt`, etc.
5. **Intentional showcase content stays literal** — the strings inside `CommConsentParentPreviewCanvas` in `CommunicationHubViews.tsx` (`Einverständniserklärung`, `Wald-Exkursion`, `Ich stimme zu`, `M. Müller`, etc.) are intentionally German because they depict an AI's German output to a German parent. Don't translate them.

## How to use translations

```tsx
import { useT, useRegion } from '../lib/i18n';

function MyComponent() {
  const t = useT();
  const region = useRegion();   // optional — only if you need region config
  return (
    <div>
      <h1>{t('myView.title')}</h1>
      <p>{t('myView.greeting', { name: 'Vitali' })}</p>          {/* {name} interpolation */}
      <p>{t(count === 1 ? 'myView.count.one' : 'myView.count.other', { count })}</p>
    </div>
  );
}
```

## Key naming convention

`view.section.element`. Examples that already exist: `dashboard.review.consent.title`, `commHub.canvas.emergency.review.broadcast`, `workspace.narration.improve.urlPrompt`. Stick to this — no exceptions.

## Common task patterns

### "Change the welcome message to say X"
1. `grep` the existing English text in `src/i18n/locales/en.json` to find the key
2. Edit the value in `en.json`
3. Edit the matching key's value in `de.json`
4. Done. Don't touch any `.tsx`.

### "Add a new button / quick action / canvas"
1. Add the new key to both `en.json` and `de.json` (same key, English value vs German value)
2. In the component, render with `{t('your.new.key')}`
3. If it's a data array (like `ALL_QUICK_ACTIONS`), give each entry a `labelKey: 'your.key'` field and render with `{t(item.labelKey)}`

### "Add a whole new scenario / view"
1. Add all chrome strings to both JSONs
2. In the component, `const t = useT();` at the top, then `t(...)` everywhere
3. For runtime-built content (like chat messages built in callbacks), capture `t` via closure and pass it into builder functions — see `buildTeacherAction` in `HiredAgentsChatView.tsx` for the pattern. The "snapshot" approach: built strings are stored in the active language and don't retranslate retroactively. That matches how a real chat works.

### "Change a scenario's narration"
1. The narrations in `AiWorkspaceView.tsx` use keys like `workspace.narration.improve.*`, `workspace.narration.mon.*`, `workspace.narration.autoFlow.*`, `workspace.narration.comm.*`
2. Find the relevant key, change the value in both JSON files. Don't touch the `.tsx`.

### "Make X region-specific (different in US vs DACH)"
- For data (connectors, comm platforms, consents): edit `src/i18n/regions.ts` and consume via `useRegion()`
- For text that should differ ONLY in DACH but not US: add the override to `src/i18n/locales/de-DACH.json` (or `en-DACH.json`). The resolver picks it up automatically.

## Always verify after changes

```bash
cd ~/Documents/Presence\ Prototype && python3 -c "
import json
en = json.load(open('src/i18n/locales/en.json'))
de = json.load(open('src/i18n/locales/de.json'))
print(f'en: {len(en)} keys, de: {len(de)} keys')
diff = set(en) ^ set(de)
print('parity:', 'OK' if not diff else f'MISMATCH {diff}')
"
```

Both counts must match and parity must be `OK` before declaring done.

## Known limitations

- The 25+ scenario narrations in `AiWorkspaceView.tsx` were originally `<span>` JSX with inline `<strong>` tags. They're now plain strings — the bold emphasis was lost. If you need to bring rich text back, introduce a `<Trans>` component pattern (~30 lines) and migrate selected narrations.
- Time labels like `"2 min ago"` / `"vor 2 Min."` are stored as static keys per occurrence. There's no relative-time formatter — values are mock fixtures. If you add real timestamps, consider `Intl.RelativeTimeFormat(region.intlLocale)`.

## Run / build

```bash
cd ~/Documents/Presence\ Prototype && npm run dev
```

Switch to **DACH / Deutsch** in the top header to verify the German experience for any change.

---

Last updated after migrating: App, Dashboard, AppsForSchoolsView, TasksView, AiReviewModal, AutoUpdatePreviewModal, UtilitiesHubView, OurTeamView, HiredAgentsChatView, KnowledgeBaseView, CommunicationsHubView, CommunicationHubViews, AiWorkspaceView. 877 keys, parity verified.

---

## Demo school websites (`public/lerchenberg/`)

Static standalone HTML files served by Vite at `http://localhost:5173/lerchenberg/[file].html`. No build step, no React — pure HTML/CSS/JS. These are used as demo targets for the automations system.

### Existing files

| File | URL | What it is |
|---|---|---|
| `public/lerchenberg/good.html` | `http://localhost:5173/lerchenberg/good.html` | **Primary automation demo target.** Primarschule Rosenbach — polished redesign with all 21 issues fixed and all 6 automation-compatible sections (team, news, calendar, documents, banner, quick links). Use this one for demos. |
| `public/lerchenberg/bad.html` | `http://localhost:5173/lerchenberg/bad.html` | Primarschule Rosenbach — authentic 2015-era Swiss school site with 21 real problems (`<!-- ISSUE #N -->`). The "before" version for audit demos. |
| `public/lerchenberg/index.html` | `http://localhost:5173/lerchenberg/index.html` | Separate site — Grundschule Lerchenberg (Mainz, DE). A different school, different design. Not the automation demo target. |
| `public/lerchenberg/gs-lerchenberg-preview.html` | `http://localhost:5173/lerchenberg/gs-lerchenberg-preview.html` | Earlier, simpler multi-page preview of Lerchenberg (SPA with JS tab switching). Ignore for automation work. |

### How to build a new school website pair (bad + good)

**Step 1 — Research.** WebSearch 2–3 real school sites in the target country. Look for: CMS type (backslash, WordPress, Typo3), URL patterns (`?page_id=23`, `.html/234`), `lang` attribute vs actual content language (common mismatch on Swiss sites), Google Fonts from `fonts.googleapis.com` (nDSG/DSGVO violation), no `<meta name="viewport">`, `<table>` layout, heading jumps h1→h4.

**Step 2 — bad.html.** Institutional look, 960px centered container, `font-family: Arial`, `font-size: 13px`. Use `#1B5E8C` header for Swiss, `#1a4a8a` for German municipal. Implement exactly these 21 real problems, each with a `<!-- ISSUE #N: explanation -->` comment:

1. `<html lang="en">` on German content
2. Google Fonts from `fonts.googleapis.com`
3. Google Analytics UA snippet
4. No `<meta name="description">`
5. No Open Graph tags
6. No skip-to-content link
7. At least 3 `<img>` without `alt`
8. `<div id="content">` instead of `<main>`
9. Old CMS URLs: `?page_id=23`, `schule/team.html/78`
10. "Index A–Z" nav link
11. Heading jumps h1 → h4 (no h2/h3 anywhere)
12. PDF links with no type or size info
13. Nav links 24px tall (below 44px touch target)
14. No `<meta name="viewport">`
15. `<table>` for sidebar layout
16. HTTP links in footer
17. No Datenschutzerklärung link
18. No accessibility statement
19. `style="font-size:11px;color:#999"` on legal text
20. `<font>` tag in content
21. `<title>Home</title>`

**Step 3 — good.html.** Fix all 21, each with `<!-- FIX #N: explanation -->`. Use the same green CSS variables as `lerchenberg/index.html` (`--g7: #2d5a3d`, `--g5: #52b788`, etc.), system fonts only, no external calls. Sections: topbar + sticky nav with SVG schoolhouse logo, hero with stats card, 4-item quick-access strip, 3-card news grid (picsum.photos images with alt text), 2-column highlights, events list + interactive JS calendar sidebar (copy from `index.html`), contact strip with staff portraits, 4-column footer with Datenschutz + Barrierefreiheit links.

**Photos:** `https://picsum.photos/seed/[descriptive-slug]/[w]/[h]` for scenes (stable, same seed = same image). `https://randomuser.me/api/portraits/[men|women]/[n].jpg` for staff. In bad.html: no `alt`. In good.html: descriptive `alt="Profilfoto von [Name], [Role]"`.

**SVG logo:** In bad.html — circular institutional badge, schoolhouse silhouette, no accessible label. In good.html — rounded square, schoolhouse outline in white on green, repeat in footer.

### Automation-compatible sections required in index.html

Every `previewType` from `src/data/mockData.ts` needs a matching section so automation demos have a real target:

| previewType | Section | Key detail |
|---|---|---|
| `new_teacher` | **Lehrpersonen grid** | First card has amber `⏳ Ausstehend` banner + Bestätigen/Ablehnen buttons. Regular staff use `randomuser.me` photos with `alt`. |
| `new_blog_post` / `blog` | **Aktuelles news grid** | 3 cards: picsum photo, category badge, `<time>` element, h3 title, excerpt. |
| `calendar` | **Termine events list** | Date blocks + color-coded tags: `tag-schule` (green), `tag-ferien` (amber), `tag-eltern` (blue). |
| `document` | **Elternressourcen grid** | First card has `✦ Neu` badge + "Aktualisiert via Drive" label. All cards show file type + KB size. |
| `banner` | **Announcement bar** | Top of page, dismissable `×` button, amber background. |
| `quick_links` | **Quick-access strip** | Below hero, CSS grid, icon + label per item. |

### Calendar widget

Copy the JS block from `public/lerchenberg/index.html` (search for `renderCalendar`). It uses a `DE_MONTHS` array, an `EVENTS` object keyed `'YYYY-M-D'`, three event types (`schule`/`ferien`/`eltern`) with colour-coded dots, hover tooltips, and prev/next buttons. Populate `EVENTS` with real school year dates for the target country/canton.
