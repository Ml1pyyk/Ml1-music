const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }
const translations = {
 ru:{welcome:"ТВОЯ МУЗЫКА",listen:"Слушай своё.",heroTitle:"Твоя библиотека<br>в одном месте",heroText:"Сохраняй любимое и собирай плейлисты.",quickAccess:"Быстрый доступ",liked:"Любимые",yourFiles:"Твои файлы",recent:"Недавно добавленные",emptyTracks:"Добавь свои аудиофайлы или подключи музыкальный каталог.",discover:"ОТКРЫВАЙ НОВОЕ",search:"Поиск",searchPlaceholder:"Песни, исполнители...",searchHint:"Поиск по твоим добавленным трекам. Глобальный каталог подключается отдельно.",yourCollection:"ТВОЯ КОЛЛЕКЦИЯ",library:"Медиатека",playlists:"Плейлисты",createPlaylist:"Создать плейлист",personalize:"ПОД СЕБЯ",settings:"Настройки",language:"Язык",appearance:"Оформление",black:"Чёрная",white:"Белая",aboutText:"Твои плейлисты и лайки сохраняются на этом устройстве.",home:"Главная",newPlaylist:"Новый плейлист",cancel:"Отмена",create:"Создать",settingsMoved:"Настройки доступны во вкладке «Настройки».",noPlaylists:"Пока нет плейлистов.",noLiked:"Пока нет любимых песен.",noFiles:"Ты ещё не добавил аудиофайлы.",addFiles:"Добавить аудиофайлы",remove:"Удалить",play:"Воспроизвести",emptySearch:"Ничего не найдено."},
 en:{welcome:"YOUR MUSIC",listen:"Listen your way.",heroTitle:"Your library<br>in one place",heroText:"Save favourites and build your playlists.",quickAccess:"Quick access",liked:"Liked songs",yourFiles:"Your files",recent:"Recently added",emptyTracks:"Add audio files or connect a music catalogue.",discover:"DISCOVER SOMETHING NEW",search:"Search",searchPlaceholder:"Songs, artists...",searchHint:"Search your added tracks. A global catalogue can be connected separately.",yourCollection:"YOUR COLLECTION",library:"Library",playlists:"Playlists",createPlaylist:"Create playlist",personalize:"MAKE IT YOURS",settings:"Settings",language:"Language",appearance:"Appearance",black:"Dark",white:"Light",aboutText:"Your playlists and likes are saved on this device.",home:"Home",newPlaylist:"New playlist",cancel:"Cancel",create:"Create",settingsMoved:"Settings are available in the Settings tab.",noPlaylists:"No playlists yet.",noLiked:"No liked songs yet.",noFiles:"You haven't added audio files yet.",addFiles:"Add audio files",remove:"Delete",play:"Play",emptySearch:"Nothing found."}
};
let state = JSON.parse(localStorage.getItem("ml1-state") || '{"tracks":[],"liked":[],"playlists":[],"lang":"ru","theme":"dark"}');
let currentTab = "playlists", currentTrack = null;
const save = () => localStorage.setItem("ml1-state", JSON.stringify(state));
const t = key => translations[state.lang][key] || key;
function applySettings(){
 document.documentElement.lang=state.lang; document.body.classList.toggle("light",state.theme==="light");
 $$("[data-i18n]").forEach(el=>{const v=t(el.dataset.i18n); if(v.includes("<br>"))el.innerHTML=v;else el.textContent=v;});
 $$("[data-i18n-placeholder]").forEach(el=>el.placeholder=t(el.dataset.i18nPlaceholder));
 $$("[data-lang]").forEach(b=>b.classList.toggle("selected",b.dataset.lang===state.lang));
 $$("[data-theme]").forEach(b=>b.classList.toggle("selected",b.dataset.theme===state.theme));
 renderAll();
}
function go(page){
 $$(".page").forEach(p=>p.classList.toggle("active",p.id===page+"Page"));
 $$(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.page===page));
 if(page==="settings") $("#settingsPage").classList.add("active");
}
$$(".nav-item").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
$("#settingsBtn").addEventListener("click",()=>go("settings"));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
$("#uploadShortcut").addEventListener("click",()=>$("#fileInput").click());
$$("[data-lang]").forEach(b=>b.addEventListener("click",()=>{state.lang=b.dataset.lang;save();applySettings();}));
$$("[data-theme]").forEach(b=>b.addEventListener("click",()=>{state.theme=b.dataset.theme;save();applySettings();}));
function addFiles(files){
 [...files].filter(f=>f.type.startsWith("audio/")).forEach(file=>{
   const id=crypto.randomUUID(); const url=URL.createObjectURL(file);
   state.tracks.unshift({id,title:file.name.replace(/\.[^.]+$/,""),artist:"Local audio",url,local:true});
 });
 save();renderAll();
}
$("#fileInput").addEventListener("change",e=>addFiles(e.target.files));
function trackRow(track){
 const liked=state.liked.includes(track.id);
 return `<div class="track"><div class="track-art">♪</div><div class="track-info"><b>${esc(track.title)}</b><small>${esc(track.artist||"Unknown artist")}</small></div><div class="track-actions"><button class="${liked?"liked":""}" data-like="${track.id}">${liked?"♥":"♡"}</button><button data-play="${track.id}">▶</button></div></div>`;
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function bindTrackButtons(){
 $$("[data-like]").forEach(b=>b.onclick=()=>{const id=b.dataset.like;state.liked=state.liked.includes(id)?state.liked.filter(x=>x!==id):[...state.liked,id];save();renderAll();});
 $$("[data-play]").forEach(b=>b.onclick=()=>playTrack(b.dataset.play));
}
function playTrack(id){
 const track=state.tracks.find(x=>x.id===id);if(!track)return;
 if(!track.url){alert("Для этого трека пока нет аудиофайла.");return;}
 currentTrack=id;$("#audio").src=track.url;$("#audio").play().catch(()=>{});$("#nowTitle").textContent=track.title;$("#nowArtist").textContent=track.artist||"";
 $("#playPause").textContent="Ⅱ";
}
$("#playPause").onclick=()=>{const a=$("#audio");if(!a.src)return;if(a.paused){a.play();$("#playPause").textContent="Ⅱ";}else{a.pause();$("#playPause").textContent="▶";}};
$("#audio").addEventListener("ended",()=>$("#playPause").textContent="▶");
function renderLibrary(){
 const host=$("#libraryContent");let html="";
 if(currentTab==="liked"){
  const arr=state.tracks.filter(x=>state.liked.includes(x.id));
  html=arr.length?arr.map(trackRow).join():`<div class="empty-state">${t("noLiked")}</div>`;
 }else if(currentTab==="files"){
  html=state.tracks.length?state.tracks.map(trackRow).join():`<div class="empty-state">${t("noFiles")}</div>`;
  html+=`<button class="primary-btn" id="addFilesBtn">${t("addFiles")}</button>`;
 }else{
  html=state.playlists.length?state.playlists.map(p=>`<div class="playlist-row"><b>♫　${esc(p.name)}</b><button data-delete-playlist="${p.id}">⋯</button></div>`).join():`<div class="empty-state">${t("noPlaylists")}</div>`;
 }
 host.innerHTML=html;bindTrackButtons();
 $("#addFilesBtn")?.addEventListener("click",()=>$("#fileInput").click());
 $$("[data-delete-playlist]").forEach(b=>b.onclick=()=>{if(confirm(t("remove")+"?")){state.playlists=state.playlists.filter(p=>p.id!==b.dataset.deletePlaylist);save();renderLibrary();}});
}
$$("[data-tab]").forEach(b=>b.addEventListener("click",()=>{currentTab=b.dataset.tab;$$("[data-tab]").forEach(x=>x.classList.toggle("active",x===b));renderLibrary();}));
$("#createPlaylist").onclick=()=>{$("#playlistName").value="";$("#playlistDialog").showModal();};
$("#savePlaylist").onclick=e=>{e.preventDefault();const name=$("#playlistName").value.trim();if(!name)return;state.playlists.push({id:crypto.randomUUID(),name,trackIds:[]});save();$("#playlistDialog").close();renderLibrary();};
$("#searchInput").addEventListener("input",e=>{
 const q=e.target.value.toLowerCase().trim();const arr=state.tracks.filter(x=>(x.title+" "+x.artist).toLowerCase().includes(q));
 $("#searchResults").innerHTML=q?(arr.length?arr.map(trackRow).join():`<div class="empty-state">${t("emptySearch")}</div>`):"";
 bindTrackButtons();
});
function renderAll(){
 $("#homeTracks").innerHTML=state.tracks.length?state.tracks.slice(0,5).map(trackRow).join():(`<div class="empty-state">${t("emptyTracks")}</div>`);
 bindTrackButtons();renderLibrary();
}
applySettings();
