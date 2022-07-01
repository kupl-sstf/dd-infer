#!/bin/bash

PROJECT="mjs-2.9.0"

if [ ! -d "./$PROJECT" ]; then
	git clone https://github.com/cesanta/mjs.git $PROJECT
	pushd $PROJECT
	git checkout 2.9.0
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

infer capture -o "$OUTPATH/$PROJECT" -- gcc -c mjs.c
popd

rsync -a $OUTPATH/$PROJECT/ /vagrant/infer-outs/$PROJECT
