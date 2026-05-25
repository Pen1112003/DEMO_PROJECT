import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToClean = [
  '../node_modules/get-proto/tsconfig.json',
  '../node_modules/has-symbols/tsconfig.json',
  '../node_modules/side-channel-list/tsconfig.json',
  '../node_modules/side-channel-map/tsconfig.json',
  '../node_modules/side-channel-weakmap/tsconfig.json',
  '../node_modules/side-channel/tsconfig.json'
];

filesToClean.forEach(file => {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Clean extends parameter directly using simple regex
      const directReplace = content.replace(/"extends":\s*"@ljharb\/tsconfig",?/g, '');
      fs.writeFileSync(filePath, directReplace, 'utf8');
      console.log(`Cleaned extends from ${file}`);
    } catch (e) {
      console.error(`Failed to clean ${file}:`, e.message);
    }
  }
});
