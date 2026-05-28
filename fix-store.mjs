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

const appStoreKeys = [
  'widgets', 'logs', 'files', 'agents', 'missions', 'skills', 'reportFiles',
  'links', 'assets', 'isAutopilotActive', 'autopilotQueue', 'autopilotStatus',
  'obd', 'addLog', 'rollback', 'addWidget', 'updateWidget', 'deleteWidget',
  'addFile', 'updateFile', 'deleteFile', 'addAsset', 'deleteAsset',
  'updateAgent', 'sendCommand', 'deleteAgent', 'addMission', 'updateMission',
  'deleteMission', 'addSkill', 'updateSkill', 'deleteSkill', 'toggleAutopilot',
  'addAutopilotTask', 'clearAutopilotQueue', 'updateAutopilotStatus',
  'completeAutopilotAction', 'addLink', 'deleteLink', 'connectOBD',
  'disconnectOBD', 'scanDTCs', 'clearDTCs', 'updatePID', 'setOBDAgentMode',
  'generateSystemReport', 'initializeFirebaseSubscriptions'
];

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const useDashboardRegex = /const\s+\{\s*([^}]+)\s*\}\s*=\s*useDashboard\(\)\s*;/g;
  
  content = content.replace(useDashboardRegex, (originalBlock, varsGroup) => {
    changed = true;
    const vars = varsGroup.split(',').map(v => v.trim()).filter(v => !!v);
    const dashboardVars = [];
    const appStoreVars = [];
    
    vars.forEach(v => {
      const varNameMatch = v.match(/^(\w+)/);
      if (varNameMatch) {
          const varName = varNameMatch[1];
          if (appStoreKeys.includes(varName)) {
              appStoreVars.push(v);
          } else {
              dashboardVars.push(v);
          }
      }
    });
    
    let newCode = '';
    if (dashboardVars.length > 0) {
      newCode += `const { ${dashboardVars.join(', ')} } = useDashboard();\n  `;
    }
    if (appStoreVars.length > 0) {
      newCode += `const { ${appStoreVars.join(', ')} } = useAppStore();`;
    }
    if (newCode === '') {
      newCode = `// useDashboard removed`;
    }
    return newCode.trim();
  });

  if (changed) {
    const importDashboardRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)DashboardContext([^'"]*)['"]\s*;/;
    const match = content.match(importDashboardRegex);
    if (match) {
        if (!content.includes('useAppStore')) {
            const relPathDepth = file.split('/').length - 2;
            const prefix = relPathDepth === 0 ? './' : '../'.repeat(relPathDepth - 1);
            let pathPrefix = prefix === './' ? './store/appStore' : '../'.repeat(relPathDepth) + 'store/appStore';
            if (file === 'src/App.tsx') pathPrefix = './store/appStore';

            content = content.replace(importDashboardRegex, `import { ${match[1].trim()} } from '${match[2]}DashboardContext${match[3]}';\nimport { useAppStore } from '${pathPrefix}';`);
        }
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
