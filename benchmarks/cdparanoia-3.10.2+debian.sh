#!/bin/bash

PROJECT="cdparanoia-3.10.2+debian"

if [ ! -d "./$PROJECT" ]; then
	wget http://deb.debian.org/debian/pool/main/c/cdparanoia/cdparanoia_3.10.2+debian.orig.tar.gz
	tar zxvf cdparanoia_3.10.2+debian.orig.tar.gz
	rm cdparanoia_3.10.2+debian.orig.tar.gz
	pushd $PROJECT
	if [ $? -eq 1 ]; then
		echo "Failed to download a source package."
		exit 3
	fi
else
	pushd $PROJECT
fi

if [ "$1" = "clean" ]; then
	make distclean
	make clean
	popd
	exit 0
fi

if [ "$1" = "download" ]; then
	popd
	exit 0
fi

OUTPATH=/home/vagrant/infer-outs
mkdir -p $OUTPATH

./configure
if [ $? -eq 0 ];then
	echo success
else
	>&2 echo "failed"
	popd
	exit 1
fi

infer capture -o "$OUTPATH/$PROJECT" -- make
if [ $? -eq 0 ];then
	echo success
	popd
	rsync -a $OUTPATH/$PROJECT/ /vagrant/infer-outs/$PROJECT
else
	>&2 echo "failed"
	rm -rf "$OUTPATH/$PROJECT"
	popd
	exit 2
fi


