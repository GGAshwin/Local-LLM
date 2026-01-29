#!/bin/bash

# Increase Node.js heap size for larger workloads
NODE_OPTIONS="--max-old-space-size=4096" npm "$@"
