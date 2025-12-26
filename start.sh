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

# Configuration
BACKEND_PORT=5000
FRONTEND_PORT=5173
DB_PORT=5433
DB_HOST="localhost"
MAX_RETRIES=30
STARTUP_WAIT=8

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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Kill process on port
kill_port() {
    if port_in_use $1; then
        print_warning "Port $1 is in use. Terminating existing process..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
        print_success "Port $1 is now free"
    fi
}

# Check if file exists
check_file() {
    if [ ! -f "$1" ]; then
        print_error "Required file not found: $1"
        return 1
    fi
    return 0
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

preflight_checks() {
    print_step "Running pre-flight checks..."
    
    local errors=0
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js detected: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js v18 or higher."
        errors=$((errors + 1))
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm detected: v$NPM_VERSION"
    else
        print_error "npm is not installed."
        errors=$((errors + 1))
    fi
    
    # Check Docker
    if command_exists docker; then
        print_success "Docker detected"
    else
        print_error "Docker is not installed. Please install Docker to run PostgreSQL."
        errors=$((errors + 1))
    fi
    
    # Check Docker Compose
    if docker compose version >/dev/null 2>&1; then
        print_success "Docker Compose detected"
    else
        print_error "Docker Compose is not available."
        errors=$((errors + 1))
    fi
    
    # Check required files
    check_file "docker-compose.yml" || errors=$((errors + 1))
    check_file "backend/package.json" || errors=$((errors + 1))
    check_file "package.json" || errors=$((errors + 1))
    
    # Check environment file
    if [ -f "backend/.env" ]; then
        print_success "Environment file found"
    else
        print_warning "backend/.env not found. You'll need to configure it."
        print_info "Copy backend/.env.example to backend/.env and configure it."
    fi
    
    if [ $errors -gt 0 ]; then
        echo ""
        print_error "$errors error(s) found. Please fix them before starting."
        exit 1
    fi
    
    print_success "All pre-flight checks passed!"
    echo ""
}

# ============================================================================
# Database Setup
# ============================================================================

start_database() {
    print_step "Step 1/4: Starting PostgreSQL Database"
    
    # Clean up ports
    kill_port $DB_PORT
    
    # Start database
    docker compose up -d postgres
    
    if [ $? -ne 0 ]; then
        print_error "Failed to start PostgreSQL"
        exit 1
    fi
    
    print_info "Waiting for database to be ready..."
    local retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        if docker exec dias-postgres pg_isready -U postgres > /dev/null 2>&1; then
            print_success "PostgreSQL is ready!"
            break
        fi
        retries=$((retries + 1))
        sleep 1
    done
    
    if [ $retries -eq $MAX_RETRIES ]; then
        print_error "PostgreSQL failed to start within timeout"
        exit 1
    fi
    
    # Initialize schema if needed
    if ! docker exec dias-postgres psql -U postgres -d dias -c "\dt" 2>/dev/null | grep -q "disasters"; then
        print_info "Initializing database schema..."
        docker exec -i dias-postgres psql -U postgres -d dias < backend/config/schema.sql > /dev/null 2>&1
        docker exec -i dias-postgres psql -U postgres -d dias < backend/config/sns-schema.sql > /dev/null 2>&1
        print_success "Database schema initialized"
    else
        print_success "Database schema already exists"
    fi
    
    echo ""
}

# ============================================================================
# Backend Setup
# ============================================================================

start_backend() {
    print_step "Step 2/4: Starting Backend Server"
    
    # Clean up port
    kill_port $BACKEND_PORT
    
    # Navigate to backend
    cd backend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_info "Installing backend dependencies (this may take a minute)..."
        npm install --silent
        print_success "Backend dependencies installed"
    else
        print_success "Backend dependencies already installed"
    fi
    
    # Start backend
    print_info "Starting backend on http://localhost:$BACKEND_PORT"
    npm run dev > /dev/null 2>&1 &
    BACKEND_PID=$!
    
    # Store PID for cleanup
    echo $BACKEND_PID > /tmp/dias-backend.pid
    
    cd ..
    
    # Wait for backend to be ready
    print_info "Waiting for backend to be ready..."
    local retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -s http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
            print_success "Backend server is ready!"
            break
        fi
        retries=$((retries + 1))
        sleep 1
    done
    
    if [ $retries -eq $MAX_RETRIES ]; then
        print_warning "Backend health check timed out (continuing anyway)"
    fi
    
    echo ""
}

# ============================================================================
# Frontend Setup
# ============================================================================

start_frontend() {
    print_step "Step 3/4: Starting Frontend Development Server"
    
    # Clean up port
    kill_port $FRONTEND_PORT
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_info "Installing frontend dependencies (this may take a minute)..."
        npm install --silent
        print_success "Frontend dependencies installed"
    else
        print_success "Frontend dependencies already installed"
    fi
    
    # Start frontend
    print_info "Starting frontend on http://localhost:$FRONTEND_PORT"
    npm run dev > /dev/null 2>&1 &
    FRONTEND_PID=$!
    
    # Store PID for cleanup
    echo $FRONTEND_PID > /tmp/dias-frontend.pid
    
    # Wait a bit for frontend to start
    sleep 3
    
    if port_in_use $FRONTEND_PORT; then
        print_success "Frontend server is ready!"
    else
        print_warning "Frontend may still be starting..."
    fi
    
    echo ""
}

# ============================================================================
# Data Sync
# ============================================================================

sync_disaster_data() {
    print_step "Step 4/4: Syncing Disaster Data"
    
    # Check if we have data already
    print_info "Checking existing data..."
    
    local count=0
    if curl -s http://localhost:$BACKEND_PORT/api/disasters > /dev/null 2>&1; then
        count=$(curl -s http://localhost:$BACKEND_PORT/api/disasters | grep -o '"count":[0-9]*' | grep -o '[0-9]*' 2>/dev/null || echo "0")
    fi
    
    if [ "$count" -eq "0" ] || [ -z "$count" ]; then
        print_info "Fetching real-time disaster data from global APIs..."
        print_info "This includes: USGS (Earthquakes), NASA FIRMS (Fires), EFAS (Floods), NASA (Cyclones)"
        
        if curl -X POST http://localhost:$BACKEND_PORT/api/sync/all -s -o /dev/null; then
            print_success "Disaster data synced successfully!"
            
            # Get updated count
            sleep 2
            count=$(curl -s http://localhost:$BACKEND_PORT/api/disasters | grep -o '"count":[0-9]*' | grep -o '[0-9]*' 2>/dev/null || echo "unknown")
            print_success "Found $count active disasters worldwide"
        else
            print_warning "Data sync may have failed (you can retry from the map page)"
        fi
    else
        print_success "Found $count disasters already in database"
        print_info "To refresh data, click 'Sync Data' on the map page"
    fi
    
    echo ""
}

# ============================================================================
# Success Message
# ============================================================================

print_success_message() {
    echo ""
    echo -e "${GREEN}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}${BOLD}║                                                            ║${NC}"
    echo -e "${GREEN}${BOLD}║               DIAS is now running!                  ║${NC}"
    echo -e "${GREEN}${BOLD}║                                                            ║${NC}"
    echo -e "${GREEN}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BOLD}Access Points:${NC}"
    echo -e "  ${CYAN}Frontend:${NC}  http://localhost:$FRONTEND_PORT"
    echo -e "  ${CYAN}Backend:${NC}   http://localhost:$BACKEND_PORT"
    echo -e "  ${CYAN}Database:${NC}  localhost:$DB_PORT"
    echo ""
    echo -e "${BOLD}Quick Tips:${NC}"
    echo -e "  • Visit the ${MAGENTA}Live Map${NC} page to see disaster locations"
    echo -e "  • Subscribe to ${MAGENTA}country-specific alerts${NC} on the Subscribe page"
    echo -e "  • Use ${MAGENTA}Ctrl+C${NC} to stop all services"
    echo -e "  • Run ${MAGENTA}./stop.sh${NC} to cleanly stop all services"
    echo ""
    echo -e "${YELLOW}Note:${NC} Background jobs sync data every 10 minutes automatically"
    echo ""
}

# ============================================================================
# Cleanup Handler
# ============================================================================

cleanup() {
    echo ""
    print_info "Shutting down services..."
    
    # Kill backend
    if [ -f /tmp/dias-backend.pid ]; then
        kill $(cat /tmp/dias-backend.pid) 2>/dev/null || true
        rm /tmp/dias-backend.pid
    fi
    kill_port $BACKEND_PORT
    
    # Kill frontend
    if [ -f /tmp/dias-frontend.pid ]; then
        kill $(cat /tmp/dias-frontend.pid) 2>/dev/null || true
        rm /tmp/dias-frontend.pid
    fi
    kill_port $FRONTEND_PORT
    
    # Stop database
    docker compose down >/dev/null 2>&1
    
    print_success "All services stopped"
    echo ""
    exit 0
}

trap cleanup SIGINT SIGTERM

# ============================================================================
# Main Execution
# ============================================================================

main() {
    clear
    echo ""
    print_info "DIAS - Disaster Information & Alert System"
    echo ""
    
    preflight_checks
    start_database
    start_backend
    start_frontend
    sync_disaster_data
    print_success_message
    
    # Keep script running
    print_info "Services are running in the background. Press Ctrl+C to stop."
    echo ""
    
    # Wait indefinitely
    while true; do
        sleep 1
    done
}

# Run main function
main

