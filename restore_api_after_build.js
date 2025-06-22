const fs = require('fs');
const path = require('path');

// Restore API directory after build
const apiPath = path.join(__dirname, 'app', 'api');
const apiBackupPath = path.join(__dirname, 'app', 'api_disabled');

if (fs.existsSync(apiBackupPath)) {
  console.log('Restoring API routes after build...');
  fs.renameSync(apiBackupPath, apiPath);
  console.log('API routes restored.');
} else {
  console.log('API backup directory not found.');
}
