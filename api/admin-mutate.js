import { readJson, sendJson } from './_shared/http.js';
import { isAdminReq } from './_shared/auth.js';
import { getUser, putUser } from './_shared/store.js';

export default async function handler(req,res){
  if(!isAdminReq(req)) return sendJson(res,{error:'Unauthorized'},401);
  if(req.method !== 'POST') return sendJson(res,{error:'Method not allowed'},405);
  const { email, action, days=30 } = await readJson(req);
  if(!email) return sendJson(res,{error:'No request'},400);
  const u = await getUser(email);
  if(!u) return sendJson(res,{error:'Not found'},404);

  const now = Date.now();
  if(action==='grant' || action==='extend'){
    const base = u.premium_until? new Date(u.premium_until).getTime() : now;
    const expires = new Date(Math.max(base, now) + days*24*3600e3).toISOString();
    u.premium_until = expires;
    u.payments = u.payments || []; u.payments.push({ at: new Date().toISOString(), via: 'admin' });
  } else if(action==='revoke'){
    u.premium_until = null;
  } else if(action==='reset_trial'){
    u.trial_started_at = new Date().toISOString();
  } else {
    return sendJson(res,{error:'Unknown action'},400);
  }
  await putUser(u);
  const { password_hash, ...safe } = u;
  return sendJson(res,{ ok:true, user: safe });
}
