import { smsg } from './lib/simple.js'
import { format } from 'util' 
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
    clearTimeout(this)
    resolve()
}, ms))
 
export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate)
        return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m)
        return
    if (global.db.data == null)
        await global.loadDatabase()
    try {
        m = smsg(this, m) || m
        if (!m)
            return
        m.exp = 0
        m.limit = false
        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object')
                global.db.data.users[m.sender] = {}
            if (user) {
                if (!isNumber(user.exp))
                    user.exp = 0
                if (!isNumber(user.limit))
                    user.limit = 10
                if (!('premium' in user)) 
                    user.premium = false
                if (!user.premium) 
                    user.premiumTime = 0
                if (!('registered' in user))
                    user.registered = false
                if (!user.registered) {
                    if (!('name' in user))
                        user.name = m.name
                    if (!isNumber(user.age))
                        user.age = -1
                    if (!isNumber(user.regTime))
                        user.regTime = -1
                }
                if (!isNumber(user.afk))
                    user.afk = -1
                if (!('afkReason' in user))
                    user.afkReason = ''
                if (!('banned' in user))
                    user.banned = false
                if (!('useDocument' in user))
                    user.useDocument = false
                if (!isNumber(user.level))
                    user.level = 0
                if (!isNumber(user.bank))
                    user.bank = 0
            } else
                global.db.data.users[m.sender] = {
                    exp: 0,
                    limit: 10,
                    registered: false,
                    name: m.name,
                    age: -1,
                    regTime: -1,
                    afk: -1,
                    afkReason: '',
                    banned: false,
                    useDocument: true,
                    bank: 0,
                    level: 0,
                }
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object')
                global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!('isBanned' in chat))
                    chat.isBanned = false
                if (!('bienvenida' in chat))
                    chat.bienvenida = true 
                if (!('antiLink' in chat))
                    chat.antiLink = false
                if (!('onlyLatinos' in chat))
                    chat.onlyLatinos = false
                 if (!('nsfw' in chat))
                    chat.nsfw = false
                if (!isNumber(chat.expired))
                    chat.expired = 0
            } else
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    bienvenida: true,
                    antiLink: false,
                    onlyLatinos: false,
                    nsfw: false, 
                    expired: 0, 
                }
            var settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('autoread' in settings)) settings.autoread = false
            } else global.db.data.settings[this.user.jid] = {
                self: false,
                autoread: false,
                status: 0
            }
        } catch (e) {
            console.error(e)
        }
        if (opts['nyimak'])  return
        if (!m.fromMe && opts['self'])  return
        if (opts['swonly'] && m.chat !== 'status@broadcast')  return
        if (typeof m.text !== 'string')
            m.text = ''
        

        let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

        const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user.prem == true

        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys)
            return
        m.exp += Math.ceil(Math.random() * 10)

        let usedPrefix
        
        const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
        const participants = (m.isGroup ? groupMetadata.participants : []) || []
        const user = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : {}) || {}
        const bot = (m.isGroup ? participants.find(u => conn.decodeJid(u.id) == this.user.jid) : {}) || {}
        const isRAdmin = user?.admin == 'superadmin' || false
        const isAdmin = isRAdmin || user?.admin == 'admin' || false
        const isBotAdmin = bot?.admin || false

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin)
                continue
            if (plugin.disabled)
                continue
            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, {
                        chatUpdate,
                        __dirname: ___dirname,
                        __filename
                    })
                } catch (e) {
                    console.error(e)
                }
            }
            if (!opts['restrict'])
                if (plugin.tags && plugin.tags.includes('admin')) {
                    continue
                }
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ? 
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ?
                    _prefix.map(p => {
                        let re = p instanceof RegExp ?
                            p :
                            new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ?
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1])
            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, {
                    match,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }))
                    continue
            }
            if (typeof plugin !== 'function')
                continue
            if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail
                let isAccept = plugin.command instanceof RegExp ? 
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ?
                        plugin.command.some(cmd => cmd instanceof RegExp ? 
                            cmd.test(command) :
                            cmd === command
                        ) :
                        typeof plugin.command === 'string' ? 
                            plugin.command === command :
                            false

                if (!isAccept)
                    continue
                m.plugin = name
                if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m.sender]
                    let setting = global.db.data.settings[this.user.jid]
                    if (name != 'group-unbanchat.js' && chat?.isBanned)
                        return 
                    if (name != 'owner-unbanuser.js' && user?.banned)
                        return
                    if (name != 'owner-unbanbot.js' && setting?.banned)
                        return
                }
                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { 
                    fail('owner', m, this)
                    continue
                }
                if (plugin.rowner && !isROwner) { 
                    fail('rowner', m, this)
                    continue
                }
                if (plugin.owner && !isOwner) { 
                    fail('owner', m, this)
                    continue
                }
                if (plugin.mods && !isMods) { 
                    fail('mods', m, this)
                    continue
                }
                if (plugin.premium && !isPrems) { 
                    fail('premium', m, this)
                    continue
                }
                if (plugin.group && !m.isGroup) { 
                    fail('group', m, this)
                    continue
                } else if (plugin.botAdmin && !isBotAdmin) { 
                    fail('botAdmin', m, this)
                    continue
                } else if (plugin.admin && !isAdmin) { 
                    fail('admin', m, this)
                    continue
                }
                if (plugin.private && m.isGroup) {
                    fail('private', m, this)
                    continue
                }
                if (plugin.register == true && _user.registered == false) { 
                    fail('unreg', m, this)
                    continue
                }
                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17 
                if (xp > 200)
                    m.reply('chirrido -_-')
                else
                    m.exp += xp
                if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
                    conn.reply(m.chat, `Se agotaron tus *🪙 Monedas de oro*`, m, rcanal)
                    continue
                }
                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    chatUpdate,
                    __dirname: ___dirname,
                    __filename
                }
                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems)
                        m.limit = m.limit || plugin.limit || false
                } catch (e) {
                    m.error = e
                    console.error(e)
                    if (e) {
                        let text = format(e)
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                        m.reply(text)
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    if (m.limit)
                        conn.reply(m.chat, `Utilizaste *${+m.limit}* 🪙`, m, rcanal)
                }
                break
            }
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
        }
        let user, stats = global.db.data.stats
        if (m) {
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                user.limit -= m.limit * 1
            }

            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total))
                        stat.total = 1
                    if (!isNumber(stat.success))
                        stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last))
                        stat.last = now
                    if (!isNumber(stat.lastSuccess))
                        stat.lastSuccess = m.error != null ? 0 : now
                } else
                    stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }

        try {
      if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
    } catch (e) {
      console.log(m, m.quoted, e)
    }
    const settingsREAD = global.db.data.settings[this.user.jid] || {}
    if (opts['autoread']) await this.readMessages([m.key])
    if (settingsREAD.autoread) await this.readMessages([m.key])
  }
}

global.dfail = (type, m, conn, usedPrefix) => {
let msg = {
    rowner: `「❑」 𝐀𝐭𝐞𝐧𝐜𝐢𝐨́𝐧: 𝐞𝐬𝐭𝐞 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞𝐬 𝐝𝐞 𝐮𝐬𝐨 𝐞𝐱𝐜𝐥𝐮𝐬𝐢𝐯𝐨 𝐝𝐞𝐥 *𝐂𝐫𝐞𝐚𝐝𝐨𝐫* 𝐝𝐞 𝐥𝐚 𝐁𝐨𝐭. 𝐍𝐢𝐧𝐠𝐮́𝐧 𝐨𝐭𝐫𝐨 𝐮𝐬𝐮𝐚𝐫𝐢𝐨 𝐩𝐨𝐝𝐫𝐚́ 𝐞𝐣𝐞𝐜𝐮𝐭𝐚𝐫𝐥𝐨.`,    
    owner: `「❑」 𝐄𝐬𝐭𝐞 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐬𝐨𝐥𝐨 𝐩𝐮𝐞𝐝𝐞 𝐬𝐞𝐫 𝐮𝐭𝐢𝐥𝐢𝐳𝐚𝐝𝐨 𝐩𝐨𝐫 𝐞𝐥 *𝐂𝐫𝐞𝐚𝐝𝐨𝐫* 𝐝𝐞 𝐥𝐚 𝐁𝐨𝐭 𝐲 𝐩𝐨𝐫 𝐥𝐨𝐬 *𝐒𝐮𝐛 𝐁𝐨𝐭𝐬*. 𝐄𝐬𝐭𝐨 𝐬𝐞 𝐝𝐞𝐛𝐞 𝐚 𝐪𝐮𝐞 𝐢𝐧𝐜𝐥𝐮𝐲𝐞 𝐟𝐮𝐧𝐜𝐢𝐨𝐧𝐞𝐬 𝐝𝐞 𝐠𝐞𝐬𝐭𝐢𝐨́𝐧 𝐲 𝐜𝐨𝐧𝐟𝐢𝐠𝐮𝐫𝐚𝐜𝐢𝐨́𝐧 𝐝𝐞𝐥 𝐬𝐢𝐬𝐭𝐞𝐦𝐚.`,    
    mods: `「❑」 𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐝𝐢𝐬𝐞𝐧̃𝐚𝐝𝐨 𝐞𝐱𝐜𝐥𝐮𝐬𝐢𝐯𝐚𝐦𝐞𝐧𝐭𝐞 𝐩𝐚𝐫𝐚 𝐥𝐨𝐬 *𝐌𝐨𝐝𝐞𝐫𝐚𝐝𝐨𝐫𝐞𝐬*. 𝐄𝐥𝐥𝐨𝐬 𝐭𝐢𝐞𝐧𝐞𝐧 𝐩𝐞𝐫𝐦𝐢𝐬𝐨𝐬 𝐚𝐝𝐢𝐜𝐢𝐨𝐧𝐚𝐥𝐞𝐬 𝐩𝐚𝐫𝐚 𝐦𝐚𝐧𝐭𝐞𝐧𝐞𝐫 𝐞𝐥 𝐨𝐫𝐝𝐞𝐧 𝐲 𝐥𝐚 𝐬𝐞𝐠𝐮𝐫𝐢𝐝𝐚𝐝 𝐝𝐞 𝐥𝐚 𝐁𝐨𝐭.`,   
    premium: `「❑」 𝐄𝐬𝐭𝐚 𝐟𝐮𝐧𝐜𝐢𝐨́𝐧 𝐞𝐬 𝐞𝐱𝐜𝐥𝐮𝐬𝐢𝐯𝐚 𝐩𝐚𝐫𝐚 𝐮𝐬𝐮𝐚𝐫𝐢𝐨𝐬 *𝐏𝐫𝐞𝐦𝐢𝐮𝐦*. 𝐋𝐨𝐬 𝐮𝐬𝐮𝐚𝐫𝐢𝐨𝐬 𝐜𝐨𝐧 𝐞𝐬𝐭𝐞 𝐭𝐢𝐩𝐨 𝐝𝐞 𝐜𝐮𝐞𝐧𝐭𝐚 𝐝𝐢𝐬𝐟𝐫𝐮𝐭𝐚𝐧 𝐝𝐞 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐲 𝐞𝐱𝐭𝐫𝐚𝐬 𝐪𝐮𝐞 𝐧𝐨 𝐞𝐬𝐭𝐚́𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐥𝐞𝐬 𝐩𝐚𝐫𝐚 𝐞𝐥 𝐫𝐞𝐬𝐭𝐨.`,    
    group: `「❑」 𝐄𝐬𝐭𝐞 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐬𝐨𝐥𝐨 𝐬𝐞 𝐩𝐮𝐞𝐝𝐞 𝐮𝐬𝐚𝐫 𝐝𝐞𝐧𝐭𝐫𝐨 𝐝𝐞 𝐮𝐧 *𝐆𝐫𝐮𝐩𝐨*. 𝐍𝐨 𝐞𝐬𝐭𝐚́ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐥𝐞 𝐩𝐚𝐫𝐚 𝐜𝐡𝐚𝐭𝐬 𝐩𝐫𝐢𝐯𝐚𝐝𝐨𝐬.`,    
    private: `「❑」 𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐞𝐱𝐜𝐥𝐮𝐬𝐢𝐯𝐨 𝐩𝐚𝐫𝐚 𝐜𝐡𝐚𝐭𝐬 *𝐏𝐫𝐢𝐯𝐚𝐝𝐨𝐬*. 𝐍𝐨 𝐩𝐨𝐝𝐫𝐚́ 𝐮𝐬𝐚𝐫𝐬𝐞 𝐞𝐧 𝐠𝐫𝐮𝐩𝐨𝐬.`,    
    admin: `「❑」 𝐄𝐬𝐭𝐞 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞𝐬𝐭𝐚́ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐥𝐞 𝐬𝐨𝐥𝐨 𝐩𝐚𝐫𝐚 𝐥𝐨𝐬 *𝐀𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐝𝐨𝐫𝐞𝐬* 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐨. 𝐒𝐮 𝐟𝐢𝐧 𝐞𝐬 𝐚𝐲𝐮𝐝𝐚𝐫 𝐚 𝐠𝐞𝐬𝐭𝐢𝐨𝐧𝐚𝐫 𝐲 𝐦𝐚𝐧𝐭𝐞𝐧𝐞𝐫 𝐥𝐚 𝐝𝐢𝐧𝐚́𝐦𝐢𝐜𝐚 𝐝𝐞 𝐥𝐨𝐬 𝐦𝐢𝐞𝐦𝐛𝐫𝐨𝐬.`,    
    botAdmin: `「❑」 𝐏𝐚𝐫𝐚 𝐞𝐣𝐞𝐜𝐮𝐭𝐚𝐫 𝐞𝐬𝐭𝐞 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐥𝐚 𝐁𝐨𝐭 𝐝𝐞𝐛𝐞 𝐭𝐞𝐧𝐞𝐫 𝐞𝐥 𝐩𝐞𝐫𝐦𝐢𝐬𝐨 𝐝𝐞 *𝐀𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐝𝐨𝐫*. 𝐒𝐢 𝐧𝐨 𝐭𝐢𝐞𝐧𝐞 𝐞𝐬𝐭𝐞 𝐫𝐨𝐥, 𝐧𝐨 𝐩𝐨𝐝𝐫𝐚́ 𝐫𝐞𝐚𝐥𝐢𝐳𝐚𝐫 𝐥𝐚 𝐚𝐜𝐜𝐢𝐨́𝐧 𝐪𝐮𝐞 𝐬𝐨𝐥𝐢𝐜𝐢𝐭𝐚𝐬.`,    
    unreg: `「❑」 𝐍𝐨 𝐡𝐚𝐬 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐝𝐨 𝐭𝐮 𝐫𝐞𝐠𝐢𝐬𝐭𝐫𝐨. 𝐏𝐚𝐫𝐚 𝐮𝐬𝐚𝐫 𝐥𝐨𝐬 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐝𝐞 𝐥𝐚 𝐁𝐨𝐭 𝐝𝐞𝐛𝐞𝐬 𝐫𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐫𝐭𝐞 𝐩𝐫𝐢𝐦𝐞𝐫𝐨.\n\n「❑」 𝐔𝐬𝐚: */reg nombre.edad*\n「❑」 𝐄𝐣𝐞𝐦𝐩𝐥𝐨: */reg JTxs.666*`,
    restrict: `「❑」 𝐄𝐬𝐭𝐚 𝐟𝐮𝐧𝐜𝐢𝐨́𝐧 𝐬𝐞 𝐞𝐧𝐜𝐮𝐞𝐧𝐭𝐫𝐚 𝐝𝐞𝐬𝐡𝐚𝐛𝐢𝐥𝐢𝐭𝐚𝐝𝐚 𝐩𝐨𝐫 𝐞𝐥 𝐚𝐝𝐦𝐢𝐧𝐢𝐬𝐭𝐫𝐚𝐝𝐨𝐫. 𝐍𝐨 𝐞𝐬𝐭𝐚́ 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐥𝐞 𝐩𝐚𝐫𝐚 𝐧𝐢𝐧𝐠𝐮́𝐧 𝐮𝐬𝐮𝐚𝐫𝐢𝐨 𝐞𝐧 𝐞𝐬𝐭𝐞 𝐦𝐨𝐦𝐞𝐧𝐭𝐨.`  
    }[type]
    if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizo 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})
