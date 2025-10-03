import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    
    let str = m.mentionedJid.length > 0 || m.quoted 
        ? `ꕥ \`${name2}\` está bailando con \`${name || who}\` 🌤 (ﾉ^ヮ^)ﾉ*:・ﾟ✧ 🐥`
        : `ꕥ \`${name2}\` está bailando 🌤 (ﾉ^ヮ^)ﾉ*:・ﾟ✧ 🐥`

    if (m.isGroup) {
        let videos = [
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861109065.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861114581.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861126777.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861132832.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861166366.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861080414.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861086066.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861092077.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861097581.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861103401.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861072821.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1742861075934.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745602488814.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745602485955.mp4',
            'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745602477517.mp4'
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

handler.help = ['bailar']
handler.tags = ['reacciones']
handler.command = ['dance', 'bailar']
handler.group = true

export default handler