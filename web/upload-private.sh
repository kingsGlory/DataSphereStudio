#!/bin/sh
npm run build:private
cd dist
tar -zcvf dss-web.tar.gz ./dist

PUTFILE=dss-web.tar.gz
ftp -n<<!
open  10.37.31.31 21
user  wangmin 9PKmMwVbRya
binary
cd luxl
lcd ./
prompt
put $PUTFILE
bye
!
echo "commit to ftp successfully"