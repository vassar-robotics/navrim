#!/bin/bash

# Phosphobot Process Checker
# This script checks if phosphobot processes are running and provides options to terminate them

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Check if running on supported platform
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    print_error "This script is for Unix-like systems (macOS/Linux)"
    print_info "On Windows, use: tasklist | findstr phosphobot"
    exit 1
fi

print_header "Phosphobot Process Checker"

# Check for phosphobot processes
print_info "Searching for phosphobot processes..."
echo ""

# Find phosphobot processes
PIDS=$(pgrep -f phosphobot 2>/dev/null || true)

if [ -z "$PIDS" ]; then
    print_success "No phosphobot processes found - all clean!"
    echo ""
    print_info "Phosphobot has been properly terminated."
    exit 0
fi

# Phosphobot processes found
print_warning "Found running phosphobot process(es)!"
echo ""

# Display detailed information
print_info "Process details:"
echo ""
echo "PID    PPID   USER       CPU%  MEM%  COMMAND"
echo "────────────────────────────────────────────────────────────────────────"

for pid in $PIDS; do
    # Get process details
    ps -p "$pid" -o pid=,ppid=,user=,pcpu=,pmem=,command= 2>/dev/null || true
done

echo ""

# Show process tree if available
if command -v pstree &> /dev/null; then
    print_info "Process tree:"
    echo ""
    for pid in $PIDS; do
        pstree -p "$pid" 2>/dev/null || true
    done
    echo ""
fi

# Count processes
NUM_PROCESSES=$(echo "$PIDS" | wc -w | tr -d ' ')
print_warning "Total phosphobot processes running: $NUM_PROCESSES"
echo ""

# Check for child processes
print_info "Checking for child processes..."
CHILD_COUNT=0
for pid in $PIDS; do
    CHILDREN=$(pgrep -P "$pid" 2>/dev/null || true)
    if [ -n "$CHILDREN" ]; then
        CHILD_COUNT=$((CHILD_COUNT + $(echo "$CHILDREN" | wc -w | tr -d ' ')))
    fi
done

if [ $CHILD_COUNT -gt 0 ]; then
    print_warning "Found $CHILD_COUNT child process(es)"
else
    print_info "No child processes found"
fi
echo ""

# Ask user if they want to terminate
echo -e "${YELLOW}Do you want to terminate these processes?${NC}"
echo ""
echo "  1) Graceful shutdown (SIGTERM) - recommended"
echo "  2) Force kill (SIGKILL) - if process is unresponsive"
echo "  3) Force kill process tree (SIGKILL) - kill all children too"
echo "  4) No, just exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_info "Sending SIGTERM to phosphobot processes..."
        for pid in $PIDS; do
            if kill -TERM "$pid" 2>/dev/null; then
                print_success "Sent SIGTERM to PID $pid"
            else
                print_error "Failed to send SIGTERM to PID $pid (may require sudo)"
            fi
        done
        echo ""
        print_info "Waiting 3 seconds for graceful shutdown..."
        sleep 3

        # Check if processes are still running
        REMAINING=$(pgrep -f phosphobot 2>/dev/null || true)
        if [ -z "$REMAINING" ]; then
            print_success "All phosphobot processes terminated successfully!"
        else
            print_warning "Some processes are still running. Consider using force kill."
        fi
        ;;

    2)
        print_info "Force killing phosphobot processes with SIGKILL..."
        for pid in $PIDS; do
            if kill -KILL "$pid" 2>/dev/null; then
                print_success "Force killed PID $pid"
            else
                print_error "Failed to kill PID $pid (may require sudo)"
            fi
        done
        echo ""
        sleep 1

        # Check if processes are gone
        REMAINING=$(pgrep -f phosphobot 2>/dev/null || true)
        if [ -z "$REMAINING" ]; then
            print_success "All phosphobot processes terminated!"
        else
            print_error "Some processes could not be killed. Try with sudo."
        fi
        ;;

    3)
        print_info "Force killing phosphobot process tree..."
        for pid in $PIDS; do
            # Kill children first
            CHILDREN=$(pgrep -P "$pid" 2>/dev/null || true)
            if [ -n "$CHILDREN" ]; then
                for child in $CHILDREN; do
                    if kill -KILL "$child" 2>/dev/null; then
                        print_success "Killed child process $child"
                    fi
                done
            fi

            # Kill parent
            if kill -KILL "$pid" 2>/dev/null; then
                print_success "Killed parent process $pid"
            else
                print_error "Failed to kill PID $pid (may require sudo)"
            fi
        done
        echo ""
        sleep 1

        # Verify
        REMAINING=$(pgrep -f phosphobot 2>/dev/null || true)
        if [ -z "$REMAINING" ]; then
            print_success "All phosphobot processes terminated!"
        else
            print_error "Some processes could not be killed. Try with sudo."
        fi
        ;;

    4)
        print_info "Exiting without terminating processes."
        exit 0
        ;;

    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
print_header "Done"
