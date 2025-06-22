const fs = require('fs');
const path = require('path');

// Temporarily rename API directory to exclude it from build
const apiPath = path.join(__dirname, 'app', 'api');
const apiBackupPath = path.join(__dirname, 'app', 'api_disabled');

if (fs.existsSync(apiPath)) {
  console.log('Disabling API routes for static build...');
  fs.renameSync(apiPath, apiBackupPath);
  console.log('API routes disabled. Run restore_api_after_build.js to restore them.');
} else {
  console.log('API directory not found or already disabled.');
}
