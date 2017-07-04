const Discord = require('discord.js');

const bot = new Discord.Client();
const token = "MzMxMTQyMjU4NDU3ODM3NTcw.DDrUxA.aivQIrt9x8Y1rKS8BvMf_-PwTvg";
const prefix = "./"
const request = require("request")

//request test
var url = "https://api.vexdb.io/v1/get_teams?team=6096A"
var teamdata = 0;

request({
    url: url,
    json: true
}, function getteamdata (error, response, body) {
    if (!error && response.statusCode === 200) {
        console.log(body) // Print the json response
        teamdata = body;
    }

})

bot.on("ready", function(){ //if ready, say so
    console.log("Ready")
});

bot.on('message', (message) => { //check for message
    if (message.author.equals(bot.user)) return; //check if the bot sent the message, if so ignore

    if (!message.content.startsWith(prefix)) return; //check for prefix

    var args = message.content.substring(prefix.length).split(" "); //take each argument
    switch (args[0]) {
      //reply statements
      case "ping":
        message.channel.send('pong');
        break;
      case "pong":
        message.channel.send('ping');
        break;
      case "ding":
        message.channel.send('dong');
        break;
      case "dong":
        message.channel.send('ding');
        break;
      case "bangle":
          message.channel.send('shangle');
          break;
      case "shangle":
          message.channel.send('bangle');
          break;
      //vexdb commands
      case "teamlog":
        request({
            url: url,
            json: true
        }, function getteamdata (error, response, body) {
            if (!error && response.statusCode === 200) {
                var testbody = JSON.stringify(body);
                message.channel.send(testbody)
                teamdata = (body);
              }
            })
        break;
    default:
        message.channel.send("Incorrect command");
    }
});

bot.login(token);
