import fetch from 'node-fetch'

export async function before(m, { conn }) {

  const canales = [
    { id: global.id_canal, name: global.name_canal },
    { id: global.id_canal2, name: global.name_canal2 }
  ]

  const canalSeleccionado = canales[Math.floor(Math.random() * canales.length)]

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
