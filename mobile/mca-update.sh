#!/bin/sh
cd "`dirname "$0"`"
"node" "/Developer/MobileChromeApps/mobile-chrome-apps/mca-create.js" --update_app "$@"
