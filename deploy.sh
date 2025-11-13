#!/bin/bash

# NibJobs Deployment Script
# This script helps deploy the entire NibJobs platform

set -e

echo "🚀 Starting NibJobs deployment..."

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

# Check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI is not installed. Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
    log_success "Firebase CLI found"
}

# Check if user is logged in to Firebase
check_firebase_login() {
    if ! firebase projects:list &> /dev/null; then
        log_error "Not logged in to Firebase. Please login first:"
        echo "firebase login"
        exit 1
    fi
    log_success "Firebase authentication verified"
}

# Deploy Firebase Functions
deploy_functions() {
    log_info "Deploying Firebase Functions..."
    cd functions
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        log_info "Installing function dependencies..."
        npm install
    fi
    
    # Build TypeScript
    log_info "Building TypeScript..."
    npm run build
    
    # Deploy functions
    log_info "Deploying to Firebase..."
    firebase deploy --only functions
    
    cd ..
    log_success "Functions deployed successfully"
}

# Deploy Firestore rules and indexes
deploy_firestore() {
    log_info "Deploying Firestore rules and indexes..."
    firebase deploy --only firestore:rules,firestore:indexes
    log_success "Firestore rules and indexes deployed"
}

# Deploy Storage rules
deploy_storage() {
    log_info "Deploying Storage rules..."
    firebase deploy --only storage
    log_success "Storage rules deployed"
}

# Build and deploy web app
deploy_web() {
    log_info "Building and deploying web application..."
    cd mobile
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        log_info "Installing mobile dependencies..."
        npm install
    fi
    
    # Build web version
    log_info "Building web application..."
    npm run build:web
    
    cd ..
    
    # Deploy to Firebase Hosting
    log_info "Deploying to Firebase Hosting..."
    firebase deploy --only hosting
    
    log_success "Web application deployed"
}

# Set up initial data
setup_initial_data() {
    log_info "Setting up initial data..."
    
    # Here you would typically run scripts to:
    # 1. Create initial categories
    # 2. Add sample Telegram sources
    # 3. Set up app metadata
    
    log_warning "Initial data setup not implemented yet"
    log_info "Please manually add Telegram sources to the 'telegram_sources' collection"
}

# Main deployment function
deploy_all() {
    log_info "Starting full deployment..."
    
    deploy_firestore
    deploy_storage
    deploy_functions
    deploy_web
    setup_initial_data
    
    log_success "🎉 NibJobs deployed successfully!"
    log_info "Next steps:"
    echo "1. Add Telegram sources to Firestore 'telegram_sources' collection"
    echo "2. Configure Cloud Scheduler for daily job scraping"
    echo "3. Test the application with sample data"
    echo "4. Submit mobile apps to App Store and Google Play"
}

# Parse command line arguments
case "${1:-all}" in
    "functions")
        check_firebase_cli
        check_firebase_login
        deploy_functions
        ;;
    "firestore")
        check_firebase_cli
        check_firebase_login
        deploy_firestore
        ;;
    "storage")
        check_firebase_cli
        check_firebase_login
        deploy_storage
        ;;
    "web")
        check_firebase_cli
        check_firebase_login
        deploy_web
        ;;
    "all")
        check_firebase_cli
        check_firebase_login
        deploy_all
        ;;
    "help"|"-h"|"--help")
        echo "NibJobs Deployment Script"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  functions   Deploy only Firebase Functions"
        echo "  firestore   Deploy only Firestore rules and indexes" 
        echo "  storage     Deploy only Storage rules"
        echo "  web         Deploy only web application"
        echo "  all         Deploy everything (default)"
        echo "  help        Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac