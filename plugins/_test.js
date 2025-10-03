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

    // Lista de administradores
    const adminParticipants = isGroup ? allParticipants.filter(p => p.admin) : []

    // Buscar al usuario en los participantes
    const target = allParticipants.find(p => p.id?.split('@')[0] === targetId.split('@')[0])
    const fallback = allParticipants.find(p => p.id === targetId)
    let userInfo = target || fallback

    // Fallback: si no lo encuentra en los participantes, lo busca en adminParticipants
    if (!userInfo && isGroup) {
      const fromAdmins = adminParticipants.find(p => p.id?.split('@')[0] === targetId.split('@')[0])
      if (fromAdmins) {
        userInfo = {
          id: fromAdmins.id,
          admin: fromAdmins.admin || 'unknown',
          isFallback: true
        }
      } else {
        // Último recurso: objeto manual con estado desconocido
        userInfo = {
          id: targetId,
          admin: 'unknown',
          isFallback: true
        }
      }
    }

    // Evaluar rol y permisos
    const role = userInfo?.admin || 'member'
    const isGroupAdmin = role === 'admin' || role === 'superadmin'
    const isGroupOwner = role === 'superadmin'

    // Lista de admins en formato visual
    const adminListText = isGroup
      ? adminParticipants.map(p => `▢ @${p.id.split('@')[0]} (${p.admin})`).join('\n')
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
handler.group = false // ✅ También funciona fuera de grupos

export default handlerd
