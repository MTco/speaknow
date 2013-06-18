#!/bin/sh
cd "`dirname "$0"`"
"node" "/opt/cordova/mobile-chrome-apps/mca-create.js" --update_app "$@"