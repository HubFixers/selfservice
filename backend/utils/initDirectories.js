const fs = require('fs');
const path = require('path');

const initializeUploadDirectories = () => {
  const uploadDirs = [
    'uploads',
    'uploads/services',
    'uploads/giftcards',
    'receipts'
  ];

  uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    
    if (!fs.existsSync(fullPath)) {
      try {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } catch (error) {
        console.error(`❌ Failed to create directory ${dir}:`, error.message);
      }
    } else {
      console.log(`✅ Directory exists: ${dir}`);
    }
  });

  // Test write permissions
  const testFile = path.join(__dirname, '..', 'uploads', 'giftcards', 'test.txt');
  try {
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✅ Write permissions OK for uploads/giftcards');
  } catch (error) {
    console.error('❌ Write permission test failed for uploads/giftcards:', error.message);
  }
};

module.exports = { initializeUploadDirectories };