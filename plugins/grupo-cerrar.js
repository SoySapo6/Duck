let handler = async (m, { conn, isBotAdmin, isAdmin, text }) => {
  if (!m.isGroup) throw '❌ Este comando solo se puede usar en grupos.'
  if (!isBotAdmin) throw '❌ Necesito ser administrador para hacer eso.'
  if (!isAdmin) throw '❌ Solo los administradores pueden usar este comando.'

  await conn.groupSettingUpdate(m.chat, 'announcement') // 'announcement' = solo admins
  m.reply('✅ El grupo ha sido *cerrado*.\nSolo los administradores pueden enviar mensajes.')
}
handler.help = ['cerrargrupo']
handler.tags = ['grupo']
handler.command = /^(cerrargrupo)$/i
handler.group = true
handler.admin = true

export default handler
