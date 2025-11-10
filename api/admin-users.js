import { sendJson } from './_shared/http.js';
import { isAdminReq } from './_shared/auth.js';
import { listUsers } from './_shared/store.js';

export default async function handler(req,res){
  if(!isAdminReq(req)) return sendJson(res,{error:'Unauthorized'},401);
  const users = await listUsers();
  users.sort((a,b)=>{
    const ap = a.premium_until? new Date(a.premium_until).getTime() : 0;
    const bp = b.premium_until? new Date(b.premium_until).getTime() : 0;
    if(bp-ap!==0) return bp-ap;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const safe = users.map(u=>{ const { password_hash, ...rest } = u; return rest; });
  return sendJson(res,{ ok:true, users: safe });
}
