(function(){
  const TOKEN_KEY = 'nh_token';
  const EMAIL_KEY = 'nh_email';
  const PENDING_KEY = 'nh_pending_payment_email';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const views = { auth: $('#auth-view'), app: $('#app-view') };

  // Tabs
  $$('.tab').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const id = btn.dataset.tab;
    $$('.tab-panel').forEach(p=>p.classList.remove('active'));
    $('#'+id).classList.add('active');
  }));

  function gmailOnly(email){ return /@gmail\.com$/i.test(email||''); }
  function upsertNotice(txt, ok){ const n=$('#notice'); if(!txt){n.classList.add('hidden'); return;} n.textContent=txt; n.classList.remove('hidden'); n.style.borderLeftColor = ok? '#19c37d' : '#ff6b6b'; }

  function isoMs(x){ return x? new Date(x).getTime() : 0; }
  function now(){ return Date.now(); }
  const DAY = 24*60*60*1000;

  function formatCountdown(ms){ const t=Math.max(0,ms); const d=Math.floor(t/86400000); const h=Math.floor((t%86400000)/3600000); const m=Math.floor((t%3600000)/60000); return `${d}d ${h}h ${m}m`; }

  function accessInfo(user){
    const tsNow = now();
    const trialStart = isoMs(user.trial_started_at || user.created_at) || tsNow;
    const trialLeft = (trialStart + DAY) - tsNow;
    const premiumLeft = (isoMs(user.premium_until) || 0) - tsNow;
    if(premiumLeft>0) return { allow:true, via:'premium', left: premiumLeft };
    if(trialLeft>0) return { allow:true, via:'trial', left: trialLeft };
    return { allow:false, via:'expired', left:0 };
  }

  function setToken(t){ localStorage.setItem(TOKEN_KEY, t); }
  function getToken(){ return localStorage.getItem(TOKEN_KEY); }
  function clearToken(){ localStorage.removeItem(TOKEN_KEY); }
  function setEmail(e){ localStorage.setItem(EMAIL_KEY, e); }
  function getEmail(){ return localStorage.getItem(EMAIL_KEY); }
  function clearEmail(){ localStorage.removeItem(EMAIL_KEY); }

  async function api(path, method='GET', body){
    const res = await fetch(`/api/${path}`,{
      method,
      headers:{'content-type':'application/json', ...(getToken()?{Authorization:`Bearer ${getToken()}`}:{})},
      body: method==='GET'? undefined : JSON.stringify(body||{})
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  function showAuth(){ views.auth.classList.add('active'); views.app.classList.remove('active'); }
  function showApp(){ views.app.classList.add('active'); views.auth.classList.remove('active'); }

  function updateStatusBadge(user){
    const badge = $('#status-badge');
    const info = accessInfo(user);
    if(info.allow){
      badge.textContent = info.via==='premium' ? `Premium • ${formatCountdown(info.left)} left` : `Trial • ${formatCountdown(info.left)} left`;
      badge.style.background = info.via==='premium' ? '#143024' : '#102130';
    } else { badge.textContent='Access expired'; badge.style.background='#301414'; }
  }

  async function renderApp(){
    const email = getEmail();
    const token = getToken();
    if(!email || !token){ showAuth(); return; }
    $('#user-email').textContent = email;
    try{
      const { user } = await api('me','GET');
      updateStatusBadge(user);
      const info = accessInfo(user);
      const gate = $('#gate');
      const embed = $('#embed-wrap');
      const upgradeBtn = document.getElementById('open-premium');
      if(info.allow){ gate.classList.add('hidden'); embed.classList.remove('hidden'); $('#trial-info').classList.add('hidden'); if(upgradeBtn) upgradeBtn.classList.add('hidden'); }
      else { gate.classList.remove('hidden'); embed.classList.add('hidden'); const t=$('#trial-info'); t.classList.remove('hidden'); t.textContent='Your free trial has ended. Please make payment to unlock premium access for 1 month.'; if(upgradeBtn) upgradeBtn.classList.remove('hidden'); }
      if(window.__nh_timer) clearInterval(window.__nh_timer);
      window.__nh_timer = setInterval(async()=>{ try{ const { user:u } = await api('me','GET'); updateStatusBadge(u);}catch(e){} }, 60*1000);
    }catch(err){ upsertNotice(err.message||'Login failed', false); showAuth(); }
  }

  async function unlockAfterRedirectIfPending(){
    try{
      const pending = localStorage.getItem(PENDING_KEY);
      if(!pending) return;
      if(!getToken()) return;
      await api('payment-unlock','POST',{});
      localStorage.removeItem(PENDING_KEY);
      upsertNotice('Premium unlocked! Enjoy 1 month access.', true);
    }catch(e){ /* ignore */ }
  }

  // Auth handlers
  $('#signup-form')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = $('#signup-email').value.trim().toLowerCase();
    const pass = $('#signup-password').value;
    const msg = $('#signup-msg'); msg.className='msg';
    if(!email || !pass){ msg.textContent='No request'; msg.classList.add('error'); return; }
    if(!gmailOnly(email)){ msg.textContent='Only @gmail.com email is allowed'; msg.classList.add('error'); return; }
    try{
      await api('signup','POST',{email,password:pass});
      msg.textContent='Account created. You can now sign in.'; msg.classList.add('ok');
      document.querySelector('.tab[data-tab="signin"]').click();
    }catch(err){ msg.textContent=err.message||'Sign up failed'; msg.classList.add('error'); }
  });

  $('#signin-form')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = $('#signin-email').value.trim().toLowerCase();
    const pass = $('#signin-password').value;
    const msg = $('#signin-msg'); msg.className='msg';
    if(!email || !pass){ msg.textContent='No request'; msg.classList.add('error'); return; }
    try{
      const { token } = await api('signin','POST',{email,password:pass});
      setToken(token); setEmail(email);
      msg.textContent='Signed in successfully'; msg.classList.add('ok');
      await unlockAfterRedirectIfPending();
      showApp(); renderApp();
    }catch(err){ msg.textContent=err.message||'Login failed'; msg.classList.add('error'); }
  });

  // Admin gate from index to admin.html
  $('#admin-form')?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const name = $('#admin-name').value.trim();
    const pass = $('#admin-pass').value;
    if(name==='nethunter' && pass==='cbtpratice@nethunter'){
      window.location.href = 'admin.html';
    } else { const m=$('#admin-msg'); m.className='msg error'; m.textContent='Admin login failed'; }
  });

  // Sign out
  $('#signout')?.addEventListener('click', ()=>{ clearToken(); clearEmail(); showAuth(); });

  // Payment handlers
  const PAY_URL = 'https://flutterwave.com/pay/7k8wh62jmtzh';
  $('#pay-btn')?.addEventListener('click', (e)=>{
    e.preventDefault();
    const email = getEmail();
    if(!email){ upsertNotice('No request — please sign in first', false); return; }
    localStorage.setItem(PENDING_KEY, email);
    window.open(PAY_URL, '_blank', 'noopener');
    upsertNotice('Payment page opened. After successful payment, you will be redirected back to your site and premium will unlock automatically.', true);
  });
  $('#open-flw')?.setAttribute('href', PAY_URL);

  // Dedicated Premium section
  $('#open-premium')?.addEventListener('click', ()=>{
    document.getElementById('premium-section')?.classList.remove('hidden');
  });
  $('#close-premium')?.addEventListener('click', ()=>{
    document.getElementById('premium-section')?.classList.add('hidden');
  });

  // Open iframe in new tab
  $('#open-new')?.addEventListener('click', ()=>{ window.open('https://getindevice.com/', '_blank'); });

  (async function init(){
    const token = getToken();
    const email = getEmail();
    if(token && email){ await unlockAfterRedirectIfPending(); showApp(); renderApp(); } else { showAuth(); }
  })();
})();
