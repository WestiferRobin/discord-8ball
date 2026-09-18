# Magic 8Ball

## What it is

A client-side Discord Activity: ask, Shake, read a random answer, Ask Again. Questions and game state stay in browser memory. React + TypeScript + Vite + Discord Embedded App SDK; no backend, bot, accounts, or external game API.

## Development

Requires Node.js 20.19–20.x or 22.12+ (see `package.json`) and npm.

```bash
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:5173. Local preview is development-only, clearly labeled, and does not invent Discord sessions. Keyboard and reduced-motion preferences are supported.

## Environment

`VITE_DISCORD_CLIENT_ID` is the only application configuration: your **PUBLIC** Discord Application/Client ID. Set it in ignored `.env` for development, or in the hosting build environment / ignored `.env.production` for release. Restart Vite or rebuild after changes; runtime hosting variables cannot change already-built files.

All `VITE_` values are public. Never add a client secret, bot token, or OAuth token. The placeholder `.env.example` is safe to track. This V1 only waits for SDK `ready()` and requests no user-data scopes; [ready() requires no scopes](https://docs.discord.com/developers/developer-tools/embedded-app-sdk#ready). Real Discord acceptance remains mandatory before release.

## Build

```bash
npm run typecheck
npm run build
npm run preview
```

Build includes type checking and generates `dist/`. Set the real public ID **before** the release build. A build without it succeeds but shows a configuration error and cannot initialize an Activity. Production preview never enables the local development bypass. Open a configured production build through Discord to play; opening it directly shows launch instructions. Initialization has a timeout and Retry reloads the page.

`private: true` prevents accidental npm publishing. The package version remains `0.0.0` while live acceptance is pending; it has no effect on Discord installation. No lint command is configured.

## Discord development testing

Configure the app below, then run an HTTPS tunnel in a second terminal:

```bash
cloudflared tunnel --url http://localhost:5173
```

Restart Vite allowing only that tunnel's generated hostname:

```bash
__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS=your-tunnel.trycloudflare.com npm run dev
```

Map `/` to that hostname in **Activities → URL Mappings**. Update changing tunnel addresses and remove stale mappings. Keep Application URL Override disabled to exercise Discord's proxy. Reload/relaunch if hot reload cannot traverse it. [Discord development guide](https://docs.discord.com/developers/activities/development-guides/local-development)

## Production hosting

Deploy **only the contents of `dist/`** to the root of a stable, public HTTPS hostname. No provider is selected or required. Build command: `npm ci && npm run build`; publish directory: `dist`.

The host must serve `/` as `index.html`, `/assets/*` as the actual generated files, and preserve launch query parameters. Use correct HTML, JavaScript, and CSS MIME types; assets must not return an HTML fallback. This app has no client-side routes, so no SPA rewrite is needed. No login wall or headers that prevent Discord embedding. Do not deploy source files, `.env`, or `node_modules`; do not use Vite dev/preview as the production server.

Keep Vite's hashed filenames for cache busting; publish HTML and matching assets together. [Discord production guidance](https://docs.discord.com/developers/activities/development-guides/production-readiness)

## Discord Developer Portal setup

In the [Developer Portal](https://discord.com/developers/applications):

| Area | Setting |
| --- | --- |
| General Information | Name: **Magic 8Ball**. Description: **A simple Magic 8-Ball Activity for Discord.** Supply an app icon; copy Application ID into the build configuration. |
| Installation | Enable **User Install** and **Guild Install**. Select **Discord Provided Link**. Default install scope for both: **applications.commands**. No `bot` scope or bot permissions. |
| Activities → Settings | Enable Activities; select only platforms you test. |
| Activities → URL Mappings | Prefix `/`, target your production hostname. Omit `https://` and `/index.html`. Use the tunnel hostname only for development. |
| Launch / Entry Point | Keep the automatically created **Launch** command and Discord's default launch handler. No custom interaction endpoint. |

Set installation contexts before enabling Activities. If an older Launch command lacks a context, inspect its `integration_types` (user/guild) and `contexts` (server/DM/group DM); these are command API settings, not frontend code. No OAuth redirect is used by this handshake-only app. [Activity setup](https://docs.discord.com/developers/activities/building-an-activity), [Entry Points](https://docs.discord.com/developers/activities/development-guides/user-actions)

## Distribution

- **Development/testing:** owner, developer team, and invited App Testers. Unverified Activities are restricted to servers with **fewer than 25 members**. [Activity restrictions](https://support-dev.discord.com/hc/en-us/articles/26576097154199-What-are-Verified-and-Unverified-Activities)
- **Testers:** under **App Testers**, invite a Discord friend (up to 50 testers). They must accept the email invitation. Enable client **Advanced → Developer Mode**; testers also activate **Application Test Mode** using the Application ID. Prefer tester access over granting developer-team access. [Tester instructions](https://support-dev.discord.com/hc/en-us/articles/21204493235991-How-Can-Users-Discover-and-Play-My-Activity)
- **Installation:** share the Portal's install link → choose a supported context → authorize → open App Launcher → Launch. User Install gives the authorizing user access across supported contexts; Guild Install requires Manage Server (`MANAGE_GUILD`) and exposes commands to server members. An install link does **not** grant unverified Activity access. [Installation contexts](https://docs.discord.com/developers/activities/building-an-activity)
- **Broad public use:** requires Activity verification, not just a shareable install link. Discovery is a separate opt-in. The generic bot 100-server verification threshold does not override Activity restrictions.

## Verification / Discovery

Official requirements rechecked September 17, 2026. Core restrictions match the original audit; tester activation and listing requirements are now documented explicitly. Actual application eligibility is **CHECK IN DEVELOPER PORTAL**.

**Verification:** open **App Verification**, complete its qualification checklist and team-owner identity verification, then submit/verify. Confirm metadata, installation, supported platforms, production URL and required policy/support links are complete. Do not assume eligibility from server count. [Verification requirements](https://support-dev.discord.com/hc/en-us/articles/23926564536471-How-Do-I-Get-My-App-Verified)

**Discovery (optional for technical V1):** after verification, complete **Discovery → Discovery Settings / Discovery Status**, preview the listing, then Enable Discovery. Required listing inputs include a description, Community-enabled support server, at least one tag, and install URL. Provide real, publicly accessible Privacy Policy and Terms of Service links; none are fabricated here. Policy descriptions must accurately reflect this app and the chosen host's practices. Comply with Discord's developer/content rules. App-specific missing requirements: **CHECK IN DEVELOPER PORTAL**. [Discovery steps](https://docs.discord.com/developers/discovery/enabling-discovery), [listing fields](https://support-dev.discord.com/hc/en-us/articles/6378525413143-App-Directory-App-profile-pages), [content policy](https://support-dev.discord.com/hc/en-us/articles/9489299950487-App-Discovery-Content-Requirements-Policy)

### Release assets (manual)

| Classification | Asset / metadata |
| --- | --- |
| [REQUIRED] | Application name and public ID; complete any metadata/assets flagged by the verification checklist. |
| [RECOMMENDED] | Description and app icon. Icon upload dimensions/formats: **CHECK IN DEVELOPER PORTAL**; the Activity asset guide does not specify them. The browser favicon is not a Portal icon upload. |
| [RECOMMENDED] | Activities → Art Assets: embedded background, **16:9, at least 1024 px wide** (e.g. 1024×576). |
| [RECOMMENDED] | Cover art, **at least 1024 px wide**, composed for both **16:9 and 13:11** crops. Image formats: use the Portal's accepted formats. |
| [DISCOVERY ONLY] | Listing description, at least one tag, supported languages (English), support server, install URL, policy links. Optional screenshots/media carousel: up to **5** assets; image dimensions/formats **CHECK IN DEVELOPER PORTAL**. |

Art is not generated in this repository. Optional Activity preview video specification: **640×360 MP4, under 10 seconds, under 1 MB**; not a V1 release requirement. [Official art specifications](https://docs.discord.com/developers/activities/development-guides/assets-and-metadata)

## Final release smoke test — MANUAL REQUIRED

1. Deploy a build containing the real public ID to HTTPS; verify HTML/JS/CSS load and set production `/` mapping.
2. Install via the Portal link in each supported context; launch from App Launcher as owner and as an invited/accepted tester (small server while unverified).
3. Confirm **Discord Activity connected**, then question → Shake/Enter → answer → Ask Again for several rounds.
4. Resize; reload during shaking and after reveal; check console errors on each enabled platform.
5. For broad public distribution, finish verification. Enable Discovery separately only if desired.

**Status:** local QA and static-build validation pass. No production host, live Portal configuration, successful Discord launch, tester launch, installation flow, verification, or Discovery status has been established from this repository.
