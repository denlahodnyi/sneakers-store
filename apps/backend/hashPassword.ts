import readlinePromises from 'node:readline/promises';
import * as bcrypt from 'bcrypt';

const rl = readlinePromises.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const pwd = await rl.question('Enter the password: ');
const hash = await bcrypt.hash(pwd, 10);
console.log(hash);
rl.close();
