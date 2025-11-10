(function(){
  const TOKEN_KEY='nh_token';
  const PENDING_KEY='nh_pending_payment_email';
  const msg = document.getElementById('msg');

  function getToken(){ return localStorage.getItem(TOKEN_KEY); }

  async function api(path, method='POST', body){
    const res = await fetch(`/api/${path}`,{
      method,
      headers:{'content-type':'application/json', ...(getToken()?{Authorization:`Bearer ${getToken()}`}:{})},
      body: JSON.stringify(body||{})
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error||'Request failed');
    return data;
  }

  async function run(){
    const pending = localStorage.getItem(PENDING_KEY);
    if(!pending){ msg.textContent='No request — no pending payment found. Please sign in and try again.'; return; }
    try{
      await api('payment-unlock','POST',{});
      localStorage.removeItem(PENDING_KEY);
      msg.textContent='Premium unlocked! Redirecting back…';
      setTimeout(()=>{ window.location.href='index.html'; }, 1200);
    }catch(err){ msg.textContent = err.message||'Unlock failed'; }
  }

  run();
})();
