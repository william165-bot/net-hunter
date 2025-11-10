(function(){
  const $ = (s)=>document.querySelector(s);
  const panel = $('#panel');
  const gate = $('#admin-gate');
  const ADMIN_TOKEN_KEY = 'nh_admin_token';

  function setAdminToken(t){ sessionStorage.setItem(ADMIN_TOKEN_KEY, t); }
  function getAdminToken(){ return sessionStorage.getItem(ADMIN_TOKEN_KEY); }

  async function api(path, method='GET', body){
    const res = await fetch(`/api/${path}`,{
      method,
      headers:{'content-type':'application/json', ...(getAdminToken()?{Authorization:`Bearer ${getAdminToken()}`}:{})},
      body: method==='GET'? undefined : JSON.stringify(body||{})
    });
    const data = await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  function isoMs(x){ return x? new Date(x).getTime() : 0; }

  async function renderTable(filter=''){
    const el = $('#table');
    try{
      const { users } = await api('admin-users','GET');
      const f = (users||[]).filter(u=> (u.email||'').toLowerCase().includes((filter||'').toLowerCase()) );
      const rows = f.map(u=>{
        const now = Date.now();
        const trialLeft = (isoMs(u.trial_started_at) + 24*3600e3) - now;
        const premLeft = isoMs(u.premium_until) - now;
        const paidCount = (u.payments||[]).filter(p=>p.via==='flutterwave-redirect').length;
        const stat = premLeft>0? `Premium • ${(premLeft/86400000).toFixed(1)}d left` : (trialLeft>0? `Trial • ${(trialLeft/3600000).toFixed(1)}h left` : 'Expired');
        return `<div class="row">
          <div class="cell email">${u.email}</div>
          <div class="cell">${stat}</div>
          <div class="cell">Paid: ${paidCount}</div>
          <div class="cell actions">
            <button class="btn success" data-act="grant" data-email="${u.email}">Grant +30d</button>
            <button class="btn" data-act="extend" data-email="${u.email}">Extend +30d</button>
            <button class="btn" data-act="revoke" data-email="${u.email}">Revoke</button>
            <button class="btn" data-act="reset_trial" data-email="${u.email}">Reset Trial</button>
          </div>
        </div>`;
      }).join('');
      el.innerHTML = rows || '<p class="hint">No users found.</p>';

      el.querySelectorAll('button[data-email]').forEach(btn=>{
        btn.addEventListener('click', async ()=>{
          const email = btn.getAttribute('data-email');
          const act = btn.getAttribute('data-act');
          try{ await api('admin-mutate','POST',{ email, action: act }); renderTable($('#search').value||''); }
          catch(e){ alert(e.message||'Action failed'); }
        })
      })
    }catch(err){ el.innerHTML = `<p class="msg error">${err.message||'Failed to load users'}</p>`; }
  }

  // Admin login
  $('#admin-login')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const n=$('#a-name').value.trim();
    const p=$('#a-pass').value;
    const m=$('#a-msg'); m.className='msg';
    try{
      const { token } = await api('admin-login','POST',{ name:n, password:p });
      setAdminToken(token);
      gate.classList.add('hidden');
      panel.classList.remove('hidden');
      renderTable();
    }catch(err){ m.textContent='Admin login failed'; m.classList.add('error'); }
  });

  $('#search')?.addEventListener('input', ()=> renderTable($('#search').value||''));

  $('#export')?.addEventListener('click', async ()=>{
    try{
      const { users } = await api('admin-users','GET');
      const data = JSON.stringify(users||[], null, 2);
      const blob = new Blob([data], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href=url; a.download='nethunt-users.json';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }catch(err){ alert('Export failed'); }
  });
})();
