#!/bin/bash

echo "========================================="
echo "  DIAS Quick Start with Docker"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}This script will help you run DIAS with Docker${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker from: https://www.docker.com/"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"
echo ""

# Check if containers are already running
if docker compose ps | grep -q "Up"; then
    echo "⚠️  Containers are already running!"
    echo ""
    echo "Options:"
    echo "  1) Stop and restart"
    echo "  2) Just view logs"
    echo "  3) Exit"
    read -p "Choose (1-3): " choice
    
    if [ "$choice" = "1" ]; then
        docker compose down
        echo "Starting containers..."
        docker compose up -d
    elif [ "$choice" = "2" ]; then
        docker compose logs -f
        exit 0
    else
        exit 0
    fi
else
    echo "Starting containers..."
    docker compose up -d
fi

echo ""
echo "Waiting for services to start..."
sleep 5

echo ""
echo "========================================="
echo -e "${GREEN}✅ DIAS is now running!${NC}"
echo "========================================="
echo ""
echo "Access your application:"
echo "  🌐 Frontend: http://localhost:3000"
echo "  🔌 Backend:  http://localhost:5000"
echo ""
echo "Useful commands:"
echo "  View logs:  docker compose logs -f"
echo "  Stop:       docker compose down"
echo "  Status:     docker compose ps"
echo ""
echo "Need help? Check: DOCKER_FOR_BEGINNERS.md"
echo ""

