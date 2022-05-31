#!/bin/sh

pnpm concurrently \
  --kill-others-on-fail \
  --prefix "[{name}]" \
  --names "test,lint,typecheck" \
  --prefix-colors "bgRed.bold.white,bgGreen.bold.white,bgBlue.bold.white,bgMagenta.bold.white" \
    "pnpm test --silent -- --watch=false" \
    "pnpm lint --quiet" \
    "pnpm typecheck"
