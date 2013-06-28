#!/bin/sh
cd "`dirname "$0"`"

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

"node" "$MCA_CREATE" --update_app "$@"
