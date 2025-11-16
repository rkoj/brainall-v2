import { Client } from 'ssh2';

const BASTION_HOST = process.env.BASTION_HOST || '192.168.100.102';
const BASTION_USER = process.env.BASTION_USER || 'root';
const BASTION_PASSWORD = process.env.BASTION_PASSWORD || 'Cl@$$UNDER2025';

export class BastionService {
  async executeCommand(command: string): Promise<{ output: string; error: string }> {
    return new Promise((resolve, reject) => {
      const conn = new Client();
      
      conn.on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          let output = '';
          let error = '';

          stream.on('close', () => {
            conn.end();
            resolve({ output, error });
          });

          stream.on('data', (data: Buffer) => {
            output += data.toString();
          });

          stream.stderr.on('data', (data: Buffer) => {
            error += data.toString();
          });
        });
      });

      conn.on('error', reject);

      conn.connect({
        host: BASTION_HOST,
        port: 22,
        username: BASTION_USER,
        password: BASTION_PASSWORD
      });
    });
  }
}

export const bastionService = new BastionService();
