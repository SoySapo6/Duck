import fetch from 'node-fetch';
import { promises as fs } from 'fs';
const FILE_PATH = './storage/databases/characters.json';

async function loadCharacters() {
    try {
        await fs.access(FILE_PATH);
    } catch {
        await fs.writeFile(FILE_PATH, '[]');
    }
    const data = await fs.readFile(FILE_PATH, 'utf-8');
    try {
        return JSON.parse(data) || [];
    } catch {
        return [];
    }
}

function formatTag(tag) {
    return String(tag || '').trim().toLowerCase().replace(/\s+/g, '_');
}

async function buscarImagenDelirius(tag) {
    const t = formatTag(tag);
    const urls = [
        `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&tags=${t}`,
        `https://danbooru.donmai.us/posts.json?tags=${t}`,
        global.APIs?.gelbooru?.url ? global.APIs.gelbooru.url + '/search/gelbooru?query=' + t : ''
    ].filter(Boolean);
    for (const url of urls) {
        try {
            const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } });
            const contentType = res.headers.get('content-type') || '';
            if (!res.ok || !contentType.includes('application/json')) continue;
            const json = await res.json();
            const data = Array.isArray(json) ? json : (json?.posts || []);
            const images = data.map(item => item.file_url || item.large_file_url || item.image || item.url)
                               .filter(u => typeof u === 'string' && /\.(jpe?g|png)$/.test(u));
            if (images.length) return images;
        } catch {}
    }
    return [];
}

const handler = async (m, { conn, usedPrefix, command }) => {
    const dbChat = global.db.data.chats;
    if (!dbChat[m.chat]) dbChat[m.chat] = {};
    const chatData = dbChat[m.chat];
    if (!chatData.gacha && m.isGroup) return m.reply('ꕥ Debes activar gacha en este grupo usando ' + usedPrefix + 'gacha on*');

    const userData = global.db.data.users[m.sender] || {};
    const now = Date.now();
    const cooldown = 0xf * 0x3c * 0x3e8;

    if (userData.lastRoll && now < userData.lastRoll) {
        const remaining = Math.ceil((userData.lastRoll - now)/1000);
        const minutes = Math.floor(remaining/60);
        const seconds = remaining % 60;
        let text = '';
        if (minutes > 0) text += minutes + ' minuto' + (minutes !== 1 ? 's ' : ' ');
        text += seconds + ' segundo' + (seconds !== 1 ? 's' : '');
        return m.reply('ꕥ Debes esperar ' + text + ' para usar ' + usedPrefix + command);
    }

    try {
        const allCharacters = await loadCharacters();
        if (!allCharacters.length) return m.reply('⚠︎ No hay personajes disponibles.');

        const char = allCharacters[Math.floor(Math.random() * allCharacters.length)];
        if (!char || !char.name) return m.reply('⚠︎ El personaje seleccionado es inválido.');

        const tag = formatTag(char.variants?.[0] || char.name);
        const images = await buscarImagenDelirius(tag);
        const img = images.length ? images[Math.floor(Math.random() * images.length)] : (char.img?.[0] || null);

        if (!img) return m.reply('ꕥ No se encontró imágenes para el personaje ' + char.name);

        chatData.lastRolledCharacter = { name: char.name, media: img };

        const message = await conn.sendFile(
            m.chat,
            img,
            (char.name || 'personaje') + '.jpg',
            `❀ Nombre » *${char.name}*\n✰ Valor » *${Number(char.value || 100).toLocaleString()}*\n♡ Estado » *${char.user ? char.user.split('@')[0] : 'desconocido'}*\n${char.source || 'Desconocido'}`,
            m
        );

        chatData.lastRolledMsgId = message?.key?.id || null;
        userData.lastRoll = now + cooldown;
        global.db.data.users[m.sender] = userData;
    } catch (e) {
        await m.reply('⚠︎ Se ha producido un problema.\n' + e.message);
    }
};

handler.command = ['roll', 'rw', 'gacha'];
handler.owner = false;
handler.mods = ['gacha', 'rw', 'roll'];
handler.register = true;
export default handler;
