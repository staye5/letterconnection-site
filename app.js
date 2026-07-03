// year
var y=document.getElementById('yr'); if(y) y.textContent=new Date().getFullYear();
// map iframe: only reveal once it actually loads (striped address fallback shows otherwise)
var mi=document.querySelector('.map-card iframe');
if(mi) mi.addEventListener('load',function(){mi.classList.add('loaded');});
// mobile nav
var b=document.querySelector('[data-burger]'), mn=document.querySelector('[data-mnav]');
if(b&&mn) b.addEventListener('click',function(){mn.classList.toggle('open');});
// reserve form -> Web3Forms
var f=document.querySelector('[data-form]'), s=document.querySelector('[data-status]');
function setS(t,k){ if(!s)return; s.textContent=t; s.className='form-status'+(k?' '+k:''); }
if(f){f.addEventListener('submit',async function(e){
  e.preventDefault();
  var btn=f.querySelector('button[type=submit]'), orig=btn?btn.textContent:'';
  if(btn){btn.disabled=true;btn.textContent='Sending…';}
  setS('','');
  try{
    var r=await fetch(f.action,{method:'POST',headers:{Accept:'application/json'},body:new FormData(f)});
    var j=await r.json().catch(function(){return{};});
    if(r.ok&&j.success){ f.reset(); setS('Thanks! We got your request and will call you back. Need it sooner? Call 281-499-6245.','ok'); if(window.lcFormSuccess) window.lcFormSuccess(f); }
    else setS('Something went wrong. Please call 281-499-6245 or email admin@letterconnection.com.','err');
  }catch(_){ setS('Couldn’t send right now. Please call 281-499-6245.','err'); }
  finally{ if(btn){btn.disabled=false;btn.textContent=orig;} }
});}
