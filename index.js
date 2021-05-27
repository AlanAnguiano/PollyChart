require('dotenv').config();

const txtBotIdentifier = "!";
// Time default 10 mins to close the poll, in mil secs is 600,000
const timeoutClosePoll = 600000;
const commandWords = ['poll', 'graph'];
const numEmojis = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
const topMedals = ["first_place", "second_place", "third_place"];
const blockedSignal = ':no_entry_sign:';
var selectedCommandWord = '';
var emojiOptionTxtObj = {}
const Discord = require('discord.js');

const bot = new Discord.Client();

const hasCommandWord = (word) => {
  const [_,possibleKeyWord] = word.split(txtBotIdentifier);
  if (commandWords.indexOf(possibleKeyWord) !== -1) {
    selectedCommandWord = possibleKeyWord;
    return true;
  }

  return false;
}

const itNeedResponse = (msg) => {
  const [firstWord] = msg.content.split(' ');
  return firstWord.charAt(0) === txtBotIdentifier && hasCommandWord(firstWord);
}

const createPoll = (msg) => {
  const words = msg.content.split('\"');
  const cleanedWords = words.filter(word => word.trim().length > 0);
  let pollTitle = cleanedWords[1];

  // sanitize the options in order to remove any whitespace
  // TODO:
  // IT REMOVES LITERALLY EVERY WHITESPACE XD EVEN IN AN OPTION ****BUGGG***
  const pollOptions = cleanedWords[2].replace(/ /g,'').split(',');
  if(validatesLongOfOptions(pollOptions, msg)){
    var pollTxt = createTextPoll(pollTitle, pollOptions);
    msg.channel.send(pollTxt)
      .then((msgSent) => {
        addOptionsReactToPoll(msgSent, pollOptions.length)
        //countVotes(msgSent)
        timeoutForPoll(pollTxt, msgSent);
      });
  }
}

const validatesLongOfOptions = (options, msg) => {
  if (options.length > 10) {
    msg.channel.send(`${blockedSignal} The maximum number of options is 10 ${blockedSignal}`)
    return false;
  }
  return true;
}

const timeoutForPoll = (pollTxt, msg) => {
  setTimeout(() => {
    //get the Top three of the options, when the options got more than 1 vote
    let topresults = chooseTopThreeResult(msg);
    //console.log(topresults)
    removeAllReactions(msg);
    displayTopResults(pollTxt, topresults, msg);
  }, timeoutClosePoll);
}

const createTextPoll = (pollTitle, pollOptions) => {
  let pollTxt = `**${pollTitle}**\n\n`;
  
  pollOptions.forEach((element, index) => {
    emojiOptionTxtObj[`${numEmojis[index]}`] = element
    pollTxt += `${numEmojis[index]}  ${element}\n`;
  });

  return pollTxt;
}

const addOptionsReactToPoll = (msg, optionsSize) => {
  for (let i = 0; i < optionsSize; i++) {
    msg.react(numEmojis[i]);
  }
}

const displayTopResults = (pollTxt, results, msg) => {
  console.log(results)
  if (results.length === 0) {
    msg.edit(`${pollTxt}\n**Nobody voted for any option :frowning2:**\n\n`)
    return;
  }

  let titleWord = results.length > 1 ? "Top Results" : "Winner"
  let topOptionsVoted = ''
  results.forEach((element, index) => {
    topOptionsVoted += `:${topMedals[index]}: ${emojiOptionTxtObj[element[0]]}\n`;
  });

  msg.edit(`${pollTxt}\n**${titleWord}**\n\n${topOptionsVoted}\n`)
}

const countReactionsVotes = (reactions) => {
  var reactionsObj = {}
  reactions.forEach(reaction => {
    let key = reaction.emoji.name;
    let value = reaction.count
    reactionsObj[`${key}`] = value
  });

  return reactionsObj
}

const chooseTopThreeResult = (msg) => {
  var countedReactions = countReactionsVotes(msg.reactions.cache)
  var sortedResults = sortResults(countedReactions)
  return sortedResults.slice(0,3)
}

const sortResults = (countedReactions) => {
  var sortable = [];
  const predicate = (x) => x > 1;

  for (var emoji in countedReactions) {
    sortable.push([emoji, countedReactions[emoji]]);
  }

  sortable.sort(function(a, b) {
    return b[1] - a[1];
  });

  sortable = sortable.filter((element) => predicate(element[1]));
  return sortable;
}

const removeAllReactions = (msg) => {
  msg.reactions.removeAll();
}
// TODO
// AN IDEA IS ADD A DRAW CASE

//TODO the poll does not support more than 10 options
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