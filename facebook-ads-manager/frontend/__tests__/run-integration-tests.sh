#!/bin/bash

# Integration Tests Runner Script
# Handles test database setup and execution

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="fb-ads-test-db"
DB_PORT="5433"
DB_NAME="facebook_ads_test"
DB_USER="postgres"
DB_PASSWORD="postgres"
TEST_DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/${DB_NAME}"

echo -e "${GREEN}=== Facebook Ads Manager - Integration Tests ===${NC}\n"

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running${NC}"
        echo "Please start Docker Desktop and try again"
        exit 1
    fi
}

# Function to check if container exists
container_exists() {
    docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

# Function to check if container is running
container_running() {
    docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

# Function to start test database
start_db() {
    echo -e "${YELLOW}Setting up test database...${NC}"

    check_docker

    if container_exists; then
        if container_running; then
            echo -e "${GREEN}Test database already running${NC}"
        else
            echo "Starting existing container..."
            docker start ${CONTAINER_NAME}
            sleep 2
        fi
    else
        echo "Creating new test database container..."
        docker run -d \
            --name ${CONTAINER_NAME} \
            -e POSTGRES_USER=${DB_USER} \
            -e POSTGRES_PASSWORD=${DB_PASSWORD} \
            -e POSTGRES_DB=${DB_NAME} \
            -p ${DB_PORT}:5432 \
            postgres:15-alpine

        echo "Waiting for database to be ready..."
        sleep 5

        # Wait for database to accept connections
        until docker exec ${CONTAINER_NAME} pg_isready -U ${DB_USER} > /dev/null 2>&1; do
            echo "Waiting for database..."
            sleep 1
        done

        echo -e "${GREEN}Database container created and ready${NC}"
    fi
}

# Function to run migrations
run_migrations() {
    echo -e "\n${YELLOW}Running database migrations...${NC}"

    DATABASE_URL="${TEST_DATABASE_URL}" npx prisma migrate deploy

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Migrations completed successfully${NC}"
    else
        echo -e "${RED}Migration failed${NC}"
        exit 1
    fi
}

# Function to reset database
reset_db() {
    echo -e "\n${YELLOW}Resetting test database...${NC}"

    docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -c "DROP DATABASE IF EXISTS ${DB_NAME};" 2>/dev/null || true
    docker exec ${CONTAINER_NAME} psql -U ${DB_USER} -c "CREATE DATABASE ${DB_NAME};"

    run_migrations

    echo -e "${GREEN}Database reset complete${NC}"
}

# Function to stop database
stop_db() {
    echo -e "\n${YELLOW}Stopping test database...${NC}"

    if container_running; then
        docker stop ${CONTAINER_NAME}
        echo -e "${GREEN}Database stopped${NC}"
    else
        echo "Database is not running"
    fi
}

# Function to remove database
remove_db() {
    echo -e "\n${YELLOW}Removing test database...${NC}"

    if container_exists; then
        docker rm -f ${CONTAINER_NAME} 2>/dev/null || true
        echo -e "${GREEN}Database container removed${NC}"
    else
        echo "Database container does not exist"
    fi
}

# Function to run tests
run_tests() {
    echo -e "\n${YELLOW}Running integration tests...${NC}\n"

    TEST_DATABASE_URL="${TEST_DATABASE_URL}" npm test -- __tests__/integration "$@"
}

# Function to run with coverage
run_coverage() {
    echo -e "\n${YELLOW}Running tests with coverage...${NC}\n"

    TEST_DATABASE_URL="${TEST_DATABASE_URL}" npm test -- __tests__/integration --coverage "$@"
}

# Function to show usage
usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Commands:
    test        Run integration tests (default)
    coverage    Run tests with coverage report
    watch       Run tests in watch mode
    setup       Setup test database (without running tests)
    reset       Reset test database
    stop        Stop test database
    remove      Remove test database container
    help        Show this help message

Options:
    -f FILE     Run specific test file
    -t TEST     Run specific test by name
    -v          Verbose output

Examples:
    $0                                  # Run all tests
    $0 coverage                         # Run with coverage
    $0 test -f template-launch          # Run specific file
    $0 test -t "should launch campaign" # Run specific test
    $0 watch                            # Run in watch mode
    $0 reset                            # Reset database
    $0 setup                            # Just setup database

EOF
}

# Main script logic
COMMAND=${1:-test}

case "$COMMAND" in
    test)
        shift
        start_db
        run_migrations
        run_tests "$@"
        ;;

    coverage)
        shift
        start_db
        run_migrations
        run_coverage "$@"
        ;;

    watch)
        shift
        start_db
        run_migrations
        echo -e "\n${YELLOW}Running tests in watch mode...${NC}\n"
        TEST_DATABASE_URL="${TEST_DATABASE_URL}" npm test -- __tests__/integration --watch "$@"
        ;;

    setup)
        start_db
        run_migrations
        echo -e "\n${GREEN}Setup complete! Run tests with: $0 test${NC}"
        ;;

    reset)
        if ! container_running; then
            start_db
        fi
        reset_db
        echo -e "\n${GREEN}Database reset! Ready for testing.${NC}"
        ;;

    stop)
        stop_db
        ;;

    remove)
        remove_db
        ;;

    help)
        usage
        ;;

    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}\n"
        usage
        exit 1
        ;;
esac

echo -e "\n${GREEN}Done!${NC}"
