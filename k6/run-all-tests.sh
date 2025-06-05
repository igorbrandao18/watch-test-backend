#!/bin/bash

echo "Running K6 Load Tests Suite"
echo "-------------------------"

echo "1. Running Authentication Load Test"
k6 run auth.js
echo "-------------------------"

echo "2. Running Search Load Test"
k6 run search.js
echo "-------------------------"

echo "3. Running Movies Load Test"
k6 run movies.js
echo "-------------------------"

echo "4. Running User Actions Load Test"
k6 run user-actions.js
echo "-------------------------"

echo "5. Running Stress Test"
k6 run stress.js
echo "-------------------------"

echo "6. Running Spike Test"
k6 run spike.js
echo "-------------------------"

echo "All tests completed!" 