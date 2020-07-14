#!/usr/bin/env sh

# see issue : https://github.com/microsoft/TypeScript/issues/27287
# "Documentation on Modules is missing ".js" suffix in import statements"

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$0")

for i in `find $SCRIPTPATH/../public/build/ -type f`;
do
    sed -i 's~import\(.*\)from\(.*\)";~import\1from\2.js";~g' $i;
    sed -i 's~import\(.*\)from\(.*\).js.js";~import\1from\2.js";~g' $i;
done
