#!/bin/bash

color_code=(
        "\033[1;35m" # text_s
        "\033[37m"   # text
        "\033[1;32m" # info_s
        "\033[0;32m" # info
        "\033[1;31m" # warn_s
        "\033[0;31m" # warn
        )

msg() {
        if [ -n "$NO_ANSI" ];then
                shift
                echo -e "$@"
        else
                c=$1
                shift
                case $c in
                        text_s) echo -e "${color_code[0]}$@\033[m";;
                        text) echo -e "${color_code[1]}$@\033[m";;
                        info_s) echo -e "${color_code[2]}$@\033[m";;
                        info) echo -e "${color_code[3]}$@\033[m";;
                        warn_s) echo -e "${color_code[4]}$@\033[m";;
                        warn) echo -e "${color_code[5]}$@\033[m";;
                        *) echo -e "$@";;
                esac
        fi
}

if [[ ! -d "${PROJECT_ROOT}" ]];then
	PROJECT_ROOT="/vagrant"
fi
TARGET_PATH="${PROJECT_ROOT}/infer-outs"
ULTIMATE_TARGET_PATH="/home/vagrant/infer-outs"

pushd benchmarks
if [ "$1" = "clean" ];then
	rm -rf ~/infer-outs
	rm -rf /vagrant/infer-outs
fi
[[ -d ${TARGET_PATH} ]] || mkdir ${TARGET_PATH}
if [ "$1" = "clean" -o "$1" = "download" ];then
	for v in `ls *.sh`;do
		echo $v
		./$v $1
	done
else
	computed=()
	passed=()
	errinconf=()
	errinbuild=()
	failed=()
	skipped=()
#	for name in `cat ${PROJECT_ROOT}/list`;do
#		v="${name}.sh"
	for v in `ls *.sh`;do
		name=${v/.sh/}
		
		if [ -d "${ULTIMATE_TARGET_PATH}/$name" ];then
			echo "$name is already captured."
			passed+=("$v")
		else
			echo "Capture: $name"
			./$v $1
			errcode=$?
			if [ $errcode -eq 0 ]; then
				computed+=("$v")
			elif [ $errcode -eq 1 ]; then
				errinconf+=("$v")
			elif [ $errcode -eq 2 ]; then
				errinbuild+=("$v")
			elif [ $errcode -eq 3 ]; then
				failed+=("$v")
			elif [ $errcode -eq 4 ]; then
				skipped+=("$v")
			fi
		fi
	done

	(msg info_s "* Passed - ${#passed[@]}"
	for v in "${passed[@]}"; do
		msg info $v
	done
	if [ "${#computed}" -gt 0 ];then
		msg info_s "* Builded (or skipped) - ${#computed[@]}"
		for v in "${computed[@]}"; do
			msg info $v
		done
	fi
	if [ "${#failed}" -gt 0 ];then
		msg warn_s "* Failed to prepare a source code - ${#failed[@]}"
		for v in "${failed[@]}"; do
			msg info $v
		done
	fi
	if [ "${#errinbuild}" -gt 0 ];then
		msg warn_s "* Error in build - ${#errinbuild[@]}"
		for v in "${errinbuild[@]}"; do
			msg info $v
		done
	fi
	if [ "${#errinconf}" -gt 0 ];then
		msg warn_s "* Error in configuration - ${#errinconf[@]}"
		for v in "${errinconf[@]}"; do
			msg info $v
		done
	fi
	if [ "${#skipped}" -gt 0 ];then
		msg warn_s "* Skipped - ${#skipped[@]}"
		for v in "${skipped[@]}"; do
			msg warn $v
		done
	fi) | tee setup.log
fi

popd

