#!/bin/bash

mode="analyze"
m=3
prek=1
maink=5

if [ ! -d "$1" ];then
	if [ "$1" == "" ];then
		echo "* Error: Target name is missing."
	else
		echo "* Error: ${1} does not exist."
	fi
	echo
	echo "Usage)"
	echo " $ DDInfer.sh ~/infer-outs/gawk-5.1.0"
	exit
fi

python /vagrant/bin/infer.py $1 $prek $maink /vagrant/best_models/$m/*.model

mode="capture"

