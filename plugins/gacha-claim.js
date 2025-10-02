import { promises as fs } from 'fs';
const CHARACTERS_FILE = './storage/databases/characters.json';

async function loadCharacters() {
    try {
        await fs.access(CHARACTERS_FILE);
    } catch {
        await fs.writeFile(CHARACTERS_FILE, '[]');
    }
    const data = await fs.readFile(CHARACTERS_FILE, 'utf-8');
    try {
        return JSON.parse(data) || [];
    } catch {
        return [];
    }
}

function getCharacterById(id, characters) {
    return characters.find(c => c.id === id) || null;
}

async function handler(m, { conn, usedPrefix, command }) {
    const dbChats = global.db.data.chats;
    if (!dbChats[m.chat]) dbChats[m.chat] = {};
    const chatData = dbChats[m.chat];

    if (!chatData.gacha && m.isGroup) {
        return m.reply(`ꕥ Los comandos de *Gacha* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con:\n» *${usedPrefix}gacha on*`);
    }

    const dbUsers = global.db.data.users;
    const userData = dbUsers[m.sender] || {};
    const now = Date.now();
    const cooldown = 15 * 60 * 1000; // 15 minutos

    if (userData.lastClaim && now < userData.lastClaim) {
        const remaining = Math.ceil((userData.lastClaim - now) / 1000);
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        let text = '';
        if (minutes > 0) text += `${minutes} minuto${minutes !== 1 ? 's ' : ' '}`;
        text += `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
        return m.reply(`ꕥ Debes esperar ${text} para usar ${usedPrefix}${command}`);
    }

    try {
        const allCharacters = await loadCharacters();
        if (!allCharacters.length) return m.reply('⚠︎ No hay personajes disponibles.');

        const char = allCharacters[Math.floor(Math.random() * allCharacters.length)];
        if (!char || !char.name) return m.reply('⚠︎ El personaje seleccionado es inválido.');

        const tag = (char.variants?.[0] || char.name).trim().toLowerCase().replace(/\s+/g, '_');

        const img = char.img?.[0] || null;
        if (!img) return m.reply(`ꕥ No se encontró imágenes para el personaje ${char.name}`);

        chatData.lastRolledCharacter = { name: char.name, media: img };
        chatData.lastRolledMsgId = (await conn.sendFile(
            m.chat,
            img,
            `${char.name}.jpg`,
            `❀ Nombre » *${char.name}*\n✰ Valor » *${Number(char.value || 100).toLocaleString()}*\n♡ Estado » *${char.user ? char.user.split('@')[0] : 'desconocido'}*\n${char.source || 'Libre'}`,
            m
        ))?.key?.id || null;

        userData.lastClaim = now + cooldown;
        dbUsers[m.sender] = userData;

    } catch (e) {
        await m.reply('⚠︎ Se ha producido un problema.\n' + e.message);
    }
}

handler.command = ['claim'];
handler.owner = false;
handler.mods = ['claim'];
handler.register = true;
handler.group = true;

export default handler;
