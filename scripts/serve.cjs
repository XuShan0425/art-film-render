const http=require("http"),fs=require("fs");
http.createServer((q,s)=>{const p="public"+(q.url==="/"?"/blank.html":q.url);fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);s.end();return}s.writeHead(200,{"content-type":p.endsWith(".html")?"text/html":"text/plain"});s.end(d)})}).listen(3999);
