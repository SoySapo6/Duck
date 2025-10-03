import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    
    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `ꕥ \`${name2}\` está aplaudiendo por \`${name || who}\` 🌤 (୨୧•͈ᴗ•͈) 🐥`
        : `ꕥ \`${name2}\` está aplaudiendo 🌤 (୨୧•͈ᴗ•͈) 🐥`

    if (m.isGroup) {
        let videos = [
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783949630.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783943462.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783939563.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783934953.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783932650.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783972646.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783967998.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783963108.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783958237.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783953678.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783977470.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783983378.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783987612.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783995547.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745783999582.mp4'
        ]

        const video = videos[Math.floor(Math.random() * videos.length)]

        conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            ptt: true,
            mentions: [who]
        }, { quoted: m })
    }
}

handler.help = ['aplaudir']
handler.tags = ['reacciones']
handler.command = ['clap', 'aplaudir']
handler.group = true

export default handler