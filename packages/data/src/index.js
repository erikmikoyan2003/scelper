const mongoose = require("mongoose");

class Data {
  constructor() {
    mongoose.connect("mongodb://localhost:27017/scelper", {
      useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true
    });

    this.chat = mongoose.model(
      "chat",
      new mongoose.Schema({
        id: Number,
        name: String,

        admins: [Number],
        members: [Number],

        settings: [mongoose.Schema.Types.Mixed],
      })
    );

    this.user = mongoose.model(
      "user",
      new mongoose.Schema({
        _id: Number,
        chats: [new mongoose.Schema({
          date: Number,
          authorID: Number,
          subtitle: String,
          attachments: [String],
          text: String
        })],
      })
    );

    this.note = mongoose.model(
      "note",
      new mongoose.Schema({
        chatId: Number, // Идентификатор беседы
        title: String, // Заголовок заметки
        date: Number,

        items: [mongoose.Schema.Types.Mixed], // Содержимое ДЗ
      })
    );

    this.counter = mongoose.model(
      "counter",
      new mongoose.Schema({
        title: String,
        chats: [Number],
      })
    );
  }
}
module.exports = new Data();
