#!/bin/sh


# blue 컨테이너가 띄워져 있는지 확인 (3000 포트 == blue)
EXIST_BLUE=$(netstat -lntp | grep 3000)

if [ -n "$EXIST_BLUE" ]; then
  TARGET_COLOR="green"
  NOW_COLOR="blue"
  WEB_SERVER_TARGET_PORT=3001
  WEB_SERVER_STOP_PORT=3000
  TARGET_SERVER_NAME="catchy-tape-green"
  NOW_SERVER_NAME="catchy-tape-blue"
else
  TARGET_COLOR="blue"
  NOW_COLOR="green"
  WEB_SERVER_TARGET_PORT=3000
  WEB_SERVER_STOP_PORT=3001
  TARGET_SERVER_NAME="catchy-tape-blue"
  NOW_SERVER_NAME="catchy-tape-green"
fi

# 1 새로운 서버를 띄운다
docker login $NCP_REGISTRY -u $NCP_DOCKER_ACCESS_KEY_ID -p $NCP_DOCKER_SECRET_KEY
docker pull $NCP_REGISTRY/catchy-tape:latest
docker run -v /home/hyung/logs:/catchy-tape/logs -d -p $WEB_SERVER_TARGET_PORT:3000 --name $TARGET_SERVER_NAME $NCP_REGISTRY/catchy-tape:latest

# 2 nginx 포트 설정 변경 후 reload
NGINX_CONFIG="/etc/nginx/nginx.conf"
sed -i 's/WEB_SERVER_TARGET_PORT/WEB_SERVER_STOP_PORT/' $NGINX_CONFIG
nginx -s reload

# 3 원래 서버 종료 & 삭제
FIRST_DEPLOYED_SERVER="catchy-tape-latest"
FIRST_DEPLOYED_SERVER_ID=$(docker ps --filter "name=$FIRST_DEPLOYED_SERVER" -q)
if [ -n "$FIRST_DEPLOYED_SERVER_ID" ]; then
  docker stop $FIRST_DEPLOYED_SERVER
  docker rm $FIRST_DEPLOYED_SERVER
fi

STOP_SERVER_ID=$(docker ps --filter "name=$NOW_SERVER_NAME" -q)
if [ -n "$STOP_SERVER_ID" ]; then
  docker stop $STOP_SERVER_ID
  docker rm $NOW_SERVER_NAME
fi

# 사용하지 않는 도커 이미지 정리
docker image prune -a -f