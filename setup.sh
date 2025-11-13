#!/bin/bash

# NibJobs Development Setup Script
# This script helps set up the development environment

set -e

echo "🛠️  Setting up NibJobs development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check Node.js version
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    log_success "Node.js $(node -v) found"
}

# Install global dependencies
install_global_deps() {
    log_info "Installing global dependencies..."
    
    # Firebase CLI
    if ! command -v firebase &> /dev/null; then
        log_info "Installing Firebase CLI..."
        npm install -g firebase-tools
    fi
    
    # React Native CLI
    if ! command -v react-native &> /dev/null; then
        log_info "Installing React Native CLI..."
        npm install -g @react-native-community/cli
    fi
    
    log_success "Global dependencies installed"
}

# Setup workspace dependencies
setup_workspace() {
    log_info "Setting up workspace dependencies..."
    
    # Install root workspace dependencies
    if [ -f "package.json" ]; then
        npm install
        log_success "Root workspace dependencies installed"
    fi
}

# Setup shared package
setup_shared() {
    log_info "Setting up shared package..."
    cd shared
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Build shared package
    npm run build
    
    cd ..
    log_success "Shared package ready"
}

# Setup Firebase Functions
setup_functions() {
    log_info "Setting up Firebase Functions..."
    cd functions
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Copy environment template if .env doesn't exist
    if [ ! -f ".env" ]; then
        cp .env.example .env
        log_warning "Created functions/.env from template. Please fill in your API keys."
    fi
    
    cd ..
    log_success "Firebase Functions ready"
}

# Setup React Native app
setup_mobile() {
    log_info "Setting up React Native application..."
    cd mobile
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Copy environment template if .env doesn't exist  
    if [ ! -f ".env" ]; then
        cp .env.example .env
        log_warning "Created mobile/.env from template. Please fill in your Firebase config."
    fi
    
    # iOS specific setup
    if [ -d "ios" ] && command -v pod &> /dev/null; then
        log_info "Installing iOS dependencies..."
        cd ios
        pod install
        cd ..
        log_success "iOS dependencies installed"
    elif [ -d "ios" ]; then
        log_warning "CocoaPods not found. iOS dependencies not installed."
        log_info "Install CocoaPods: sudo gem install cocoapods"
    fi
    
    cd ..
    log_success "React Native application ready"
}

# Initialize Firebase project
init_firebase() {
    log_info "Initializing Firebase..."
    
    if [ ! -f ".firebaserc" ]; then
        log_warning "Firebase not initialized. Run 'firebase init' to set up your project."
        return
    fi
    
    # Start Firebase emulators for development
    log_info "Firebase emulators can be started with: npm run dev"
    log_success "Firebase configuration ready"
}

# Create initial Firestore data
setup_initial_firestore() {
    log_info "Setting up initial Firestore data..."
    
    # This would create initial categories, sample data, etc.
    log_warning "Initial Firestore data setup not implemented yet."
    log_info "After setting up Firebase, add sample data to Firestore collections."
}

# Main setup function
setup_all() {
    log_info "Starting complete development setup..."
    
    check_node
    install_global_deps
    setup_workspace
    setup_shared
    setup_functions
    setup_mobile
    init_firebase
    setup_initial_firestore
    
    log_success "🎉 Development environment setup complete!"
    log_info "Next steps:"
    echo "1. Fill in environment variables in functions/.env and mobile/.env"
    echo "2. Initialize Firebase: firebase init (if not done already)"
    echo "3. Start development: npm run dev"
    echo "4. Start React Native: cd mobile && npm run ios/android"
}

# Parse command line arguments
case "${1:-all}" in
    "workspace")
        check_node
        setup_workspace
        ;;
    "shared")
        setup_shared
        ;;
    "functions")
        setup_functions
        ;;
    "mobile")
        setup_mobile
        ;;
    "firebase")
        init_firebase
        ;;
    "all")
        setup_all
        ;;
    "help"|"-h"|"--help")
        echo "NibJobs Development Setup Script"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  workspace   Setup workspace dependencies"
        echo "  shared      Setup shared package"
        echo "  functions   Setup Firebase Functions"
        echo "  mobile      Setup React Native app"
        echo "  firebase    Initialize Firebase"
        echo "  all         Complete setup (default)"
        echo "  help        Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac