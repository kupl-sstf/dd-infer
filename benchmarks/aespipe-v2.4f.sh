#!/bin/bash

PROJECT="aespipe-v2.4f"

if [ ! -d "./$PROJECT" ]; then
	wget http://loop-aes.sourceforge.net/aespipe/aespipe-v2.4f.tar.bz2
	tar -xjf aespipe-v2.4f.tar.bz2
	rm aespipe-v2.4f.tar.bz2
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
