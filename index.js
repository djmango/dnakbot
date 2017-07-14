//APIs
console.log("getting apis...");
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpeg = require('ffmpeg');
const request = require("request");
const getYouTubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
const client = new Discord.Client();
const prefix = "./"
const spotify = require('./spotify.js');
const youtube = require('./youtube.js');
//keys
console.log("pulling keys...");
const keys = JSON.parse(fs.readFileSync('keys.json'));
const token = keys.discordtoken
const yt_api_key = keys.youtubetoken
const bot_controller = keys.bot_controller
const bot_controller2 = keys.bot_controller2
//vars
console.log("setting variables...");
var backQueue = [];
var queue = [];
var queueNames = [];
var isPlaying = false;
var dispatcher = null;
var voiceChannel = null;
var skipReq = 0;
var skippers = [];
var currentBackQueue = 0;
var argsAmnt = 0;
var serverID;
var teamdata;
var wordTodefine; //word to define
var wordDefinition; //defenition of word
var definitions;
var status;
var notadmin = 'daddy mango thinks your not good enough for me'
// TODO: factorio server, spam functions, aditional admin stuff, browse discord.js library
client.on("ready", function(){ //if ready, say so
    console.log("ready!")
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
function isYoutube(str){
  return str.toLowerCase.indexOf("youtube.com") > - 1;
}
function skip_song() {
    dispatcher.end();
}
function playMusic(id, message, backQueueUsed) {
    voiceChannel = message.member.voiceChannel || voiceChannel;

    if (voiceChannel != null) {
        voiceChannel.join()
            .then(function(connection) {
                stream = ytdl("https://www.youtube.com/watch?v=" + id, {
                    filter: 'audioonly'
                });
                skipReq = 0;
                skippers = [];

                dispatcher = connection.playStream(stream);
                dispatcher.on('end', function() {
                    skipReq = 0;
                    skippers = [];
                    if (backQueueUsed) {
                        currentBackQueue++;
                    } else {
                        queue.shift();
                        queueNames.shift();
                    }
                    if (queue.length === 0) {
                        queue = [];
                        queueNames = [];
                        if (backQueue.length === currentBackQueue) {
                            currentBackQueue = 0;
                        }
                        youtube.search_video(backQueue[currentBackQueue] + " official", function(id) {
                            playMusic(id, message, true);
                        });
                    } else {
                        playMusic(queue[0], message, false);
                    }
                });
            });
    } else {
        message.reply("Please be in a voiceChannel or have the bot already in a voiceChannel");
    }
}
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    while (1 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
function add_to_queue(strID) {
    if (youtube.isYoutube(strID)) {
        queue.push(getYouTubeID(strID));
    } else {
        queue.push(strID);
    }
}
client.on('guildMemberAdd', member => {//welcome message
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
            value: "`ping` `help` `info` `commands` `def` `def add`"
          },
          {
            name: "music",
            value: "`play` `skip` `pause` `resume` `list=` `join` `queue` `song`"
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
          status = status + ' ' + args[i]
        }
        if(message.member.roles.has(bot_controller) || message.member.roles.has(bot_controller2)) client.user.setStatus('online', status), message.channel.send('setting status to' + status)
        else message.channel.send(notadmin)
        break;
      case "purge":
        if(message.member.roles.has(bot_controller) || message.member.roles.has(bot_controller2)){
          let messagecount = parseInt(args[1]);
          message.channel.fetchMessages({limit: messagecount}).then(messages => message.channel.bulkDelete(messages));
        }
        else message.channel.send(notadmin)
        break;
      case "leaveserver":
        if(message.member.roles.has(bot_controller) ||  message.member.roles.has(bot_controller)) message.guild.leave()
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
              fs.writeFileSync(`./def/def${serverID}.json`, JSON.stringify({}));
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
        break;
      case "skip":
        break;
      case "fskip":
        break;
      case "join":
        break;
      case "song":
        break;
      case "list=":
        break;
      case "queue":
        break;
      case "pause":
        break;
      case "resume":
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

client.on('message', function(message) {
    const member = message.member;
    const mess = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1).join(" ");
    if (mess.indexOf("discord.gg") > -1) {
        message.reply("You are not allowed to post other discords here!");
        message.delete();
        return;

    }else if (mess.startsWith(prefix + 'skip')) {
        if (skippers.indexOf(message.author.id) == -1) {
            skippers.push(message.author.id);
            skipReq++;
            if (skipReq >= Math.ceil((voiceChannel.members.size - 1) / 2)) {
                skip_song();
                message.reply("your skip has been acknowledged. Skipping now!");
            } else {
                message.reply("your skip has been acknowledged. You need **" + ((Math.ceil((voiceChannel.members.size - 1) / 2)) - skipReq) + "** more skips requests.");
            }
        } else {
            message.reply("you already voted!");
        }
    } else if (mess.startsWith(prefix + 'fskip') && (member.roles.has(bot_controller) || message.member.roles.has(bot_controller))) {
        try {
            skip_song();
        } catch (err) {
            console.log(err);
        }
    }
    else if (mess.startsWith(prefix + 'play') && message.channel.id === "331140285646241792") {
        if (member.voiceChannel || voiceChannel != null) {
            if (queue.length > 0 || isPlaying) {
                if (args.toLowerCase().indexOf("list=") === -1) {
                    youtube.getID(args, function(id) {
                        add_to_queue(id);
                        fetchVideoInfo(id, function(err, videoInfo) {
                            if (err) throw new Error(err);
                            message.reply(" added to queue: **" + videoInfo.title + "**")
                            queueNames.push(videoInfo.title);
                        });
                    });
                } else {
                    youtube.getPlayListSongs(args.match(/list=(.*)/)[args.match(/list=(.*)/).length - 1], 50, function(arr) {
                        arr.forEach(function(e) {
                            add_to_queue(e.snippet.resourceId.videoId);
                            queueName.push(e.snippet.title);
                        });
                        youtube.getPlayListMetaData(args.match(/list=(.*)/)[args.match(/list=(.*)/).length - 1], 50, function(data) {
                            message.reply(" added to queue, playlist: **" + data.snippet.title + "**");
                        });
                    });
                }
            } else {
                isPlaying = true;
                if (args.toLowerCase().indexOf("list=") === -1) {
                    youtube.getID(args, function(id) {
                        queue.push(id);
                        playMusic(id, message, false);
                        fetchVideoInfo(id, function(err, videoInfo) {
                            if (err) throw new Error(err);
                            queueNames.push(videoInfo.title);
                            message.reply(" now playing: **" + videoInfo.title + "**")
                        });
                    });
                } else {
                    youtube.getPlayListSongs(args.match(/list=(.*)/)[args.match(/list=(.*)/).length - 1], 50, function(arr) {
                        arr.forEach(function(e) {
                            add_to_queue(e.snippet.resourceId.videoId);
                            queueNames.push(e.snippet.title);
                        });
                        playMusic(queue[0], message, false);
                        youtube.getPlayListMetaData(args.match(/list=(.*)/)[args.match(/list=(.*)/).length - 1], 50, function(data) {
                            message.reply(" now playing playlist: **" + data.snippet.title + "**");
                        });
                    });
                }
            }
        } else {
            message.reply('join a voice channel first');
        }
    } else if (mess.startsWith(prefix + 'pause') && (member.roles.has(bot_controller) || message.member.roles.has(bot_controller))) {
        try {
            dispatcher.pause();
            message.reply("pausing!");
        } catch (error) {
            message.reply("no song playing");
        }
    } else if (mess.startsWith(prefix + 'resume') && (member.roles.has(bot_controller) || message.member.roles.has(bot_controller))) {
        try {
            dispatcher.resume();
            message.reply("resuming!");
        } catch (error) {
            message.reply("no song playing");
        }
    } else if (/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig.exec(mess) != null && message.channel.id !== "335499850525179904") {
        client.channels.get('335499850525179904').send(message.author + " said in an **incorrect** chat: \n\n\n" + message.content + "\n please use #link-spam");
        message.delete();
    } else if (mess.startsWith(prefix + "join")) {
        if (member.voiceChannel) {
            youtube.search_video(backQueue[currentBackQueue] + " official", function(id) {
                playMusic(id, message, true);
                isPlaying = true;
                message.reply(" joining voice chat -- " + message.member.voiceChannel.name + " -- and starting radio!");
            });
        } else {
            message.reply(" you need to be in a chat!");
        }
    } else if (mess.startsWith(prefix + "queue")) {
        var ret = "\n\n`";
        for (var i = 0; i < queueNames.length; i++) {
            ret += (i + 1) + ": " + queueNames[i] + (i === 0 ? " **(Current)**" : "") + "\n";
        }
        ret += "`"
        message.reply(ret);
    } else if (mess.startsWith(prefix + "song")) {
        message.reply(" the current song is: *" + (queueNames[0] || backQueue[currentBackQueue]) + "*")
    }
});

client.login(token);
