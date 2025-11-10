import { readJson, sendJson } from './_shared/http.js';
import { isGmail, hashPassword } from './_shared/auth.js';
import { getUser, putUser } from './_shared/store.js';

export default async function handler(req, res){
  if(req.method !== 'POST') return sendJson(res, {error:'Method not allowed'}, 405);
  const { email, password } = await readJson(req);
  if(!email || !password) return sendJson(res, {error:'No request'}, 400);
  if(!isGmail(email)) return sendJson(res, {error:'Only @gmail.com email is allowed'}, 400);

  const key = email.toLowerCase();
  const exists = await getUser(key);
  if(exists) return sendJson(res,{error:'Sign up failed — account already exists'},409);

  const password_hash = await hashPassword(password);
  const now = new Date().toISOString();
  await putUser({ email:key, password_hash, created_at: now, trial_started_at: now, premium_until: null, payments: [] });
  return sendJson(res,{ok:true});
}
