import fetch from 'node-fetch'

export async function before(m, { conn }) {

  const ids = [id_canal, id_canal2]
  const names = [name_canal, name_canal2]

  const randomId = ids[Math.floor(Math.random() * ids.length)]
  const randomName = names[Math.floor(Math.random() * names.length)]

  global.rcanal = {
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: randomId,
        serverMessageId: 100,
        newsletterName: randomName,
      }
    }
  }
}
