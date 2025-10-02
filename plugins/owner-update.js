import { exec } from 'child_process'

let handler = async (m, { conn }) => {
  m.react('⏳')
  exec('git pull', (err, stdout, stderr) => {
    if (err) {
      m.reply(`❌ Error en git pull:\n${err.message}`)
      return
    }
    if (stderr) m.reply(`⚠️ Advertencia:\n${stderr}`)
    m.reply(`✅ Git pull completado:\n\`\`\`${stdout}\`\`\`\n\n♻️ Reiniciando el bot...`)
    setTimeout(() => {
      process.exit(0) 
    }, 2000)
  })
}

handler.help = ['fix']
handler.tags = ['owner']
handler.command = ['fix']

export default handler
