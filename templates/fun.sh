#!/bin/sh

ELECTRON="{{ELECTRON}}"
FUN="{{FUN}}"

if [ "$1" = "--electron-path" ]; then
  echo $ELECTRON
  exit 0
fi

if [ "$1" = "--fun-path" ]; then
  echo $FUN
  exit 0
fi

ELECTRON_RUN_AS_NODE=1 exec "$ELECTRON" "$FUN" "$@"
