const fs = require('fs');
const path = require('path');

// Helper: create directory if it does not exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Copy logo file from source to backend public/images
const copyLogoFile = () => {
  try {
    const sourcePaths = [
      path.join(__dirname, '../../../ecommerce/public/images/handix-logo1.png'),
      path.join(__dirname, '../../../frontend/public/images/handix-logo1.png')
    ];
    const destDir = path.join(__dirname, '../public/images');
    const destPath = path.join(destDir, 'handix-logo1.png');
    createDirIfNotExists(destDir);
    
    let sourceFile = null;
    for (const sourcePath of sourcePaths) {
      if (fs.existsSync(sourcePath)) {
        sourceFile = sourcePath;
        break;
      }
    }
    
    if (!sourceFile) {
      console.error('Could not find logo file in any of the expected locations');
      return false;
    }
    
    // Copy the file
    fs.copyFileSync(sourceFile, destPath);
    console.log(`Copied logo from ${sourceFile} to ${destPath}`);
    return true;
  } catch (error) {
    console.error('Error copying logo file:', error);
    return false;
  }
};

// Run the copy operation on script execution
copyLogoFile();

module.exports = { copyLogoFile };
