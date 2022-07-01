#!/bin/bash

for v in `ls -1 -d $PROJECT_ROOT/benchmarks/*/`;do
	name=$(basename $v)
	# alarm_stats.js [total alarms] [standard deviation]
	alarm_stats.js 30 2 $PROJECT_ROOT/experiment1/data/${name}*
	if [ $? -eq 0 ];then
		echo $name
	fi
done

