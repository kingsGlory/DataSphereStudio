#!/bin/bash

user=$1
dir=$2
echo $1 $2;
sudo mkdir -p $dir
sudo chown $user:$user $dir