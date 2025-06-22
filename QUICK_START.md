# Quick Start Guide

This is a quick start guide to help you launch Phosphobot LeRobot Desktop application in 5 minutes.

## 📋 Prerequisites

Make sure your system has the following installed:

- **Node.js 16+** - [Download Link](https://nodejs.org/)
- **Git** - [Download Link](https://git-scm.com/)
- **Network Connection** - For downloading dependencies and backend environment
- **uv (Optional)** - [Installation Guide](https://astral.sh/uv) - If not installed, the app will download automatically

## 🚀 5-Minute Quick Setup

### 1. Get Project Code

```bash
git clone <your-repo-url>
cd phosphobot-lerobot-desktop
```

### 2. Install Project Dependencies

```bash
npm install
```

### 3. Automatic Project Setup

```bash
npm run setup
```

This command will automatically:
- ✅ Check system environment
- ✅ Download Phosphobot frontend code
- ✅ Install frontend dependencies
- ✅ Create necessary directory structure

### 4. Build Frontend

```bash
npm run build-frontend
```

### 5. Start Application

```bash
npm start
```

## 🎯 First Run

When you start the application for the first time, you will see the setup wizard:

1. **Choose Installation Directory** - Select installation location for LeRobot backend
2. **Auto-detect uv** - Skip if uv is already installed, otherwise automatically download and install
3. **Create Environment** - Use uv to create Python virtual environment
4. **Install Dependencies** - Use uv to quickly install LeRobot dependencies
5. **Wait for Completion** - The entire process takes about 5-10 minutes (faster than traditional methods)
6. **Start Using** - Full functionality available after installation is complete

## 🛠️ Development Mode

If you want to develop:

```bash
# Start development mode (with hot reload support)
npm run dev

# Clean build files
npm run clean

# Re-setup project
npm run clean && npm run setup
```

## 📦 Build and Distribution

```bash
# Build production version
npm run build

# Create installer package
npm run dist
```

The built installer will be in the `release/` directory.

## ❗ Common Issues

### Q: What if frontend setup fails?

**A: Manually setup frontend**
```bash
git clone https://github.com/phospho-app/phosphobot.git temp-phosphobot
cp -r temp-phosphobot/dashboard frontend
rm -rf temp-phosphobot
cd frontend && npm install
```

### Q: What if Node.js version is too low?

**A: Upgrade Node.js**
- Visit [nodejs.org](https://nodejs.org/) to download the latest LTS version
- Or use nvm: `nvm install 18 && nvm use 18`

### Q: What if Git clone fails?

**A: Check network and Git configuration**
```bash
# Check Git version
git --version

# Check network connection
ping github.com

# Try using HTTPS instead of SSH
git config --global url."https://github.com/".insteadOf git@github.com:
```

### Q: What if frontend build fails?

**A: Check frontend project configuration**
1. Make sure `frontend/` directory exists
2. Check if `frontend/package.json` has build script
3. Try manual build:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

### Q: What if backend installation fails?

**A: Check system requirements and uv installation**
1. Ensure sufficient disk space (at least 2GB)
2. Ensure network can access GitHub and uv download sources
3. If uv auto-installation fails, install manually:
   - **macOS**: `brew install uv`
   - **Windows**: `winget install uv` or visit [astral.sh/uv](https://astral.sh/uv)
   - **Linux**: `curl -LsSf https://astral.sh/uv/install.sh | sh`
4. Re-select installation directory and retry

### Q: What is uv? Why use it?

**A: Advantages of uv**
- 🚀 **Ultra Fast**: 10-100x faster than traditional pip
- 📦 **Modern**: Built with Rust, more reliable
- 💾 **Lightweight**: No need to download large Miniconda
- 🔧 **Compatible**: Fully compatible with existing Python ecosystem

## 📚 Next Steps

- 📖 Read the complete [README.md](./README.md)
- 🔧 Check [Technical Architecture Documentation](./README.md#technical-architecture)
- 🐛 Having issues? [Submit Issue](your-repo-url/issues)
- 💡 Have suggestions? [Contribute](./README.md#contributing)

## 🆘 Getting Help

If you encounter any issues:

1. Check the [Troubleshooting](./README.md#troubleshooting) section
2. Search existing [Issues](your-repo-url/issues)
3. Create new [Issue](your-repo-url/issues/new)
4. Contact maintainers

---

**Happy using!** 🎉 