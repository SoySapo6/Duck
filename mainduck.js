import { createRequire } from 'module';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { tmpdir } from 'os';
import { format } from 'util';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { Low, JSONFile } from 'lowdb';
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js';
import store from './lib/store.js';
import { DisconnectReason, useMultiFileAuthState, MessageRetryMap, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } from '@whiskeysockets/baileys';
import { proto } from '@whiskeysockets/baileys';
import readline from 'readline';
import NodeCache from 'node-cache';

if (process.env.NODE_ENV === 'development') {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
}

if (existsSync('./duckconfig.js')) {
  await import('./duckconfig.js').catch(console.error);
}

const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

protoType();
serialize();

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
  return dirname(global.__filename(pathURL, true));
};

global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};

global.API = (name, path = '/', query = {}, apikeyqueryname) => 
  (name in global.APIs ? global.APIs[name] : name) + path + 
  (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');

global.timestamp = { start: new Date() };

const __dirname = global.__dirname(import.meta.url);

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎z/#$%.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');

global.db = new Low(new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`));

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async () => {
      if (!global.db.READ) {
        clearInterval(this);
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
      }
    }, 1 * 1000));
  }
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = chain(global.db.data);
};
loadDatabase();

global.authFile = `sessions`;
const { state, saveState, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterMap = (MessageRetryMap) => {};
const msgRetryCounterCache = new NodeCache();
const { version } = await fetchLatestBaileysVersion();
let phoneNumber = global.botnumber;

const methodCodeQR = process.argv.includes("qr");
const methodCode = !!phoneNumber || process.argv.includes("code");
const MethodMobile = process.argv.includes("mobile");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

let opcion;
if (methodCodeQR) {
  opcion = '1';
} else if (!methodCode && !existsSync(`./${authFile}/creds.json`)) {
  do {
    opcion = await question('Seleccione una opción:\n1. Con código QR\n2. Con código de texto de 8 dígitos\n---> ');
    if (!/^[1-2]$/.test(opcion)) {
      console.log('Por favor, seleccione solo 1 o 2.\n');
    }
  } while (opcion !== '1' && opcion !== '2');
}

console.info = () => {};
const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: opcion === '1' || methodCodeQR,
  mobile: MethodMobile,
  browser: opcion === '1' ? ['𝐃𝐮𝐜𝐤 - 𝐁𝐨𝐭', 'Safari', '2.0.0'] : methodCodeQR ? ['𝐃𝐮𝐜𝐤 - 𝐁𝐨𝐭', 'Safari', '2.0.0'] : ['Ubuntu', 'Chrome', '110.0.5585.95'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  getMessage: async (clave) => {
    let jid = jidNormalizedUser(clave.remoteJid);
    let msg = await store.loadMessage(jid, clave.id);
    return msg?.message || "";
  },
  msgRetryCounterCache,
  msgRetryCounterMap,
  defaultQueryTimeoutMs: undefined,
  version,
};

global.conn = makeWASocket(connectionOptions);

if (!existsSync(`./${authFile}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    if (!conn.authState.creds.registered) {
      if (MethodMobile) throw new Error('No se puede usar un código de emparejamiento con la API móvil');
      let numeroTelefono;
      if (phoneNumber) {
        numeroTelefono = phoneNumber.replace(/[^0-9]/g, '');
        if (!Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) {
          console.log(chalk.bgBlack(chalk.bold.redBright("Comience con el código de país de su número de WhatsApp.\nejemplo: 54xxxxxxxxx\n")));
          process.exit(0);
        }
      } else {
        while (true) {
          numeroTelefono = await question(chalk.bgBlack(chalk.bold.yellowBright('Por favor, escriba su número de WhatsApp.\nEjemplo: 54xxxxxxxxx\n')));
          numeroTelefono = numeroTelefono.replace(/[^0-9]/g, '');
          if (numeroTelefono.match(/^\d+$/) && Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) {
            break;
          } else {
            console.log(chalk.bgBlack(chalk.bold.redBright("Por favor, escriba su número de WhatsApp.\nEjemplo: 54xxxxxxxxx.\n")));
          }
        }
      }
      rl.close();
      setTimeout(async () => {
        let codigo = await conn.requestPairingCode(numeroTelefono);
        codigo = codigo?.match(/.{1,4}/g)?.join("-") || codigo;
        console.log(chalk.yellow('Introduce el código de emparejamiento en WhatsApp.'));
        console.log(chalk.black(chalk.bgGreen(`Tu código de emparejamiento es: `)), chalk.black(chalk.white(codigo)));
      }, 3000);
    }
  }
}

conn.isInit = false;
conn.well = false;

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data) await global.db.write();
      if (opts['autocleartmp']) {
        const tmp = [tmpdir(), join(__dirname, 'tmp')];
        tmp.forEach((dir) => {
          if (existsSync(dir)) {
            readdirSync(dir).forEach((file) => {
              const filePath = join(dir, file);
              if (statSync(filePath).isFile() && (Date.now() - statSync(filePath).mtimeMs >= 1000 * 60 * 3)) {
                unlinkSync(filePath);
              }
            });
          }
        });
      }
    }, 30 * 1000);
  }
}

if (opts['server']) {
  (await import('./server.js')).default(global.conn, PORT);
}

function clearTmp() {
  const tmp = [join(__dirname, './tmp')];
  tmp.forEach((dirname) => {
    if (existsSync(dirname)) {
      readdirSync(dirname).forEach((file) => {
        const filePath = join(dirname, file);
        if (statSync(filePath).isFile() && (Date.now() - statSync(filePath).mtimeMs >= 1000 * 60 * 3)) {
          unlinkSync(filePath);
        }
      });
    }
  });
}

function purgeSession() {
  const directorio = readdirSync("./sessions");
  const filesFolderPreKeys = directorio.filter(file => file.startsWith('pre-key-'));
  filesFolderPreKeys.forEach(file => {
    unlinkSync(`./sessions/${file}`);
  });
}

function purgeSessionSB() {
  try {
    const listaDirectorios = readdirSync('./serbot/');
    let SBprekey = [];
    listaDirectorios.forEach(directorio => {
      if (statSync(`./serbot/${directorio}`).isDirectory()) {
        const DSBPreKeys = readdirSync(`./serbot/${directorio}`).filter(fileInDir => fileInDir.startsWith('pre-key-'));
        SBprekey = [...SBprekey, ...DSBPreKeys];
        DSBPreKeys.forEach(fileInDir => {
          unlinkSync(`./serbot/${directorio}/${fileInDir}`);
        });
      }
    });
    if (SBprekey.length === 0) console.log(chalk.cyanBright(`=> No hay archivos por eliminar.`));
  } catch (err) {
    console.log(chalk.bold.red(`Algo salió mal durante la eliminación, archivos no eliminados: ${err}`));
  }
}

function purgeOldFiles() {
  const directories = ['./sessions/', './serbot/'];
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  directories.forEach(dir => {
    if (existsSync(dir)) {
      readdirSync(dir).forEach(file => {
        const filePath = join(dir, file);
        try {
          const stats = statSync(filePath);
          if (stats.isFile() && stats.mtimeMs < oneHourAgo && file !== 'creds.json') {
            unlinkSync(filePath);
            console.log(chalk.bold.green(`Archivo ${file} borrado con éxito`));
          }
        } catch (err) {
          console.log(chalk.bold.red(`Archivo ${file} no borrado: ${err}`));
        }
      });
    }
  });
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update;
  global.stopped = connection;
  if (isNewLogin) conn.isInit = true;
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date;
  }
  if (global.db.data == null) loadDatabase();
  if (update.qr || methodCodeQR) {
    if (opcion === '1' || methodCodeQR) {
      console.log(chalk.yellow('Escanea el código QR.'));
    }
  }
  if (connection === 'open') {
    console.log(chalk.yellow('Conectado correctamente.'));
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  if (reason === 405) {
    if (existsSync("./sessions/creds.json")) {
      unlinkSync("./sessions/creds.json");
    }
    console.log(chalk.bold.redBright(`Conexión reemplazada, Por favor espere un momento me voy a reiniciar...\nSi aparecen errores, vuelve a iniciar con: npm start`));
    if (typeof process.send === 'function') {
      process.send('reset');
    } else {
      console.warn('process.send no está disponible. Reinicia manualmente el proceso.');
      process.exit(1);
    }
  }
  if (connection === 'close') {
    if (reason === DisconnectReason.badSession) {
      conn.logger.error(`Sesión incorrecta, por favor elimina la carpeta ${global.authFile} y escanea nuevamente.`);
    } else if (reason === DisconnectReason.connectionClosed) {
      conn.logger.warn(`Conexión cerrada, reconectando...`);
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionLost) {
      conn.logger.warn(`Conexión perdida con el servidor, reconectando...`);
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionReplaced) {
      conn.logger.error(`Conexión reemplazada, se ha abierto otra nueva sesión. Por favor, cierra la sesión actual primero.`);
    } else if (reason === DisconnectReason.loggedOut) {
      conn.logger.error(`Conexión cerrada, por favor elimina la carpeta ${global.authFile} y escanea nuevamente.`);
    } else if (reason === DisconnectReason.restartRequired) {
      conn.logger.info(`Reinicio necesario, reinicie el servidor si presenta algún problema.`);
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.timedOut) {
      conn.logger.warn(`Tiempo de conexión agotado, reconectando...`);
      await global.reloadHandler(true).catch(console.error);
    } else {
      conn.logger.warn(`Razón de desconexión desconocida. ${reason || ''}: ${connection || ''}`);
      await global.reloadHandler(true).catch(console.error);
    }
  }
}

process.on('uncaughtException', console.error);

let isInit = true;
let handler = await import('./handler.js');
global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Object.keys(Handler || {}).length) handler = Handler;
  } catch (e) {
    console.error(e);
  }
  if (restatConn) {
    const oldChats = global.conn.chats;
    try {
      global.conn.ws.close();
    } catch {}
    conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions, { chats: oldChats });
    isInit = true;
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  conn.handler = handler.handler.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn);

  const currentDateTime = new Date();
  const messageDateTime = new Date(conn.ev);
  if (currentDateTime >= messageDateTime) {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  } else {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  }

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);
  isInit = false;
  return true;
};

const pluginFolder = join(__dirname, './plugins/index');
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
  if (!existsSync(pluginFolder)) {
    return;
  }
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = join(pluginFolder, filename);
      const module = await import(file);
      global.plugins[filename] = module.default || module;
    } catch (e) {
      conn.logger.error(e);
      delete global.plugins[filename];
    }
  }
}
filesInit().then(() => console.log(Object.keys(global.plugins))).catch(console.error);

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = join(pluginFolder, filename);
    if (filename in global.plugins) {
      if (existsSync(dir)) {
        conn.logger.info(`Updated plugin - '${filename}'`);
      } else {
        conn.logger.warn(`Plugin borrado - '${filename}'`);
        return delete global.plugins[filename];
      }
    } else {
      conn.logger.info(`Nuevo plugin - '${filename}'`);
    }
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) {
      conn.logger.error(`Syntax error while loading '${filename}'\n${format(err)}`);
    } else {
      try {
        const module = await import(`${dir}?update=${Date.now()}`);
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`Error plugin - '${filename}'\n${format(e)}`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);

await global.reloadHandler();

async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127);
        });
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false));
      }),
    ]);
  }));
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
  Object.freeze(global.support);
}

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return;
  await clearTmp();
}, 180000);

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return;
  await purgeSession();
}, 1000 * 60 * 60);

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return;
  await purgeSessionSB();
}, 1000 * 60 * 60);

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn.user) return;
  await purgeOldFiles();
}, 1000 * 60 * 60);

_quickTest().catch(console.error);
