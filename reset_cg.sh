#!/bin/bash

rm -rf /vagrant/cgs
mkdir -p /vagrant/cgs
for v in `ls -1 ~/infer-outs`;do
	echo "- $v"
	infer analyze -q --cg-only --cg-no-recursion -o ~/infer-outs/$v
	cp ~/infer-outs/$v/cg.dot /vagrant/cgs/$v.txt
done

