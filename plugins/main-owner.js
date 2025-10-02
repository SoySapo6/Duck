let handler = async (m, { conn }) => {
let vcard = `BEGIN:VCARD
VERSION:3.0
N:;SoyMaycol;;;
FN:SoyMaycol
ORG:SoyMaycol
TITLE:Programador
item1.TEL;waid=51921826291:51921826291
item1.X-ABLabel:Celular
item2.EMAIL;type=INTERNET:soymaycol.cn@gmail.com
item2.X-ABLabel:Correo
item3.URL:https://github.com/SoySapo6/
item3.X-ABLabel:GitHub
X-WA-BIZ-DESCRIPTION:SoyMaycol - Programador joven
X-WA-BIZ-NAME:SoyMaycol
END:VCARD`;

    await conn.sendMessage(
        m.chat, 
        { contacts: { displayName: 'SoyMaycol', contacts: [{ vcard }] } }, 
        { quoted: m }
    );
};

handler.help = ['owner'];
handler.tags = ['main'];
handler.command = ['owner', 'creator', 'creador', 'dueño'];

export default handler;
