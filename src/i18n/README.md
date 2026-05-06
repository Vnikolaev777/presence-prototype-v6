# Translations

This folder holds every user-facing string in the prototype. You don't need to
know TypeScript or React to edit them — just open the right `.json` file in any
text editor (or VS Code, or even Notepad), change a value, save, and the app
will pick up the change on the next reload.

## Where things live

```
src/i18n/
├── README.md                   ← you are here
├── regions.ts                  ← integrations + consents per region (devs only)
└── locales/
    ├── en.json                 ← English baseline — the source of truth
    ├── de.json                 ← German baseline
    ├── en-US.json              ← (optional) English overrides for US-only copy
    ├── en-Germany.json         ← (optional) English overrides for Germany-only copy
    ├── de-US.json              ← (optional) German overrides for US-only copy
    └── de-Germany.json         ← (optional) German overrides for Germany-only copy
```

You'll spend almost all your time in `en.json` and `de.json`. The four region
files are usually empty — only fill them in when a specific market needs different
copy from the rest of the world (e.g. a Germany-specific GDPR phrasing).

## How a translation gets picked

For every string the app needs, the system walks down this list and uses the
first one it finds:

1. `{language}-{region}.json` — most specific (e.g. `de-Germany.json`)
2. `{language}.json` — language baseline (e.g. `de.json`)
3. `en.json` — final safety net
4. The key itself, in code form, if even English is missing

So if `de.json` is missing a key, the app shows the English version rather than
breaking. You can leave keys un-translated during a draft and ship the language
gradually.

## Adding a new key

1. Open `en.json`. Add your new line, in alphabetical-ish position with the rest
   of its group (the keys are organized by section — `nav.*`, `consent.*`, etc.):
   ```json
     "dashboard.welcome": "Welcome back!",
   ```
2. Open `de.json`. Add the German version with the same key:
   ```json
     "dashboard.welcome": "Willkommen zurück!",
   ```
3. Save both files. Reload the app. Done.

If you add a key only to `en.json` and forget `de.json`, the German UI will show
the English fallback — not ideal, but not broken.

## Editing an existing translation

Open the right file, find the line, change the value (right-hand side), save.

```json
"nav.workspace": "Presence Assistant"
              ↑ change this part, leave the key on the left alone
```

## Region-specific overrides

If 95% of German copy is identical between Germany and the US, but ONE phrase
needs to be different in Germany for legal reasons, here's the workflow:

1. Keep the general translation in `de.json`.
2. Open `de-Germany.json` and add **only the keys that differ**:
   ```json
   {
     "consent.gdpr.body": "Wir verarbeiten Ihre personenbezogenen Daten gemäß DSGVO und BDSG."
   }
   ```
3. The rest of the German UI keeps using `de.json`. Only this one key gets the
   Germany-specific version.

This keeps duplication low. Most apps never need region overrides; they're a
nice escape hatch for the cases that do.

## JSON gotchas

JSON is unforgiving about a few things:

- **Commas:** every line except the last in a block needs a trailing comma.
  ```json
  "a": "first",
  "b": "second",
  "c": "third"        ← no comma on the last line
  ```
- **Quotes:** keys and string values must be wrapped in double quotes (`"`),
  not single quotes (`'`).
- **Escaping:** if a translation contains a `"`, escape it with `\"`. Newlines
  inside strings are written as `\n`.
- **No comments:** JSON doesn't allow `//` or `/* */`. If you want notes, put
  them in this README or in commit messages.

If you mess up the syntax, the app will fail to load and show a JSON parse
error in the browser console. The error usually tells you the line number.

## Adding a new language later

When you're ready for, say, French:

1. Create `locales/fr.json` (start by copying `en.json` and translating).
2. Update the list of supported languages in `src/i18n/regions.ts` and
   `src/lib/i18n.tsx` (a developer needs to do this part — about 10 lines).
3. The language switcher in the top bar picks it up automatically.

## Where strings come from in the code

If you can't find the right key for something you see in the UI, ask a
developer or grep the codebase for a snippet of the English text. Every string
the app shows the user should already be in `en.json` once translation is fully
rolled out — until then, you may find some still hardcoded in `.tsx` files.
That's the migration in progress.
