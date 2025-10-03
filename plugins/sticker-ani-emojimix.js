/* Codigo de "La Suki Bot"
---> Modificado por SoyMaycol */
import fs from "fs"
import path from "path"
import axios from "axios"
import Crypto from "crypto"
import webp from "node-webpmux"

const tempFolder = path.join(process.cwd(), "tmp/")
if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true })

const handler = async (msg, { conn, text }) => {
  const emoji = text?.trim()
  const usedPrefix = "."

  if (!emoji || !emoji.match(/\p{Emoji}/u)) {
    return await conn.sendMessage(msg.key.remoteJid, {
      text: `✧ Oye~ mándame un emoji travieso para que lo haga sticker animado...\n\nEj: \`${usedPrefix}aniemoji 😏\``
    }, { quoted: msg })
  }

  try {
    await conn.sendMessage(msg.key.remoteJid, { react: { text: "⌛", key: msg.key } })

    // 🚀 NUEVA API
    const { data } = await axios.get(`https://mayapi.ooguy.com/emojito?emoji=${encodeURIComponent(emoji)}&apikey=soymaycol<3`)

    if (!data.status || !data.result) {
      return await conn.sendMessage(msg.key.remoteJid, { text: "✘ No pude jugar con ese emoji, prueba otro..." }, { quoted: msg })
    }

    const mediaRes = await axios.get(data.result, { responseType: "arraybuffer" })
    const buffer = Buffer.from(mediaRes.data)

    const senderName = msg.pushName || "Desconocid@ sexy"
    const metadata = {
      packname: `DogMD ✦ ${senderName}`,
      author: `Hecho por SoyMaycol • Bot Pendejo`,
      categories: [emoji]
    }

    const stickerBuffer = await writeExifDirect(buffer, metadata)

    await conn.sendMessage(msg.key.remoteJid, { sticker: { url: stickerBuffer } }, { quoted: msg })
    await conn.sendMessage(msg.key.remoteJid, { react: { text: "✔", key: msg.key } })

  } catch (err) {
    console.error("✘ Error en aniemoji:", err)
    await conn.sendMessage(msg.key.remoteJid, { text: "✘ Ups... algo salió mal con tu emoji animado~" }, { quoted: msg })
    await conn.sendMessage(msg.key.remoteJid, { react: { text: "✘", key: msg.key } })
  }
}

handler.command = ["aniemoji"]
handler.tags = ['sticker']
export default handler

async function writeExifDirect(webpBuffer, metadata) {
  const tmpIn = path.join(tempFolder, randomFileName("webp"))
  const tmpOut = path.join(tempFolder, randomFileName("webp"))
  fs.writeFileSync(tmpIn, webpBuffer)

  const json = {
    "sticker-pack-id": "hanako-aniemoji",
    "sticker-pack-name": metadata.packname,
    "sticker-pack-publisher": metadata.author,
    "emojis": metadata.categories || [""]
  }

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00,
    0x00, 0x00
  ])

  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
  const exif = Buffer.concat([exifAttr, jsonBuff])
  exif.writeUIntLE(jsonBuff.length, 14, 4)

  const img = new webp.Image()
  await img.load(tmpIn)
  img.exif = exif
  await img.save(tmpOut)
  fs.unlinkSync(tmpIn)
  return tmpOut
}

function randomFileName(ext) {
  return `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`
                               }
