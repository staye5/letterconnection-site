(()=>{
const plans={3:{rent:5400,tax:446,total:5846,monthly:18,note:'Start with three months. Setup and your first key are included.'},6:{rent:9600,tax:792,total:10392,monthly:16,note:'Six months at $16/month equivalent rent, paid upfront.'},12:{rent:18000,tax:1485,total:19485,monthly:15,note:'Our most popular term. Save $12 in rent versus two six-month terms at current prices.'}};
// Owner-approved prepaid checkout links; public totals verified before release.
const checkoutUrls={3:'https://link.clover.com/urlshortener/j89s6Q',6:'https://link.clover.com/urlshortener/mpXk8G',12:'https://link.clover.com/urlshortener/CpnqmZ'};
const money=c=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(c/100);
const radios=[...document.querySelectorAll('input[name="term"]')],ack=document.getElementById('ack'),pay=document.getElementById('pay'),status=document.getElementById('checkout-status');
if(!ack||!pay)return;
const requested=new URLSearchParams(location.search).get('term');
if(Object.hasOwn(plans,requested))radios.forEach(r=>r.checked=r.value===requested);
function selected(){return radios.find(r=>r.checked)?.value||'12'}
function refresh(){const term=selected(),p=plans[term];document.getElementById('summary-title').textContent=term+'-month mailbox';document.getElementById('rent-label').textContent=term+' months of rent';for(const key of ['rent','tax','total'])document.getElementById(key).textContent=money(p[key]);document.getElementById('equivalent').textContent='$'+p.monthly+'/month equivalent rent · paid upfront';document.getElementById('value-note').textContent=p.note;pay.textContent='Continue to Clover — '+money(p.total);pay.disabled=!ack.checked||(!window.LC_PREVIEW&&!checkoutUrls[term]);status.textContent=window.LC_PREVIEW?'Preview: this button opens a local checkout summary. No payment can be taken.':(!checkoutUrls[term]?'Online checkout for this term is not connected yet. Please contact the store.':'Clover handles your card details. Your mailbox activates after required setup.');}
radios.forEach(r=>r.addEventListener('change',refresh));ack.addEventListener('change',refresh);window.addEventListener('pageshow',()=>setTimeout(refresh,0));
pay.addEventListener('click',()=>{if(!ack.checked)return;const term=selected();if(window.LC_PREVIEW){location.assign('checkout-preview.html?term='+term);return}const value=checkoutUrls[term];if(!value)return;const u=new URL(value);if(u.protocol==='https:'&&(u.hostname==='clover.com'||u.hostname.endsWith('.clover.com')))location.assign(u.href)});
refresh();
})();
