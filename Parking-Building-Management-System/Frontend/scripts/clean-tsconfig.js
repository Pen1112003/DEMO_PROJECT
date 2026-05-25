import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToClean = [
  '../node_modules/get-proto/tsconfig.json',
  '../node_modules/has-symbols/tsconfig.json',
  '../node_modules/math-intrinsics/tsconfig.json'
];

filesToClean.forEach(file => {
  const filePath = path.resolve(__dirname, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Use simple regex to strip out comments and parse properly, or clean the file directly
      const cleanedContent = content.replace(/\/\/.*/g, '');
      const data = JSON.parse(cleanedContent);
      
      if (data.extends) {
        delete data.extends;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Successfully cleaned extends from ${file}`);
      }
    } catch (e) {
      // Direct replacement fallback if JSON.parse fails due to comments
      try {
        const directReplace = fs.readFileSync(filePath, 'utf8')
          .replace(/"extends":\s*"@ljharb\/tsconfig",?/g, '');
        fs.writeFileSync(filePath, directReplace, 'utf8');
        console.log(`Fallback regex cleaned extends from ${file}`);
      } catch (innerError) {
        console.error(`Failed to clean ${file}:`, e.message);
      }
    }
  }
});
