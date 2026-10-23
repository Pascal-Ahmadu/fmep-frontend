# Football micro-event forecasts — frontend

Nuxt 3 interface for the prediction backend: the week's picks and the models'
measured accuracy.

## Running it

The backend must be reachable first. On Windows, from the backend project:

```bash
python scripts/dev_api.py          # http://localhost:8000
```

Then here:

```bash
cp .env.example .env               # set FMEP_API_KEY
npm install --legacy-peer-deps     # npm 10.9 trips over the Nuxt peer graph
npm run dev                        # http://localhost:3000
```

## How it talks to the API

The browser never calls the prediction API directly, and never sees the API key.

```
browser → /api/fmep/<path> (Nuxt server) → http://backend:8000/api/v1/<path>
                                            with the X-API-Key header
```

`server/api/fmep/[...path].ts` is that proxy. Two reasons for it:

- **The key stays server side.** Anything in `runtimeConfig.public`, or in a
  component, ships to the browser where anyone can read it.
- **The backend only listens on localhost** in production, so the browser could
  not reach it directly anyway.

## Pages

| Route | Shows |
| --- | --- |
| `/` | Picks per market, ranked by how far each forecast departs from that league's usual rate |
| `/performance` | Live accuracy from settled forecasts: hit rate, and the margin over the baseline |

Player markets are paused in the backend while the free data source has no
per-player statistics, so only corners, cards and fouls appear.

## Deploying

Built for Vercel (`npm run build`). Two environment variables are needed there:

- `FMEP_API_BASE` — the backend's address, reachable from Vercel
- `FMEP_API_KEY` — the key from the backend's `API_KEYS`

Note that the backend currently binds to localhost on its instance, so a
deployment needs it published behind a reverse proxy with TLS first. Until then
this runs locally against a local or tunnelled API.
