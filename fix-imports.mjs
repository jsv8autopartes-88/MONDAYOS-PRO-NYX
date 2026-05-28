import fs from 'fs';
import path from 'path';

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
};

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('useAppStore') && !content.includes('import { useAppStore }')) {
    const relPathDepth = file.split('/').length - 2;
    const prefix = relPathDepth === 0 ? './' : '../'.repeat(relPathDepth - 1);
    let pathPrefix = prefix === './' ? './store/appStore' : '../'.repeat(relPathDepth) + 'store/appStore';
    if (file === 'src/App.tsx') pathPrefix = './store/appStore';

    content = `import { useAppStore } from '${pathPrefix}';\n` + content;
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
