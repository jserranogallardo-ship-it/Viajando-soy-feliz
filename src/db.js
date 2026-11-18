import Database from "better-sqlite3";
const db=new Database(process.env.DB_PATH||"viajes-ia.sqlite");
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS offers(
 id TEXT PRIMARY KEY, title TEXT NOT NULL, category TEXT, origin TEXT, destination TEXT,
 price REAL NOT NULL, currency TEXT DEFAULT 'EUR', per_person INTEGER DEFAULT 1,
 source TEXT, seller_name TEXT, seller_domain TEXT, booking_url TEXT,
 departure_date TEXT, return_date TEXT, checked_at TEXT, risk_score INTEGER,
 risk_level TEXT, risk_reasons TEXT, raw_json TEXT
);
CREATE TABLE IF NOT EXISTS price_history(
 id INTEGER PRIMARY KEY AUTOINCREMENT, offer_id TEXT NOT NULL, price REAL NOT NULL,
 currency TEXT NOT NULL, observed_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS scan_runs(
 id INTEGER PRIMARY KEY AUTOINCREMENT, started_at TEXT NOT NULL, finished_at TEXT,
 status TEXT NOT NULL, providers_checked INTEGER DEFAULT 0, offers_found INTEGER DEFAULT 0,
 error_summary TEXT
);
`);
const insertOffer=db.prepare(`INSERT INTO offers(id,title,category,origin,destination,price,currency,per_person,source,seller_name,seller_domain,booking_url,departure_date,return_date,checked_at,risk_score,risk_level,risk_reasons,raw_json)
VALUES(@id,@title,@category,@origin,@destination,@price,@currency,@per_person,@source,@seller_name,@seller_domain,@booking_url,@departure_date,@return_date,@checked_at,@risk_score,@risk_level,@risk_reasons,@raw_json)
ON CONFLICT(id) DO UPDATE SET title=excluded.title,price=excluded.price,checked_at=excluded.checked_at,risk_score=excluded.risk_score,risk_level=excluded.risk_level,risk_reasons=excluded.risk_reasons,raw_json=excluded.raw_json`);
const insertHistory=db.prepare("INSERT INTO price_history(offer_id,price,currency,observed_at) VALUES(?,?,?,?)");
export function startRun(){const info=db.prepare("INSERT INTO scan_runs(started_at,status) VALUES(?,?)").run(new Date().toISOString(),"running");return info.lastInsertRowid;}
export function finishRun(id,{status="completed",providers=0,offers=0,error=""}={}){db.prepare("UPDATE scan_runs SET finished_at=?,status=?,providers_checked=?,offers_found=?,error_summary=? WHERE id=?").run(new Date().toISOString(),status,providers,offers,error,id);}
export function saveOffers(offers=[]){
 const tx=db.transaction(items=>{for(const o of items){insertOffer.run(o);insertHistory.run(o.id,o.price,o.currency,o.checked_at);}});
 tx(offers);
}
export function getOffers(filters={}){
 let rows=db.prepare("SELECT * FROM offers let rows = db.prepare("SELECT * FROM offers ORDER BY checked_at DESC").all();
 if(filters.budget) rows=rows.filter(x=>x.price<=filters.budget);
 if(filters.categories?.length) rows=rows.filter(x=>filters.categories.includes(x.category));
 if(filters.destination) rows=rows.filter(x=>(x.destination||"").toLowerCase().includes(filters.destination.toLowerCase()));
 if(filters.origin && filters.origin!=="Cualquier aeropuerto de España") rows=rows.filter(x=>(x.origin||"").includes(filters.origin));
 if (["next30", "weekend", "summer"].includes(filters.dates)) {
  const today = new Date().toISOString().slice(0, 10);
  const cutoff = new Date(Date.parse(today) + 30 * 86400000)
    .toISOString().slice(0, 10);

  rows = rows.filter(({ departure_date: departure }) => {
    if (!departure || departure < today) return false;
    if (filters.dates === "next30") return departure < cutoff;
    if (filters.dates === "summer") {
      return ["06", "07", "08"].includes(departure.slice(5, 7));
    }
    const day = new Date(departure).getUTCDay();
    return day === 0 || day === 6;
  });
}
 return rows.map(x=>({...x,risk_reasons:JSON.parse(x.risk_reasons||"[]"),raw_json:undefined}));
}
export function getScanStatus(){return db.prepare("SELECT * FROM scan_runs ORDER BY id DESC LIMIT 1").get()||{status:"not_started"};}
