/* Shared campaign state. Passwords and write permissions are checked by the service. */
(() => {
  'use strict';
  const PROD='https://shattering-campaign-service.duskytiger2.chatgpt.site';
  const local=['localhost','127.0.0.1'].includes(location.hostname);
  const API=local?'http://127.0.0.1:5173':PROD;
  const SESSION='shattering-access-v1',listeners=new Set(),pending=new Map();
  let documents={},role='public',name='Visitor',online=false,loading=false,session=null,refreshing=null,generation=0;
  try {session=JSON.parse(sessionStorage.getItem(SESSION)||'null');if(session?.expires<Date.now())session=null;}catch{}
  const copy=v=>v===undefined?undefined:structuredClone(v);
  const emit=detail=>{for(const fn of [...listeners]){try{fn(detail);}catch(error){console.error('Campaign listener',error);}}updateAccess();};
  function persist(){try{if(session)sessionStorage.setItem(SESSION,JSON.stringify(session));else sessionStorage.removeItem(SESSION);}catch{}}
  function clearAuth(){generation++;session=null;role='public';name='Visitor';for(const key of Object.keys(documents))if(key.startsWith('dm:')||key==='intake'||key==='canon')delete documents[key];persist();emit({type:'auth',role});}
  async function request(path,options={}){
    const requestGeneration=generation;
    const headers={'Content-Type':'application/json',...(session?.token?{Authorization:'Bearer '+session.token}:{}),...options.headers};
    let response;
    try{response=await fetch(API+path,{...options,headers,cache:'no-store',credentials:'omit',signal:options.signal||AbortSignal.timeout(20000)});}catch{online=false;updateAccess();throw new Error('Shared archive is unreachable. Your changes have not been saved. Try again when the connection returns.');}
    let data;try{data=await response.json();}catch{throw new Error('The shared archive returned an unreadable response.');}
    if(!response.ok){if(response.status===401&&path!=='/api/auth/login'&&requestGeneration===generation)clearAuth();const error=new Error(data.error||'This request could not be completed.');error.status=response.status;error.document=data.document;throw error;}
    online=true;return data;
  }
  async function refresh(){
    if(refreshing)return refreshing;
    const started=generation;
    refreshing=(async()=>{loading=true;updateAccess();try{
      const result=await request('/api/state');if(started!==generation)return;
      const changed=Object.keys({...documents,...result.documents}).filter(k=>documents[k]?.version!==result.documents[k]?.version);
      for(const key of Object.keys(documents))if(!result.documents[key]&&!pending.has(key))delete documents[key];
      for(const [key,doc]of Object.entries(result.documents))if(!pending.has(key))documents[key]=doc;
      const authChanged=role!==result.role;role=result.role;name=result.name;
      if(changed.length||authChanged)emit({type:authChanged?'auth':'refresh',keys:changed,role});
    }catch(error){if(error.status===401){refreshing=null;return refresh();}emit({type:'connection',error:error.message});}
    finally{loading=false;refreshing=null;updateAccess();}})();return refreshing;
  }
  async function save(key,value){
    if(role==='public'){signIn();throw new Error('Sign in to save shared changes.');}
    if(pending.has(key))throw new Error('A save is already in progress. Please wait for it to finish.');
    const version=documents[key]?.version||0,data=copy(value),started=generation;
    pending.set(key,true);updateAccess();
    try{
      const result=await request('/api/docs/'+encodeURIComponent(key),{method:'PUT',body:JSON.stringify({version,data})});
      if(started!==generation)throw new Error('Your access changed during this save. Refresh to check the saved record.');
      documents[key]=result.document;emit({type:'save',keys:[key]});return copy(result.document.data);
    }catch(error){if(started===generation&&error.status===409&&error.document){documents[key]=error.document;emit({type:'conflict',keys:[key],error:error.message});}throw error;}
    finally{pending.delete(key);updateAccess();}
  }
  async function login(password,requestedRole,displayName){
    const result=await request('/api/auth/login',{method:'POST',body:JSON.stringify({password,role:requestedRole,name:displayName})});
    generation++;session=result;persist();role=result.role;name=result.name;documents={};
    if(refreshing)await refreshing;await refresh();emit({type:'auth',role});return result;
  }
  async function logout(){try{await request('/api/auth/logout',{method:'POST',body:'{}'});}finally{clearAuth();if(refreshing)await refreshing;await refresh();}}
  async function upload(file){if(role==='public')throw new Error('Sign in before uploading a recording.');if(file.size>50*1024*1024)throw new Error('Recordings must be 50 MiB or smaller.');return request('/api/files',{method:'POST',headers:{'Content-Type':file.type||'application/octet-stream','X-File-Name':encodeURIComponent(file.name)},body:file,signal:AbortSignal.timeout(300000)});}
  function updateAccess(){const button=document.getElementById('accessButton');if(button){button.textContent=role==='dm'?'DM access':role==='party'?'Party access':'Party sign-in';button.dataset.role=role;}const status=document.getElementById('sharedStatus');if(status){status.textContent=pending.size?'Saving…':loading&&!online?'Connecting…':online?'Shared archive online':'Shared archive unavailable';status.dataset.online=String(online);}}
  function signIn(requestedRole='party'){
    const dialog=document.getElementById('accessDialog');if(!dialog)return;
    const form=document.getElementById('accessForm'),signed=document.getElementById('accessSigned');
    form.hidden=role!=='public'&&requestedRole!=='dm';signed.hidden=!form.hidden;
    document.getElementById('accessRole').value=requestedRole==='dm'?'dm':'party';document.getElementById('accessPassword').value='';
    document.getElementById('accessError').textContent='';document.getElementById('accessIdentity').textContent=name+' · '+(role==='dm'?'Dungeon Master':'Party editing');
    if(!dialog.open)dialog.showModal();(form.hidden?document.getElementById('accessSignout'):document.getElementById('accessPassword')).focus();
  }
  function install(){
    document.body.insertAdjacentHTML('beforeend',`<dialog id="accessDialog" class="access-dialog"><button class="access-close icon-button" aria-label="Close sign-in">×</button><p class="eyebrow">H.O.C.2.A / CREW ACCESS</p><h2>Welcome aboard.</h2><form id="accessForm"><p>Anyone can explore. Sign in to contribute to the shared campaign.</p><label for="accessRole">Access</label><select id="accessRole"><option value="party">Party member</option><option value="dm">Dungeon Master</option></select><label for="accessName">Your display name <span class="muted">(optional)</span></label><input id="accessName" maxlength="60" autocomplete="nickname" placeholder="How should we credit your updates?"><label for="accessPassword">Password</label><input id="accessPassword" type="password" required maxlength="256" autocomplete="current-password"><p id="accessError" role="alert"></p><button class="button" type="submit">Sign in</button><p class="source-note">Party members share editing access. Display names are labels, not private accounts. Sign-in lasts in this browser tab until you close it or sign out.</p></form><div id="accessSigned" hidden><p id="accessIdentity"></p><div class="button-row"><button class="button secondary" id="accessSignout">Sign out</button><button class="button secondary" id="accessUpgrade">DM sign-in</button></div></div></dialog>`);
    const dialog=document.getElementById('accessDialog');dialog.querySelector('.access-close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
    document.getElementById('accessButton').onclick=()=>signIn();
    document.getElementById('accessForm').onsubmit=async e=>{e.preventDefault();const submit=e.target.querySelector('[type=submit]');submit.disabled=true;document.getElementById('accessError').textContent='Signing in…';try{await login(document.getElementById('accessPassword').value,document.getElementById('accessRole').value,document.getElementById('accessName').value);document.getElementById('accessPassword').value='';dialog.close();}catch(error){document.getElementById('accessError').textContent=error.message;}finally{submit.disabled=false;}};
    document.getElementById('accessSignout').onclick=async()=>{await logout();dialog.close();};
    document.getElementById('accessUpgrade').onclick=()=>signIn('dm');updateAccess();
  }
  window.CampaignSync={get role(){return role;},get online(){return online;},get name(){return name;},canEdit:()=>role!=='public',canDM:()=>role==='dm',get:(key,fallback)=>copy(documents[key]?.data??fallback),version:key=>documents[key]?.version||0,save,refresh,signIn,logout,upload,fileURL:async id=>(await request('/api/files/'+encodeURIComponent(id)+'/url')).url,subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},history:key=>request('/api/history?key='+encodeURIComponent(key)),revokeParty:()=>request('/api/auth/revoke',{method:'POST',body:'{}'})};
  install();window.CampaignSync.ready=refresh();
  setInterval(()=>{if(!document.hidden&&!pending.size)refresh();},15000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
})();
