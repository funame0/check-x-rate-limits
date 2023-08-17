#!/bin/sh
rm -r dist
for v in v2 v3
do
  mkdir -p dist/$v
  cp -r src dist/$v/
  mv dist/$v/src/$v.manifest.json dist/$v/src/manifest.json
  rm dist/$v/src/*.manifest.json
  yarn run parcel build dist/$v/src/manifest.json --dist-dir dist/$v/build
  cp LICENSE.txt dist/$v/src/
  cp LICENSE.txt dist/$v/build/
done
