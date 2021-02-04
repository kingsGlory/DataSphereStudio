printf "请输入(0:公有云测试环境, 1:公有云生产环境, 2:私有化环境)："
read num

uploadFtp(){
ftp -n<<!
open  10.37.31.31 21
user  wangmin 9PKmMwVbRya
binary
cd luxl
put $1
close
bye
!
}

case $num in
    0)
      npm run build:test
      cd dist
      tar -zcvf dss-web.tar.gz ./dist
      uploadFtp dss-web.tar.gz
      ;;
    1)
      npm run build
      cd dist
      tar -zcvf dss-web.tar.gz ./dist
      uploadFtp dss-web.tar.gz
      ;;
    2)
      npm run build:private
      cd dist
      tar -zcvf dss-web.tar.gz ./dist
      uploadFtp dss-web.tar.gz
    ;;
    *)
    	echo "错误 "
    	exit 0
esac




