#!/bin/bash
set -e
set -o pipefail

if [ -d "mobile" ] ; then
  echo "Your project is already initialized. If you want to re-initialize it, remove the mobile/ directory"
  exit 1
fi

if ! hash cordova 2>/dev/null; then 
  echo "Couldn't find cordova executable. Please, add Cordova bin directory to your path and run again"
  exit 1
fi

# first look for an environment variable
MCA_CREATE="$MCA_DIR/mca-create.js"
if [ -z $MCA_DIR ] ; then
  # if not found, check the hardcoded dir used in installation
  MCA_CREATE="/Developer/MobileChromeApps/mobile-chrome-apps/mca-create.js"
  if [ ! -x "$MCA_CREATE" ] ; then 
    echo "mca-create.js not found. Try creating a MCA_DIR env variable pointing to the mobile-chrome-apps dir" 
    exit 1
  fi
fi

package=`echo $1 | perl -pe 's/[^.]+\.[^.]+\.([^.]+)\.[^.]+/\1/'`

if [ -z $package ] ; then
  echo "Usage: $0 <com.yourcompany.package.AppName>"
  exit 1
fi

"node" "$MCA_CREATE" --source="chromeapp" "$@"

if [ ! -d $package ] ; then
  echo "unrecognized error, there should have a $package directory here"
  exit 1
fi

mv $package mobile

pushd mobile > /dev/null

# remove the www directory and a symlink instead:
rm -Rf www
ln -s ../chromeapp www

# copy libs if any
if [ -d ../libs ] ; then
  cp ../libs/*.jar platforms/android/libs
fi

# copy plugins if any
for i in ../plugins/* ; do
  cordova plugin add $i
done

# update
./mca-update.sh

popd > /dev/null

echo "OK, all installed and updated"

