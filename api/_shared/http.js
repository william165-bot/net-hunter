export async function readJson(req){
  return await new Promise((resolve)=>{
    let data='';
    req.on('data', chunk=> data+=chunk);
    req.on('end', ()=>{ try{ resolve(JSON.parse(data||'{}')); }catch{ resolve({}); } });
  });
}

export function sendJson(res, obj, status=200){
  res.statusCode = status;
  res.setHeader('content-type','application/json');
  res.end(JSON.stringify(obj));
}
