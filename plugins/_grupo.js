let handler = async (m, { conn, command, isAdmin }) => {
  if (!m.isGroup) throw '❌ Este comando solo se puede usar en grupos.'
  if (!isAdmin) throw '❌ Solo los administradores pueden usar este comando.'

  if (command === 'cerrar') {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    m.reply('✅ El grupo ha sido *cerrado*. Solo los administradores pueden enviar mensajes.')
  } else if (command === 'abrir') {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    m.reply('✅ El grupo ha sido *abierto*. Todos los participantes pueden enviar mensajes.')
  }
}

handler.help = ['abrir', 'cerrar']
handler.tags = ['grupo']
handler.command = /^(abrir|cerrar)$/i
handler.group = true
handler.admin = true

export default handler
