//APIs
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const client = new Discord.Client();
const keys = JSON.parse(fs.readFileSync('keys.json'))
const prefix = "./"
const request = require("request")
const token = keys.discordtoken
const newUsers = [];

var servers = {};
var argsAmnt = 0;
var serverID;
var teamdata;
var queue = [];
var isPlaying = false;
var dispatcher = null;
var voiceChannel = null;
var skipReq = 0;
var skippers = [];
var wordTodefine; //word to define
var wordDefinition; //defenition of word
var definitions;

client.on("ready", function(){ //if ready, say so
    console.log("Ready")
});

function requestdata(url){
  request({
      url: url,
      json: true
  }, function getteamdata (error, response, body) {
      if (!error && response.statusCode === 200) {
          //JSON.parse(body);
          teamdata = ('Team ' + body.result[0].number + ' located in ' + body.result[0].city +
          ', ' + body.result[0].region + ', ' + body.result[0].country + '. They are known as ' +
          body.result[0].team_name + ' of ' + body.result[0].organisation + '. They participate in the ' +
          body.result[0].program + ' ' + body.result[0].grade + ' competetion.');
        }
      })
}

client.on('guildMemberAdd', member => {//welcome message
  console.log(member);
  member.guild.defaultChannel.send({embed: {
    color: 0xFFFFFF,
    author: {
      name: client.user.username,
      icon_url: client.user.avatarURL
    },
    title: "This server is powered by dnakbot",
    url: "http://github.com/djmango/dnakbot",
    description: `Welcome to the server, ${member}!',
    fields: [{
        name: "Info",
        value: "I am dnak bot, a bot created by djmango. get started by typing ./help!"
      },
      {
        name: "Donations",
        value: "pls help keep this bot online by donating bitcoin to **1KGVv2QKego2eKVDibci6nXaJcVw9ZdmXV** or PayPal to **anoneemousehax@gmail.com**."
      },
      {
        name: "Feedback",
        value: "feel free to report bugs or a #feature-request on my [github](http://github.com/djmango/dnakbot)!"
      },
    ],
    timestamp: new Date(),
    footer: {
      icon_url: client.user.avatarURL,
      text: "© djmango"
    }
  }
});
});

client.on('message', (message) => { //check for message
    if (message.author.equals(client.user)) return; //check if the client sent the message, if so ignore

    if (!message.content.startsWith(prefix)) return; //check for prefix

    var args = message.content.substring(prefix.length).split(" "); //take each argument
    function sendteamdata () {
      message.channel.send(teamdata)
    }
    switch (args[0].toLowerCase()) {
      //reply statements
      case "ping":
        message.channel.send('pong');
        break;
      case "ding":
        message.channel.send('dong');
        break;
      case "help":
        message.channel.send('hello my name is dnak bot, i am a dnak discrod bot made by djmango. type ./commands for commands')
        break;
      case "info":
        message.channel.send('hello my name is dnak bot, i am a dnak discrod bot made by djmango. type ./commands for commands')
        break;
      case "commands":
        message.channel.send('COMMANDS: def, info, play, vex; more comming soon to a dsircod sserver near ulolxd')
        break;
      //def commands
      case "def":
        if (args[1]) {
          switch (args[1].toLowerCase()) {
            case "add":
              //documentation: use object, server:object:word:defenition, { a: {x: 7, y: 9} }
              //{serverID {wordTodefine: wordDefinition, wordTodefine, wordDefinition }}
              //def add (word to define) (definition)
              serverID = JSON.parse(message.guild.id); //pull server id
              definitions = JSON.parse(fs.readFileSync(`./def/def${serverID}.json`)) //pull definitions for server
              wordTodefine = args[2]
              wordDefinition = ''
              //wordDefinition = args[3]
              for (var i = 3; i < args.length; i++) { //for loop to loop through def args
                wordDefinition = wordDefinition + ' ' + args[i]
              }
              definitions[wordTodefine] = wordDefinition
              fs.writeFile(`./def/def${serverID}.json`, JSON.stringify(definitions)) //push updated definitions for server
              break;
            case "init":
              serverID = JSON.parse(message.guild.id); //pull server id
              fs.appendFile(`./def/def${serverID}.json`, JSON.stringify({}))
              break;
            default:
              serverID = JSON.parse(message.guild.id); //pull server id
              definitions = JSON.parse(fs.readFileSync(`./def/def${serverID}.json`)) //pull definitions for server
              wordTodefine = (args[1])
              message.channel.send(definitions[wordTodefine])
          }
        }
        else {
          message.channel.send('uses include `def init (run this first)` `def add (word to define) (definition)`, `def (word)`, and `def del (definition to delete)`')
        }
        break;
      //music commands
      case "play":
        if (!args[1]) {
          message.channel.send('pls give link')
        }
        if (!message.member.voiceChannel) {
          message.channel.send('u not in voice channel b')
        }

        break;
      //vexdb commands
      case "vex":
        switch (args[1]) {
          case "team":
            requestdata(url = `https://api.vexdb.io/v1/get_teams?team=${args[2]}`);
            setTimeout(sendteamdata, 1000);
            break;

          default:
              message.channel.send("Incorrect command, use ./vex team (team number)");
        }
        break;
      default: //default
        message.channel.send("Incorrect command");
    }
});

client.login(token);
