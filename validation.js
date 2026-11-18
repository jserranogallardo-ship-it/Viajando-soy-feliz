const allowed=["Vuelos","Hoteles y apartamentos","Vuelo + hotel","Cruceros","Escapadas y viajes organizados"];
export function validateFilters(f={}){
 const budget=Math.min(300,Math.max(1,Number(f.budget)||300));
 return {budget,origin:String(f.origin||"Cualquier aeropuerto de España").slice(0,100),destination:String(f.destination||"").slice(0,100),categories:Array.isArray(f.categories)?f.categories.filter(x=>allowed.includes(x)):allowed,dates:String(f.dates||"flexible").slice(0,30)};
}
