const handler = async (m, { conn, text, participants, groupMetadata, args, isAdmin, isBotAdmin }) => {
  try {
    const isGroup = !!m.isGroup
    const metadata = isGroup ? (groupMetadata || await conn.groupMetadata(m.chat)) : null
    const allParticipants = isGroup ? (participants || metadata?.participants || []) : []

    // Obtener ID del objetivo (mencionado, citado o autor del mensaje)
    const mention = m.mentionedJid?.[0]
    const quoted = m.quoted?.sender
    const targetId = mention || quoted || m.sender

    // Obtener nombre del usuario
    let userName = 'No disponible'
    try { userName = await conn.getName(targetId) } catch {}

    const groupName = metadata?.subject || 'No disponible'

    // Obtener admins con método directo si está disponible (fallback)
    let adminParticipants = []
    try {
      if (conn.groupGetAdmins) {
        const adminIds = await conn.groupGetAdmins(m.chat)
        adminParticipants = allParticipants.filter(p => adminIds.includes(p.id))
      } else {
        adminParticipants = allParticipants.filter(p => p.admin)
      }
    } catch {
      adminParticipants = allParticipants.filter(p => p.admin)
    }

    // Obtener creador / owner
    const ownerId = metadata?.owner || metadata?.creator || null

    // Buscar al usuario en los participantes
    let userInfo = allParticipants.find(p => p.id === targetId)

    // Si no lo encontró, buscar en admins
    if (!userInfo) {
      userInfo = adminParticipants.find(p => p.id === targetId)
    }

    // Si sigue sin encontrar, fallback manual
    if (!userInfo) {
      userInfo = {
        id: targetId,
        admin: 'unknown',
        isFallback: true
      }
    }

    // Detectar rol real con fallback owner
    let role = userInfo.admin || 'member'
    if (ownerId && targetId === ownerId) {
      role = 'superadmin' // Forzar owner
    }
    const isGroupAdmin = role === 'admin' || role === 'superadmin'
    const isGroupOwner = role === 'superadmin'

    // Lista de admins en texto
    const adminListText = isGroup
      ? adminParticipants.map(p => `▢ @${p.id.split('@')[0]} (${p.admin || 'admin'})`).join('\n')
      : '— No aplica (fuera de grupo) —'

    const adminMentionList = adminParticipants.map(p => p.id)

    // Armar respuesta final
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
${JSON.stringify(userInfo, null, 2)}
\`\`\`

≡ *Debug Interno:*
▢ *isGroup:* ${isGroup}
▢ *participants loaded:* ${!!participants}
▢ *groupMetadata loaded:* ${!!groupMetadata}
▢ *getName:* ${userName}
▢ *isBotAdmin:* ${isBotAdmin}
▢ *isSenderAdmin (por WhatsApp):* ${isAdmin}
▢ *ownerId:* ${ownerId || 'No disponible'}
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
handler.group = true

export default handler
