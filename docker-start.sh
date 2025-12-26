#!/bin/bash

set -e  # Exit on error

# Color codes for beautiful output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}${BOLD}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}$1${NC}"
}

show_help() {
    echo "Usage: ./docker-start.sh [OPTIONS]"
    echo ""
    echo "Start DIAS using Docker Compose"
    echo ""
    echo "Options:"
    echo "  -h, --help       Show this help message"
    echo "  -d, --dev        Start in development mode (with hot reloading)"
    echo "  -b, --build      Force rebuild images before starting"
    echo ""
    echo "Examples:"
    echo "  ./docker-start.sh           # Start in production mode"
    echo "  ./docker-start.sh --dev     # Start in development mode"
    echo "  ./docker-start.sh --build   # Rebuild and start"
    echo ""
}

main() {
    local compose_file="docker-compose.yml"
    local build_flag=""
    local dev_mode=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -d|--dev)
                dev_mode=true
                compose_file="docker-compose.dev.yml"
                shift
                ;;
            -b|--build)
                build_flag="--build"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    clear
    echo ""
    print_info "DIAS - Disaster Information & Alert System (Docker)"
    echo ""
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    print_success "Docker is ready"
    
    # Build if requested
    if [ -n "$build_flag" ]; then
        print_step "Building Docker images..."
        docker compose -f $compose_file build
        print_success "Images built successfully"
        echo ""
    fi
    
    # Start services
    print_step "Starting Docker containers..."
    docker compose -f $compose_file up -d
    
    if [ $? -ne 0 ]; then
        print_error "Failed to start containers"
        exit 1
    fi
    
    print_success "Containers started successfully"
    echo ""
    
    # Wait for services to be ready
    print_step "Waiting for services to be ready..."
    sleep 10
    
    # Check health
    if [ "$dev_mode" = true ]; then
        FRONTEND_URL="http://localhost:5173"
    else
        FRONTEND_URL="http://localhost:3000"
    fi
    
    print_step "Checking service health..."
    
    # Check backend
    if curl -s http://localhost:5000/health > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend is not responding yet"
    fi
    
    # Show status
    echo ""
    print_success "Services are starting up!"
    echo ""
    
    # Display access points
    echo -e "${GREEN}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║                                                            ║${NC}"
    echo -e "${GREEN}${BOLD}║               DIAS is now running!                  ║${NC}"
    echo -e "${GREEN}${BOLD}║                                                            ║${NC}"
    echo -e "${GREEN}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BOLD}Access Points:${NC}"
    echo -e "  ${CYAN}Frontend:${NC}  $FRONTEND_URL"
    echo -e "  ${CYAN}Backend:${NC}   http://localhost:5000"
    echo -e "  ${CYAN}Database:${NC}  localhost:5432"
    echo ""
    
    if [ "$dev_mode" = true ]; then
        echo -e "${YELLOW}Mode:${NC} Development (Hot reloading enabled)"
    else
        echo -e "${YELLOW}Mode:${NC} Production"
    fi
    
    echo ""
    echo -e "${BOLD}Quick Commands:${NC}"
    echo -e "  • View logs:      ${MAGENTA}docker compose logs -f${NC}"
    echo -e "  • Stop services:  ${MAGENTA}./docker-stop.sh${NC}"
    echo -e "  • Check status:   ${MAGENTA}docker compose ps${NC}"
    echo ""
    
    # Show logs
    print_info "Showing logs (Ctrl+C to exit logs, containers will keep running)..."
    echo ""
    docker compose -f $compose_file logs -f
}

main "$@"

