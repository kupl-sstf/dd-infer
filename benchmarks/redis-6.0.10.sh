#!/bin/bash

PROJECT="redis-6.0.10"

if [ ! -d "./$PROJECT" ]; then
	git clone https://github.com/redis/redis.git $PROJECT
	pushd $PROJECT
	git checkout 6.0.10 
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

infer capture -o "$OUTPATH/$PROJECT" -- make
popd

rsync -a $OUTPATH/$PROJECT/ /vagrant/infer-outs/$PROJECT
