#!/bin/bash

PROJECT="sed-4.8"

if [ ! -d "./$PROJECT" ]; then
	git clone --recurse-submodules git://git.sv.gnu.org/sed $PROJECT
	pushd $PROJECT
	git checkout v4.8
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

./bootstrap
./configure
infer capture -o "$OUTPATH/$PROJECT" -- make
popd

rsync -a $OUTPATH/$PROJECT/ /vagrant/infer-outs/$PROJECT
