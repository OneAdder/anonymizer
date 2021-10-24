#!/bin/bash

unoserver &
venv/bin/gunicorn -w1 -t180 -b 127.0.0.1:8080 anonymizer.app:app --access-logfile access-log
