#!/bin/bash

PROJECT="gnubik-2.4.3"

if [ ! -d "./$PROJECT" ]; then
	>&2 echo "Please install the 'guile-2.0-dev', 'freeglut3-dev', 'libgtkglext1-dev' packages to build:"
       	>&2 echo "sudo apt-get install guile-2.0-dev freeglut3-dev libgtkglext1-dev"
	wget https://ftp.gnu.org/gnu/gnubik/gnubik-2.4.3.tar.gz
	tar zxvf $PROJECT.tar.gz
	rm $PROJECT.tar.gz
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


