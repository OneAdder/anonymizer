#!/bin/bash

echo "Starting unoserver"
unoserver &
if [ -z "$1" ]; then
  listen=127.0.0.1:8080
else
  listen="$1"
fi
echo "Starting webapp on $1"
venv/bin/gunicorn -w1 -t180 -b "$listen" anonymizer.app:app --access-logfile access-log
echo "Stopping webapp"
pkill gunicorn
echo "Stopping unoserver"
killall unoserver
