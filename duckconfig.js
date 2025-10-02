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

global.nombre2 = ''
global.autor = ''
global.nombre = ''
global.img = ''

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
