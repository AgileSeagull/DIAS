#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}$1${NC}"
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
    echo "Usage: ./docker-stop.sh [OPTIONS]"
    echo ""
    echo "Stop DIAS Docker containers"
    echo ""
    echo "Options:"
    echo "  -h, --help       Show this help message"
    echo "  -v, --volumes    Also remove volumes (deletes all data)"
    echo "  -i, --images     Also remove images"
    echo ""
    echo "Examples:"
    echo "  ./docker-stop.sh           # Normal stop"
    echo "  ./docker-stop.sh --volumes # Stop and remove data"
    echo ""
}

main() {
    local remove_volumes=false
    local remove_images=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--volumes)
                remove_volumes=true
                shift
                ;;
            -i|--images)
                remove_images=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo ""
    print_info "Stopping DIAS Docker Containers"
    echo ""
    
    # Try both compose files
    local files=("docker-compose.yml" "docker-compose.dev.yml")
    
    for compose_file in "${files[@]}"; do
        if [ -f "$compose_file" ]; then
            print_step "Stopping services from $compose_file..."
            
            local stop_cmd="docker compose -f $compose_file down"
            
            if [ "$remove_volumes" = true ]; then
                stop_cmd="$stop_cmd -v"
            fi
            
            if [ "$remove_images" = true ]; then
                stop_cmd="$stop_cmd --rmi all"
            fi
            
            $stop_cmd
            
            print_success "Services from $compose_file stopped"
            echo ""
        fi
    done
    
    # Check if any containers are still running
    local running_containers=$(docker ps -q --filter "name=dias")
    
    if [ -n "$running_containers" ]; then
        print_warning "Some containers are still running"
        echo ""
        print_info "Running containers:"
        docker ps --filter "name=dias"
        echo ""
        print_info "Force stop with: docker stop dias-*"
    else
        print_success "All DIAS containers stopped"
    fi
    
    echo ""
    echo -e "${GREEN}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║                                                            ║${NC}"
    echo -e "${GREEN}${BOLD}║              ✓  Containers Stopped  ✓                    ║${NC}"
    echo -e "${GREEN}${BOLD}║                                                            ║${NC}"
    echo -e "${GREEN}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}To start DIAS again, run: ${BOLD}./docker-start.sh${NC}"
    echo ""
    
    if [ "$remove_volumes" = true ]; then
        print_warning "All data has been removed. You'll need to re-sync disaster data."
    fi
    
    echo ""
}

main "$@"

