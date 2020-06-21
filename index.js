const {Client, Collection} = require("discord.js"),
    client = new Client(),
    {readdir} = require("fs"),
    low = require('lowdb'),
    FileSync = require('lowdb/adapters/FileSync'),
    adapter = new FileSync('db.json'),
    db = low(adapter);

db.defaults({
    description: [],
    credits: [],
    note: [],
    rep: [],
    age: []
}).write();

const config = require("./config.json");
client.config = config;
client.db = db;

let now = new Date();
let hour = now.getHours();
let minute = now.getMinutes();
let second = now.getSeconds();
let times = (`[${hour}:${minute}:${second}]/`);

client.on('ready', () => {
    console.log(times + `\x1b[33m%s\x1b[0m`, '[WARN]', '\x1b[0m', 'Connexion en cours...');
    console.log(times + `\x1b[33m%s\x1b[0m`, '[WARN]', '\x1b[0m', 'Connexion à l\'API Discord.js en cours...');
    console.log(times + `\x1b[32m%s\x1b[0m`, '[OK]', '\x1b[0m', 'Connexion à l\'API Discord.js effectuée');
    console.log(times + `\x1b[36m%s\x1b[0m`, '[INFO]', '\x1b[0m', 'Connecté sur ' + client.user.username + '#' + client.user.discriminator);
    console.log(times + `\x1b[32m%s\x1b[0m`, '[OK]', '\x1b[0m', 'Chargement terminé');
    console.log(times + `\x1b[32m%s\x1b[0m`, '[OK]', '\x1b[0m', 'Prêt et connecté');

    const activities = [
        "d!help | Delta",
        `d!help | ${client.guilds.size} serveurs`,
        `d!help | ${client.users.size} users`
    ];
    client.setInterval(() => {
        const index = Math.floor(Math.random() * activities.length);
        client.user.setActivity(activities[index], {
            type: "PLAYING",
            url: "http://twitch.tv/client"
        });
    }, 15000);
});


client.login(config.token);

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
});

client.commands = new Discord.Collection();

// Recherche de toutes les commandes
fs.readdir("./commands/", (err, content) => {
    if (err) console.log(err);
    if (content.length < 1) return console.log('Veuillez créer des dossiers dans le dossier commands !');
    let groups = [];
    for (let element of content) {
        if (!element.includes('.')) groups.push(element); // Si c'est un dossier
    }
    for (let folder of groups) {
        fs.readdir("./commands/" + folder, (e, files) => {
            let js_files = files.filter(f => f.split(".").pop() === "js");
            if (js_files.length < 1) return console.log('Veuillez créer des fichiers dans le dossier "' + folder + '" !');
            if (e) console.log(e);
            for (let element of js_files) {
                let props = require('./commands/' + folder + '/' + element);
                client.commands.set(element.split('.')[0], props);
            }
        });
    }
});

client.on('guildCreate', guild => {
    const embed = new Discord.RichEmbed()
        .setDescription(`📌 Merci à **${guild.name}** d'avoir ajouté ${client.user.username}`)
        .addField("📋 __Nom du serveur__", guild.name, true)
        .addField("📊 __Nombre de membres__ :", guild.memberCount, true)
        .addField("💻 __Nombre de salons__ :", guild.channels.size, true)
        .addField("👤 __Propriétaire__ :", guild.owner, true)
        .addField("🌍 __Région du serveur__ :", guild.region, true)
        .addField("📝 __ID du serveur__ :", guild.id, true)
        .setColor("#F03A17")
    client.channels.get('553915173757255680').send(embed);
});
