const fs = require('fs');
const path = require('path');

// Move API directory completely out of app folder
const apiDisabledPath = path.join(__dirname, 'app', 'api_disabled');
const apiBackupPath = path.join(__dirname, 'api_backup');

if (fs.existsSync(apiDisabledPath)) {
  console.log('Moving API routes out of app directory...');
  fs.renameSync(apiDisabledPath, apiBackupPath);
  console.log('API routes moved to api_backup directory.');
} else {
  console.log('API disabled directory not found.');
}
