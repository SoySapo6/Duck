import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    
    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `ꕥ \`${name2}\` está comiendo con \`${name || who}\` 🌤 (っ˘ڡ˘ς) 🐥`
        : `ꕥ \`${name2}\` está comiendo 🌤 (っ˘ڡ˘ς) 🐥`

    if (m.isGroup) {
        let videos = [
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863608402.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863601845.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863654803.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863646010.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863636034.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863624765.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863597122.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863743960.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863731956.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863726838.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863692870.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742863676967.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745602892981.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745602901923.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745602887999.mp4'
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

handler.help = ['comer']
handler.tags = ['reacciones']
handler.command = ['eat', 'comer']
handler.group = true

export default handler