import crypto from "node:crypto";
import { startRun,finishRun } from "./db.js";
import { assessRisk } from "./risk.js";

function normalize(item){
 const price=Number(item.price);
 const checked_at=new Date().toISOString();
 const canonical={title:String(item.title||"Oferta sin título").slice(0,180),category:String(item.category||"Vuelos"),origin:String(item.origin||""),destination:String(item.destination||""),price,currency:String(item.currency||"EUR").toUpperCase(),per_person:item.per_person===false?0:1,source:String(item.source||"Proveedor conectado"),seller_name:String(item.seller_name||""),seller_domain:String(item.seller_domain||""),booking_url:String(item.booking_url||""),departure_date:item.departure_date||"",return_date:item.return_date||"",checked_at};
 const id=String(item.id||crypto.createHash("sha256").update(JSON.stringify([canonical.title,canonical.booking_url,canonical.departure_date])).digest("hex"));
 const risk=assessRisk(canonical);
 return {...canonical,...risk,id,raw_json:JSON.stringify(item)};
}

// Travelpayouts Aviasales Data API: prices are cached historical observations,
// not a live inventory or a guaranteed bookable fare.
async function fetchTravelpayouts(){
 const token=process.env.TRAVELPAYOUTS_TOKEN;
 if(!token) return {name:"travelpayouts-aviasales",offers:[],configured:false};
 const params=new URLSearchParams({currency:"eur",period_type:"year",page:"1",limit:String(Math.min(100,Math.max(1,Number(process.env.TRAVELPAYOUTS_LIMIT||100)))),show_to_affiliates:"true",sorting:"price",trip_class:"0",origin:process.env.TRAVELPAYOUTS_ORIGIN||"ES",market:process.env.TRAVELPAYOUTS_MARKET||"es"});
 const response=await fetch(`https://api.travelpayouts.com/v2/prices/latest?${params}`,{headers:{Accept:"application/json","X-Access-Token":token},signal:AbortSignal.timeout(25000)});
 if(!response.ok) throw new Error(`Travelpayouts HTTP ${response.status}`);
 const payload=await response.json();
 if(payload.success===false) throw new Error(String(payload.error||"Travelpayouts devolvió un error"));
 const rows=Array.isArray(payload.data)?payload.data:[];
 const offers=rows.map((row)=>{
   const from=String(row.origin||row.origin_iata||"").toUpperCase();
   const to=String(row.destination||row.destination_iata||row.destination_city||"").toUpperCase();
   const depart=String(row.depart_date||row.departure_at||"").slice(0,10);
   const back=String(row.return_date||row.return_at||"").slice(0,10);
   const amount=Number(row.value??row.price);
   const flightDate=depart?new Date(`${depart}T00:00:00Z`).toLocaleDateString("es-ES",{day:"2-digit",month:"short",year:"numeric",timeZone:"UTC"}):"fecha flexible";
   return {id:`aviasales-${from}-${to}-${depart}-${back}-${amount}`,title:`Vuelo ${from||"España"} → ${to||"destino"} · ${flightDate}`,category:"Vuelos",origin:from,destination:to,price:amount,currency:"EUR",per_person:true,source:"Aviasales · Travelpayouts (precio en caché)",seller_name:"Consulta de precio Aviasales",seller_domain:"aviasales.com",booking_url:"https://www.aviasales.com/",departure_date:depart,return_date:back,price_found_at:row.found_at||null,price_is_current:row.actual===true,stops:Number(row.number_of_changes??0)};
 }).filter(x=>Number.isFinite(x.price)&&x.price>0&&x.price<=300&&x.price_is_current);
 return {name:"travelpayouts-aviasales",offers,configured:true};
}

async function fetchGenericPartner(){
 const endpoint=process.env.TRAVEL_PROVIDER_URL;
 if(!endpoint) return {name:"partner-api",offers:[],configured:false};
 const headers={"Accept":"application/json"};
 if(process.env.TRAVEL_PROVIDER_TOKEN) headers.Authorization=`Bearer ${process.env.TRAVEL_PROVIDER_TOKEN}`;
 const response=await fetch(endpoint,{headers,signal:AbortSignal.timeout(20000)});
 if(!response.ok) throw new Error(`Proveedor HTTP ${response.status}`);
 const data=await response.json();
 return {name:"partner-api",offers:Array.isArray(data.offers)?data.offers:[],configured:true};
}

export async function scanAllProviders(){
 const runId=startRun();let providers=0,normalized=[];
 try{
   const sources=[];
   if(process.env.TRAVELPAYOUTS_TOKEN) sources.push(await fetchTravelpayouts());
   if(process.env.TRAVEL_PROVIDER_URL) sources.push(await fetchGenericPartner());
   providers=sources.filter(s=>s.configured).length;
   normalized=sources.flatMap(s=>s.offers).map(normalize).filter(o=>o.price>0&&o.currency==="EUR"&&o.price<=300);
   finishRun(runId,{status:"completed",providers,offers:normalized.length});
   return {providers_checked:providers,offers:normalized};
 }catch(error){
   finishRun(runId,{status:"failed",providers,offers:0,error:String(error.message||error).slice(0,300)});
   throw error;
 }
}
