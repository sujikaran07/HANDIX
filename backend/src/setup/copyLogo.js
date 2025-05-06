const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Copy the logo file from ecommerce to backend
const copyLogoFile = () => {
  try {
    // Source logo paths to check (in order of preference)
    const sourcePaths = [
      path.join(__dirname, '../../../ecommerce/public/images/handix-logo1.png'),
      path.join(__dirname, '../../../frontend/public/images/handix-logo1.png')
    ];
    
    // Destination path
    const destDir = path.join(__dirname, '../public/images');
    const destPath = path.join(destDir, 'handix-logo1.png');
    
    // Create the destination directory if it doesn't exist
    createDirIfNotExists(destDir);
    
    // Find the first source path that exists
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

// Run the copy operation
copyLogoFile();

module.exports = { copyLogoFile };
