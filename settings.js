import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"

global.botNumber = "" 

global.owner = [
"50493732693",
"51921826291",
"180650938249287"
]

global.suittag = [] 
global.prems = []


global.libreria = "AdonixBailyes"
global.vs = "Latest"
global.nameqr = "Duck-MD"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBots"
global.duckJadibts = true


global.botname = "𝗗𝘂𝗰𝗸 𝗔𝗠"
global.textbot = "💚 𝘿𝙪𝙘𝙠, mᥲძᥱ ᥕі𝗍һ ᑲᥡ 𝐓𝐡𝐞 𝐀𝐌 𝐂𝐥𝐮𝐛."
global.dev = "© 𝐌𝐚𝐝𝐞 𝐖𝐢𝐭𝐡 𝗔𝗠.𝗖𝗹𝘂𝗯"
global.author = "© mᥲძᥱ ᥕі𝗍һ ᑲᥡ 𝗔𝗠 𝗖𝗹𝘂𝗯"
global.etiqueta = "𝕮𝖑𝖚𝖇 𝖠𝖬"
global.currency = "¢£ 𝖢𝗁𝗈𝖼𝗈𝖢𝗈𝖼𝗄𝗂𝖾𝗌"
global.banner = "https://files.catbox.moe/dkmx9n.jpg"
global.icono = "https://files.catbox.moe/ogn3ry.jpg"
global.catalogo = fs.readFileSync('./lib/catalogo.jpg')


global.group = ""
global.community = ""
global.channel = "https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O"
global.github = "https://github.com/meado-learner/Duck"
global.gmail = "minexdt@gmail.com"
global.ch = {
ch1: "120363372883715167@newsletter",
ch2: "120363403739366547@newsletter"
}


global.APIs = {
xyro: { url: "https://xyro.site", key: null },
yupra: { url: "https://api.yupra.my.id", key: null },
vreden: { url: "https://api.vreden.web.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
zenzxz: { url: "https://api.zenzxz.my.id", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
mayapi: { url: "https://mayapi.ooguy.com", key: "may-3d9ac5f2" },
apiadonix: { url: "https://apiadonix.kozow.com", key: "SoyMaycol<3" }
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'settings.js'"))
import(`${file}?update=${Date.now()}`)
})
