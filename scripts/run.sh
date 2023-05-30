#!/bin/bash

echo "環境構築を開始します。"
cd ~/shopizer-shop-reactjs/
echo "Front用サービスを起動します"
npm run dev 2&>1 > /tmp/front.log &
echo "Front用サービスを起動しました。"
echo "APIサービスを起動します。しばらくお待ちください。"
cd ~/shopizer/sm-shop
./mvnw spring-boot:run -Dspring-boot.run.profiles=local > /tmp/back.log &
echo $! > /tmp/back.pid
for _ in `seq 0 1000`; do
  if [[ 1 -eq `grep "Started ShopApplication" /tmp/back.log | wc -l` ]]; then
    echo "";
    echo "APIサービスが起動しました。 http://$HOSTNAME.$_SANDBOX_ID.instruqt.io:3000 にアクセスしてみましょう。"
    break;
  fi;
  echo -e ". \c";
  sleep 2.83;
done;
