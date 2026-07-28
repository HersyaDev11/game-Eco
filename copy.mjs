import fs from 'fs';
import path from 'path';

const srcDir = 'C:/Users/ASUS/.gemini/antigravity-ide/brain/ca322788-d1f1-4054-a5c3-3a4a8cddcbf3';
const destDir = 'c:/game-eco/public/assets';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const filesToCopy = [
  'trash_organik_1785090099289.png',
  'trash_anorganik_1785090109033.png',
  'trash_kertas_1785090119871.png',
  'trash_b3_1785090129654.png'
];

filesToCopy.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to ${destPath}`);
  } else {
    console.error(`Source file not found: ${srcPath}`);
  }
});
