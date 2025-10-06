module.exports = function requireAdmin(req, res, next) {
  console.log('requireAdmin - req.user:', req.user);
  console.log('requireAdmin - req.user.roles:', req.user?.roles);
  
  if (!req.user || !Array.isArray(req.user.roles) || !req.user.roles.includes('admin')) {
    console.log('Acesso negado - usuário não é admin');
    return res.status(403).json({ success: false, error: 'Acesso restrito a administradores.' });
  }
  
  console.log('Acesso permitido - usuário é admin');
  next();
}; 