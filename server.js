import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getOffers, getScanStatus, saveOffers } from "./src/db.js";
import { scanAllProviders } from "./src/scanner.js";
import { startScheduler } from "./src/scheduler.js";
import { validateFilters } from "./src/validation.js";

const app=express();
const __dirname=path.dirname(fileURLToPath(import.meta.url));
app.use(express.json({limit:"100kb"}));
app.use(express.static(__dirname));
app.get("/api/health",(req,res)=>res.json({status:"ok",engine:"viajando-soy-feliz",providerCount:Number(Boolean(process.env.TRAVELPAYOUTS_TOKEN))+Number(Boolean(process.env.TRAVEL_PROVIDER_URL))}));
app.get("/api/offers",(req,res)=>{
  const filters=validateFilters(req.query.filters ? JSON.parse(req.query.filters) : {});
  res.json({offers:getOffers(filters),scan:getScanStatus()});
});
app.get("/api/scan/status",(req,res)=>res.json(getScanStatus()));
app.post("/api/scan/run",async(req,res)=>{
 const token = process.env.ADMIN_SCAN_TOKEN;
if (!token) return res.status(503).json({ error: "scan_disabled" });
if (req.get("x-admin-token") !== token) return res.status(401).json({ error: "unauthorized" });  req.get("x-admin-token")!==process.env.ADMIN_SCAN_TOKEN) return res.status(401).json({error:"unauthorized"});
  try { const result=await scanAllProviders(); saveOffers(result.offers); res.json({ok:true,...result,scan:getScanStatus()}); }
  catch(e){res.status(500).json({ok:false,error:"scan_failed"});}
});
const port=process.env.PORT||3000;
startScheduler();
app.listen(port,()=>console.log(`Viajando soy Feliz en http://localhost:${port}`));
