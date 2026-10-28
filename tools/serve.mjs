import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('showcase');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const target=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!target.startsWith(root+sep)||!types[extname(target)]){res.writeHead(404);res.end();return;}const data=await readFile(target);res.writeHead(200,{'Content-Type':types[extname(target)],'Cache-Control':'no-store'});res.end(data);}catch{res.writeHead(404);res.end();}}).listen(8080,'127.0.0.1',()=>console.log('Diatonic OS showcase: http://127.0.0.1:8080'));
