/**
 * Proxy to the prediction API.
 *
 * The browser calls /api/fmep/picks?market=total_fouls; this adds the API key
 * server side and forwards to the backend. Two reasons it works this way:
 *
 *   - the key never reaches the browser, where anyone could read it;
 *   - the backend only listens on localhost, so the browser could not reach it
 *     directly even if we wanted it to.
 */
// Plain ofetch, not Nitro's $fetch: the target is an external API, and Nitro's
// route-typed $fetch overflows the type checker on a computed path.
import { ofetch } from 'ofetch'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  // Read at request time too: nuxt.config's process.env values are fixed at build time.
  const apiBase = (process.env.FMEP_API_BASE || config.apiBase).trim()
  const apiKey = (process.env.FMEP_API_KEY || config.apiKey).trim()
  const path = getRouterParam(event, 'path') ?? ''
  const query = getQuery(event)
  const method = event.node.req.method ?? 'GET'
  const body = ['GET', 'HEAD'].includes(method) ? undefined : await readBody(event).catch(() => undefined)

  try {
    return await ofetch(`/api/v1/${path}`, {
      baseURL: apiBase,
      method,
      query,
      body,
      headers: apiKey ? { 'X-API-Key': apiKey } : {},
    })
  } catch (error: any) {
    // Pass the backend's own problem document through, so the page can show
    // what it said rather than a generic failure.
    const status = error?.response?.status ?? 502
    const detail =
      error?.data?.detail ??
      (status === 502
        ? `Could not reach the prediction API at ${apiBase}.`
        : 'The prediction API returned an error.')
    throw createError({ statusCode: status, statusMessage: detail, data: error?.data })
  }
})
