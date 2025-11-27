import { execSync } from 'child_process';
import 'dotenv/config';
import readlineSync from 'readline-sync';

let ip = readlineSync.question('Enter your IP address or press enter to use default: ');

if (!ip) {
    
    ip = process.env.POCKETBASE_HOST;
};

execSync(`cd backend/pocketbase && pocketbase.exe serve --http="${ip}:8090"`, { stdio: 'inherit' });