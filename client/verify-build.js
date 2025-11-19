// Simple script to verify public folder was copied
import { existsSync } from 'fs';
import { join } from 'path';

const distFigmaAssets = join(process.cwd(), 'dist', 'figmaAssets');
const studentsPng = join(distFigmaAssets, 'students.png');

if (existsSync(studentsPng)) {
  console.log('✅ Public folder copied successfully!');
  console.log('✅ figmaAssets folder exists in dist');
} else {
  console.error('❌ ERROR: Public folder NOT copied to dist!');
  console.error('❌ figmaAssets folder missing from dist');
  process.exit(1);
}

