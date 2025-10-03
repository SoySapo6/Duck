let handler = async (m, { conn, args, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat]
  if (!args[0]) {
    return m.reply(`
╭─❍「 🐶 Perritos Memeros 🐾 」❍─╮
🐕 Estado actual del NSFW: *${chat.nsfw ? '🐶 Activado' : '🚪 Desactivado'}*
┆ Usa:
┆ ${usedPrefix + command} on
┆ ${usedPrefix + command} off
╰─❍───────────────❍─╯
`)
  }

  if (/on|enable|1/i.test(args[0])) {
    chat.nsfw = true
    m.reply(`
╭─❍「 🐕 Perritos Memeros 🐾 」❍─╮
🎉 El club de perritos traviesos está abierto...
┆ ¡Cuidado con los memes calientes! 🔥
╰─❍───────────────❍─╯
`)
  } else if (/off|disable|0/i.test(args[0])) {
    chat.nsfw = false
    m.reply(`
╭─❍「 🐶 Perritos Memeros 🐾 」❍─╮
🛑 Los perritos se calmaron.
┆ El club de NSFW está cerrado. 🚪
╰─❍───────────────❍─╯
`)
  } else {
    m.reply(`Formato incorrecto 🐾.
Ejemplo:
${usedPrefix + command} on
${usedPrefix + command} off`)
  }
}

handler.command = /^nsfw$/i
handler.admin = true
handler.group = true

export default handler
