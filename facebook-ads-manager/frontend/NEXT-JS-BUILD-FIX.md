# `next build` failing on /404 — resolved

## Symptom

```
✓ Compiled successfully
  Generating static pages (0/31) ...
Error: <Html> should not be imported outside of pages/_document.
Error occurred prerendering page "/404"
Export encountered an error on /_error: /404, exiting the build.
⨯ Static worker exited with code: 1
```

`next dev` was unaffected, so this only ever blocked deployment.

## Root cause

`NODE_ENV=development` was set in `.env.local` (and shipped in `.env.example`,
so every fresh checkout inherited it).

Next.js reads `.env.local` during `next build`, and an explicit `NODE_ENV` in an
env file overrides the value Next sets per command. The production build
therefore ran in development mode: React loaded its development server bundle
(`react-dom-server.browser.development.js` appears in the stack trace), and
static generation of the Pages Router error fallbacks failed on the `<Html>`
import.

Next warns about this immediately above the failure, which is easy to read past:

```
⚠ You are using a non-standard "NODE_ENV" value in your environment.
```

## Fix

Remove `NODE_ENV` from `.env.local` and `.env.example`. Next sets it itself —
`development` for `next dev`, `production` for `next build` and `next start`.

Verified: `next build` then completes with `✓ Generating static pages (31/31)`
and exit code 0, with no change to application code or `next.config.js`.

`docker-compose.yml` still sets `NODE_ENV=development` for the `app` service.
That is correct — it is a dev container running `next dev` with the source
volume-mounted. Do not run `next build` inside it.

## Previously suspected, and wrong

An earlier version of this document attributed the error to an OpenTelemetry
chunk importing `HtmlContext`, and `next.config.js` still carries a comment
about disabling static optimization "to avoid Html import bug". Neither holds:
the project has no Pages Router directory, and nothing in `node_modules`
outside Next itself imports `next/document`. The `experimental.ppr: false`
setting in `next.config.js` is inert with respect to this failure and can be
removed independently.
