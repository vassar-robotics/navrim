# Phosphobot LeRobot Desktop

An Electron desktop application that integrates Phosphobot frontend with LeRobot backend.

## Project Overview

This project integrates the following two open-source projects into an easy-to-use desktop application:

- **Phosphobot Frontend**: Dashboard frontend interface from [phospho-app/phosphobot](https://github.com/phospho-app/phosphobot)
- **LeRobot Backend**: Robotics learning backend from [huggingface/lerobot](https://github.com/huggingface/lerobot)

## Features

- ✅ **Frontend Packaging**: Phosphobot frontend fully integrated into Electron application
- ✅ **Backend On-demand Installation**: Automatic LeRobot backend environment installation on first run
- ✅ **Cross-platform Support**: Supports Windows, macOS and Linux
- ✅ **Modern Package Management**: Uses uv for fast Python environment and dependency management
- ✅ **Smart Detection**: Skips download if uv is already installed
- ✅ **Progress Display**: Real-time progress display during installation
- ✅ **Backend Management**: Start/stop backend service, view logs

## Project Structure

```
phosphobot-lerobot-desktop/
├── src/                    # Electron main process code
│   ├── main.js            # Main process entry file
│   ├── preload.js         # Preload script
│   └── backend-installer.js # Backend installer
├── resources/             # Resource files
│   ├── setup.html         # Setup page
│   └── icon.png          # Application icon
├── frontend/              # Phosphobot frontend code (obtained via script)
├── dist/                  # Built frontend files
├── release/               # Packaged application files
├── package.json           # Project configuration
└── README.md             # Project documentation
```

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Git

### Installation and Running

1. **Clone the project**
   ```bash
   git clone <your-repo-url>
   cd phosphobot-lerobot-desktop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup frontend**
   ```bash
   npm run setup
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   ```

5. **Build application**
   ```bash
   npm run build
   ```

6. **Package for distribution**
   ```bash
   npm run dist
   ```

## Development Guide

### Development Environment Setup

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Get Phosphobot frontend code:
   ```bash
   npm run setup-frontend
   ```

3. Install frontend dependencies:
   ```bash
   npm run install-frontend
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Build Process

Application build consists of the following steps:

1. **Frontend Build**: Build Phosphobot dashboard
2. **Electron Packaging**: Package application using electron-builder
3. **Resource Copying**: Copy necessary resource files

### Custom Configuration

You can modify packaging options in the `build` configuration in `package.json`:

```json
{
  "build": {
    "appId": "com.yourcompany.phosphobot-lerobot",
    "productName": "Phosphobot LeRobot Desktop",
    "directories": {
      "output": "release"
    }
  }
}
```

## Technical Architecture

### Frontend Architecture

- **Tech Stack**: TypeScript + React (Phosphobot dashboard)
- **Build Tool**: Vite or Webpack (depends on original project configuration)
- **Integration Method**: Built static files packaged into Electron application

### Backend Architecture

- **Tech Stack**: Python + FastAPI (LeRobot)
- **Package Management**: uv (fast Python package manager)
- **Environment Management**: uv virtual environment
- **Installation Method**: uv + Git Clone + uv pip install
- **Management Method**: Electron main process manages backend process via child_process

### Communication Architecture

```
┌─────────────────┐    IPC     ┌──────────────────┐
│ Frontend (Renderer) │ ◄─────────► │ Main Process (Electron) │
└─────────────────┘            └──────────────────┘
                                        │
                                   child_process
                                        │
                                        ▼
                               ┌──────────────────┐
                               │  LeRobot Backend Process │
                               └──────────────────┘
```

## First-time Setup Process

When users run the application for the first time, the following setup process is triggered:

1. **Choose Installation Directory**: User selects installation location for LeRobot backend
2. **Check uv**: Check if uv is installed on system, automatically download and install if not
3. **Create Virtual Environment**: Use uv to create Python 3.10 virtual environment
4. **Clone LeRobot**: Clone LeRobot repository from GitHub
5. **Install Dependencies**: Use uv to install Python package dependencies
6. **Complete Setup**: Save configuration, start backend service

## uv Advantages

Compared to traditional Miniconda approach, using uv has the following advantages:

- 🚀 **Ultra Fast**: 10-100x faster installation speed than pip
- 📦 **Modern Tool**: Built with Rust, more reliable and stable
- 💾 **Small Size**: No need to download large Miniconda installation package
- 🔧 **Good Compatibility**: Fully compatible with pip ecosystem
- ⚡ **Smart Caching**: Better dependency resolution and caching mechanism

## Script Descriptions

- `npm run setup`: Complete project setup, including getting frontend code and installing dependencies
- `npm run setup-frontend`: Only get Phosphobot frontend code
- `npm run install-frontend`: Only install frontend dependencies
- `npm run build-frontend`: Build frontend code
- `npm run dev`: Development mode with hot reload support
- `npm run build`: Complete build process
- `npm run pack`: Package to directory (without creating installer)
- `npm run dist`: Create distribution installer

## Troubleshooting

### Frontend Setup Issues

If frontend setup fails, you can manually operate:

```bash
# Manually clone phosphobot
git clone https://github.com/phospho-app/phosphobot.git temp-phosphobot
```

### Node.js Version Issues

If Node.js version is too low:

- Visit [nodejs.org](https://nodejs.org/) to download the latest LTS version
- Or use nvm: `nvm install 18 && nvm use 18`

### Git Clone Issues

If Git clone fails:

```bash
# Check Git version
git --version

# Check network connection
ping github.com

# Try using HTTPS instead of SSH
git config --global url."https://github.com/".insteadOf git@github.com:
```

### Frontend Build Issues

Check frontend project configuration:
1. Make sure `frontend/` directory exists
2. Check if `frontend/package.json` has build script
3. Try manual build:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

### Backend Installation Issues

Check system requirements and uv installation:
1. Ensure sufficient disk space (at least 2GB)
2. Ensure network can access GitHub and uv download sources
3. If uv auto-installation fails, install manually:
   - **macOS**: `brew install uv`
   - **Windows**: `winget install uv` or visit [astral.sh/uv](https://astral.sh/uv)
   - **Linux**: `curl -LsSf https://astral.sh/uv/install.sh | sh`
4. Re-select installation directory and retry

## Contributing

We welcome contributions! Please read our contribution guidelines before submitting PR.

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit Pull Request

### Code Style

- Use ESLint and Prettier for code formatting
- Follow existing code style
- Write meaningful commit messages
- Add tests for new features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [phospho-app/phosphobot](https://github.com/phospho-app/phosphobot) for the excellent frontend
- [huggingface/lerobot](https://github.com/huggingface/lerobot) for the powerful robotics backend
- [astral-sh/uv](https://github.com/astral-sh/uv) for the fast Python package manager

## Contact

- Issues: [GitHub Issues](your-repo-url/issues)
- Discussions: [GitHub Discussions](your-repo-url/discussions)
- Email: your-email@example.com

---

**Happy coding!** 🚀 