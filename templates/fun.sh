#!/bin/sh

ELECTRON="{{ELECTRON}}"
FUN="{{FUN}}"

if [ $1x == '--electron-path'x ]; then
  echo $ELECTRON
  exit 0
fi

if [ $1x == '--fun-path'x ]; then
  echo $FUN
  exit 0
fi

ELECTRON_RUN_AS_NODE=1 exec "$ELECTRON" "$FUN" "$@"
