import { sendJson, readJson } from './_shared/http.js';
import { getUserFromReq } from './_shared/auth.js';
import { getUser, putUser } from './_shared/store.js';

export default async function handler(req,res){
  if(req.method !== 'POST') return sendJson(res,{error:'Method not allowed'},405);
  const email = getUserFromReq(req);
  if(!email) return sendJson(res,{error:'Unauthorized'},401);
  const u = await getUser(email);
  if(!u) return sendJson(res,{error:'Not found'},404);
  const base = u.premium_until ? new Date(u.premium_until).getTime() : 0;
  const now = Date.now();
  const start = Math.max(base, now);
  const expires = new Date(start + 30*24*3600e3).toISOString();
  u.premium_until = expires;
  u.payments = u.payments || []; u.payments.push({ at: new Date().toISOString(), via: 'flutterwave-redirect' });
  await putUser(u);
  return sendJson(res,{ ok:true, premium_until: expires });
}
