const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to ensure TypeScript dependencies are in dependencies
function ensureTypeScriptDeps() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Move TypeScript dependencies to dependencies if they're in devDependencies
  const tsDeps = ['typescript', '@types/react', '@types/node', '@types/react-dom'];
  tsDeps.forEach(dep => {
    if (packageJson.devDependencies?.[dep]) {
      packageJson.dependencies[dep] = packageJson.devDependencies[dep];
      delete packageJson.devDependencies[dep];
    }
  });

  // Write back to package.json
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
}

try {
  // Ensure TypeScript dependencies are in the right place
  console.log('Ensuring TypeScript dependencies are in the right place...');
  ensureTypeScriptDeps();

  // Install dependencies
  console.log('Installing dependencies...');
  execSync('pnpm install --no-frozen-lockfile', { stdio: 'inherit' });

  // Install TypeScript dependencies explicitly
  console.log('Installing TypeScript dependencies...');
  execSync('pnpm install typescript@5.8.3 @types/react@18.3.20 @types/node@20.17.32 @types/react-dom@18.3.7 --no-frozen-lockfile', { stdio: 'inherit' });

  // Run the Next.js build
  console.log('Running Next.js build...');
  execSync('pnpm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} 