import { snapsave } from '@bochilteam/scraper';
import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('🦆💦 ¡Cuak! Ingresa un enlace de Facebook para descargar el video.');

  try {
    await m.react('🦆🕓'); // patito pensando
    const data = await snapsave(args[0]);

    if (!Array.isArray(data) || data.length === 0) 
      return m.reply('🦆❌ No se pudo descargar el video, patito :/');

    let video = data.find(v => v.resolution.includes('HD')) || data[0];

    if (video) {
      const videoBuffer = await fetch(video.url).then(res => res.buffer());

      await conn.sendMessage(m.chat, { 
        video: videoBuffer, 
        mimetype: 'video/mp4', 
        fileName: 'video.mp4', 
        caption: `🦆🎬 Aquí está tu video descargado, patito!`, 
        mentions: [m.sender], 
      }, { quoted: m });

      await m.react('✅🦆'); // patito feliz
    } else {
      await m.react('❌🦆'); // patito triste
      m.reply('🦆❗ No encontré un video válido, intenta otro enlace.');
    }
  } catch (e) {
    console.log("Error en descarga FB:", e);
    await m.react('❌🦆');
    m.reply('🦆⚠️ Algo salió mal al intentar descargar el video, patito.');
  }
};

handler.help = ['facebook'];
handler.tags = ['dl'];
handler.command = ['fb', 'facebook', 'FB', 'FACEBOOK'];

export default handler;
