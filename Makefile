.PHONY: build test default

default: .git/hooks/pre-commit build

build:
	yarn install

.git/hooks/pre-commit: scripts/prettier.sh
	cp scripts/prettier.sh .git/hooks/pre-commit
