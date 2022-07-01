#!/bin/bash

PROJECT="bluez-5.55"

if [ ! -d "./$PROJECT" ]; then
	>&2 echo "Please install the 'libdbus-1-dev', 'libudev-dev', 'libical-dev', and 'libreadline-dev' packages to build:"
       	>&2 echo "sudo apt install libdbus-1-dev libudev-dev libical-dev libreadline-dev"
	git clone https://git.kernel.org/pub/scm/bluetooth/bluez.git $PROJECT
	pushd $PROJECT
	if [ $? -eq 1 ]; then
		echo "Failed to download a source package."
		exit 3
	fi
	git checkout 5.55
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

./bootstrap

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


