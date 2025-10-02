import { snapsave } from '@bochilteam/scraper';    
import fetch from 'node-fetch';    

let handler = async (m, { conn, args }) => {    
  if (!args[0]) return m.reply('🦆❗ Ingresa un enlace de Facebook, patito!');    

  try {    
    await m.react('🕓'); // relojito mientras descarga
    
    const data = await snapsave(args[0]);    
    
    if (!Array.isArray(data) || data.length === 0) 
      return m.reply('🦆❌ No se pudo descargar el video, cuak :/');    
    
    let video = data.find(v => v.resolution.includes('HD')) || data[0];    
    
    if (video) {    
      const videoBuffer = await fetch(video.url).then(res => res.buffer());    
      
      // Mensaje con video
      await conn.sendMessage(m.chat, { 
        video: videoBuffer, 
        mimetype: 'video/mp4', 
        fileName: 'video.mp4', 
        caption: `🦆✨ Aquí tienes tu video de Facebook, patito!`, 
        mentions: [m.sender], 
      }, { quoted: m });    
      
      await m.react('✅');     
    } else {    
      await m.react('❌');     
    }    
  } catch (e) {    
    console.log('Error pato descargando video:', e);
    await m.react('❌');     
  }    
}    

handler.help = ['facebook'];    
handler.tags = ['dl'];    
handler.command = ['fb', 'facebook', 'FB', 'FACEBOOK'];    

export default handler;
