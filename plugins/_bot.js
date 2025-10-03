let handler = async (m, { conn, command, isAdmin, isROwner, isOwner, groupMetadata }) => {
    if (!isAdmin && !isOwner && !isROwner) {
        return m.reply('🛑 Solo *administradores* o el *dueño del bot* pueden usar este comando.')
    }

    let chat = global.db.data.chats[m.chat]
    if (command === 'bot') {
        const args = m.text.split(' ')
        const accion = args[1]?.toLowerCase()

        if (accion === 'on') {
            if (!chat.isBanned) return m.reply('✅ El bot ya está activado en este chat.')
            chat.isBanned = false
            m.reply('✅ Bot *activado* en este chat.')
        } else if (accion === 'off') {
            if (chat.isBanned) return m.reply('❌ El bot ya estaba desactivado en este chat.')
            chat.isBanned = true
            m.reply('⛔ Bot *desactivado* en este chat. Solo responderé a `bot on`.')
        } else {
            m.reply('ℹ️ Usa:\n*bot on* - Para activar el bot\n*bot off* - Para desactivar el bot')
        }
    }
}

handler.command = /^bot$/i
handler.group = true
handler.admin = true // Solo admins o dueños
handler.botAdmin = true
export default handler
