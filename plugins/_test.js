const handler = async (m, { conn, text, participants, groupMetadata, args }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

  try {
    const metadata = groupMetadata || await conn.groupMetadata(m.chat)
    const allParticipants = participants || metadata.participants || []

    // Identificar al usuario objetivo
    const mention = m.mentionedJid?.[0]
    const quoted = m.quoted?.sender
    const targetId = mention || quoted || m.sender

    // Lista de administradores
    const adminParticipants = allParticipants.filter(p => p.admin)

    // Buscar al usuario en los participantes
    const target = allParticipants.find(p => p.id?.split('@')[0] === targetId.split('@')[0])
    const fallback = allParticipants.find(p => p.id === targetId)

    let userInfo = target || fallback

    // Si no encuentra al usuario, lo intenta con la lista de admins
    if (!userInfo) {
      const fromAdmins = adminParticipants.find(p => p.id?.split('@')[0] === targetId.split('@')[0])
      if (fromAdmins) userInfo = fromAdmins
    }

    const isGroupAdmin = userInfo?.admin === 'admin' || userInfo?.admin === 'superadmin'
    const isGroupOwner = userInfo?.admin === 'superadmin'
    const role = userInfo?.admin || 'member'

    const adminListText = adminParticipants
      .map(p => `▢ @${p.id.split('@')[0]} (${p.admin})`)
      .join('\n')
    const adminMentionList = adminParticipants.map(p => p.id)

    const debugMessage = `
≡ *Debug de Permisos del Usuario*

▢ *Usuario:* @${targetId.split('@')[0]}
▢ *Grupo:* ${metadata.subject}
▢ *ID Grupo:* ${m.chat}

≡ *Información del Usuario:*
▢ *ID:* ${targetId}
▢ *Rol:* ${role}
▢ *¿Es admin?:* ${isGroupAdmin ? '✅ Sí' : '❌ No'}
▢ *¿Es owner (creador)?:* ${isGroupOwner ? '✅ Sí' : '❌ No'}

≡ *Admins del grupo (${adminParticipants.length}):*
${adminListText}

≡ *Raw del participante:*
\`\`\`json
${JSON.stringify(userInfo, null, 2) || 'No se encontró información'}
\`\`\`
`.trim()

    await conn.reply(m.chat, debugMessage, m, {
      mentions: [targetId, ...adminMentionList],
    })

  } catch (e) {
    console.error(e)
    m.reply('⚠️ Error al obtener la información del grupo.\n\n' + (e.message || e))
  }
}

handler.help = ['admincheck', 'isadmin']
handler.tags = ['group', 'info']
handler.command = ['admincheck', 'isadmin']
handler.group = true

export default handler
