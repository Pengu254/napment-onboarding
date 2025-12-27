#!/bin/bash

# =============================================================================
# NAPMENT ONBOARDING - DEPLOYMENT SCRIPT
# =============================================================================
# Usage: ./deploy.sh [environment] [command]
# 
# Environments:
#   staging     - Deploy to staging
#   production  - Deploy to production
#   dev         - Local development
#
# Commands:
#   up          - Start services
#   down        - Stop services
#   restart     - Restart services
#   logs        - View logs
#   status      - Check status
#   build       - Build images
#   setup       - First-time server setup
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
ENVIRONMENT="${1:-dev}"
COMMAND="${2:-up}"
PROJECT_NAME="napment-onboarding"

# Print with color
print_msg() {
    echo -e "${2:-$GREEN}$1${NC}"
}

# Show banner
show_banner() {
    echo ""
    print_msg "╔═══════════════════════════════════════════════════════╗" $PURPLE
    print_msg "║          NAPMENT ONBOARDING DEPLOYMENT                ║" $PURPLE
    print_msg "╚═══════════════════════════════════════════════════════╝" $PURPLE
    echo ""
}

# Get compose file based on environment
get_compose_file() {
    case $ENVIRONMENT in
        production|prod)
            echo "docker/docker-compose.prod.yml"
            ;;
        staging|stage)
            echo "docker/docker-compose.staging.yml"
            ;;
        dev|development)
            echo "docker/docker-compose.dev.yml"
            ;;
        *)
            print_msg "Unknown environment: $ENVIRONMENT" $RED
            exit 1
            ;;
    esac
}

# Check if .env exists
check_env() {
    if [ ! -f ".env" ] && [ "$ENVIRONMENT" != "dev" ]; then
        print_msg "⚠️  Warning: .env file not found" $YELLOW
        print_msg "Copy env.example to .env and configure it:" $YELLOW
        print_msg "  cp env.example .env" $BLUE
        print_msg "  nano .env" $BLUE
    fi
}

# First-time server setup
setup() {
    print_msg "🔧 Setting up server for Napment Onboarding..." $BLUE
    
    # Update system
    print_msg "Updating system..." $YELLOW
    apt-get update && apt-get upgrade -y
    
    # Install Docker
    if ! command -v docker &> /dev/null; then
        print_msg "Installing Docker..." $YELLOW
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    else
        print_msg "Docker already installed ✓" $GREEN
    fi
    
    # Install Docker Compose
    if ! docker compose version &> /dev/null; then
        print_msg "Installing Docker Compose..." $YELLOW
        apt-get install -y docker-compose-plugin
    else
        print_msg "Docker Compose already installed ✓" $GREEN
    fi
    
    # Create project directory
    mkdir -p /opt/napment-onboarding
    
    print_msg "✅ Server setup complete!" $GREEN
    print_msg ""
    print_msg "Next steps:" $YELLOW
    print_msg "1. Clone the repository:" $BLUE
    print_msg "   git clone <repo-url> /opt/napment-onboarding" $BLUE
    print_msg "2. Configure environment:" $BLUE
    print_msg "   cd /opt/napment-onboarding" $BLUE
    print_msg "   cp env.example .env && nano .env" $BLUE
    print_msg "3. Deploy:" $BLUE
    print_msg "   ./deploy.sh production up" $BLUE
}

# Build images
build() {
    local compose_file=$(get_compose_file)
    print_msg "🔨 Building images for $ENVIRONMENT..." $BLUE
    docker compose -f $compose_file -p $PROJECT_NAME build --no-cache
    print_msg "✅ Build complete!" $GREEN
}

# Start services
up() {
    local compose_file=$(get_compose_file)
    check_env
    
    print_msg "🚀 Starting $ENVIRONMENT environment..." $BLUE
    docker compose -f $compose_file -p $PROJECT_NAME up -d
    
    sleep 5
    status
    
    print_msg ""
    print_msg "✅ Services started!" $GREEN
    
    case $ENVIRONMENT in
        production|prod)
            print_msg "Frontend: https://onboarding.bobbi.live" $BLUE
            print_msg "Backend:  https://onboarding-api.bobbi.live" $BLUE
            ;;
        staging|stage)
            print_msg "Frontend: https://staging-onboarding.bobbi.live" $BLUE
            print_msg "Backend:  https://staging-onboarding-api.bobbi.live" $BLUE
            ;;
        dev|development)
            print_msg "Frontend: http://localhost:3001" $BLUE
            print_msg "Backend:  http://localhost:8001" $BLUE
            ;;
    esac
}

# Stop services
down() {
    local compose_file=$(get_compose_file)
    print_msg "⏹️  Stopping $ENVIRONMENT environment..." $BLUE
    docker compose -f $compose_file -p $PROJECT_NAME down
    print_msg "Services stopped" $GREEN
}

# Restart services
restart() {
    local compose_file=$(get_compose_file)
    print_msg "🔄 Restarting $ENVIRONMENT environment..." $BLUE
    docker compose -f $compose_file -p $PROJECT_NAME restart
    sleep 3
    status
}

# View logs
logs() {
    local compose_file=$(get_compose_file)
    print_msg "📋 Logs for $ENVIRONMENT (Ctrl+C to exit)..." $BLUE
    docker compose -f $compose_file -p $PROJECT_NAME logs -f
}

# Check status
status() {
    local compose_file=$(get_compose_file)
    print_msg "📊 Status for $ENVIRONMENT:" $BLUE
    docker compose -f $compose_file -p $PROJECT_NAME ps
    
    echo ""
    print_msg "📈 Resource Usage:" $BLUE
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
        $(docker compose -f $compose_file -p $PROJECT_NAME ps -q 2>/dev/null) 2>/dev/null || true
}

# Pull and update
update() {
    local compose_file=$(get_compose_file)
    print_msg "📥 Updating $ENVIRONMENT..." $BLUE
    
    # Pull latest code if git repo
    if [ -d ".git" ]; then
        git pull
    fi
    
    # Pull latest images
    docker compose -f $compose_file -p $PROJECT_NAME pull
    
    # Restart with new images
    docker compose -f $compose_file -p $PROJECT_NAME up -d --force-recreate
    
    # Cleanup
    docker image prune -f
    
    print_msg "✅ Update complete!" $GREEN
}

# Show help
help() {
    echo "Napment Onboarding Deployment Script"
    echo ""
    echo "Usage: ./deploy.sh [environment] [command]"
    echo ""
    echo "Environments:"
    echo "  dev, development   Local development"
    echo "  staging, stage     Staging environment"
    echo "  production, prod   Production environment"
    echo ""
    echo "Commands:"
    echo "  up        Start services"
    echo "  down      Stop services"
    echo "  restart   Restart services"
    echo "  logs      View logs"
    echo "  status    Check status"
    echo "  build     Build images"
    echo "  update    Pull and update"
    echo "  setup     First-time server setup (run as root)"
    echo "  help      Show this help"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh dev up           # Start local development"
    echo "  ./deploy.sh staging up       # Deploy to staging"
    echo "  ./deploy.sh production up    # Deploy to production"
    echo "  ./deploy.sh staging logs     # View staging logs"
}

# Main
show_banner
print_msg "Environment: $ENVIRONMENT | Command: $COMMAND" $YELLOW
echo ""

case $COMMAND in
    setup)
        setup
        ;;
    build)
        build
        ;;
    up|start)
        up
        ;;
    down|stop)
        down
        ;;
    restart)
        restart
        ;;
    logs)
        logs
        ;;
    status|ps)
        status
        ;;
    update|pull)
        update
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_msg "Unknown command: $COMMAND" $RED
        help
        exit 1
        ;;
esac

