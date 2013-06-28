
In the first run, execute mca-initialize.sh

A folder "mobile" will be created with cordova project, including a symlink for your chromeapp directory and the libs and plugins in those respective directories. Note that the mobile/ directory is transient and should not be versioned, since it can (and should) always be recreated from the chromeapp, libs and plugins directories.

If you want to rebuild the entire mobile project, just remove mobile/ directory and run mca-initialize.sh again.

