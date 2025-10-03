// Codigo de SoyMaycol y no quites creditos
/* import yts from "yt-search";

const limit = 100;

const handler = async (m, { conn, text, command }) => {
if (!text) return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ay bebé, necesito algo para trabajar~
├─ Dame el nombre de un video o URL de YouTube
├─ y yo haré magia para ti... ♡
│
├─ ¿No sabes cómo usarme? Escribe:
│   ⇝ .help
├─ Te aseguro que valdré la pena~
╰─✦`);

await m.react("🔥");  

try {  
    const res = await yts(text);  
    if (!res || !res.videos || res.videos.length === 0) {  
        return m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Mmm... no encuentro nada así bebé
├─ Intenta con algo más específico
├─ que me haga sudar un poquito~ ♡
╰─✦`);
    }

    const video = res.videos[0];  
    const title = video.title || "Sin título";  
    const authorName = video.author?.name || "Desconocido";  
    const durationTimestamp = video.timestamp || "Desconocida";  
    const views = video.views || "Desconocidas";  
    const url = video.url || "";  
    const thumbnail = video.thumbnail || "";  

    const isDirectDownload = ["play", "playaudio", "ytmp3", "play2", "playvid", "ytv", "ytmp4"].includes(command);  

    if (isDirectDownload) {  
        const initialMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ooh~ encontré algo delicioso:
├─ 「❀」${title}
│
├─ ✧ Canal: ${authorName}
├─ ✧ Duración: ${durationTimestamp}
├─ ✧ Vistas: ${views}
│
├─ Déjame trabajar mi magia... ♡
├─ ▓░░░░░░░░░ 10%
├─ Esto se va a poner caliente~
╰─✦`;

        let sentMessage;  
        if (thumbnail) {  
            sentMessage = await conn.sendMessage(m.chat, {  
                image: { url: thumbnail },  
                caption: initialMessage,  
            }, { quoted: m });  
        } else {  
            sentMessage = await conn.sendMessage(m.chat, {  
                text: initialMessage,  
            }, { quoted: m });  
        }  

        if (["play", "playaudio", "ytmp3"].includes(command)) {  
            await downloadAudio(conn, m, url, title, sentMessage, thumbnail);  
        } else if (["play2", "playvid", "ytv", "ytmp4"].includes(command)) {  
            await downloadVideo(conn, m, url, title, sentMessage, thumbnail);  
        }  
    } else {  
        const buttons = [  
            { buttonId: `.ytmp3 ${url}`, buttonText: { displayText: "♪ Audio Seductor ♪" }, type: 1 },  
            { buttonId: `.ytmp4 ${url}`, buttonText: { displayText: "♣ Video Caliente ♣" }, type: 1 },  
        ];  

        const processingMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Mmm~ qué delicia tenemos aquí:
├─ 「❀」${title}
│
├─ ✧ Canal: ${authorName}
├─ ✧ Duración: ${durationTimestamp}
├─ ✧ Vistas: ${views}
│
├─ ¿Qué prefieres bebé?
├─ Algo para los oídos o para los ojos~ ♡
╰─✦`;

        try {  
            if (thumbnail) {  
                await conn.sendMessage(m.chat, {  
                    image: { url: thumbnail },  
                    caption: processingMessage,  
                    buttons,  
                    headerType: 4,  
                }, { quoted: m });  
            } else {  
                await conn.sendMessage(m.chat, {  
                    text: processingMessage,  
                    buttons,  
                    headerType: 1,  
                }, { quoted: m });  
            }  
        } catch {  
            await m.reply(processingMessage + "\n\nDime qué quieres amor:\n• 1 para audio\n• 2 para video");  
        }  
    }  

} catch (error) {  
    console.error("Error general:", error);  
    await m.reply(`╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ Ay no bebé, algo salió mal...
├─ Pero no te preocupes, sigo siendo tuya~ ♡
├─ Error: ${error.message}
├─ Inténtalo otra vez, prometo portarme bien
╰─✦`);
    await m.react("💔");
}
};

const downloadAudio = async (conn, m, url, title, sentMessage, thumbnail) => {
let progress = 10;
let progressInterval;
let lastProgressText = "";

try {  
    const cleanTitle = cleanName(title) + ".mp3";  
      
    progressInterval = setInterval(async () => {  
        if (progress < 80) {  
            progress += Math.floor(Math.random() * 5) + 2;  
            if (progress > 80) progress = 80;  
              
            const progressBar = createProgressBar(progress);  
            const sexyMessages = [  
                "Esto se está poniendo intenso~",  
                "Déjame seguir trabajando para ti♡",  
                "Casi estoy lista bebé~",  
                "Un poquito más y será tuyo♡"  
            ];  
            const randomMessage = sexyMessages[Math.floor(Math.random() * sexyMessages.length)];  
              
            const newMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ ${randomMessage}
├─ ✧ Preparando tu audio sensual...
│
├─ ${progressBar} ${progress}%
├─ No pares de mirarme trabajar~ ♡
╰─✦`;

            if (newMessage !== lastProgressText) {  
                lastProgressText = newMessage;  
                await updateMessage(conn, m.chat, sentMessage, newMessage, thumbnail);  
            }  
        }  
    }, 800);  

// Dentro de downloadAudio justo después de recibir la respuesta de la API:
const apiUrl = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=mp3&apikey=soymaycol<3`;
const response = await fetch(apiUrl, { redirect: 'follow' });
const data = await response.json();

if (!data || !data.status || !data.result || !data.result.url) {
    throw new Error("No pude conseguir lo que querías bebé");
}

// 🔥 Resolver redirección del link que devuelve la API
const finalResponse = await fetch(data.result.url, { method: "HEAD", redirect: "follow" });
const finalUrl = finalResponse.url; // aquí está el link directo al MP3

progress = 90;
const progressBar90 = createProgressBar(progress);
const message90 = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${data.result.title || title}
│
├─ Ya casi termino contigo~ ♡
│
├─ ${progressBar90} ${progress}%
├─ Preparándome para dártelo todo...
╰─✦`;

await updateMessage(conn, m.chat, sentMessage, message90, thumbnail);

// ✅ Usar el link final resuelto
await conn.sendMessage(m.chat, {
    audio: { url: finalUrl },
    mimetype: "audio/mpeg",
    fileName: cleanTitle,
}, { quoted: m });

    const progressBar100 = createProgressBar(100);  
    const finalMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${data.result.title || title}
│
├─ ¡Listo mi amor! ♡
│
├─ ${progressBar100} 100%
├─ Espero que disfrutes lo que hice para ti~
├─ ¿Quieres que haga algo más? ♡
╰─✦`;

    await updateMessage(conn, m.chat, sentMessage, finalMessage, thumbnail);  
    await m.react("💋");  

} catch (error) {  
    clearInterval(progressInterval);  
    console.error("Error descargando audio:", error);  
      
    const errorMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ Ay bebé... algo no salió bien
├─ Pero no te rindas conmigo~ ♡
├─ ${error.message}
├─ Inténtalo otra vez, prometo compensarte
╰─✦`;

    await updateMessage(conn, m.chat, sentMessage, errorMessage, thumbnail);  
    await m.react("😢");  
}
};

const downloadVideo = async (conn, m, url, title, sentMessage, thumbnail) => {
let progress = 10;
let progressInterval;
let lastProgressText = "";

try {  
    const cleanTitle = cleanName(title) + ".mp4";  
      
    progressInterval = setInterval(async () => {  
        if (progress < 80) {  
            progress += Math.floor(Math.random() * 5) + 2;  
            if (progress > 80) progress = 80;  
              
            const progressBar = createProgressBar(progress);  
            const hotMessages = [  
                "Mira cómo trabajo para ti~",  
                "Este video va a estar delicioso♡",  
                "Casi puedes tenerme completa~",  
                "No pares de verme trabajar bebé♡"  
            ];  
            const randomMessage = hotMessages[Math.floor(Math.random() * hotMessages.length)];  
              
            const newMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ ${randomMessage}
├─ ✧ Procesando tu video caliente...
│
├─ ${progressBar} ${progress}%
├─ Te va a encantar lo que viene~ ♡
╰─✦`;

            if (newMessage !== lastProgressText) {  
                lastProgressText = newMessage;  
                await updateMessage(conn, m.chat, sentMessage, newMessage, thumbnail);  
            }  
        }  
    }, 800);  

    // Nueva API call para video
    const apiUrl = `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=mp4&apikey=soymaycol<3`;  
    const response = await fetch(apiUrl, {
        redirect: 'follow' // Seguir redirecciones
    });  
    const data = await response.json();  

    if (!data || !data.status || !data.result || !data.result.url) {  
        throw new Error("No pude darte lo que querías amor");  
    }  

    progress = 90;  
    const progressBar90 = createProgressBar(progress);  
    const message90 = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${data.result.title || title}
│
├─ Ya casi es tuyo completamente~ ♡
│
├─ ${progressBar90} ${progress}%
├─ Preparando la gran revelación...
╰─✦`;

    await updateMessage(conn, m.chat, sentMessage, message90, thumbnail);  
    clearInterval(progressInterval);  

    // Descargar el archivo desde la URL con redirecciones
    await conn.sendMessage(m.chat, {  
        video: { url: data.result.url },  
        mimetype: "video/mp4",  
        fileName: cleanTitle,  
    }, { quoted: m });  

    const progressBar100 = createProgressBar(100);  
    const finalMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${data.result.title || title}
│
├─ ¡Aquí tienes todo bebé! ♡
│
├─ ${progressBar100} 100%
├─ ¿Te gustó cómo lo hice?~
├─ Siempre estoy lista para más... ♡
╰─✦`;

    await updateMessage(conn, m.chat, sentMessage, finalMessage, thumbnail);  
    await m.react("🔥");  

} catch (error) {  
    clearInterval(progressInterval);  
    console.error("Error descargando video:", error);  
      
    const errorMessage = `╭─❍「 ✦ MaycolPlus ✦ 」
│
├─ 「❀」${title}
│
├─ Oh no amor... hubo un problemita
├─ Pero sabes que siempre vuelvo por más~ ♡
├─ ${error.message}
├─ Dale otra oportunidad a tu MaycolPlus
╰─✦`;

    await updateMessage(conn, m.chat, sentMessage, errorMessage, thumbnail);  
    await m.react("😈");  
}
};

const updateMessage = async (conn, chatId, sentMessage, newText, thumbnail) => {
try {
    const messageKey = sentMessage.key;

    if (thumbnail) {  
        try {  
            await conn.relayMessage(chatId, {  
                protocolMessage: {  
                    key: messageKey,  
                    type: 14,  
                    editedMessage: {  
                        imageMessage: {  
                            url: thumbnail,  
                            caption: newText  
                        }  
                    }  
                }  
            }, {});  
        } catch {  
            try {  
                await conn.sendMessage(chatId, {  
                    edit: messageKey,  
                    text: newText  
                });  
            } catch {  
                console.log("No se pudo editar el mensaje");  
            }  
        }  
    } else {  
        try {  
            await conn.sendMessage(chatId, {  
                edit: messageKey,  
                text: newText  
            });  
        } catch {  
            try {  
                await conn.relayMessage(chatId, {  
                    protocolMessage: {  
                        key: messageKey,  
                        type: 14,  
                        editedMessage: {  
                            conversation: newText  
                        }  
                    }  
                }, {});  
            } catch {  
                console.log("No se pudo editar el mensaje de texto");  
            }  
        }  
    }  
} catch (error) {  
    console.error("Error actualizando mensaje:", error.message);  
}
};

const createProgressBar = (percentage) => {
const totalBars = 10;
const filledBars = Math.floor((percentage / 100) * totalBars);
const emptyBars = totalBars - filledBars;

const filled = "▓".repeat(filledBars);  
const empty = "░".repeat(emptyBars);  
  
return filled + empty;
};

function cleanName(name) {
return name.replace(/[^\w\s-_.]/gi, "").substring(0, 50);
}

handler.command = handler.help = ["play", "playaudio", "ytmp3", "play2", "playvid", "ytv", "ytmp4", "yt"];
handler.tags = ["descargas"];
handler.register = true;

export default handler; */

import fetch from "node-fetch";
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    console.log('[INFO] Comando recibido:', command, 'Texto:', text);

    if (!text?.trim()) {
      console.log('[WARN] No se envió texto para buscar');
      return conn.reply(m.chat, `❀ Envía el nombre o link del vídeo para descargar.`, m);
    }

    await m.react('🕒');
    console.log('[INFO] Emoji de espera enviado');

    const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/);
    const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text;
    console.log('[INFO] Query detectada:', query);

    const search = await yts(query);
    console.log('[INFO] Resultados de búsqueda obtenidos');

    const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0];
    if (!result) throw 'ꕥ No se encontraron resultados.';

    const { title, seconds, views, url, thumbnail, author } = result;
    console.log(`[INFO] Video seleccionado: ${title} | ${seconds}s | ${views} vistas | ${url}`);

    if (seconds > 1620) throw '⚠ El video supera el límite de duración (27 minutos).';

    const vistas = formatViews(views);
    const duracion = formatDuration(seconds);
    const canal = author?.name || 'Desconocido';

    if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
      console.log('[INFO] Descargando audio...');
      const audioUrl = await getYtmp3(url);
      if (!audioUrl) throw '> ⚠ Algo falló, no se pudo obtener el audio.';
      console.log('[INFO] URL de audio obtenida:', audioUrl);

      const info = `「✦」Descargando *<${title}>*

> ✐ Canal » *${canal}*
> ⴵ Duración » *${duracion}*
> ✰ Calidad: *128k*
> 🜸 Link » ${url}
> ⟡ Vistas » *${vistas}*`;

      console.log('[INFO] Enviando info de audio...');
      await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m });

      console.log('[INFO] Enviando audio...');
      await conn.sendMessage(m.chat, { audio: { url: audioUrl }, fileName: `${title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });

      await m.react('✔️');
      console.log('[SUCCESS] Audio enviado correctamente');

    } else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
      console.log('[INFO] Descargando video...');
      const video = await getYtmp4(url);
      if (!video?.data) throw '⚠ Algo falló, no se pudo obtener el video.';
      console.log('[INFO] Video obtenido');

      const info = `「✦」Descargando *<${title}>*

> ✐ Canal » *${canal}*
> ⴵ Duración » *${duracion}*
> ✰ Calidad: *360p*
> 🜸 Link » ${url}
> ⟡ Vistas » *${vistas}*`;

      console.log('[INFO] Enviando info de video...');
      await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m });

      console.log('[INFO] Enviando video...');
      await conn.sendMessage(m.chat, { video: video.data, fileName: `${title}.mp4`, mimetype: 'video/mp4', caption: '> » Video descargado correctamente.' }, { quoted: m });

      await m.react('✔️');
      console.log('[SUCCESS] Video enviado correctamente');
    }

  } catch (e) {
    await m.react('✖️');
    console.error('[ERROR]', e);
    return conn.reply(m.chat, typeof e === 'string' ? e : '⚠ Se produjo un error.\n' + e.message, m);
  }
};

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'playaudio', 'play2', 'ytv', 'ytmp4', 'mp4'];
handler.tags = ['descargas'];
handler.group = true;

export default handler;

async function getYtmp3(url) {
  try {
    console.log('[INFO] Llamando API YTMP3');
    const endpoint = `https://apiadonix.kozow.com/download/ytmp3?apikey=SoyMaycol<3&url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint, { redirect: 'follow' }).then(r => r.json());
    console.log('[INFO] Respuesta API YTMP3:', res);
    if (!res?.data?.url) return null;
    return res.data.url;
  } catch (err) {
    console.error('[ERROR] getYtmp3', err);
    return null;
  }
}

async function getYtmp4(url) {
  try {
    console.log('[INFO] Llamando API YTMP4');
    const endpoint = `https://apiadonix.kozow.com/download/ytmp4?apikey=SoyMaycol<3&url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint).then(r => r.json());
    console.log('[INFO] Respuesta API YTMP4:', res);
    if (!res?.data?.url) return null;

    const finalUrl = await getFinalUrl(res.data.url);
    console.log('[INFO] URL final del video:', finalUrl);

    const videoBuffer = await fetch(finalUrl).then(r => r.arrayBuffer());
    return { data: Buffer.from(videoBuffer), url: finalUrl };
  } catch (err) {
    console.error('[ERROR] getYtmp4', err);
    return null;
  }
}

async function getFinalUrl(url) {
  console.log('[INFO] Resolviendo URL final...');
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  return res.url || url;
}

function formatViews(views) {
  if (views === undefined) return "No disponible";
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)} B (${views.toLocaleString()})`;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)} M (${views.toLocaleString()})`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)} K (${views.toLocaleString()})`;
  return views.toString();
}

function formatDuration(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min} minutos ${sec} segundos`;
}
