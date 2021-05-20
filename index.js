require('dotenv').config();

var txtBotIdentifier = "!";
var commandWords = ['poll', 'graph'];
const numEmojis = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟", "0️⃣"];
var selectedCommandWord = '';
const Discord = require('discord.js');

var bot = new Discord.Client();

var hasCommandWord = (word) => {
  let possibleKeyWord = word.split(txtBotIdentifier)[1];
  if (commandWords.indexOf(possibleKeyWord) !== -1) {
    selectedCommandWord = possibleKeyWord;
    return true;
  }

  return false;
}
var itNeedResponse = (msg) => {
  let firstWord = msg.content.split(' ')[0];
  return firstWord.charAt(0) === txtBotIdentifier && hasCommandWord(firstWord);
}

var createPoll = (msg) => {
  let words = msg.content.split('\"');
  let cleanedWords = words.filter(word => word.trim().length > 0);
  let pollTitle = cleanedWords[1];

  // sanitize the options in order to remove any whitespace
  let pollOptions = cleanedWords[2].replace(/ /g,'').split(',');

  let pollTxt = createTextPoll(pollTitle, pollOptions);
  msg.channel.send(pollTxt)
    .then((msgSent) => addOptionsReactToPoll(msgSent, pollOptions.length));
}

var createTextPoll = (pollTitle, pollOptions) => {
  let pollTxt = `**${pollTitle}**\n\n`;
  
  pollOptions.forEach((element, index) => {
    pollTxt += `${numEmojis[index]}  ${element}\n`;
  });

  return pollTxt;
}

var addOptionsReactToPoll = (msg, optionsSize) => {
  for (let i = 0; i < optionsSize; i++) {
    msg.react(numEmojis[i]);
  }
}

bot.on('message', function (msgObject) {
  if (itNeedResponse(msgObject)) {
    if (selectedCommandWord === commandWords[0]) {
      createPoll(msgObject);
    } else {
      renderGraph();
    }
  }
})

bot.login(process.env.BOT_TOKEN);