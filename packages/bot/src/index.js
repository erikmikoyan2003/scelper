// TODO обработка ошибок при отсутствии config.json
const { VK } = require("vk-io");
const config = require("../config.json");

class Bot {
  constructor() {
    let vk = new VK({
      token: config.token,
    });
    this.api = vk.api;
  }

  async listen(req, res) {
    if (req.secret != config.secret) {
      return res.send("not ok");
    } 
    console.log(req)
    switch (req.type) {
      case "confirmation":
        res.send(config.confirmation);
        break;

      case "message_new": 
        this.api.messages.send({
          random_id: 0,
          peer_id: req.object.message.peer_id,
          message: req.object.message.text
        })
        break;

      default:
        break;
    }
  }
}
const bot = new Bot();

module.exports = bot;
