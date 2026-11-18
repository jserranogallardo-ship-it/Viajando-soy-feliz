import cron from "node-cron";
import { scanAllProviders } from "./scanner.js";
import { saveOffers } from "./db.js";
export function startScheduler(){
 if(process.env.DISABLE_SCHEDULER==="1") return;
 cron.schedule("0 5 * * *",async()=>{
   try{const result=await scanAllProviders();saveOffers(result.offers);console.log(`Escaneo diario: ${result.offers.length} ofertas válidas`);}
   catch(e){console.error("Fallo en escaneo diario:",e.message);}
 },{timezone:"Europe/Madrid"});
}
