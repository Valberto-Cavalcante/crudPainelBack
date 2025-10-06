// models/adminLogModel.js
// Helpers to create/sanitize documents for the "admin_log" collection.

const SENSITIVE_KEYS = new Set([
    'pass', 'password', 'senha', 'token', 'authorization', 'auth', 'secret', 'jwt'
  ]);
  
  function sanitizeObject(obj, depth = 0) {
    if (!obj || typeof obj !== 'object' || depth > 3) return obj;
    if (Array.isArray(obj)) return obj.map(v => sanitizeObject(v, depth + 1));
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.has(String(k).toLowerCase())) continue;
      out[k] = typeof v === 'object' ? sanitizeObject(v, depth + 1) : v;
    }
    return out;
  }
  
  /**
   * Try to generate a numeric sequential id.
   * Falls back to a time-based id if your db helper "acharUltimo" does not exist.
   */
  async function generateLogId(db) {
    try {
      if (typeof db.acharUltimo === 'function') {
        const last = await db.acharUltimo('admin_log', {});
        if (last && typeof last.id === 'number') return last.id + 1;
      }
    } catch (_) { /* ignore and fallback */ }
    return Number(String(Date.now()) + Math.floor(Math.random() * 1000).toString().padStart(3, '0'));
  }
  
  function createLogDoc({
    id,
    admin = {},
    action,
    entity,
    entityId = null,
    method,
    endpoint,
    statusCode,
    ip,
    userAgent,
    requestSnapshot = {},
    durationMs
  }) {
    return {
      id,
      adminId: admin.id ?? null,
      adminUserName: admin.userName ?? null,
              adminRoles: Array.isArray(admin.roles) ? admin.roles : [],
      action,                 // 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'READ'
      entity,                 // e.g. 'users', 'menus'
      entityId,               // optional related id
      method,
      endpoint,
      statusCode,
      ip,
      userAgent,
      request: sanitizeObject(requestSnapshot),
      durationMs,
      __new: new Date(),
      __editado: new Date(),
      isDeleted: false
    };
  }
  
  module.exports = {
    sanitizeObject,
    generateLogId,
    createLogDoc
  };
  