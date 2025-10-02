import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
  ['50493732693', '-', true],
  ['']
]

global.vips = []
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"

global.nombre2 = '⏤͟͟͞͞☆𝗗𝘂𝗰𝗸, mᥲძᥱ ᥕі𝗍һ 𝗔𝗠.𝗖𝗹𝘂𝗯'
global.autor = 'CLUB.AM'
global.nombre = '𝐃𝐮𝐜𝐤 𝐀𝐌'
global.img = 'https://files.catbox.moe/0hfvjz.jpg'

global.name_canal = ''
global.id_canal = ''
global.canal = ''


global.multiplier = 69
global.maxwarn = '2'


let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright('Actualización detectada en duckconfig.js'))
  import(`${file}?update=${Date.now()}`)
})
