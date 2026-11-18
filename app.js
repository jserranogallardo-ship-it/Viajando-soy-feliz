const toast = (message) => { const el=document.getElementById("toast"); el.textContent=message; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),3200); };
const form=document.getElementById("search-form");
form.addEventListener("submit", async (event)=>{
  event.preventDefault();
  const categories=[...document.querySelectorAll('.check input:checked')].map(x=>x.value);
  const filters={origin:document.getElementById("origin").value,destination:document.getElementById("destination").value.trim(),dates:document.getElementById("dates").value,budget:Number(document.getElementById("budget").value),categories};
  if(!categories.length){toast("Selecciona al menos una categoría.");return;}
  if(!filters.budget || filters.budget<1 || filters.budget>300){toast("El presupuesto inicial debe estar entre 1 y 300 €.");return;}
  localStorage.setItem("viajesIA.filters",JSON.stringify(filters));
  try{
    const response=await fetch("/api/offers?"+new URLSearchParams({filters:JSON.stringify(filters)}));
    if(!response.ok) throw new Error("API no disponible");
    const data=await response.json();
    renderOffers(data.offers||[]);
  }catch(e){toast("Buscador guardado. El motor de ofertas reales todavía no está conectado.");}
});
function renderOffers(offers){
 const list=document.getElementById("results-list");
 if(!offers.length){list.className="empty-state";list.innerHTML='<div class="empty-icon">⌕</div><h3>No hay ofertas verificadas para estos filtros</h3><p>Seguiremos mostrando únicamente resultados recibidos de fuentes conectadas y con precio comprobable.</p>';return;}
 list.className="offer-list";list.innerHTML="";
 offers.forEach(o=>{const card=document.createElement("article");card.className="offer-card";card.innerHTML=`<div><b>${escapeHtml(o.title||"Viaje")}</b><p>${escapeHtml([o.origin,o.destination].filter(Boolean).join(" → ")||"Ruta por confirmar")} · ${escapeHtml(o.source||"Fuente")}</p><small>${o.departure_date?"Salida: "+escapeHtml(o.departure_date):"Fecha por confirmar"} · Precio de referencia; confirma disponibilidad antes de reservar</small></div><strong>${Number(o.price).toFixed(0)} €</strong><span>${escapeHtml(o.risk_level||"Revisión pendiente")}</span>${o.booking_url?`<a href="${escapeHtml(o.booking_url)}" target="_blank" rel="noopener noreferrer">Consultar en proveedor</a>`:""}`;list.appendChild(card);});
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
document.getElementById("notify-btn").addEventListener("click",async()=>{
 if(!("Notification" in window)){toast("Este navegador no admite notificaciones.");return;}
 const permission=await Notification.requestPermission();
 if(permission==="granted"){new Notification("Viajando soy Feliz",{body:"Avisos activados en este dispositivo cuando el motor esté conectado."});toast("Permiso de notificaciones concedido.");}
 else toast("No se han concedido permisos de notificación.");
});
if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("/sw.js").catch(()=>{});
const saved=localStorage.getItem("viajesIA.filters");
if(saved){try{const f=JSON.parse(saved);document.getElementById("origin").value=f.origin;document.getElementById("destination").value=f.destination;document.getElementById("dates").value=f.dates;document.getElementById("budget").value=f.budget;document.querySelectorAll(".check input").forEach(x=>x.checked=f.categories.includes(x.value));}catch(e){}}
