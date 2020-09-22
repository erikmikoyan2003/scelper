// TODO вопросы при заполнении данных на русском
// TODO красиво оформить ввод данных
// TODO старые варианты, если новые данные не введены
const fs = require("fs");
const readline = require("readline-sync");

var data;
try {
  const config = require("../packages/bot/config.json");
  data = {
    name: readline.question(`Bot name: (${config.name}) `) || config.name,
    id: readline.question(`Bot id: (${config.id}) `) || config.id,
    botToken:
      readline.question(`Bot token: (${config.botToken}) `) || config.botToken,
    botSecret:
      readline.question(`Bot secret: (${config.botSecret}) `) ||
      config.botSecret,
    botConfirmation:
      readline.question(`Bot confirmation: (${config.botConfirmation}) `) ||
      config.botConfirmation,

    loggerToken:
      readline.question(`Logger token: (${config.loggerToken}) `) ||
      config.loggerToken,
    adminID:
      readline.question(`Your(admin) id: (${config.adminID}) `) ||
      config.adminID,
  };
} catch (err) {
  data = {
    name: readline.question("Bot name: "),
    id: readline.question("Bot id: "),
    botToken: readline.question("Bot token: "),
    botSecret: readline.question("Bot secret: "),
    botConfirmation: readline.question("Bot confirmation: "),

    loggerToken: readline.question("Logger token: "),
    adminID: readline.question("Your(admin) id: "),
  };
}

fs.writeFile(__dirname + "./../packages/bot/config.json", JSON.stringify(data), (error) => {
  if (error) {
    return console.log(error);
  }

  console.log("Файл сохранен");
});