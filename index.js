//APIs
console.log("getting apis...");
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('ffmpeg');
const request = require("request");
const getYouTubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
const youtubenode = require('youtube-node')
const prompt = require('prompt');
const spotify = require('./spotify.js');
const youtube = new youtubenode()
const client = new Discord.Client();
const prefix = "./"
//keys
console.log("pulling keys...");
const keys = JSON.parse(fs.readFileSync('keys.json')); //read all keys
const token = keys.discordtoken //discord api key
const yt_api_key = keys.youtubetoken //youtube api key
const bot_controller = keys.bot_controller //retros arcade bot coontroller role
const bot_controller2 = keys.bot_controller2 //dnak dev bot controller role
const bot_controller3 = keys.bot_controller3 //dank members bot controller role
//vars
console.log("setting variables...");
var musicServers = {}; //all servers playing music
var musicServer = {}; //current music server
var musicQueue = []; //queue in current server
var musicList = []; //names of music queue
var musicResults = []; //all results of search query
var musicSearch; //query for youtube search
var isPlaying = false; //is music playing
var isStreaming = false; //if music is streaming
var isSearch = true; //if query is for search
var isLooping = false; //if music is looping
var isSearching = false; //if searching
var isBotController = false; //if author is bot controller
var duration; //duration of current song
var serverID; //current server id
var teamdata; //json data from vexDB
var wordTodefine; //word to define
var wordDefinition; //defenition of word
var definitions; //def object
var status; //'is playing' status
var verification = {};
var verifyUser; //user to verify
var verifySpecialty;//users specialty
var notadmin = 'djmango thinks you are not good enough for me'
// TODO: add console command functions, add webhooks for github and bot restarting, factorio server manager
//set keys
console.log('pushing keys...');
youtube.setKey(yt_api_key) //apply youtube api key
//functions
client.on("ready", function(){ //if ready, say so
    console.log("dnakbot is ready!\n" + `logged in as ${client.user.tag}!`);
    prompts()
});

function prompts() {
  prompt.get(['command'], function (err, result) {
  console.log('\n');
  console.log(result.command);
    switch (result.command) {
      case 'help': //log all commands, note to self, make sure to update this
        console.log('commands:\n b: lolxd');
        prompts()
        break;
      case 'servers': //log all servers currently active
        //var leaving = client.guilds.get('id')
        //leaving.leave()
        var guilds = client.guilds.array();
        var names = '';
        for (var i = 0; i < guilds.length; i++) {
          names = names + guilds[i].name + ', '
        }
        console.log(names);
        prompts()
        break;
      default:
    }
  });
}
function botcontroller(author) { //check if messsage author is bot controller
  //author = message.member
  if(author.roles.has(bot_controller) || author.roles.has(bot_controller2) || author.roles.has(bot_controller3) || author.id == 193066810470301696){
    isBotController = true;
  }
  else {
    isBotController = false;
  }
}
function requestdata(url){ //request data from url
  request({
      url: url,
      json: true
  }, function getteamdata (error, response, body) {
      if (!error && response.statusCode === 200) {
          teamdata = ('Team ' + body.result[0].number + ' located in ' + body.result[0].city +
          ', ' + body.result[0].region + ', ' + body.result[0].country + '. They are known as ' +
          body.result[0].team_name + ' of ' + body.result[0].organisation + '. They participate in the ' +
          body.result[0].program + ' ' + body.result[0].grade + ' competetion.');
        }
      })
}
function play(connection, message) {
  isStreaming = true;
  musicServer.dispatcher = connection.playStream(ytdl(musicServer.musicQueue[0], {filter: "audioonly"}));
  console.log('joined')
  info(connection, message)
  if (isLooping == false) musicServer.musicQueue.shift();
  musicServer.dispatcher.on("end", function() {
    if (musicServer.musicQueue[0]) musicList.shift(), message.reply('now playing ' + musicInfo.title.toLowerCase() + ' `' + duration + '` '), play(connection, message);
    else isPlaying = false, isStreaming = false, connection.disconnect();
  });
}
function info(message) {
  fetchVideoInfo(getYouTubeID(musicServer.musicQueue[0])).then(function (musicInfo) {
    musicList.push(musicInfo)
    if((musicInfo.duration / 60) >= 1){ //if duration is more than a minute
      if ((musicInfo.duration / 3600) >= 1) { //if duration is more than a hour
        var hours = Math.floor(musicInfo.duration / 3600);
        if (Math.floor((musicInfo.duration / 60) - (hours * 3600)) < 0) {
          var minutes = 0
        }
        else {
          var minutes = Math.floor((musicInfo.duration / 60) - (hours * 3600));
        }
        var seconds = Math.floor((musicInfo.duration - (minutes * 60)) - (hours * 3600));
        if (minutes < 10) { //if less than 10 mins
          if (seconds < 10) { //if less than 10 secconds
            duration = `${hours}:0${minutes}:0${seconds}`
          }
          else {
            duration = `${hours}:0${minutes}:${seconds}`
            }
        }
        else { //if more than 10 mins
          if (seconds < 10) { //if less than 10 secconds
            duration = `${hours}:${minutes}:0${seconds}`
          }
          else {
            duration = `${hours}:${minutes}:${seconds}`
            }
        }
      }
      else {//if duration is less than an hour, more than a minute
        if (Math.floor(musicInfo.duration / 60) < 10) { //if less than 10 minutes
          var minutes = Math.floor(musicInfo.duration / 60);
          var seconds = musicInfo.duration - minutes * 60;
          if (seconds < 10) { //if less than 10 secconds
            duration = `0${minutes}:0${seconds}`
          }
          else {
            duration = `0${minutes}:${seconds}`
          }
        }
        else {
          var minutes = Math.floor(musicInfo.duration / 60);
          var seconds = musicInfo.duration - minutes * 60;
          duration = `${minutes}:${seconds}`
        }
      }
    }
    else { //if duration is less than a minute
      if (musicInfo.duration < 10) { //if less than 10 secconds
        var seconds = musicInfo.duration;
        duration = `0${seconds}`
      }
      else {
        var seconds = musicInfo.duration;
        duration = `${seconds}`
      }
    }
    message.reply('added ' + musicInfo.title + ' `' + duration + '` to the queue')
  });
}
client.on('guildMemberAdd', member => {//welcome message on join
  member.guild.defaultChannel.send({embed: {
    color: 0xFFFFFF,
    author: {
      name: client.user.username,
      icon_url: client.user.avatarURL
    },
    title: "dnakbot",
    url: "http://github.com/djmango/dnakbot",
    description: `Welcome to the server, ${member}!`,
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
client.on('message', async message => { //check for message
    botcontroller(message.member) //find out if message author is a bot controller
    serverID = JSON.parse(message.guild.id); //pull server id
    if (message.author.equals(client.user)) return; //check if the client sent the message, if so ignore

    if (!message.content.startsWith(prefix)) return; //check for prefix

    var args = message.content.substring(prefix.length).split(" "); //take each argument
    function sendteamdata () {
      message.channel.send(teamdata)
    }
    switch (args[0].toLowerCase()) {
      //reply statements
      case "ping":
        //message.channel.send('pong ' + '`' + message.member.client.ping + ' msecs' + '`');
        const m = await message.channel.send("ping?");
        m.edit(`pong! latency is ${m.createdTimestamp - message.createdTimestamp}ms. api latency is ${Math.round(client.ping)}ms`);
        break;
      case "help":
        message.channel.send('hello my name is dnak bot, i am a dnak discrod bot made by djmango. features include youtube music, youtube playlists and custom definitions. type ./commands for commands')
        break;
      case "info":
        message.channel.send('hello my name is dnak bot, i am a dnak discrod bot made by djmango. features include youtube music, youtube playlists and custom definitions. type ./commands for commands')
        break;
      case "commands":
        message.channel.send({embed: {
        color: 0xFFFFFF,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        title: "commands",
        description: 'list of commands for dnakbot',
        fields: [{
            name: "general",
            value: "`ping`, `help`, `info`, `commands`, `def`"
          },
          {
            name: "music",
            value: "`play`, `choose`, `skip`, `pause`, `resume`, `join`, `queue`, `song`, `loop`"
          },
          {
            name: "verification",
            value: "`verify`"
          },
          {
            name: "admin",
            value: "`def add`, `purge`, `status`"
          },
        ],
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: "© djmango"
          }
          }
        });
        break;
      //admin commands
      case "status":
        status = ''
        for (var i = 1; i < args.length; i++) {
          status = status + args[i] + ' '
        }
        if(isBotController == true)
          client.user.setGame(status), message.channel.send('setting status to playing ' + status)
        else message.channel.send(notadmin)
        break;
      case "purge":
        if(isBotController == true){
          let messagecount = parseInt(args[1]);
          message.channel.fetchMessages({limit: messagecount}).then(messages => message.channel.bulkDelete(messages));
        }
        else message.channel.send(notadmin)
        break;
      //def commands
      case "def":
        if (args[1]) {
          switch (args[1].toLowerCase()) {
            case "add":
              //documentation: use object, server:object:word:defenition, { a: {x: 7, y: 9} }
              //[serverID {wordTodefine: wordDefinition, wordTodefine, wordDefinition }]
              //def add (word to define) (definition)
              definitions = JSON.parse(fs.readFileSync(`./def/def${serverID}.json`)) //pull definitions for server
              wordTodefine = args[2]
              wordDefinition = ''
              for (var i = 3; i < args.length; i++) { //for loop to loop through def args
                wordDefinition = wordDefinition + ' ' + args[i]
              }
              definitions[wordTodefine] = wordDefinition
              fs.writeFile(`./def/def${serverID}.json`, JSON.stringify(definitions)) //push updated definitions for server
              break;
            case "init":
              fs.writeFileSync(`./def/def${serverID}.json`, JSON.stringify({}));
              break;
            default:
              definitions = JSON.parse(fs.readFileSync(`./def/def${serverID}.json`)) //pull definitions for server
              wordTodefine = (args[1])
              message.channel.send(definitions[wordTodefine])
          }
        }
        else {
          message.channel.send('uses include `def init (run this first)`, `def add (word to define) (definition)`, `def (word)`, and `def del (definition to delete)`')
        }
        break;
      //music commands
      case "play":
        isSearch = true;
        if (args[1]) {//if link or search query is provided, run code
          serverID = JSON.parse(message.guild.id);
          if (!message.member.voiceChannel) {//check if on voice channel
            message.reply('u not in voice channel b')
            return
          };
          if (isSearching == true) {
            message.reply('choose a song before you search again')
            return
          }
          if (args[1].indexOf('.com') && !args[1].indexOf('youtube.com')) {
            message.reply('only youtube b')
          }
          if(!musicServers[serverID]) musicServers[serverID] = {
            musicQueue: []
          };
          if (args[1].indexOf('youtube.com') >= 0){//if its a link, run code
            musicServers[serverID].musicQueue.push(args[1]);
            musicServer = musicServers[serverID];
            info(message)
            isPlaying = true;
            isSearch = false;
          }
          else { //if its a search query, run code
            for (var i = 1; i < args.length; i++) { //for loop to loop through search query
              musicSearch = musicSearch + ' ' + args[i]
            }
            youtube.search(musicSearch, 5, function(error, result) {
              if (error) {
                console.log(error);
              }
              else {
                //push results to public variable
                for (var i = 0; i < 5; i++) {
                  musicResults[i] = result.items[i]
                }
                //choose song out of results
                var ret = "\n\n`";
                for (var i = 0; i < musicResults.length; i++) {
                  ret += (i + 1) + ": " + musicResults[i].snippet.title + "\n";
                }
                ret += "`"
                message.reply('search results:' + ret);
                isSearching = true;
                isSearch = true;
              }
            });
          }
          if(!message.guild.voiceConnection && isSearch == false) message.member.voiceChannel.join().then(function(connection){
            play(connection, message)
          });
          else if(isStreaming == false && isSearch == false){
            play(connection, message)
          }
        }
        else {
          message.reply('pls provide a link or search query')
          return;
        }
        break;
      case "choose":
        serverID = JSON.parse(message.guild.id);
        args[1] = args[1] - 1;
        message.reply('now playing: ' + musicResults[args[1]].snippet.title)
        musicServers[serverID].musicQueue.push('https://www.youtube.com/watch?v=' + musicResults[args[1]].id.videoId);
        console.log(musicServers[serverID].musicQueue[0])
        musicServer = musicServers[serverID];
        isPlaying = true;
        isSearching = false;
        info(message)
        if(!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection){
          play(connection, message)
        });
        else if(isStreaming == false){
          play(connection, message)
        }
        break;
      case "skip":
        if (musicServer.musicQueue[0]) {
          serverID = JSON.parse(message.guild.id);
          musicServer = musicServers[serverID];
          console.log(musicList)
          musicList.shift()
          musicServer.dispatcher.end()
          console.log(musicList)
        }
        break;
      case "song":
        message.reply('currently playing ' + musicList[0].title + ' ' + duration)
        break;
      case "queue":
        var ret = "\n\n`";
        for (var i = 0; i < musicList.length; i++) {
          ret += (i + 1) + ": " + musicList[i].title + (i === 0 ? " **(current)**" : "") + "\n";
        }
        ret += "`"
        message.reply(ret);
        break;
      case "pause":
        if(isPlaying == true) musicServer.dispatcher.paused = true, message.reply('paused')
        else message.reply('not playing anything b')
        break;
      case "resume":
        if(isPlaying == true) musicServer.dispatcher.paused = false, message.reply('resumed')
        else message.reply('not playing anything b')
        break;
      case "loop":
        if (isLooping == true) {
          isLooping = false
        }
        if (isLooping == false) {
          isLooping = true
        }
        break;
      //moderation commmands
      case "verify":
        if(message.channel.id == 335507682108768257 || message.channel.id == 342927069807640579){
          if (!args[2] || !args[1]) {
            message.reply('make sure to follow the format described in the pins')
            return
          }
          verifyUser = args[1]
          for (var i = 2; i < args.length; i++) {
            verifySpecialty = args[i]
          }
          verification[verifyUser] = verifySpecialty
          fs.writeFile('./verification.json', JSON.stringify(verification))
          message.reply('thank you for submitting a verification request')
        }
        else {
        message.reply("use the #verification chat for verification requests");
        message.delete();
        }
        break;
      //wiki commands
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
        message.channel.send("incorrect command");
    }
});

client.login(token);
