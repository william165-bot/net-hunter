import { readJson, sendJson } from './_shared/http.js';
import { signAdminToken } from './_shared/auth.js';

export default async function handler(req,res){
  if(req.method !== 'POST') return sendJson(res,{error:'Method not allowed'},405);
  const { name, password } = await readJson(req);
  const ADMIN_USER = process.env.ADMIN_USER || 'nethunter';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'cbtpratice@nethunter';
  if(name===ADMIN_USER && password===ADMIN_PASS){ return sendJson(res,{ ok:true, token: signAdminToken() }); }
  return sendJson(res,{error:'Admin login failed'},401);
}
