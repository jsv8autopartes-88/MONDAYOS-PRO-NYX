import fs from 'fs';

const filePath = 'src/store/appStore.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Ensure 'auth' is imported
if (!content.includes('auth,')) {
    content = content.replace('db, handleFirestoreError', 'auth, db, handleFirestoreError');
}

// Replace all function signatures
const replacements = [
    { from: /addWidget: \(userId, ObjectWidget\) => \{/, to: "addWidget: (ObjectWidget) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /updateWidget: \(userId, id, updates\) => \{/, to: "updateWidget: (id, updates) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /deleteWidget: \(userId, id\) => \{/, to: "deleteWidget: (id) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /addFile: \(userId, file\) => \{/, to: "addFile: (file) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /updateFile: \(userId, id, updates\) => \{/, to: "updateFile: (id, updates) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /deleteFile: \(userId, id\) => \{/, to: "deleteFile: (id) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /updateAgent: async \(userId, agentId, updates\) => \{/, to: "updateAgent: async (agentId, updates) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /sendCommand: async \(userId, agentId, cmd, args = \[\]\) => \{/, to: "sendCommand: async (agentId, cmd, args = []) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /deleteAgent: async \(userId, agentId\) => \{/, to: "deleteAgent: async (agentId) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /addMission: \(userId, mission\) => \{/, to: "addMission: (mission) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /updateMission: \(userId, id, updates\) => \{/, to: "updateMission: (id, updates) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /deleteMission: \(userId, id\) => \{/, to: "deleteMission: (id) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /addSkill: \(userId, skill\) => \{/, to: "addSkill: (skill) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /updateSkill: \(userId, id, updates\) => \{/, to: "updateSkill: (id, updates) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /deleteSkill: \(userId, id\) => \{/, to: "deleteSkill: (id) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /addLink: \(userId, link\) => \{/, to: "addLink: (link) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /deleteLink: \(userId, id\) => \{/, to: "deleteLink: (id) => {\n    const userId = auth?.currentUser?.uid || null;" },
    { from: /generateSystemReport: \(userId\) => \{/, to: "generateSystemReport: () => {\n    const userId = auth?.currentUser?.uid || null;" },
];

replacements.forEach(({from, to}) => {
    content = content.replace(from, to);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated appStore.ts signatures");
