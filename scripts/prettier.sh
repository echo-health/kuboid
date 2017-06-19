#!/bin/bash
git diff --staged --diff-filter=dx --name-only HEAD | grep ".*\.js$" | xargs -I % sh -c 'yarn run format -- %; git add %'
