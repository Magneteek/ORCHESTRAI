#!/bin/bash

# Health check script for Docker container
# Returns 0 if healthy, 1 if unhealthy

set -e

# Configuration
HEALTH_URL="${HEALTH_URL:-http://localhost:3001/api/health}"
MAX_RETRIES="${MAX_RETRIES:-3}"
RETRY_DELAY="${RETRY_DELAY:-2}"

# Function to check health endpoint
check_health() {
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")
    echo "$response_code"
}

# Main health check logic
main() {
    local retries=0

    while [ $retries -lt "$MAX_RETRIES" ]; do
        response=$(check_health)

        if [ "$response" = "200" ]; then
            echo "Health check passed (HTTP $response)"
            exit 0
        fi

        retries=$((retries + 1))

        if [ $retries -lt "$MAX_RETRIES" ]; then
            echo "Health check failed (HTTP $response), retrying in ${RETRY_DELAY}s... ($retries/$MAX_RETRIES)"
            sleep "$RETRY_DELAY"
        fi
    done

    echo "Health check failed after $MAX_RETRIES attempts (HTTP $response)"
    exit 1
}

main
