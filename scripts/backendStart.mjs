import { execSync } from 'child_process';
import 'dotenv/config';
import readlineSync from 'readline-sync';

// console.log(process.env.EXPO_PUBLIC_POCKETBASE_HOST);


let ip = readlineSync.question('Enter your IP address or press enter to use default: ');

if (!ip) {
    
    ip = process.env.POCKETBASE_HOST;
};

let execCommand = `cd backend/pocketbase && pocketbase.exe serve --http="${ip}:8090"`

execSync(execCommand, { stdio: 'inherit' });