// routes/utils/logAuthEvent.js
const db = require('../../db');
const { generateLogId, createLogDoc } = require('../../models/adminLogModel');

async function logAuthEvent({ req, res, user, action }) {
  try {
    const id = await generateLogId(db);
    const doc = createLogDoc({
      id,
      admin: user || {},          // may be empty on failed login
      action,                     // 'LOGIN' | 'LOGOUT'
      entity: 'auth',
      entityId: user?.id ?? null,
      method: req.method,
      endpoint: req.originalUrl || req.url,
      statusCode: res.statusCode,
      ip: (req.headers['x-forwarded-for'] || '').split(',')[0] || req.ip,
      userAgent: req.headers['user-agent'] || '',
      requestSnapshot: {
        params: req.params || {},
        query: req.query || {},
        body: req.body || {}
      },
      durationMs: 0
    });
    await db.insert('admin_log', doc, false);
  } catch (e) {
    console.error('[logAuthEvent] failed:', e?.message || e);
  }
}

module.exports = { logAuthEvent };
