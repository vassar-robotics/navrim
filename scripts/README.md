# Navrim Development Scripts

This directory contains utility scripts for Navrim development and testing.

## Available Scripts

### clean-dev-env.sh

Cleans the local development environment to simulate a fresh macOS installation. This is useful for testing the first-run experience and installation process.

#### Usage

```bash
# Basic usage - will prompt for confirmation
./scripts/clean-dev-env.sh

# Skip confirmation prompts
./scripts/clean-dev-env.sh --force

# Preview what will be deleted without actually deleting
./scripts/clean-dev-env.sh --dry-run

# Show help
./scripts/clean-dev-env.sh --help
```

#### What it cleans

- **Navrim Virtual Environment**: `~/Library/Application Support/Navrim/navrim-env`
- **Application Caches**: 
  - `~/Library/Application Support/Navrim/Cache`
  - `~/Library/Application Support/Navrim/GPUCache`
  - `~/Library/Application Support/Navrim/blob_storage`
- **UV Package Manager** (completely removes UV installation):
  - `~/.local/bin/uv` - UV binary
  - `~/.cargo/bin/uv` - UV binary (if installed via cargo)
  - `~/.local/share/uv` - UV tool directory
  - `~/.cache/uv` - UV package cache

#### Options

- `--dry-run`: Show what would be deleted without actually deleting anything
- `--force`, `-f`: Skip confirmation prompts
- `--help`, `-h`: Show usage information

#### NPM Script

You can also run the cleanup script using npm:

```bash
npm run clean:dev
```

## Adding New Scripts

When adding new development scripts:

1. Create the script file in this directory
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Add documentation here in README.md
4. Consider adding an npm script alias in package.json if frequently used
5. Use consistent error handling and output formatting (see clean-dev-env.sh for reference)