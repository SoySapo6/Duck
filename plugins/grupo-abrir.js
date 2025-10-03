let handler = async (m, { conn, args, isBotAdmin, isAdmin }) => {
  if (!m.isGroup) throw '❌ Este comando solo se puede usar en grupos.'
  if (!isBotAdmin) throw '❌ Necesito ser administrador para hacer eso.'
  if (!isAdmin) throw '❌ Solo los administradores pueden usar este comando.'

  let action = args[0]?.toLowerCase()
  if (!['abrir', 'cerrar'].includes(action)) throw '⚠️ Usa:\n#grupo abrir\n#grupo cerrar'

  if (action === 'cerrar') {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    m.reply('✅ El grupo ha sido *cerrado*.')
  } else {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    m.reply('✅ El grupo ha sido *abierto*.')
  }
}
handler.help = ['grupo abrir|cerrar']
handler.tags = ['grupo']
handler.command = /^(grupo)$/i
handler.group = true
handler.admin = true

export default handler
