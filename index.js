const Discord = require('discord.js');

const bot = new Discord.Client();
const token = "MzMxMTQyMjU4NDU3ODM3NTcw.DDrUxA.aivQIrt9x8Y1rKS8BvMf_-PwTvg";
const prefix = "./"

bot.on("ready", function(){
    console.log("Ready")
});

bot.on('message', (message) => { //check message
    if(message.content == 'ping') {
        message.channel.sendMessage('pong');
    }
    if(message.content == 'ding') {
        message.channel.sendMessage('dong');
    }
    if (message.author.equals(bot.user)) return;

    if (!message.content.startsWith(prefix)) return;

    var args = message.content.substring(prefix.length).split(" "); //take each argument
// TODO: automate aws server git update to match bot
    switch (args[0]) {
      case "ping":
        message.channel.sendMessage('pong');
        break;
    default:
        message.channel.send("Incorrect command");
    }
});

bot.login(token);
