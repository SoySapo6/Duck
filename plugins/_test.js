const handler = async (m, { conn, text, participants, groupMetadata, args, isAdmin, isBotAdmin }) => {
  try {
    const isGroup = !!m.isGroup
    const metadata = isGroup ? (groupMetadata || await conn.groupMetadata(m.chat)) : null
    const allParticipants = isGroup ? (participants || metadata?.participants || []) : []
    
    // Selección del usuario objetivo
    const mention = m.mentionedJid?.[0]
    const quoted = m.quoted?.sender
    const targetId = mention || quoted || m.sender

    // Buscar al usuario en la lista de participantes del grupo
    const target = allParticipants.find(p => p.id?.split('@')[0] === targetId.split('@')[0])
    const fallback = allParticipants.find(p => p.id === targetId)
    const adminParticipants = isGroup ? allParticipants.filter(p => p.admin) : []

    let userInfo = target || fallback

    // Si no encuentra al usuario, intenta con la lista de admins
    if (!userInfo && isGroup) {
      const fromAdmins = adminParticipants.find(p => p.id?.split('@')[0] === targetId.split('@')[0])
      if (fromAdmins) userInfo = fromAdmins
    }

    // Datos del participante
    const isGroupAdmin = userInfo?.admin === 'admin' || userInfo?.admin === 'superadmin'
    const isGroupOwner = userInfo?.admin === 'superadmin'
    const role = userInfo?.admin || 'member'

    const adminListText = isGroup
      ? adminParticipants.map(p => `▢ @${p.id.split('@')[0]} (${p.admin})`).join('\n')
      : '— No aplica, no es un grupo —'

    const adminMentionList = adminParticipants.map(p => p.id)

    // Extra: nombre del usuario objetivo
    let userName
    try {
      userName = await conn.getName(targetId)
    } catch {
      userName = 'No disponible'
    }

    // Extra: nombre del grupo
    const groupName = metadata?.subject || 'No disponible'

    // Estructura del debug
    const debugMessage = `
≡ *Debug de Permisos del Usuario*

▢ *Usuario:* @${targetId.split('@')[0]} (${userName})
▢ *Grupo:* ${groupName}
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
${userInfo ? JSON.stringify(userInfo, null, 2) : 'No se encontró información'}
\`\`\`

≡ *Debug Interno:*
▢ *isGroup:* ${isGroup}
▢ *participants loaded:* ${!!participants}
▢ *groupMetadata loaded:* ${!!groupMetadata}
▢ *getName:* ${userName}
▢ *isBotAdmin:* ${isBotAdmin}
▢ *isSenderAdmin (por WhatsApp):* ${isAdmin}
`.trim()

    await conn.reply(m.chat, debugMessage, m, {
      mentions: [targetId, ...(isGroup ? adminMentionList : [])]
    })

  } catch (e) {
    console.error('❌ Error en admincheck:', e)
    m.reply(`⚠️ Error al obtener la información del grupo o del usuario.\n\n${e.message || e}`)
  }
}

handler.help = ['admincheck', 'isadmin']
handler.tags = ['group', 'info', 'debug']
handler.command = ['admincheck', 'isadmin']
handler.group = false // ✅ También puede usarse en privado

export default handler
