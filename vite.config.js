import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiProxyPlugin = () => ({
  name: 'local-api-proxy',
  configureServer(server) {
    server.middlewares.use('/api/memory', (req, res) => {
      let body = ''
      req.setEncoding('utf8')
      req.on('data', chunk => {
        body += chunk
        if (body.length > 1024 * 1024) req.destroy()
      })
      req.on('end', async () => {
        try {
          const originalPath = req.originalUrl || req.url || '/'
          const targetPath = originalPath.replace(/^\/api\/memory/, '') || '/'
          const upstream = await fetch(`http://127.0.0.1:8765${targetPath}`, {
            method: req.method,
            headers: body ? { 'Content-Type': req.headers['content-type'] || 'application/json' } : {},
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : (body || undefined),
            signal: AbortSignal.timeout(8000)
          })
          const responseText = await upstream.text()
          res.statusCode = upstream.status
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8')
          res.end(responseText)
        } catch (error) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ message: '本地记忆服务未启动', detail: error.message }))
        }
      })
    })

    server.middlewares.use('/api/proxy-bailian', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ message: '仅支持POST请求' }))
        return
      }

      let body = ''
      req.setEncoding('utf8')
      req.on('data', chunk => {
        body += chunk
        if (body.length > 1024 * 1024) req.destroy()
      })
      req.on('end', async () => {
        try {
          const { apiKey, appId, prompt, sessionId, bizParams } = JSON.parse(body || '{}')
          if (!apiKey || !appId || !prompt) {
            throw new Error('API Key、应用ID或问题内容不完整')
          }
          if (!/^[A-Za-z0-9_-]+$/.test(appId)) {
            throw new Error('应用ID格式不正确')
          }

          const input = { prompt }
          if (sessionId) input.session_id = sessionId
          if (bizParams != null) {
            if (typeof bizParams !== 'object' || Array.isArray(bizParams)) {
              throw new Error('bizParams必须是对象')
            }
            input.biz_params = bizParams
          }
          const upstream = await fetch(
            `https://dashscope.aliyuncs.com/api/v1/apps/${encodeURIComponent(appId)}/completion`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
              },
              body: JSON.stringify({ input, parameters: {} }),
              signal: AbortSignal.timeout(60000)
            }
          )
          const responseText = await upstream.text()
          res.statusCode = upstream.status
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8')
          res.end(responseText)
        } catch (error) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ message: error.message || '百炼应用代理请求失败' }))
        }
      })
    })

    server.middlewares.use('/api/proxy-chat', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ message: '仅支持POST请求' }))
        return
      }

      let body = ''
      req.setEncoding('utf8')
      req.on('data', chunk => {
        body += chunk
        if (body.length > 1024 * 1024) req.destroy()
      })
      req.on('end', async () => {
        try {
          const { endpoint, apiKey, model, messages } = JSON.parse(body || '{}')
          if (!endpoint || !apiKey || !model || !Array.isArray(messages)) {
            throw new Error('API配置或消息格式不完整')
          }

          const target = new URL(endpoint)
          const isLocal = ['localhost', '127.0.0.1', '::1'].includes(target.hostname)
          if (target.protocol !== 'https:' && !(isLocal && target.protocol === 'http:')) {
            throw new Error('远程API必须使用HTTPS，本地接口可使用HTTP')
          }

          const upstream = await fetch(target, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({ model, messages, stream: false }),
            signal: AbortSignal.timeout(45000)
          })
          const responseText = await upstream.text()
          res.statusCode = upstream.status
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8')
          res.end(responseText)
        } catch (error) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ message: error.message || 'API代理请求失败' }))
        }
      })
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiProxyPlugin()],
})
