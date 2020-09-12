// TODO вопросы при заполнении данных на русском
const fs = require("fs");
const readline = require('readline-sync');

function auth() {
  let data = {
    name: readline.question("name: "),
    id: readline.question("id: "),
    token: readline.question("token: "),
    secret: readline.question("secret: "),
    confirmation: readline.question("confirmation: ")
  };

  fs.writeFile(
    __dirname + "./../config.json",
    JSON.stringify(data),
    (error) => {
      if (error) {
        return console.log(err);
      }

      console.log("Файл сохранен");
    }
  );
}
auth()