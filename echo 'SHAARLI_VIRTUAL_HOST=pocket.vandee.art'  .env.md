```
echo 'SHAARLI_VIRTUAL_HOST=pocket.vandee.art' > .env
```

```
echo 'SHAARLI_LETSENCRYPT_EMAIL=vandee@vandee.art' >> .env
```

```
server {

  listen 80;

  server_name 142.171.224.126;

location / {

    proxy_pass http://127.0.0.1:4000;
    proxy_http_version  1.1;
    proxy_set_header    Connection              "";
    proxy_set_header    Host                    $http_host;
    proxy_set_header    X-Forwarded-Proto       $scheme;
    proxy_set_header    X-Real-IP               $remote_addr;
    proxy_set_header    X-Forwarded-For         $proxy_add_x_forwarded_for;
    proxy_set_header    Accept-Encoding gzip;

    proxy_buffering off;
    proxy_cache off;

    send_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    proxy_read_timeout 300;
  }

}

```

sudo vim /etc/nginx/sites-available/rss.conf

sudo vim /etc/nginx/sites-available/memos

sudo ln -s /etc/nginx/sites-available/shaarli /etc/nginx/sites-enabled/

sudo ln -s /etc/nginx/sites-available/memos /etc/nginx/sites-enabled/

sudo rm /etc/nginx/sites-enabled/rss.conf



```
http {
    [...]

    index index.html index.php;

    root        /home/john/web;
    access_log  /var/log/nginx/access.log combined;
    error_log   /var/log/nginx/error.log;

    server {
        listen       80;
        server_name  pocket.vandee.art;
        # redirect HTTP to HTTPS
        return       301 https://pocket.vandee.art$request_uri;
    }

}
```

```
sudo chown -R root:www-data /var/www/pocket.vandee.art
sudo chmod -R g+rX /var/www/pocket.vandee.art
sudo chmod -R g+rwX /var/www/pocket.vandee.art/{cache/,data/,pagecache/,tmp/}
```

```shell
curl http://fun.vandee.art:5230/api/v1/memos \
   -H "Accept: application/json" \
   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6InYxIiwidHlwIjoiSldUIn0.eyJuYW1lIjoiVmFuZGVlIiwiaXNzIjoibWVtb3MiLCJzdWIiOiIxIiwiYXVkIjpbInVzZXIuYWNjZXNzLXRva2VuIl0sImV4cCI6MTczMDYzMjgwOCwiaWF0IjoxNzMwMDI4MDA4fQ.gOjH-LSdBZ6CtvZ8ymiCoNR2b5M_ybkAghtFsM-xijY"
```





curl https://get.acme.sh | sh -s email=vandeensnw@gmail.com



acme.sh --issue --dns -d fun.vandee.art \  --yes-I-know-dns-manual-mode-enough-go-ahead-please

```
acme.sh --issue --dns -d fun.vandee.art \
 --yes-I-know-dns-manual-mode-enough-go-ahead-please

```

```
acme.sh --install-cert -d pocket.vandee.art \
--key-file       /home/vandee/ssl/key.pem  \
--fullchain-file /home/vandee/ssl/cert.pem \
--reloadcmd     "service nginx force-reload"
```

```
acme.sh --install-cert -d fun.vandee.art \
 --key-file       ~/ssl/key.pem  \
 --fullchain-file ~/ssl/cert.pem \
 --reloadcmd     "service nginx force-reload"
```

```
acme.sh --renew -d pocket.vandee.art \
   --yes-I-know-dns-manual-mode-enough-go-ahead-please
```

```
acme.sh --issue --dns -d pocket.vandee.art \
 --yes-I-know-dns-manual-mode-enough-go-ahead-please
```

curl https://get.acme.sh | sh -s email=my@example.com

```
curl https://get.acme.sh | sh -s email=vandeensnw@gmail.com
```

```
server {

  listen 80;
  server_name memo.vandee.art;

  # 在这里重定向HTTP到HTTPS
  return 301 https://$host$request_uri;

}

server {
  listen 443 ssl;
  server_name memo.vandee.art;

  ssl_certificate /home/vandee/ssl/fullchain.pem;  # 替换为你的证书路径
  ssl_certificate_key /home/vandee/ssl/privkey.pem;  # 替换为你的私钥路径

  location / {
    proxy_pass http://127.0.0.1:5230;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Accept-Encoding gzip;

    proxy_buffering off;
    proxy_cache off;

    send_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;
    proxy_read_timeout 300;
  }
}
```

sudo systemctl restart nginx

sudo vim /etc/nginx/sites-available/memos

sudo nginx -t
