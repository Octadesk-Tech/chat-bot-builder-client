import { HttpMethodsWebhook, QueryParameters } from 'models'

export type ParsedCurl = {
  method: HttpMethodsWebhook
  url: string
  path: string
  headers: QueryParameters[]
  parameters: QueryParameters[]
  body: string
}

export const parseCurlCommand = (curl: string): ParsedCurl | null => {
  try {
    const normalized = curl
      .replace(/\\\n/g, ' ')
      .replace(/\\\r\n/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    if (!normalized.toLowerCase().startsWith('curl')) return null

    const methodValues = Object.values(HttpMethodsWebhook) as string[]
    let method: HttpMethodsWebhook = HttpMethodsWebhook.GET
    let hasExplicitMethod = false

    const methodMatch = normalized.match(/-X\s+([A-Z]+)/i)
    if (methodMatch) {
      const upper = methodMatch[1].toUpperCase()
      if (methodValues.includes(upper)) {
        method = upper as HttpMethodsWebhook
        hasExplicitMethod = true
      }
    }

    const urlMatch = normalized.match(/https?:\/\/[^\s'"]+/)
    if (!urlMatch) return null
    let fullUrl = urlMatch[0]

    const headers: QueryParameters[] = []
    const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g
    let headerMatch
    while ((headerMatch = headerRegex.exec(normalized)) !== null) {
      const [key, value] = headerMatch[1].split(/:(.+)/)
      if (key && value) {
        headers.push({
          key: key.trim(),
          value: value.trim(),
          displayValue: value.trim(),
          type: 'header',
          isNew: true,
        } as QueryParameters)
      }
    }

    let body = ''
    const bodyMatch = normalized.match(
      /--data(?:-raw|-binary|-urlencode)?\s+(['"])([\s\S]*?)\1/
    )
    if (bodyMatch) {
      body = bodyMatch[2]
      if (!hasExplicitMethod) method = HttpMethodsWebhook.POST
    } else {
      const bodyMatchUnquoted = normalized.match(/-d\s+(['"])([\s\S]*?)\1/)
      if (bodyMatchUnquoted) {
        body = bodyMatchUnquoted[2]
        if (!hasExplicitMethod) method = HttpMethodsWebhook.POST
      }
    }

    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl
    }

    const urlObj = new URL(fullUrl)
    const parameters: QueryParameters[] = []
    urlObj.searchParams.forEach((value, key) => {
      parameters.push({
        key,
        value,
        displayValue: value,
        type: 'query',
        isNew: true,
      } as QueryParameters)
    })

    return {
      method,
      url: urlObj.origin,
      path: urlObj.pathname !== '/' ? urlObj.pathname : '',
      headers,
      parameters,
      body: body || '{}',
    }
  } catch {
    return null
  }
}
