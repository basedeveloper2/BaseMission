import fs from 'fs';
import path from 'path';

export default function handler(req: any, res: any) {
  try {
    const cwd = process.cwd();
    const rootFiles = fs.readdirSync(cwd);
    
    let serverFiles: string[] = [];
    try {
      serverFiles = fs.readdirSync(path.join(cwd, 'server'));
    } catch (e) {
      serverFiles = ["Error reading server dir: " + e];
    }

    let serverSrcFiles: string[] = [];
    try {
      serverSrcFiles = fs.readdirSync(path.join(cwd, 'server', 'src'));
    } catch (e) {
      serverSrcFiles = ["Error reading server/src dir: " + e];
    }

    res.status(200).json({ 
      status: "ok", 
      message: "Health check passed",
      debug: {
        cwd,
        rootFiles,
        serverFiles,
        serverSrcFiles
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}
