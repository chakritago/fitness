'use strict';
(() => {
 const items=Array.isArray(window.BUNGBOY_ARTICLES)?window.BUNGBOY_ARTICLES:[];
 const cats=[['all','ทุกหมวด','◈'],['metabolism','ระบบเผาผลาญ','⚡'],['fatloss','ลดไขมัน / น้ำหนัก','🔥'],['training','เวทเทรนนิง','🏋️'],['nutrition','อาหาร / โภชนาการ','🥗'],['physique','รูปร่าง / กล้ามท้อง','💪'],['coaching','โค้ช / เคสศึกษา','🎯'],['mindset','วินัย / จิตวิทยา','🧠'],['lifestyle','สุขภาพ / ชีวิตประจำวัน','🌙'],['others','อื่น ๆ','📌']];
 const $=id=>document.getElementById(id);const catName=key=>cats.find(c=>c[0]===key)?.[1]||'อื่น ๆ';
 const safeGet=(key,fallback)=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};
 const safeSet=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
 const readJSON=key=>{try{return JSON.parse(safeGet(key,'{}'))||{}}catch{return {}}};
 const saved=readJSON('bungboy-fav-v1'), read=readJSON('bungboy-read-v1'), notes=readJSON('bungboy-notes-v1');
 const initialView=safeGet('bungboy-view-v1','embed')==='list'?'list':'embed';
 const state={category:'all',filter:'all',query:'',sort:'original',visible:initialView==='embed'?12:24,view:initialView,selected:null,route:false};
 const pageSize=()=>state.view==='embed'?12:24;
 const byId=new Map(items.map(a=>[a.id,a]));
 const embedObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){embedObserver.unobserve(entry.target);mountEmbed(entry.target,byId.get(entry.target.dataset.articleId))}
 },{rootMargin:'250px 0px'}):null;
 let noteTimer=null;
 function el(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node}
 function resetScroll(){state.visible=pageSize();window.scrollTo({top:$('content').getBoundingClientRect().top+window.scrollY-100,behavior:'smooth'})}
 function countCat(key){return key==='all'?items.length:items.filter(a=>a.category===key).length}
 function categories(){for(const target of [$('categories'),$('mobileCats')]){target.replaceChildren();for(const [key,name,emoji] of cats){const b=el('button',target.id==='categories'?'sidebar-item':'pill');b.type='button';b.classList.toggle('active',key===state.category);const e=el('span','emoji',emoji),t=el('span','',name),n=el('span','count',String(countCat(key)));b.append(e,t,n);b.onclick=()=>{state.category=key;state.route=false;resetScroll();render()};target.append(b)}}}
 function matches(a){if(state.route&&!routeIds.has(a.id))return false;if(state.category!=='all'&&a.category!==state.category)return false;if(state.filter==='saved'&&!saved[a.id])return false;if(state.filter==='read'&&!read[a.id])return false;if(state.filter==='unread'&&read[a.id])return false;if(state.filter==='video'&&!['video','youtube'].includes(a.type))return false;const search=state.query.normalize('NFKC').toLocaleLowerCase('th').replace(/\s+/g,'').trim();if(search){const text=[a.title,...a.aliases,catName(a.category)].join(' ').normalize('NFKC').toLocaleLowerCase('th').replace(/\s+/g,'');if(!text.includes(search))return false}return true}
 const routeSearch=['ขั้นตอนสำหรับมือ','6เรื่องที่คุณต้องรู้','calorie deficit','9เรื่องที่คุณต้องรู้','วิธีหา carb protein fat','จัดตารางเวท','วิธีลดไขมันแบบง่าย'];
 const routeIds=new Set(routeSearch.map(s=>items.find(a=>a.title.toLocaleLowerCase('th').includes(s.toLocaleLowerCase('th')))?.id).filter(Boolean));
 function card(a){const d=el('article','item'), top=el('div','item-top'), label=el('div','item-label'),dot=el('span','dot'),save=el('button','savebtn',saved[a.id]?'★':'☆');label.append(dot,el('span','',catName(a.category)));save.type='button';save.title=saved[a.id]?'ลบบุ๊กมาร์ก':'บันทึกเรื่องนี้';save.setAttribute('aria-label',save.title);save.classList.toggle('saved',!!saved[a.id]);save.onclick=()=>{toggleSaved(a);render()};top.append(label,save);
 const title=el('button','titlebutton',a.title);title.onclick=()=>openReader(a);
 const bottom=el('div','item-bottom'), meta=el('span','',`${a.type==='youtube'?'▶ YouTube':a.type==='video'?'▶ Video':'▤ Facebook'}${read[a.id]?' · ✓ อ่านแล้ว':''}`),actions=el('div','item-actions');const link=el('button','readbtn','อ่าน / ดูโพสต์ ↗');link.onclick=()=>openReader(a);actions.append(link);bottom.append(meta,actions);if(state.view==='embed'){
  const host=el('div','item-embed');host.dataset.articleId=a.id;
  host.append(el('p','preview-note','กำลังเตรียมโพสต์จากต้นทาง...'));
  d.classList.add('embedded');d.append(top,title,host,bottom);
 }else d.append(top,title,bottom);return d}
 function render(){categories();for(const b of document.querySelectorAll('[data-filter]'))b.classList.toggle('active',b.dataset.filter===state.filter);
 for(const [id,mode] of [['viewEmbed','embed'],['viewList','list']]){const b=$(id);b.classList.toggle('active',state.view===mode);b.setAttribute('aria-pressed',String(state.view===mode))}
 $('embedHint').hidden=state.view!=='embed';$('heroTotal').textContent=items.length.toLocaleString('th-TH');$('sectionTitle').textContent=state.route?'เส้นทางอ่านสำหรับมือใหม่':state.category==='all'?'บทความทั้งหมด':catName(state.category);
 let found=items.filter(matches);if(state.route)found.sort((a,b)=>Array.from(routeIds).indexOf(a.id)-Array.from(routeIds).indexOf(b.id));else if(state.sort==='az')found.sort((a,b)=>a.title.localeCompare(b.title,'th'));else if(state.sort==='za')found.sort((a,b)=>b.title.localeCompare(a.title,'th'));
 $('results').textContent=`แสดง ${Math.min(found.length,state.visible).toLocaleString('th-TH')} จาก ${found.length.toLocaleString('th-TH')} หัวข้อ · บันทึกไว้ ${Object.keys(saved).filter(k=>saved[k]).length} · อ่านแล้ว ${Object.keys(read).filter(k=>read[k]).length}`;
 const cards=$('cards');embedObserver?.disconnect();cards.classList.toggle('embed-mode',state.view==='embed');cards.replaceChildren();if(!found.length){const e=el('div','empty');e.style.gridColumn='1/-1';e.append(el('strong','','ไม่พบหัวข้อที่ค้นหา'),el('p','','ลองใช้คำสั้นลงหรือเปลี่ยนตัวกรอง'));cards.append(e)}else{const f=document.createDocumentFragment();for(const a of found.slice(0,state.visible))f.append(card(a));cards.append(f)}
 if(state.view==='embed')for(const host of cards.querySelectorAll('.item-embed')){
  if(embedObserver)embedObserver.observe(host);else mountEmbed(host,byId.get(host.dataset.articleId));
 }
 const pg=$('pagination');pg.replaceChildren();if(found.length>state.visible){const more=el('button','secondary',`ดูเพิ่มเติมอีก ${Math.min(pageSize(),found.length-state.visible)} หัวข้อ ↓`);more.onclick=()=>{state.visible+=pageSize();render()};pg.append(more)}
 }
 function toggleSaved(a){if(saved[a.id])delete saved[a.id];else saved[a.id]=true;safeSet('bungboy-fav-v1',JSON.stringify(saved));if(state.selected?.id===a.id)syncReaderButtons()}
 function toggleRead(a){if(read[a.id])delete read[a.id];else read[a.id]=true;safeSet('bungboy-read-v1',JSON.stringify(read));syncReaderButtons();render()}
 function syncReaderButtons(){const a=state.selected;if(!a)return;$('markRead').textContent=read[a.id]?'✓ อ่านแล้ว · ยกเลิก':'✓ ทำเครื่องหมายอ่านแล้ว';$('saveReader').textContent=saved[a.id]?'★ บันทึกแล้ว':'☆ บันทึก'}
 function embedSrc(a,width){
  if(!a||a.linkState==='incomplete')return '';
  try{
   const url=new URL(a.url),host=url.hostname.toLowerCase();
   if(a.type==='youtube'){
    if(!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtu.be'].includes(host))return '';
    const id=host.includes('youtu.be')?url.pathname.slice(1):url.searchParams.get('v')||url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1];
    return id&&/^[\w-]{11}$/.test(id)?'https://www.youtube-nocookie.com/embed/'+id:'';
   }
   if(!['facebook.com','www.facebook.com','m.facebook.com','web.facebook.com'].includes(host))return '';
   const endpoint=a.type==='video'?'video.php':'post.php';
   return 'https://www.facebook.com/plugins/'+endpoint+'?href='+encodeURIComponent(a.url)+'&show_text=true&width='+width;
  }catch{return ''}
 }
 function mountEmbed(area,a){
  if(!area||!a)return;
  area.replaceChildren();area.classList.remove('youtube','fb-video','fb-post');
  const width=Math.max(350,Math.min(500,Math.floor(area.getBoundingClientRect().width-30)||500));
  const src=embedSrc(a,width);
  const link=el('a','embed-source',a.linkState==='incomplete'?'↗ ไปยังหน้าเพจต้นทาง':'↗ เปิดโพสต์ต้นฉบับ');
  link.href=a.linkState==='incomplete'?'https://www.facebook.com/100699831731227/':a.url;
  link.target='_blank';link.rel='noopener noreferrer';
  if(!src){area.append(el('p','preview-note',a.linkState==='incomplete'?'ลิงก์ต้นทางไม่สมบูรณ์ จึงไม่สามารถฝังโพสต์นี้ได้':'ไม่รองรับการฝังลิงก์นี้'),link);return}
  area.classList.add(a.type==='youtube'?'youtube':a.type==='video'?'fb-video':'fb-post');
  const frame=document.createElement('iframe');
  frame.src=src;frame.loading='lazy';frame.title='โพสต์ต้นฉบับ: '+a.title;
  frame.setAttribute('allowfullscreen','');
  frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
  frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-forms');
  if(a.type==='youtube')frame.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  const note=a.linkState==='reconstructed'?'⚠ URL กู้คืนจากลิงก์ที่ถูกตัด อาจฝังไม่ได้':'หากโพสต์ไม่ปรากฏ อาจเป็นข้อจำกัดของ Facebook/YouTube หรือการตั้งค่าความเป็นส่วนตัว';
  area.append(frame,link,el('p','preview-note',note));
 }
 function loadEmbed(){if(state.selected)mountEmbed($('preview'),state.selected)}
 function openReader(a){state.selected=a;$('readerTitle').textContent=a.title;$('readerCategory').textContent=catName(a.category)+' · '+(a.type==='youtube'?'YouTube':a.type==='video'?'วิดีโอ':'Facebook');$('readerPosition').textContent='#'+a.sourceOrder;$('originalLink').href=a.linkState==='incomplete'?'https://www.facebook.com/100699831731227/':a.url;$('originalLink').textContent=a.linkState==='incomplete'?'↗ เปิดหน้าเพจเพื่อค้นหา':'↗ เปิดบทความต้นฉบับ';const w=$('urlWarning');w.style.display=a.linkState==='original'?'none':'block';w.textContent=a.linkState==='reconstructed'?'⚠ ลิงก์ในรายการเดิมถูกตัด จึงสร้าง URL จากรหัสรูป/โพสต์ที่ปรากฏ ยังไม่ได้ยืนยันว่าเปิดได้':'⚠ ลิงก์ต้นทางไม่สมบูรณ์ และไม่มีรหัสที่ยืนยันปลายทางได้';$('myNote').value=notes[a.id]||'';$('noteStatus').textContent='บันทึกอัตโนมัติในเครื่อง';syncReaderButtons();$('reader').classList.add('open');$('backdrop').classList.add('open');$('reader').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('closeReader').focus();loadEmbed();history.replaceState(null,'','#article='+encodeURIComponent(a.id))}
 function closeReader(){if(!state.selected)return;if(noteTimer){clearTimeout(noteTimer);noteTimer=null}const a=state.selected;notes[a.id]=$('myNote').value;safeSet('bungboy-notes-v1',JSON.stringify(notes));state.selected=null;$('reader').classList.remove('open');$('backdrop').classList.remove('open');$('reader').setAttribute('aria-hidden','true');document.body.style.overflow='';history.replaceState(null,'',location.pathname+location.search)}

 function exportProgress(){
  const backup={version:1,exportedAt:new Date().toISOString(),saved,read,notes};
  const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='bungboy-reading-backup-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 async function importProgress(event){
  const file=event.target.files?.[0];if(!file)return;
  try{
   if(file.size>2000000)throw Error('ไฟล์มีขนาดเกิน 2 MB');
   const data=JSON.parse(await file.text());
   if(!data||data.version!==1||!['saved','read','notes'].every(k=>data[k]&&typeof data[k]==='object'&&!Array.isArray(data[k])))throw Error('รูปแบบไฟล์ไม่ถูกต้อง');
   if(!window.confirm('นำเข้าข้อมูลจะเขียนทับบุ๊กมาร์ก สถานะอ่านแล้ว และบันทึกเดิมในเบราว์เซอร์นี้ ต้องการดำเนินการหรือไม่?'))return;
   const ids=new Set(items.map(a=>a.id));
   const fields=[['saved','bungboy-fav-v1'],['read','bungboy-read-v1'],['notes','bungboy-notes-v1']];
   for(const [key,storageKey] of fields){
    const clean={};for(const [id,value] of Object.entries(data[key])){
     if(!ids.has(id))continue;
     if(key==='notes'&&typeof value==='string')clean[id]=value.slice(0,20000);
     else if(key!=='notes'&&value===true)clean[id]=true;
    }
    safeSet(storageKey,JSON.stringify(clean));
   }
   window.location.reload();
  }catch(error){window.alert('นำเข้าไม่สำเร็จ: '+error.message)}
  finally{event.target.value=''}
 }
 function run(){document.documentElement.dataset.theme=safeGet('bungboy-theme-v1',matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');let fontsize=Number(safeGet('bungboy-font-v1','16'));if(!Number.isFinite(fontsize)||fontsize<16||fontsize>22)fontsize=16;document.documentElement.style.setProperty('--fs',fontsize+'px');
 $('search').oninput=e=>{state.query=e.target.value;state.visible=pageSize();render()};$('sort').onchange=e=>{state.sort=e.target.value;render()};document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;state.visible=pageSize();state.route=false;render()});$('clearFilters').onclick=()=>{state.category='all';state.filter='all';state.query='';state.sort='original';state.route=false;$('search').value='';$('sort').value='original';resetScroll();render()};
 $('themeBtn').onclick=()=>{const v=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=v;safeSet('bungboy-theme-v1',v)};
 $('fontBtn').onclick=()=>{fontsize=fontsize>=22?16:fontsize+2;document.documentElement.style.setProperty('--fs',fontsize+'px');safeSet('bungboy-font-v1',String(fontsize));$('fontBtn').title='ขนาดตัวอักษร '+fontsize+'px'};
 $('startRoute').onclick=()=>{state.category='all';state.filter='all';state.query='';state.route=true;state.visible=pageSize();$('search').value='';resetScroll();render()};$('showSaved').onclick=()=>{state.category='all';state.filter='saved';state.route=false;resetScroll();render()};
 $('closeReader').onclick=closeReader;$('backdrop').onclick=closeReader;document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.selected)closeReader();if(e.key==='/'&&!state.selected&&document.activeElement?.tagName!=='INPUT'){e.preventDefault();$('search').focus()}});
 $('saveReader').onclick=()=>{if(!state.selected)return;toggleSaved(state.selected);render()};$('markRead').onclick=()=>{if(state.selected)toggleRead(state.selected)};
 $('copyLink').onclick=async()=>{const a=state.selected;if(!a)return;const s=a.url;try{await navigator.clipboard.writeText(s);$('copyLink').textContent='✓ คัดลอกแล้ว'}catch{$('copyLink').textContent='คัดลอกไม่ได้ กรุณาเปิดต้นฉบับ'}setTimeout(()=>{$('copyLink').textContent='คัดลอกลิงก์'},2000)};
 const setView=mode=>{if(state.view===mode)return;state.view=mode;safeSet('bungboy-view-v1',mode);state.visible=pageSize();render()};
 $('viewEmbed').onclick=()=>setView('embed');$('viewList').onclick=()=>setView('list');
 $('exportProgress').onclick=exportProgress;$('importProgress').onclick=()=>$('progressFile').click();$('progressFile').onchange=importProgress;
 $('myNote').oninput=()=>{if(!state.selected)return;const id=state.selected.id,val=$('myNote').value;$('noteStatus').textContent='กำลังบันทึก...';if(noteTimer)clearTimeout(noteTimer);noteTimer=setTimeout(()=>{notes[id]=val;safeSet('bungboy-notes-v1',JSON.stringify(notes));$('noteStatus').textContent='✓ บันทึกในเบราว์เซอร์แล้ว'},350)};
 render();const frag=location.hash.match(/article=([^&]+)/);if(frag){try{const id=decodeURIComponent(frag[1]);const a=items.find(x=>x.id===id);if(a)openReader(a)}catch{}}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();