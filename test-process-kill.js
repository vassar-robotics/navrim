/**
 * Test script to verify phosphobot process termination
 *
 * This script helps verify that:
 * 1. Processes can be terminated gracefully with SIGTERM
 * 2. Processes can be force-killed with SIGKILL if they don't respond
 * 3. Child processes are also terminated
 *
 * Usage: node test-process-kill.js
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Create a mock long-running process that simulates phosphobot
function createMockProcess(respondToSignals = true) {
  const script = `
    const http = require('http');

    ${respondToSignals ? `
    // Handle SIGTERM gracefully
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      setTimeout(() => {
        console.log('Cleanup complete, exiting');
        process.exit(0);
      }, 1000);
    });
    ` : `
    // Ignore SIGTERM (simulate unresponsive process)
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM but ignoring it...');
    });
    `}

    // Create a simple HTTP server to keep process alive
    const server = http.createServer((req, res) => {
      res.writeHead(200);
      res.end('Mock phosphobot service');
    });

    server.listen(8999, () => {
      console.log('Mock phosphobot running on port 8999');
    });

    // Spawn a child process to test process tree killing
    const child = spawn('sleep', ['3600']);
    console.log('Spawned child process with PID:', child.pid);

    child.on('exit', (code) => {
      console.log('Child process exited with code:', code);
    });
  `;

  return spawn('node', ['-e', script], {
    stdio: ['ignore', 'pipe', 'pipe']
  });
}

// Kill process tree (same logic as in environment.ts)
async function killProcessTree(pid) {
  try {
    if (process.platform === 'win32') {
      await execAsync(`taskkill /pid ${pid} /T /F`);
    } else {
      try {
        const { stdout } = await execAsync(`pgrep -P ${pid}`);
        const childPids = stdout.trim().split('\n').filter(p => p);

        console.log(`Found ${childPids.length} child process(es):`, childPids);

        for (const childPid of childPids) {
          try {
            process.kill(parseInt(childPid), 'SIGKILL');
            console.log(`Killed child process ${childPid}`);
          } catch (e) {
            console.log(`Child process ${childPid} already dead`);
          }
        }
      } catch (e) {
        console.log('No children found or pgrep failed');
      }

      try {
        process.kill(pid, 'SIGKILL');
        console.log(`Killed main process ${pid}`);
      } catch (e) {
        console.log(`Main process ${pid} already dead`);
      }
    }
  } catch (error) {
    console.error('Error killing process tree:', error.message);
  }
}

// Test graceful shutdown
async function testGracefulShutdown() {
  console.log('\n=== Test 1: Graceful Shutdown (responsive process) ===');

  const mockProcess = createMockProcess(true);
  console.log('Started mock process with PID:', mockProcess.pid);

  mockProcess.stdout.on('data', (data) => {
    console.log('STDOUT:', data.toString().trim());
  });

  mockProcess.stderr.on('data', (data) => {
    console.log('STDERR:', data.toString().trim());
  });

  // Wait for process to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Sending SIGTERM...');
  mockProcess.kill('SIGTERM');

  // Wait to see if it terminates gracefully
  const terminated = await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false);
    }, 6000);

    mockProcess.once('exit', (code, signal) => {
      clearTimeout(timeout);
      console.log(`Process exited with code ${code} and signal ${signal}`);
      resolve(true);
    });
  });

  if (terminated) {
    console.log('✅ Process terminated gracefully');
  } else {
    console.log('❌ Process did not terminate gracefully, force killing...');
    await killProcessTree(mockProcess.pid);
  }
}

// Test force kill on unresponsive process
async function testForceKill() {
  console.log('\n=== Test 2: Force Kill (unresponsive process) ===');

  const mockProcess = createMockProcess(false);
  console.log('Started unresponsive mock process with PID:', mockProcess.pid);

  mockProcess.stdout.on('data', (data) => {
    console.log('STDOUT:', data.toString().trim());
  });

  mockProcess.stderr.on('data', (data) => {
    console.log('STDERR:', data.toString().trim());
  });

  // Wait for process to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Sending SIGTERM...');
  mockProcess.kill('SIGTERM');

  // Wait to see if it terminates gracefully
  const terminated = await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve(false);
    }, 6000);

    mockProcess.once('exit', (code, signal) => {
      clearTimeout(timeout);
      console.log(`Process exited with code ${code} and signal ${signal}`);
      resolve(true);
    });
  });

  if (!terminated) {
    console.log('Process did not respond to SIGTERM, force killing process tree...');
    await killProcessTree(mockProcess.pid);

    // Give it a moment
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      // Check if process is still alive
      process.kill(mockProcess.pid, 0);
      console.log('❌ Process still running after force kill!');
    } catch (e) {
      console.log('✅ Process successfully force killed');
    }
  } else {
    console.log('⚠️  Unresponsive process actually terminated (unexpected)');
  }
}

// Run all tests
async function runTests() {
  console.log('Starting process termination tests...\n');

  try {
    await testGracefulShutdown();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await testForceKill();

    console.log('\n=== All tests completed ===');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

runTests();
