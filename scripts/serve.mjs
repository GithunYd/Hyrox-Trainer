import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('docs');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png'};
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  let p=decodeURIComponent(url.pathname).replace(/^\/Hyrox-Trainer(?=\/|$)/,'');
  if(p==='/'||p==='')p='/index.html';
  const file=path.resolve(root,'.'+p);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);});
}).listen(4173,'127.0.0.1',()=>console.log('Preview: http://127.0.0.1:4173/Hyrox-Trainer/'));
