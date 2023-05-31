#!/bin/bash

echo "環境構築を開始します。"
cd ~/shopizer-shop-reactjs/
echo "Front用サービスを起動します"
npm run dev 2&>1 > /tmp/front.log &
echo "Front用サービスを起動しました。"
~/shopizer/restart_backend.sh
