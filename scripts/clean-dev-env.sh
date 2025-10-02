#!/bin/bash

# Navrim Development Environment Cleanup Script
# This script removes all Navrim-related data from the local environment
# to simulate a fresh installation for testing purposes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Navrim Development Environment Cleaner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if directory exists and its size
check_directory() {
    local dir="$1"
    if [ -d "$dir" ]; then
        local size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        echo "$size"
        return 0
    else
        return 1
    fi
}

# Parse command line arguments
DRY_RUN=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force|-f)
            FORCE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --dry-run         Show what would be deleted without actually deleting"
            echo "  --force, -f       Skip confirmation prompts"
            echo "  --help, -h        Show this help message"
            echo ""
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Define paths to clean
NAVRIM_APP_SUPPORT="$HOME/Library/Application Support/Navrim"
NAVRIM_ENV="$NAVRIM_APP_SUPPORT/navrim-env"
NAVRIM_CACHE="$NAVRIM_APP_SUPPORT/Cache"
NAVRIM_GPU_CACHE="$NAVRIM_APP_SUPPORT/GPUCache"
NAVRIM_BLOB_STORAGE="$NAVRIM_APP_SUPPORT/blob_storage"
UV_CACHE="$HOME/.cache/uv"
UV_BIN="$HOME/.local/bin/uv"
UV_TOOL="$HOME/.local/share/uv"
CARGO_UV="$HOME/.cargo/bin/uv"

# Check what needs to be cleaned
echo -e "${BLUE}Checking for Navrim data...${NC}"
echo ""

FOUND_SOMETHING=false

# Check Navrim application support folder
if check_directory "$NAVRIM_APP_SUPPORT" > /dev/null; then
    size=$(check_directory "$NAVRIM_APP_SUPPORT")
    print_info "Found Navrim application support folder: $NAVRIM_APP_SUPPORT (${size})"
    FOUND_SOMETHING=true
fi

# Check for UV installation
UV_FOUND=false
if [ -f "$UV_BIN" ]; then
    print_info "Found UV binary: $UV_BIN"
    UV_FOUND=true
    FOUND_SOMETHING=true
fi

if [ -f "$CARGO_UV" ]; then
    print_info "Found UV binary (cargo): $CARGO_UV"
    UV_FOUND=true
    FOUND_SOMETHING=true
fi

if check_directory "$UV_TOOL" > /dev/null; then
    size=$(check_directory "$UV_TOOL")
    print_info "Found UV tool directory: $UV_TOOL (${size})"
    UV_FOUND=true
    FOUND_SOMETHING=true
fi

if check_directory "$UV_CACHE" > /dev/null; then
    size=$(check_directory "$UV_CACHE")
    print_info "Found UV cache: $UV_CACHE (${size})"
    FOUND_SOMETHING=true
fi

if [ "$UV_FOUND" = true ]; then
    print_warning "UV package manager will be removed (Navrim will reinstall it on next run)"
fi

echo ""

# If nothing found, exit
if [ "$FOUND_SOMETHING" = false ]; then
    print_success "No Navrim development data found. Environment is already clean!"
    exit 0
fi

# If dry run, show what would be deleted and exit
if [ "$DRY_RUN" = true ]; then
    print_warning "DRY RUN MODE - Nothing will be deleted"
    echo ""
    echo "The following would be removed:"
    [ -d "$NAVRIM_APP_SUPPORT" ] && echo "  - $NAVRIM_APP_SUPPORT (entire folder)"
    [ -f "$UV_BIN" ] && echo "  - $UV_BIN"
    [ -f "$CARGO_UV" ] && echo "  - $CARGO_UV"
    [ -d "$UV_TOOL" ] && echo "  - $UV_TOOL"
    [ -d "$UV_CACHE" ] && echo "  - $UV_CACHE"
    echo ""
    if [ -d "$NAVRIM_ENV" ]; then
        echo "Additionally, will attempt to uninstall:"
        echo "  - navrim-phosphobot package"
        echo "  - navrim-lerobot package"
        echo "  - gotrue package"
        echo ""
    fi
    print_info "Run without --dry-run to actually clean"
    exit 0
fi

# Confirmation prompt (unless --force is used)
if [ "$FORCE" = false ]; then
    echo -e "${YELLOW}This will remove all Navrim development data from your system.${NC}"
    echo -e "${YELLOW}This action cannot be undone.${NC}"
    echo ""
    read -p "Are you sure you want to continue? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleanup cancelled"
        exit 0
    fi
fi

# Perform cleanup
echo ""
print_info "Starting cleanup..."

# First, try to uninstall phosphobot and lerobot packages if virtual environment exists
if [ -d "$NAVRIM_ENV" ]; then
    print_info "Attempting to uninstall phosphobot and lerobot packages..."

    # Check if uv is available
    if command -v uv &> /dev/null; then
        # Try to uninstall packages using uv
        UV_PROJECT_ENVIRONMENT="$NAVRIM_ENV" uv pip uninstall navrim-phosphobot navrim-lerobot gotrue -y 2>/dev/null && \
            print_success "Uninstalled navrim packages" || \
            print_warning "Could not uninstall packages (environment may be corrupted)"
    else
        print_warning "UV not found, skipping package uninstall"
    fi
fi

# Remove entire Navrim application support folder
if [ -d "$NAVRIM_APP_SUPPORT" ]; then
    print_info "Removing entire Navrim application support folder..."
    rm -rf "$NAVRIM_APP_SUPPORT"
    print_success "Removed: $NAVRIM_APP_SUPPORT"
fi

# Remove UV package manager
if [ -f "$UV_BIN" ]; then
    print_info "Removing UV binary..."
    rm -f "$UV_BIN"
    print_success "Removed: $UV_BIN"
fi

if [ -f "$CARGO_UV" ]; then
    print_info "Removing UV binary (cargo)..."
    rm -f "$CARGO_UV"
    print_success "Removed: $CARGO_UV"
fi

if [ -d "$UV_TOOL" ]; then
    print_info "Removing UV tool directory..."
    rm -rf "$UV_TOOL"
    print_success "Removed: $UV_TOOL"
fi

if [ -d "$UV_CACHE" ]; then
    print_info "Removing UV cache..."
    rm -rf "$UV_CACHE"
    print_success "Removed: $UV_CACHE"
fi

echo ""
print_success "Cleanup complete! Your development environment is now clean."
print_info "The next app launch will perform a fresh installation, including reinstalling UV."
