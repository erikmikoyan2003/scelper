// TODO обработка ошибок при отсутствии config.json
// TODO проверка отправки сообщений
// TODO интерфейс subcommand (для /дз и /расписание)
// TODO собственные команды
const { VK } = require("vk-io");

const config = require("../config.json");

class Bot {
  constructor() {
    this.info = {
      id: config.id,
    };
    this.api = new VK({
      token: config.botToken,
    }).api;
    this.logger = new VK({
      token: config.loggerToken
    })
    this.commands = {};
  }

  /**
   * @description Метод добавляет в функцию в список команд на 
   определенный триггер (заголовок)
   * @param {String} title REGEXP для вызова команды
   * @param {Object} properties Свойства команды вида: 
   {
     chatOnly: true,
     adminOnly: true,
     registratedOnly: true,
   }
   * @param {Function} func функция, которая исполняется при вызове команды
   */
  command(title, properties, func) {
    if (typeof this.commands[title] !== "object") {
      this.commands[title] = [];
    }

    this.commands[title].push({ func: func, properties: properties });
  }

  trigger(title, ctx) {
    Object.keys(this.commands).forEach((element) => {
      if (title.match(new RegExp(element, "i"))) {
        this.commands[element].forEach((command) => {
          // TODO проверка соответствия свойствам
          if (
            command.properties.chatOnly &&
            ctx.message.peer_id == ctx.message.from_id
          ) {
            return this.api.messages.send({
              peer_id: ctx.message.peer_id,
              random_id: 0,
              message: "⛔Команда доступна только в беседах",
            });
          }

          command.func(ctx);
        });
      }
    });
  }

  error(err, ctx) {
    this.api.messages.send({
      peer_id: ctx.message.peer_id,
      message: `⛔Неизвестная ошибка.`,
      random_id: 0
    });
    this.logger.messages.send({
      peer_id: config.adminID,
      message: `Error:\n${err}\n\nCtx:\nctx`,
      random_id: 0
    })
  }

  listen(req, res) {
    if (req.secret != config.botSecret) return res.send("not ok");

    switch (req.type) {
      case "confirmation":
        res.send(config.botConfirmation);
        break;

      case "message_new":
        // TODO добавить к коммандам свойства для того, чтобы
        // сократить кол-во кода и проверок
        this.trigger(req.object.message.text, req.object);
        res.send("ok");
        break;

      // TODO обработка остальных событий
    }
  }
}

module.exports = new Bot();
