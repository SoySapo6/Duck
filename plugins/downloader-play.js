import yts from 'yt-search';
import fetch from 'node-fetch';

let handler = async (m, { conn, command, args, text, usedPrefix }) => {
  if (!text) 
    return conn.reply(
      m.chat, 
      '「✿」 _Ingresa el nombre de lo que quieres buscar_', 
      m
    );

  await m.react('🕓');

  let res = await yts(text);
  let play = res.videos[0];

  if (!play) 
    return conn.reply(
      m.chat, 
      '> No se encontraron resultados para tu búsqueda', 
      m
    );

  let { title, thumbnail, ago, timestamp, views, videoId, url, author } = play;

  let txt = '';
  txt += `「✦」 Descargando *${title || ''}*\n\n`;
  txt += `> ❑ Canal » *${author.name || ''}*\n`;
  txt += `> ♡ Vistas » *${views.toLocaleString() || ''}*\n`;
  txt += `> ✧︎ Duración » *${timestamp || ''}*\n`;
  txt += `> ✿ Publicado » *${ago || ''}*\n`;
  txt += `> ✎ Link » https://youtube.com/watch?v=${videoId}`;

  await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: txt });

  try {
    if (command === 'play' || command === 'play2') {
      if (command.endsWith('mp3') || command === 'play') {
       
        let audioUrl;
        let apiName = '';
        if (global.apiadonix) {
          apiName = 'Adonix API';
          const endpoint = `${global.apiadonix}/download/ytmp3?apikey=Adofreekey&url=${encodeURIComponent(url)}`;
          let res = await fetch(endpoint);
          let json = await res.json();
          audioUrl = json.data?.url;
        } else if (global.mayapi) {
          apiName = 'MayAPI';
          const endpoint = `${global.mayapi}/ytdl?url=${encodeURIComponent(url)}&type=mp3&apikey=may-3d9ac5f2`;
          let res = await fetch(endpoint);
          let json = await res.json();
          audioUrl = json.result?.url;
        }

        if (!audioUrl) 
          return conn.reply(
            m.chat, 
            '「✦」 Ocurrio un error, no se pudo obtener el audio.', 
            m
          );

        await conn.sendMessage(m.chat, { 
          text: `「❑」 *Server:* *${apiName}*`
        });

        await conn.sendMessage(m.chat, { 
          audio: { url: audioUrl }, 
          mimetype: 'audio/mpeg', 
          ptt: false 
        });
      } else {
       
        let videoUrl;
        let apiName = '';
        if (global.apiadonix) {
          apiName = 'Adonix API';
          const endpoint = `${global.apiadonix}/download/ytmp4?apikey=Adofreekey&url=${encodeURIComponent(url)}`;
          let res = await fetch(endpoint);
          let json = await res.json();
          videoUrl = json.data?.url;
        } else if (global.mayapi) {
          apiName = 'MayAPI';
          const endpoint = `${global.mayapi}/ytdl?url=${encodeURIComponent(url)}&type=mp4&apikey=may-3d9ac5f2`;
          let res = await fetch(endpoint);
          let json = await res.json();
          videoUrl = json.result?.url;
        }

        if (!videoUrl) 
          return conn.reply(
            m.chat, 
            '「✦」 Ocurrio un error, no se pudo obtener el video.', 
            m
          );

        await conn.sendMessage(m.chat, { 
          text: `> ❑ *Server:* *${apiName}*`
        });

        await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption: `「✦」 *${title}*` });
      }
    }
    await m.react('✅');
  } catch (e) {
    console.log(e);
    conn.reply(m.chat, '「❌」 Ocurrió un error al descargar', m);
  }
};

handler.help = ['play', 'play2'];
handler.tags = ['dl'];
handler.command = ['play', 'play2'];

export default handler;
