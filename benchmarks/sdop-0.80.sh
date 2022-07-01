#!/bin/bash

PROJECT="sdop-0.80"

if [ ! -d "./$PROJECT" ]; then
	wget http://deb.debian.org/debian/pool/main/s/sdop/sdop_0.80.orig.tar.bz2
	tar -xjf sdop_0.80.orig.tar.bz2
	rm sdop_0.80.orig.tar.bz2
	pushd $PROJECT
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
infer capture -o "$OUTPATH/$PROJECT" -- make
popd

rsync -a $OUTPATH/$PROJECT/ /vagrant/infer-outs/$PROJECT
