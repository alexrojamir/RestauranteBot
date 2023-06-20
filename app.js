require('dotenv').config()
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')
const axios = require('axios')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')

const MONGO_DB_URI = 'mongodb+srv://rrojamir:KRYYiiKLOi71YWwq@4emstudios.0ejggy5.mongodb.net/'
const MONGO_DB_NAME = 'botwsppru'

const menuApi = async () => {
    const response = await axios.get('http://mongo.vensys.pe/')
    const data = response.data;
    return data.map(m => ({body:[`*${m.producto}*`, `${m.descripcion}`,`Precio: *S/${m.precio}*`].join('\n')}))
}

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario'])

const flowDocs = addKeyword(['pedir', 'pedido', 'pido'])
.addAnswer('A continuación, te envío el menú del día de hoy 😋', null, async (ctx, {flowDynamic}) =>{
    const data = await menuApi()
    flowDynamic(data)
    
}).addAnswer('Si el menú de hoy es de su agrado, por favor envíenos su pedido 😄',{
    delay:1500
})

const flowTuto = addKeyword(['tutorial', 'tuto']).addAnswer(
    [
        '🙌 Aquí encontras un ejemplo rapido',
        'https://bot-whatsapp.netlify.app/docs/example/',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowGracias = addKeyword(['gracias', 'grac']).addAnswer(
    [
        '🚀 Puedes aportar tu granito de arena a este proyecto',
        '[*opencollective*] https://opencollective.com/bot-whatsapp',
        '[*buymeacoffee*] https://www.buymeacoffee.com/leifermendez',
        '[*patreon*] https://www.patreon.com/leifermendez',
        '\n*2* Para siguiente paso.',
    ],
    null,
    null,
    [flowSecundario]
)

const flowDiscord = addKeyword(['discord']).addAnswer(
    ['🤪 Únete al discord', 'https://link.codigoencasa.com/DISCORD', '\n*2* Para siguiente paso.'],
    null,
    null,
    [flowSecundario]
)

const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
    .addAnswer('🙌 Hola! bienvenido al restaurante *Pepito*')
    .addAnswer(
        [
            'te comparto los siguientes pasos para realizar tu pedido',
            '👉 *pedir* Si deseas realizar tu pedido',
            '👉 *informes* para enviarte nuestro listado de locales en todo Lima',
            '👉 *pagos* Para enviarte los métodos de pago que aceptamos',
            
            
        ],
        null,
        null,
        [flowDocs, flowGracias, flowTuto, flowDiscord]
    )

const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,
    })
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}
QRPortalWeb({port:4001})
main()
