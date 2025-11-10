import { sendJson } from './_shared/http.js';
import { getUserFromReq } from './_shared/auth.js';
import { getUser } from './_shared/store.js';

export default async function handler(req,res){
  const email = getUserFromReq(req);
  if(!email) return sendJson(res,{error:'Unauthorized'},401);
  const u = await getUser(email);
  if(!u) return sendJson(res,{error:'Not found'},404);
  const { password_hash, ...safe } = u;
  return sendJson(res,{ ok:true, user: safe });
}
