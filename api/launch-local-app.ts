import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  runtime: 'nodejs',
};

interface LaunchRequest {
  scriptPath: string;
  appName: string;
}

interface LaunchResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Security: Define allowed script directories
// Note: Update these paths to match your system's script directories
const ALLOWED_SCRIPT_DIRECTORIES = [
  process.env.HOME ? `${process.env.HOME}/dev/scripts` : '/home/user/dev/scripts',
  process.env.HOME ? `${process.env.HOME}/scripts` : '/home/user/scripts',
  process.env.HOME ? `${process.env.HOME}/Downloads` : '/home/user/Downloads',
  process.env.HOME ? `${process.env.HOME}/Documents/scripts` : '/home/user/Documents/scripts',
  './scripts', // Relative to project root
  // Add more allowed directories as needed
];

function isPathAllowed(scriptPath: string): boolean {
  const absolutePath = path.resolve(scriptPath);
  return ALLOWED_SCRIPT_DIRECTORIES.some(allowedDir => 
    absolutePath.startsWith(path.resolve(allowedDir))
  );
}

async function scriptExists(scriptPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(scriptPath);
    return stats.isFile();
  } catch {
    return false;
  }
}

function executePythonScript(scriptPath: string): Promise<{ success: boolean; output?: string; error?: string }> {
  return new Promise((resolve) => {
    console.log(`🚀 Launching script: ${scriptPath}`);
    
    const pythonProcess = spawn('python3', [scriptPath], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    // Set a timeout for the process
    const timeout = setTimeout(() => {
      pythonProcess.kill('SIGTERM');
      resolve({
        success: false,
        error: 'Script execution timed out after 10 seconds'
      });
    }, 10000);

    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      
      console.log(`📊 Script finished with code: ${code}`);
      console.log(`📤 stdout: ${stdout}`);
      console.log(`📤 stderr: ${stderr}`);

      if (code === 0) {
        resolve({
          success: true,
          output: stdout.trim()
        });
      } else {
        resolve({
          success: false,
          error: stderr.trim() || `Script exited with code ${code}`
        });
      }
    });

    pythonProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.error(`❌ Failed to start script: ${error.message}`);
      resolve({
        success: false,
        error: `Failed to start script: ${error.message}`
      });
    });

    // Detach the process so it can continue running independently
    pythonProcess.unref();
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const body: LaunchRequest = await req.json();
    const { scriptPath, appName } = body;

    if (!scriptPath || !appName) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: scriptPath and appName' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Security check: Ensure script path is in allowed directories
    if (!isPathAllowed(scriptPath)) {
      console.warn(`🚫 Blocked attempt to execute script outside allowed directories: ${scriptPath}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Script path not in allowed directories' 
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if script exists
    if (!(await scriptExists(scriptPath))) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Script not found: ${scriptPath}` 
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Execute the Python script
    const result = await executePythonScript(scriptPath);

    if (result.success) {
      const response: LaunchResponse = {
        success: true,
        message: `${appName} launched successfully!`
      };

      return new Response(
        JSON.stringify(response),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } else {
      const response: LaunchResponse = {
        success: false,
        error: result.error || 'Unknown error occurred'
      };

      return new Response(
        JSON.stringify(response),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('❌ API Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}