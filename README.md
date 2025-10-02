# Navrim

Download the latest builds [here](https://download.vassarrobotics.com).

This project is under active development. Please refer to [branch dev/littlenyima/v1](https://github.com/vassar-robotics/navrim/tree/dev/littlenyima/v1) for more details.

## Development

### Prerequisites

- Node.js 20+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start
```

### Testing Fresh Installation

To test the app as if it's being run on a new Mac for the first time:

```bash
# Clean all local Navrim data
npm run clean:dev

# Or use the script directly with options
./scripts/clean-dev-env.sh --dry-run  # Preview what will be deleted
./scripts/clean-dev-env.sh --force    # Skip confirmation
```

This will remove:
- Navrim virtual environment
- Application caches
- All local Navrim data
- UV package manager installation

The next time you run the app, it will go through the complete setup process including:
- Installing uv package manager from scratch
- Creating virtual environment
- Installing navrim-phosphobot, navrim-lerobot, and gotrue packages
- Starting phosphobot service

### Build

```bash
# Build for production
pnpm build

# Package the app
pnpm package
```

### Scripts

See [scripts/README.md](scripts/README.md) for available development scripts.
