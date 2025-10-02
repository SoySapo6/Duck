import moment from "moment-timezone"
import fs from "fs"
import path from "path"

let handler = async (m, { conn, usedPrefix }) => {
  try {
    let menu = {}
    for (let plugin of Object.values(global.plugins)) {
      if (!plugin || !plugin.help) continue
      let taglist = plugin.tags || []
      for (let tag of taglist) {
        if (!menu[tag]) menu[tag] = []
        menu[tag].push(plugin)
      }
    }

    let uptimeSec = process.uptime()
    let hours = Math.floor(uptimeSec / 3600)
    let minutes = Math.floor((uptimeSec % 3600) / 60)
    let seconds = Math.floor(uptimeSec % 60)
    let uptimeStr = `${hours}h ${minutes}m ${seconds}s`

    let botNameToShow = global.nombre || ""
    let bannerUrl = global.img || ""
    let videoUrl = null

    const senderBotNumber = conn.user.jid.split('@')[0]
    const configPath = path.join('./Doges/SubBots', senderBotNumber, 'config.json')
    if (fs.existsSync(configPath)) {
      try {
        const subBotConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (subBotConfig.name) botNameToShow = subBotConfig.name
        if (subBotConfig.banner) bannerUrl = subBotConfig.banner
        if (subBotConfig.video) videoUrl = subBotConfig.video
      } catch (e) { console.error(e) }
    }

    let rolBot = conn.user.jid == global.conn.user.jid ? '✰ 𝐏𝐫𝐢𝐧𝐜𝐢𝐩𝐚𝐥' : '❉ 𝐒𝐮𝐛𝐁𝐨𝐭'

    
    let txt = `𝐇𝐨𝐥𝐚 𝐁𝐫𝐨!, 𝐒𝐨𝐲 *${botNameToShow}* (${rolBot})

➜ ℍ𝕠𝕣𝕒 ᴾᵉʳᵘ: ${moment.tz("America/Lima").format("HH:mm:ss")}
➜ 𝐅𝐞𝐜𝐡𝐚: ${moment.tz("America/Lima").format("DD/MM/YYYY")}
➜ 𝐀𝐜𝐭𝐢𝐯𝐢𝐝𝐚𝐝: ${uptimeStr}

━━━━━━[ 🗿 ]━━━━━━\n`

    for (let tag in menu) {
      txt += `> ┃「✣」 *${tag.toUpperCase()}*\n\n`
      for (let plugin of menu[tag]) {
        for (let cmd of plugin.help) {
          txt += `> ┃ 🐕 *${usedPrefix + cmd}*\n`
        }
      }
      txt += `> ┗╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍╍\n\n`
    }

    if (videoUrl) {
      await conn.sendMessage(
        m.chat,
        { video: { url: videoUrl }, caption: txt, gifPlayback: false },
        { quoted: m }
      )
    } else if (bannerUrl) {
      await conn.sendMessage(
        m.chat,
        { image: { url: bannerUrl }, caption: txt },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        { image: { url: global.img }, caption: txt },
        { quoted: m }
      )
    }

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, "» Ocurrió un error.", m)
  }
}

handler.command = ['help', 'menu']
export default handler
