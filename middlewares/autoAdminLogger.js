// middlewares/autoAdminLogger.js
// Global admin action logger: zero route changes needed.

const db = require('../db');
const { generateLogId, createLogDoc } = require('../models/adminLogModel');

const METHOD_TO_ACTION = { POST: 'CREATE', PUT: 'UPDATE', PATCH: 'UPDATE', DELETE: 'DELETE' };

function parseEntityFromUrl(url, stripPrefixes = []) {
  try {
    const clean = (url || '').split('?')[0];
    let path = clean;

    for (const p of stripPrefixes) {
      if (path.startsWith(p)) {
        path = path.slice(p.length);
        break;
      }
    }

    const parts = path.split('/').filter(Boolean);
    if (!parts.length) return 'root';
    return parts[0]; // first segment as entity guess: /users/123 -> "users"
  } catch {
    return 'unknown';
  }
}

function autoAdminLogger(options = {}) {
  const {
    stripPrefixes = ['/api', '/v1'],
    ignore = [/^\/health/i], // paths to skip
    logGets = false          // true if you also want to log GET requests
  } = options;

  return (req, res, next) => {
    const t0 = Date.now();

    res.on('finish', async () => {
      try {
        // Skip selected paths
        const path = req.originalUrl || req.url || '';
        if (ignore.some(rx => rx.test(path))) return;

        // Only admins
        const user = req.user;
        const isAdmin = user && Array.isArray(user.roles) && user.roles.includes('admin');
        if (!isAdmin) return;

        const method = String(req.method || '').toUpperCase();
        const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
        const isAuthEvent = /\/(login|logout)\b/i.test(path);
        if (!logGets && !isMutating && !isAuthEvent) return;

        let action = METHOD_TO_ACTION[method] || 'READ';
        if (/\/login\b/i.test(path)) action = 'LOGIN';
        if (/\/logout\b/i.test(path)) action = 'LOGOUT';

        const entity = res.locals.__entity || parseEntityFromUrl(path, stripPrefixes);
        const entityId = res.locals.__entityId || req.params?.id || null;

        const id = await generateLogId(db);
        const doc = createLogDoc({
          id,
          admin: user,
          action,
          entity,
          entityId,
          method,
          endpoint: path,
          statusCode: res.statusCode,
          ip: (req.headers['x-forwarded-for'] || '').split(',')[0] || req.ip,
          userAgent: req.headers['user-agent'] || '',
          requestSnapshot: {
            params: req.params || {},
            query: req.query || {},
            body: req.body || {}
          },
          durationMs: Date.now() - t0
        });

        await db.insert('admin_log', doc, false); // do not mirror to LCMS
      } catch (err) {
        console.error('[autoAdminLogger] failed:', err?.message || err);
      }
    });

    next();
  };
}

module.exports = autoAdminLogger;
