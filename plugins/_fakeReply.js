import fetch from 'node-fetch'

export async function before(m, { conn }) {

  // Usamos siempre el primer canal
  const canalSeleccionado = { id: global.id_canal, name: global.name_canal }

  global.rcanal = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: canalSeleccionado.id,
        serverMessageId: 100,
        newsletterName: canalSeleccionado.name,
      }
    }
  }
}
