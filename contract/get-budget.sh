#!/bin/bash

set -e

echo "Starting get-budget request"

# Starting deposit-local
echo "Getting report for main flow"
npx hardhat run --network localhost scripts/deposit.ts
wait

# Starting deposit-frog-local
echo "Getting report for confirm frog flow"
npx hardhat run --network localhost scripts/confirmFrog.ts
wait

# Starting reject-frog-local
echo "Getting report for reject frog flow"
npx hardhat run --network localhost scripts/rejectFrog.ts
wait

json_file="local/budget.json"
case "$OSTYPE" in
  linux*)   xdg-open "$json_file" ;;
  darwin*)  open "$json_file" ;; 
  msys*)    start "$json_file" ;;
  *)        echo "Operating System not supported" ;;
esac

echo "get-budget finished."
