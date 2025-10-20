#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=5000
FRONTEND_PORT=5173
DB_PORT=5433

# ============================================================================
# Helper Functions
# ============================================================================

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

# Check if port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Kill process on port
kill_port() {
    local port=$1
    local service=$2
    
    if port_in_use $port; then
        print_step "Stopping $service (port $port)..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
        
        if ! port_in_use $port; then
            print_success "$service stopped"
        else
            print_warning "$service may still be running"
        fi
    else
        print_info "$service is not running"
    fi
}

# ============================================================================
# Stop Services
# ============================================================================

stop_frontend() {
    # Try to stop using PID file first
    if [ -f /tmp/dias-frontend.pid ]; then
        local pid=$(cat /tmp/dias-frontend.pid)
        if kill -0 $pid 2>/dev/null; then
            print_step "Stopping Frontend (PID: $pid)..."
            kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null || true
            rm /tmp/dias-frontend.pid
            sleep 1
            print_success "Frontend stopped"
        else
            rm /tmp/dias-frontend.pid
        fi
    fi
    
    # Kill any remaining processes on the port
    kill_port $FRONTEND_PORT "Frontend"
}

stop_backend() {
    # Try to stop using PID file first
    if [ -f /tmp/dias-backend.pid ]; then
        local pid=$(cat /tmp/dias-backend.pid)
        if kill -0 $pid 2>/dev/null; then
            print_step "Stopping Backend (PID: $pid)..."
            kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null || true
            rm /tmp/dias-backend.pid
            sleep 1
            print_success "Backend stopped"
        else
            rm /tmp/dias-backend.pid
        fi
    fi
    
    # Kill any remaining processes on the port
    kill_port $BACKEND_PORT "Backend"
}

stop_database() {
    print_step "Stopping PostgreSQL Database..."
    
    if docker ps | grep -q dias-postgres; then
        docker compose down >/dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            print_success "PostgreSQL stopped"
        else
            print_warning "Failed to stop PostgreSQL cleanly"
        fi
    else
        print_info "PostgreSQL is not running"
    fi
}

# ============================================================================
# Cleanup
# ============================================================================

cleanup_temp_files() {
    print_step "Cleaning up temporary files..."
    
    # Remove PID files
    rm -f /tmp/dias-backend.pid /tmp/dias-frontend.pid
    
    print_success "Cleanup complete"
}

# ============================================================================
# Service Status Check
# ============================================================================

check_status() {
    print_step "Checking service status..."
    echo ""
    
    local all_stopped=true
    
    # Check Frontend
    if port_in_use $FRONTEND_PORT; then
        print_warning "Frontend is still running on port $FRONTEND_PORT"
        all_stopped=false
    else
        print_success "Frontend is stopped"
    fi
    
    # Check Backend
    if port_in_use $BACKEND_PORT; then
        print_warning "Backend is still running on port $BACKEND_PORT"
        all_stopped=false
    else
        print_success "Backend is stopped"
    fi
    
    # Check Database
    if docker ps | grep -q dias-postgres; then
        print_warning "PostgreSQL is still running"
        all_stopped=false
    else
        print_success "PostgreSQL is stopped"
    fi
    
    echo ""
    
    if [ "$all_stopped" = true ]; then
        print_success "All DIAS services are stopped"
    else
        print_warning "Some services may still be running"
        echo ""
        print_info "You can force kill all processes with:"
        echo "  pkill -f 'npm run dev'"
        echo "  docker compose down -v"
    fi
}

# ============================================================================
# Options Handler
# ============================================================================

show_help() {
    echo "Usage: ./stop.sh [OPTIONS]"
    echo ""
    echo "Stop DIAS services cleanly"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -f, --force         Force stop all services (kill -9)"
    echo "  -v, --volumes       Also remove Docker volumes (deletes all data)"
    echo "  --frontend-only     Stop only frontend"
    echo "  --backend-only      Stop only backend"
    echo "  --database-only     Stop only database"
    echo ""
    echo "Examples:"
    echo "  ./stop.sh                    # Normal stop"
    echo "  ./stop.sh --force            # Force stop everything"
    echo "  ./stop.sh --volumes          # Stop and remove all data"
    echo "  ./stop.sh --frontend-only    # Stop only frontend"
    echo ""
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    local force=false
    local volumes=false
    local frontend_only=false
    local backend_only=false
    local database_only=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -f|--force)
                force=true
                shift
                ;;
            -v|--volumes)
                volumes=true
                shift
                ;;
            --frontend-only)
                frontend_only=true
                shift
                ;;
            --backend-only)
                backend_only=true
                shift
                ;;
            --database-only)
                database_only=true
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
    print_info "🛑 Stopping DIAS Services"
    echo ""
    
    # Stop services based on options
    if [ "$frontend_only" = true ]; then
        stop_frontend
    elif [ "$backend_only" = true ]; then
        stop_backend
    elif [ "$database_only" = true ]; then
        stop_database
    else
        # Stop all services
        stop_frontend
        echo ""
        stop_backend
        echo ""
        stop_database
        echo ""
        cleanup_temp_files
    fi
    
    # Handle volumes option
    if [ "$volumes" = true ]; then
        echo ""
        print_warning "Removing Docker volumes (this will delete all database data)..."
        read -p "Are you sure? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose down -v >/dev/null 2>&1
            print_success "Volumes removed"
        else
            print_info "Volume removal cancelled"
        fi
    fi
    
    echo ""
    check_status
    
    echo ""
    echo -e "${GREEN}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║                                                            ║${NC}"
    echo -e "${GREEN}${BOLD}║              ✓  Services Stopped Successfully  ✓          ║${NC}"
    echo -e "${GREEN}${BOLD}║                                                            ║${NC}"
    echo -e "${GREEN}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}To start DIAS again, run: ${BOLD}./start.sh${NC}"
    echo ""
}

# Run main function
main "$@"

