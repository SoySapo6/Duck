let handler = async (m, { conn, args, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat]
  if (!args[0]) {
    return m.reply(`
╭─❍「 ✦ Hanako ✦ 」❍─╮
🌸 Estado actual del NSFW: *${chat.nsfw ? '🌙 Activado' : '🚪 Desactivado'}*
┆ Usa:
┆ ${usedPrefix + command} on
┆ ${usedPrefix + command} off
╰─❍──────────❍─╯
`)
  }

  if (/on|enable|1/i.test(args[0])) {
    chat.nsfw = true
    m.reply(`
╭─❍「 ✦ Hanako ✦ 」❍─╮
👻 Los conjuros prohibidos
del *NSFW* fueron abiertos...
┆ Cuidado, humano curioso. 🌙
╰─❍──────────❍─╯
`)
  } else if (/off|disable|0/i.test(args[0])) {
    chat.nsfw = false
    m.reply(`
╭─❍「 ✦ Hanako ✦ 」❍─╮
🔮 El sello sagrado fue colocado.
┆ El *NSFW* quedó sellado. 🚪
╰─❍──────────❍─╯
`)
  } else {
    m.reply(`Formato incorrecto UwU.
Ejemplo:
${usedPrefix + command} on
${usedPrefix + command} off`)
  }
}

handler.command = /^nsfw$/i
handler.admin = true
handler.group = true

export default handler
