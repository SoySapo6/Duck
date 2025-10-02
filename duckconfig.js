import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = ['51921826291','SoyMaycol',true];

global.vips = []
global.sessions = "Doges/Principal"
global.jadi = "Doges/SubBots"

global.nombre2 = '𝐃𝐨𝐠 ᴮʸ ᴹᵃʸᶜᵒˡ'
global.author = '𝙃𝙚𝙘𝙝𝙤 𝙥𝙤𝙧 𝙎𝙤𝙮𝙈𝙖𝙮𝙘𝙤𝙡 <3'
global.nombre = '𝐃𝐨𝐠 ᴹᴰ'
global.img = 'https://files.catbox.moe/0hfvjz.jpg'

global.name_canal = '𝐒𝐨𝐲𝐌𝐚𝐲𝐜𝐨𝐥 <𝟑 • Actualizaciones'
global.id_canal = '120363372883715167@newsletter'
global.canal = 'https://whatsapp.com/channel/0029VayXJte65yD6LQGiRB0R'
global.currency = 'DogeCoins'

global.apiadonix = 'https://apiadonix.kozow.com'
global.mayapi = 'https://mayapi.ooguy.com'

global.multiplier = 69
global.maxwarn = '2'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright('Actualización detectada en duckconfig.js'))
  import(`${file}?update=${Date.now()}`)
})
