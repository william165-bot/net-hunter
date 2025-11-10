import { readJson, sendJson } from './_shared/http.js';
import { verifyPassword, signUserToken } from './_shared/auth.js';
import { getUser } from './_shared/store.js';

export default async function handler(req,res){
  if(req.method !== 'POST') return sendJson(res, {error:'Method not allowed'}, 405);
  const { email, password } = await readJson(req);
  if(!email || !password) return sendJson(res, {error:'No request'}, 400);
  const key = email.toLowerCase();
  const u = await getUser(key);
  if(!u) return sendJson(res, {error:'Login failed — account not found. Please sign up.'}, 404);
  const ok = await verifyPassword(password, u.password_hash);
  if(!ok) return sendJson(res, {error:'Login failed — incorrect password'}, 401);
  const token = signUserToken(u.email);
  return sendJson(res, { ok:true, token });
}
