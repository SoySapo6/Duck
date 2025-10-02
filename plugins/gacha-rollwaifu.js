// Codigo hecho por SoyMaycol <3
import { promises as fs } from 'fs'

const charactersFilePath = './storage/database/characters.json'
const haremFilePath = './storage/database/harem.json'

const cooldowns = {}

async function loadCharacters() {
  const data = await fs.readFile(charactersFilePath, 'utf-8')
  return JSON.parse(data)
}

async function saveCharacters(characters) {
  await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
}

async function loadHarem() {
  try {
    const data = await fs.readFile(haremFilePath, 'utf-8')
    const parsed = JSON.parse(data)
    return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

async function saveHarem(harem) {
  await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2), 'utf-8')
}

let handler = async (m, { conn }) => {
  const userId = m.sender
  const now = Date.now()

  if (cooldowns[userId] && now < cooldowns[userId]) {
    const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000)
    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60
    return conn.reply(m.chat, `《✧》Debes esperar *${minutes} minutos y ${seconds} segundos* para usar *#rw* de nuevo.`, m)
  }

  try {
    const characters = await loadCharacters()
    const randomCharacter = characters[Math.floor(Math.random() * characters.length)]
    const randomImage = randomCharacter.img[Math.floor(Math.random() * randomCharacter.img.length)]

    const harem = await loadHarem()

    // 🔍 Buscar dueño del personaje
    let userEntry = null
    for (const [uid, chars] of Object.entries(harem)) {
      if (Array.isArray(chars) && chars.some(c => c.id === randomCharacter.id)) {
        userEntry = { userId: uid, character: chars.find(c => c.id === randomCharacter.id) }
        break
      }
    }

    const statusMessage = userEntry
      ? `Reclamado por @${userEntry.userId.split('@')[0]}`
      : 'Libre'

    const message = `❀ Nombre » *${randomCharacter.name}*
⚥ Género » *${randomCharacter.gender}*
✰ Valor » *${randomCharacter.value}*
♡ Estado » ${statusMessage}
❖ Fuente » *${randomCharacter.source}*
✦ ID: *${randomCharacter.id}*`

    const mentions = userEntry ? [userEntry.userId] : []
    await conn.sendFile(m.chat, randomImage, `${randomCharacter.name}.jpg`, message, m, { mentions })

    if (!randomCharacter.user) {
      await saveCharacters(characters)
    }

    cooldowns[userId] = now + 15 * 60 * 1000
  } catch (error) {
    await conn.reply(m.chat, `✘ Error al cargar el personaje: ${error.message}`, m)
  }
}

handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha']
handler.command = ['ver', 'rw', 'rollwaifu']
handler.group = true

export default handler
