//APIs
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
const client = new Discord.Client();
const keys = JSON.parse(fs.readFileSync('keys.json'))
const prefix = "./"
const request = require("request")
const token = keys.discordtoken

var serverID;
var teamdata;
var queue = [];
var isPlaying = false;
var dispatcher = null;
var voiceChannel = null;
var skipReq = 0;
var skippers = [];
var defWord; //word to define
var wordDef; //defenition of word
var definitions = {};

client.on("ready", function(){ //if ready, say so
    console.log("Ready")
});

function requestdata(url){
  request({
      url: url,
      json: true
  }, function getteamdata (error, response, body) {
      if (!error && response.statusCode === 200) {
          teamdata = JSON.stringify(body);
          //message.channel.send(teststring);
        }
      })
}

client.on('message', (message) => { //check for message
    if (message.author.equals(client.user)) return; //check if the client sent the message, if so ignore

    if (!message.content.startsWith(prefix)) return; //check for prefix

    var args = message.content.substring(prefix.length).split(" "); //take each argument
    function sendteamdata () {
      message.channel.send(teamdata)
    }
    serverID = message.guild.id;
    definitions = {serverID: {defWord:wordDef}};
    switch (args[0].toLowerCase()) {
      //reply statements
      case "ping":
        message.channel.send('pong');
        break;
      case "ding":
        message.channel.send('dong');
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
              args[2] = defWord;
              args[3] = wordDef;
              console.log(tokens);
              //documentation: use object, server:ojbect:word:defenition, { a: {x: 7, y: 9} }
              //def add (word to define) (definition)
              var b = {d: eval(message.guild.id)}
              console.log(b.d)
              message.channel.send(b.d)
              break;
            default:
              message.channel.send('uses include `def add (word to define) (definition)`, `def (word)`, and def del (definition to delete)')

          }
        }
        else {
          message.channel.send('uses include `def add (word to define) (definition)`, `def (word)`, and def del (definition to delete)')
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
