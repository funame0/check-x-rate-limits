#!/bin/sh
rm -r dist
for v in v2 v3; do
  mkdir -p dist/$v
  cp -r src dist/$v/
  cd dist/$v
  mv src/$v.manifest.json src/manifest.json
  rm src/*.manifest.json
  yarn run parcel build src/manifest.json --dist-dir build
  cp ../../LICENSE.txt src/
  cp ../../LICENSE.txt build/
  if [ $v == "v2" ]; then
    zip -r check-x-rate-limits-for-firefox.zip *
  elif [ $v == "v3" ]; then
    zip -r check-x-rate-limits-for-chrome.zip *
  fi
  cd -
done
