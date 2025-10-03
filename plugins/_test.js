const handler = async (m, { conn, participants, groupMetadata, text, isAdmin, isOwner }) => {
  // Verificar que se esté en un grupo
  if (!m.isGroup) {
    return m.reply('❌ Este comando solo funciona en grupos.')
  }

  try {
    const sender = m.sender
    const groupId = m.chat
    const metadata = groupMetadata || await conn.groupMetadata(groupId)
    const allParticipants = participants || metadata.participants || []

    // Buscar al usuario que ejecutó el comando
    const userInfo = allParticipants.find(p => p.id === sender)

    // Obtener datos
    const isGroupAdmin = userInfo?.admin === 'admin' || userInfo?.admin === 'superadmin'
    const isGroupOwner = userInfo?.admin === 'superadmin'
    const role = userInfo?.admin || 'member'

    // Lista de administradores
    const adminList = allParticipants
      .filter(p => p.admin)
      .map(p => `@${p.id.split('@')[0]} (${p.admin})`)
      .join('\n')

    // Mensaje de depuración
    const debugMessage = `
≡ *Debug de Permisos del Usuario*

▢ *Usuario:* @${sender.split('@')[0]}
▢ *Grupo:* ${metadata.subject}
▢ *ID Grupo:* ${groupId}

≡ *Información del Usuario:*
▢ *ID:* ${sender}
▢ *Rol:* ${role}
▢ *¿Es admin?:* ${isGroupAdmin ? '✅ Sí' : '❌ No'}
▢ *¿Es owner (creador)?:* ${isGroupOwner ? '✅ Sí' : '❌ No'}

≡ *Admins del grupo (${adminList.split('\n').length}):*
${adminList}

≡ *Raw del participante:*
\`\`\`json
${JSON.stringify(userInfo, null, 2)}
\`\`\`
`.trim()

    await conn.reply(m.chat, debugMessage, m, { mentions: [sender, ...adminList.map(a => a.id)] })

  } catch (e) {
    console.error(e)
    m.reply('⚠️ Ocurrió un error al obtener la información del grupo.\n\n' + (e.message || e))
  }
}

handler.help = ['admincheck', 'isadmin']
handler.tags = ['group', 'info']
handler.command = ['admincheck', 'isadmin']
handler.group = true

export default handler
