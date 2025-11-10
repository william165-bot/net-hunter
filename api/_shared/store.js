import { kv } from '@vercel/kv';

const USERS_SET = 'users:index';

export async function getUser(email){
  const raw = await kv.get(`user:${email}`);
  if(!raw) return null;
  if(typeof raw === 'string'){
    try{ return JSON.parse(raw); }catch{ return null; }
  }
  return raw;
}

export async function putUser(user){
  const value = JSON.stringify(user);
  await kv.set(`user:${user.email}`, value);
  await kv.sadd(USERS_SET, user.email);
}

export async function listUsers(){
  const emails = await kv.smembers(USERS_SET) || [];
  const users = await Promise.all(emails.map(e=> getUser(e)));
  return users.filter(Boolean);
}
