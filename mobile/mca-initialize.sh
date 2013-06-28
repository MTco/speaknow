#!/bin/bash
set -e
set -o pipefail

if [ -d "platforms" ] ; then
  echo "Your project is already initialized. If you want to rebuild it, remove dirs platforms, merges and plugins"
  exit 1
fi

if ! hash cordova 2>/dev/null; then 
  echo "Couldn't find cordova executable. Please, add Cordova bin directory to your path and run again"
  exit 1
fi

mkdir plugins
cordova platform add android

for i in ../plugins/* ; do
  cordova plugin add $i
done

./mca-update.sh

echo "OK, all installed and updated"

