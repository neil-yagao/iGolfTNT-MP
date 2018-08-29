#! /bin/bash
#$1 Should be en0 in Mac and eth0 in unbuntu

LOCAL_IP=`ifconfig | grep -e '$1' -A 4 | grep -e 'inet ' | awk '{split($0,a," "); print a[2]}'`

if [ -z $LOCAL_IP ] ; then 
	echo "cant find related ip address"
	exit 1;
fi

docker run --name igolf_mp -p 3000:3000 --net="host" -e "MYSQL_URL=$LOCAL_IP" neilhu68/igolf_mp