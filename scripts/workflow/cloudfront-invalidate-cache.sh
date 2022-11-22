#!/usr/bin/env bash

set -euo pipefail
IFS=$'\n\t'

# aws cloudfront list-distributions

CF_DISTRIBUTION_ID="E2P616A60XGBA1"

aws cloudfront create-invalidation --distribution-id $CF_DISTRIBUTION_ID --paths '/*'

# aws cloudfront create-invalidation --distribution-id E2XWXHML34RJAB --paths '/*'


# # PROJECT_ROOT=$(git rev-parse --show-toplevel)
