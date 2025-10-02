import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return !0;

  const fkontak = { 
    key: { 
      participants: "0@s.whatsapp.net", 
      remoteJid: "status@broadcast", 
      fromMe: false, 
      id: "Halo" 
    }, 
    message: { 
      contactMessage: { 
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
      }
    }, 
    participant: "0@s.whatsapp.net"
  };

  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => 'https://files.catbox.moe/p2eq60.jpg')
  let img = await (await fetch(`${pp}`)).buffer()

  let chat = global.db.data.chats[m.chat]

  let txt = `${groupMetadata.subject} | Group`

  let groupSize = participants.length
  if (m.messageStubType == 27) groupSize++;
  else if (m.messageStubType == 28 || m.messageStubType == 32) groupSize--;

  
  if (chat.welcome && m.messageStubType == 27) {
    let bienvenida = `𝗕𝗶𝗲𝗻𝘃𝗲𝗻𝗶𝗱𝗼(a) @${m.messageStubParameters[0].split`@`[0]}\n☆ Esperamos que tu participación en este *grupo* sea constructiva y respetuosa.\n✎ Puedes usar *#help* para ver todos los comandos disponibles.\n〄╏ 𝗔𝗣𝗜: https://apiadonix.kozow.com`
    await conn.sendMessage(m.chat, { image: img, caption: bienvenida, mentions: [m.messageStubParameters[0]] }, { quoted: fkontak })
  }

  
  if (chat.welcome && (m.messageStubType == 28 || m.messageStubType == 32)) {
    let bye = `@${m.messageStubParameters[0].split`@`[0]} 𝗦𝗲 𝗵𝗮 𝗿𝗲𝘁𝗶𝗿𝗮𝗱𝗼 𝗱𝗲𝗹 𝐆𝐫𝐮𝐩𝐨\n「❏」 Actualmente, el grupo cuenta con *${groupSize}* miembros.\n✎ Puedes usar *#help* para ver todos los comandos disponibles.\n〄╏ 𝗔𝗣𝗜: https://apiadonix.kozow.com`
    await conn.sendMessage(m.chat, { image: img, caption: bye, mentions: [m.messageStubParameters[0]] }, { quoted: fkontak })
  }
}
