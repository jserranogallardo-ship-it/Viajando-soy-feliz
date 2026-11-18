import { domainToASCII } from "node:url";
const knownBadPatterns=[/free-?travel/i,/claim-prize/i,/cheap-ticket-now/i];
const disposableMail=["mailinator.com","tempmail.com","10minutemail.com"];
export function assessRisk(offer){
 const reasons=[]; let score=0;
 let hostname="";
 try{hostname=new URL(offer.booking_url).hostname.toLowerCase();}catch{score+=45;reasons.push("Enlace de compra ausente o inválido");}
 if(hostname){
   if(!offer.booking_url.startsWith("https://")){score+=25;reasons.push("El enlace no usa HTTPS");}
   if(knownBadPatterns.some(p=>p.test(hostname))){score+=40;reasons.push("Dominio con patrón sospechoso");}
   if(hostname.split(".").length<2 || hostname.length<5){score+=15;reasons.push("Dominio poco consistente");}
   if(domainToASCII(hostname)!==hostname){score+=10;reasons.push("Dominio internacionalizado: revisar posibles caracteres parecidos");}
 }
 if(!offer.seller_name){score+=15;reasons.push("No consta identidad del vendedor");}
 if(!offer.source){score+=10;reasons.push("No consta fuente de datos");}
 if(!Number.isFinite(Number(offer.price))||Number(offer.price)<=0){score+=50;reasons.push("Precio no válido");}
 if(!offer.checked_at){score+=10;reasons.push("No consta fecha de comprobación");}
 score=Math.min(100,score);
 return {risk_score:score,risk_level:score>=60?"alto":score>=30?"medio":"bajo",risk_reasons:JSON.stringify(reasons)};
}
