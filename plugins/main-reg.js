import fetch from "node-fetch";

let handler = async (m, { text, args, usedPrefix, command, conn }) => {
  let user = global.db.data.users[m.sender];

  if (user.registered) {
    return m.reply(`
🦆💦 ¡Cuak! Ya estás registrado, patito/a ✨  
Nombre: ${user.name || m.pushName}  
Edad: ${user.age} años`);
  }

  if (!args[0]) {
    return m.reply(`
🦆📋 Registro de patitos  
Usa el comando así:  

${usedPrefix + command} TuNombre.Edad  

Ejemplo: ${usedPrefix + command} Ducky.12`);
  }

  let [name, age] = text.split(".");
  age = parseInt(age);

  if (!name || !age) {
    return m.reply(`
🦆❗ Formato inválido  
Ejemplo correcto: ${usedPrefix + command} Ducky.12`);
  }

  if (age < 5 || age > 100) {
    return m.reply(`
🦆⚠️ La edad de tu patito debe estar entre 5 y 100 años`);
  }

  user.name = name.trim();
  user.age = age;
  user.regTime = +new Date();
  user.registered = true;

  // ─ ✦ Mensaje privado al usuario ✦ ─
  m.reply(`
🦆💛 Registro exitoso, patito/a!  

• Nombre: ${user.name}  
• Edad: ${user.age} años  

¡Bienvenid@ al charco del DuckAM! 🌊🦆  
Disfruta de todos los comandos y cuida tu estanque!`);
};

handler.help = ["reg <nombre.edad>"];
handler.tags = ["info"];
handler.command = ["reg"];
handler.register = false;

export default handler;
