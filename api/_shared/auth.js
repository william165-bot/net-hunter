import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function signUserToken(email){
  return jwt.sign({ sub: email, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
}

export function signAdminToken(){
  return jwt.sign({ sub: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
}

export function getUserFromReq(req){
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if(!token) return null;
  try{
    const p = jwt.verify(token, JWT_SECRET);
    return p.role==='user' ? p.sub : null;
  }catch{ return null; }
}

export function isAdminReq(req){
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if(!token) return false;
  try{ const p = jwt.verify(token, JWT_SECRET); return p.role==='admin'; }catch{ return false; }
}

export function isGmail(email){ return /@gmail\.com$/i.test(email||''); }
export async function hashPassword(p){ const salt = await bcrypt.genSalt(10); return bcrypt.hash(p, salt); }
export async function verifyPassword(p,h){ return bcrypt.compare(p,h); }
