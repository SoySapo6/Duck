import fs from 'fs'
import { WAMessageStubType } from '@whiskeysockets/baileys'

async function generarBienvenida({ conn, userId, groupMetadata, chat }) {
const username = `@${userId.split('@')[0]}`
const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'long', year: 'numeric' })
const groupSize = groupMetadata.participants.length + 1
const desc = groupMetadata.desc?.toString() || 'Sin descripción'
const mensaje = (chat.sWelcome || 'Edita con el comando "setwelcome"').replace(/{usuario}/g, `${username}`).replace(/{grupo}/g, `*${groupMetadata.subject}*`).replace(/{desc}/g, `${desc}`)
const caption = `☆ 𝐁𝐢𝐞𝐧𝐯𝐞𝐧𝐢𝐝𝐨(a) ${username} 𝐚 *"${groupMetadata.subject}"*\n✿ ${mensaje}\n✩ _Ahora somos ${groupSize} Miembros._\n凸( •̀_•́ )凸 𝐃𝐢𝐬𝐟𝐫𝐮𝐭𝐚 𝐭𝐮 𝐞𝐬𝐭𝐚𝐝𝐢𝐚 𝐞𝐧 𝐞𝐥 𝐠𝐫𝐮𝐩𝐨!\n> *➮ Recuerda usar #help para ver todos los comandos disponibles.*\n\n❑╏ 𝗔𝗣𝗜'𝐬:\nhttps://apiadonix.kozow.com\nhttps://mayapi.ooguy.com`
return { pp, caption, mentions: [userId] }
}
async function generarDespedida({ conn, userId, groupMetadata, chat }) {
const username = `@${userId.split('@')[0]}`
const pp = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://raw.githubusercontent.com/The-King-Destroy/Adiciones/main/Contenido/1745522645448.jpeg')
const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "America/Mexico_City", day: 'numeric', month: 'long', year: 'numeric' })
const groupSize = groupMetadata.participants.length - 1
const desc = groupMetadata.desc?.toString() || 'Sin descripción'
const mensaje = (chat.sBye || 'Edita con el comando "setbye"').replace(/{usuario}/g, `${username}`).replace(/{grupo}/g, `${groupMetadata.subject}`).replace(/{desc}/g, `*${desc}*`)
const caption = `☆ ${username} 𝐒𝐞 𝐡𝐚 𝐫𝐞𝐭𝐢𝐫𝐚𝐝𝐨 𝐝𝐞 *"${groupMetadata.subject}"*\n✿ ${mensaje}\n✩ _Ahora somos ${groupSize} Miembros._\n(p′︵‵。) 𝐄𝐬𝐩𝐞𝐫𝐚𝐦𝐨𝐬 𝐯𝐮𝐞𝐥𝐯𝐚𝐬 𝐩𝐫𝐨𝐧𝐭𝐨!\n> *➮ Recuerda usar #help para ver todos los comandos disponibles.*\n\n❑╏ 𝗔𝗣𝗜'𝐬:\nhttps://apiadonix.kozow.com\nhttps://mayapi.ooguy.com`
return { pp, caption, mentions: [userId] }
}
let handler = m => m
handler.before = async function (m, { conn, participants, groupMetadata }) {
if (!m.messageStubType || !m.isGroup) return !0
const primaryBot = global.db.data.chats[m.chat].primaryBot
if (primaryBot && conn.user.jid !== primaryBot) throw !1
const chat = global.db.data.chats[m.chat]
const userId = m.messageStubParameters[0]
if (chat.welcome && m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
const { pp, caption, mentions } = await generarBienvenida({ conn, userId, groupMetadata, chat })
rcanal.contextInfo.mentionedJid = mentions
await conn.sendMessage(m.chat, { image: { url: pp }, caption, ...rcanal }, { quoted: null })
try { fs.unlinkSync(img) } catch {}
}
if (chat.welcome && (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE)) {
const { pp, caption, mentions } = await generarDespedida({ conn, userId, groupMetadata, chat })
rcanal.contextInfo.mentionedJid = mentions
await conn.sendMessage(m.chat, { image: { url: pp }, caption, ...rcanal }, { quoted: null })
try { fs.unlinkSync(img) } catch {}
}}

export { generarBienvenida, generarDespedida }
export default handler
