#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Phosphobot LeRobot Desktop project setup...\n');

// Check Node.js version
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    console.error('❌ Node.js 16 or higher is required');
    console.error(`   Current version: ${nodeVersion}`);
    process.exit(1);
  }
  
  console.log(`✅ Node.js version check passed: ${nodeVersion}`);
}

// Check if Git is installed
function checkGit() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    console.log('✅ Git is installed');
  } catch (error) {
    console.error('❌ Git is not installed, please install Git first');
    process.exit(1);
  }
}

// Create necessary directories
function createDirectories() {
  const dirs = ['dist', 'resources'];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

// Clone Phosphobot frontend
function setupFrontend() {
  console.log('\n📦 Setting up Phosphobot frontend...');
  
  try {
    // If already exists, delete first
    if (fs.existsSync('temp-phosphobot')) {
      console.log('🗑️  Cleaning existing temporary files...');
      fs.rmSync('temp-phosphobot', { recursive: true, force: true });
    }
    
    if (fs.existsSync('frontend')) {
      console.log('🗑️  Cleaning existing frontend files...');
      fs.rmSync('frontend', { recursive: true, force: true });
    }
    
    // Clone repository
    console.log('📥 Cloning Phosphobot repository...');
    execSync('git clone https://github.com/phospho-app/phosphobot.git temp-phosphobot', { 
      stdio: 'inherit' 
    });
    
    // Copy dashboard directory
    console.log('📂 Copying frontend code...');
    if (fs.existsSync('temp-phosphobot/dashboard')) {
      fs.cpSync('temp-phosphobot/dashboard', 'frontend', { recursive: true });
      console.log('✅ Frontend code copy completed');
    } else {
      console.error('❌ Dashboard directory not found');
      return false;
    }
    
    // Clean temporary files
    console.log('🗑️  Cleaning temporary files...');
    fs.rmSync('temp-phosphobot', { recursive: true, force: true });
    
    return true;
  } catch (error) {
    console.error('❌ Frontend setup failed:', error.message);
    return false;
  }
}

// Install frontend dependencies
function installFrontendDependencies() {
  console.log('\n📦 Installing frontend dependencies...');
  
  try {
    process.chdir('frontend');
    
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
      console.error('❌ package.json not found in frontend directory');
      return false;
    }
    
    // Try to install using npm
    console.log('📥 Installing dependencies using npm...');
    execSync('npm install', { stdio: 'inherit' });
    
    process.chdir('..');
    console.log('✅ Frontend dependencies installation completed');
    return true;
  } catch (error) {
    process.chdir('..');
    console.error('❌ Frontend dependencies installation failed:', error.message);
    return false;
  }
}

// Create basic dist structure
function createDistStructure() {
  console.log('\n📁 Creating dist directory structure...');
  
  const distPath = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  // Create a basic index.html as placeholder
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phosphobot LeRobot Desktop</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        h1 { color: #333; }
        .status { color: #666; margin: 20px 0; }
        .loading { 
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Phosphobot LeRobot Desktop</h1>
        <div class="status">
            <div class="loading"></div>
            <p>Loading application...</p>
        </div>
        <p>This is a placeholder page. Please run frontend build to get the complete application interface.</p>
    </div>
</body>
</html>
  `.trim();
  
  fs.writeFileSync(path.join(distPath, 'index.html'), indexHtml);
  console.log('✅ Created placeholder index.html');
}

// Main function
async function main() {
  try {
    checkNodeVersion();
    checkGit();
    createDirectories();
    
    const frontendSuccess = setupFrontend();
    if (!frontendSuccess) {
      console.error('\n❌ Frontend setup failed, please check network connection and permissions');
      process.exit(1);
    }
    
    const depsSuccess = installFrontendDependencies();
    if (!depsSuccess) {
      console.warn('\n⚠️  Frontend dependencies installation failed, you may need to install manually');
    }
    
    createDistStructure();
    
    console.log('\n🎉 Project setup completed!');
    console.log('\nNext steps:');
    console.log('1. npm run build-frontend  # Build frontend');
    console.log('2. npm run dev             # Run in development mode');
    console.log('3. npm run build           # Build for production');
    console.log('4. npm run dist            # Create distribution package');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run main function
main();

module.exports = { main }; 