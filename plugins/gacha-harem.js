import { promises as fs } from 'fs'

const charactersFilePath = './storage/databases/characters.json'
const haremFilePath = './storage/databases/harem.json'

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('ꕥ No pudimos cargar los datos de personajes.\n> ● *Si crees que es un fallo, repórtalo usando /report*')
    }
}

async function loadHarem() {
    try {
        const data = await fs.readFile(haremFilePath, 'utf-8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

let handler = async (m, { conn, args }) => {
    try {
        const characters = await loadCharacters()
        const harem = await loadHarem()
        let userId

        if (m.quoted?.sender) {
            userId = m.quoted.sender
        } else if (args[0]?.startsWith('@')) {
            userId = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            userId = m.sender
        }

        const userCharacters = characters.filter(character => character.user === userId)

        if (userCharacters.length === 0) {
            await conn.sendMessage(m.chat, {
                text: 'ꕥ No tienes personajes reclamados en tu harem.\n> ● *Usa /claim para empezar tu colección.*',
                ...global.rcanal
            }, { quoted: m })
            return
        }

        const page = parseInt(args[1]) || 1
        const charactersPerPage = 50
        const totalCharacters = userCharacters.length
        const totalPages = Math.ceil(totalCharacters / charactersPerPage)

        if (page < 1 || page > totalPages) {
            await conn.sendMessage(m.chat, {
                text: `ꕥ Página inválida.\n> ● *Tu harem tiene ${totalPages} páginas en total.*`,
                ...global.rcanal
            }, { quoted: m })
            return
        }

        const startIndex = (page - 1) * charactersPerPage
        const endIndex = Math.min(startIndex + charactersPerPage, totalCharacters)

        let message = `*✿ Harem ✿*\n`
        message += `> ⌦ Dueño » @${userId.split('@')[0]}\n`
        message += `> ☄︎ Personajes » *${totalCharacters}*\n\n`

        for (let i = startIndex; i < endIndex; i++) {
            const character = userCharacters[i]
            message += `» *${character.name}* (*${character.value}*)\n`
        }

        message += `\n✎ _Página *${page}* de *${totalPages}*_`

        await conn.sendMessage(m.chat, {
            text: message,
            mentions: [userId],
            ...global.rcanal
        }, { quoted: m })
    } catch (error) {
        await conn.sendMessage(m.chat, {
            text: `ꕥ Ocurrió un error al cargar tu harem.\n> ● *Error ›* ${error.message}`,
            ...global.rcanal
        }, { quoted: m })
    }
}

handler.help = ['harem']
handler.tags = ['gacha']
handler.command = ['harem', 'claims', 'waifus']
handler.group = false
handler.register = false

export default handler
