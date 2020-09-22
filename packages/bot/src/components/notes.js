// TODO поддержка subtitle
// TODO получение дз из ЛС
// TODO ограничение длины заметки
// TODO исправить перезапись заметок
// TODO структурировать config
// TODO сортировка при выводе дз
const data = require("@scelper/data");

module.exports = (bot) => {
  // Записывает в указанную ячейку заметку
  bot.command(`/записать`, { chatOnly: true }, async (ctx) => {
    let title = ctx.message.text.match(/\/записать ([a-zа-я]+)/i);

    // Обработка ошибок
    switch (true) {
      // Отсутствие названия заметки
      case !title:
        return bot.api.messages.send({
          random_id: 0,
          message: `⛔Вы не указали название заметки. Попробуйте «/записать дз»`,
          peer_id: ctx.message.peer_id,
        });
      // Отсутствие пересланных сообщений
      case ctx.message.fwd_messages.length === 0 && !ctx.message.reply_message:
        return bot.api.messages.send({
          random_id: 0,
          message: `⛔Вы не переслали сообщение. Попробуйте отправить сообщение с заметкой, а потом перешлите с текстом «/записать (название заметки)».`,
          peer_id: ctx.message.peer_id,
        });
    }

    data.note.deleteMany(
      { title: title[1], chatId: ctx.message.peer_id },
      (err) => {
        if (err) return bot.error(err, ctx);

        new data.note({
          chatId: ctx.message.peer_id,
          title: title[1],
          date: new Date(),

          items: ctx.message.fwd_messages
            .concat(ctx.message.reply_message || [])
            .map((value) => {
              return {
                date: value.date,
                authorID: value.from_id,
                subtitle:
                  (value.text.match(/#([a-zа-я0-9]+)/i) &&
                    value.text.match(/#([a-zа-я0-9]+)/i)[1]) ||
                  "",
                attachments: value.attachments, //TODO
                text: value.text,
              };
            }),
        }).save((err) => {
          if (err) return bot.error(err, ctx);

          bot.api.messages.send({
            random_id: 0,
            message: `✅Заметка успешно записана`,
            peer_id: ctx.message.peer_id,
          });
        });
      }
    );
  });

  // Отправляет заметку по названию
  bot.command(`/узнать`, { chatOnly: true }, (ctx) => {
    let title = ctx.message.text.match(/\/узнать ([a-zа-я]+)/i);

    switch (true) {
      case !title:
        return bot.api.messages.send({
          random_id: 0,
          message: `⛔Вы не указали название заметки. Попробуйте «/узнать дз»`,
          peer_id: ctx.message.peer_id,
        });
    }

    data.note
      .find(
        {
          title: title[1],
          chatId: ctx.message.peer_id,
        },
        "-_id"
      )
      .sort({ date: 1 })
      .exec(async (err, docs) => {
        if (err) return bot.error(err, ctx);
        if (docs.length === 0) {
          return bot.api.messages.send({
            random_id: 0,
            message: `⛔Заметка с таким заголовком еще не записана. Если хотите получить список всех заметок беседы, воспользуйтесь командой «/всезаметки»`,
            peer_id: ctx.message.peer_id,
          });
        }

        let doc = docs[0];

        bot.api.messages.send({
          random_id: 0,
          message: await (async function () {

            let message = `Заметка <<${doc.title}>>`;

            for (i = 0, lastAuthorId = 0; i < doc.items.length; i++) {
              let value = doc.items[i];
              if (lastAuthorId == value.authorID) {
                message += `\n\n${value.text}`;
              } else {
                message += `\n\n@id${value.authorID}:\n${value.text}`;
                lastAuthorId = value.authorID;
              }
            }
            return (message += "\n\n");
          })(),
          peer_id: ctx.message.peer_id,
          disable_mentions: 1,
          payload: JSON.stringify({ type: "note", doc: doc }),
        });
      });
  });

  // Дополнение заметок
  bot.command(`/дополнить`, { chatOnly: true }, (ctx) => {
    let title = ctx.message.text.match(/\/дополнить ([a-zа-я]+)/i);

    switch (true) {
      // Отсутствие названия заметки
      case !title:
        return bot.api.messages.send({
          random_id: 0,
          message: `⛔Вы не указали название заметки. Попробуйте «/дополнить дз»`,
          peer_id: ctx.message.peer_id,
        });
      // Отсутствие пересланных сообщений
      case ctx.message.fwd_messages.length === 0 && !ctx.message.reply_message:
        return bot.api.messages.send({
          random_id: 0,
          message: `⛔Вы не переслали сообщение. Попробуйте отправить сообщение с заметкой, а потом перешлите с текстом «/дополнить (название заметки)».`,
          peer_id: ctx.message.peer_id,
        });
    }

    ctx.message.fwd_messages
      .concat(ctx.message.reply_message || [])
      .forEach((value) => {
        let subtitle =
          (value.text.match(/#([a-zа-я0-9]+)/i) &&
            value.text.match(/#([a-zа-я0-9]+)/i)[1]) ||
          "";

        if (subtitle) {
          data.note.findOneAndUpdate(
            {
              title: title,
              chatId: ctx.message.peer_id,
              "items.subtitle": subtitle,
            },
            {
              $set: {
                "items.$": {
                  date: value.date,
                  authorID: value.from_id,
                  subtitle: subtitle,
                  attachments: value.attachments, //TODO
                  text: value.text,
                },
              },
            },
            (err, doc) => {
              if (err) return bot.error(err, ctx);
              if (!doc) {
                data.note.findOneAndUpdate(
                  { title: title, chatId: ctx.message.peer_id },
                  {
                    $push: {
                      items: {
                        date: value.date,
                        authorID: value.from_id,
                        subtitle: subtitle,
                        attachments: value.attachments, //TODO
                        text: value.text,
                      },
                    },
                  },
                  (err) => {
                    if (err) return bot.error(err, ctx);
                  }
                );
              }
            }
          );
        } else {
          data.note.findOneAndUpdate(
            { title: title, chatId: ctx.message.peer_id },
            {
              $push: {
                items: {
                  date: value.date,
                  authorID: value.from_id,
                  subtitle: subtitle,
                  attachments: value.attachments, //TODO
                  text: value.text,
                },
              },
            },
            (err) => {
              if (err) return bot.error(err, ctx);
            }
          );
        }
      });

    bot.api.messages.send({
      random_id: 0,
      message: `ДЗ успешно дополнено.`,
      peer_id: ctx.message.peer_id,
    });
  });

  // Псевдоудаление заметок
  bot.command(`/удалить`, { chatOnly: true }, (ctx) => {
    let title = ctx.message.text.match(/\/удалить ([a-zа-я]+)/),
      isText = Boolean(title);

    if (!isText) {
      title =
        ctx.message.reply_message &&
        ctx.message.reply_message.from_id === -bot.info.id &&
        ctx.message.reply_message.payload &&
        JSON.parse(ctx.message.reply_message.payload).type === "note" &&
        JSON.parse(ctx.message.reply_message.payload).doc._id;
    }

    switch (true) {
      case !title:
        return bot.api.messages.send({
          random_id: 0,
          message: `⛔Вы не указали заметку для удаления. Попробуйте «/удалить дз», или перешлите сообщение с дз, отправленное ботом.`,
          peer_id: ctx.message.peer_id,
        });
    }

    data.note.deleteMany(isText ? { title: title } : { _id: title }, (err) => {
      if (err) return bot.error(err, ctx);

      bot.api.messages.send({
        random_id: 0,
        message: "✅Заметка удалена",
        peer_id: ctx.message.peer_id,
      });
    });
  });

  // Восстановление заметок
  bot.command(`/восстановить`, { chatOnly: true }, (ctx) => {
    doc =
      ctx.message.reply_message &&
      ctx.message.reply_message.from_id === -bot.info.id &&
      ctx.message.reply_message.payload &&
      JSON.parse(ctx.message.reply_message.payload).type === "note" &&
      JSON.parse(ctx.message.reply_message.payload).doc;

    switch (true) {
      case !doc:
        return bot.api.messages.send({
          random_id: 0,
          message: `⛔Вы не указали заметку для восстановления. Ответьте на сообщение с заметкой, чтобы восстановить.\n⚠ВАЖНО! На сообщение нужно именно ответить, а не переслать`,
          peer_id: ctx.message.peer_id,
        });
    }

    data.note.deleteMany({ title: doc.title, chatId: doc.chatId }, (err) => {
      if (err) return bot.error(err, ctx);
    });

    new data.note(doc).save((err) => {
      if (err) return bot.error(err, ctx);

      bot.api.messages.send({
        random_id: 0,
        message: `Заметка успешно восстановлена`,
        peer_id: ctx.message.peer_id,
      });
    });
  });

  // Вывод всех заметок +
  bot.command(`/всезаметки`, { chatOnly: true }, (ctx) => {
    data.note
      .find({
        chatId: ctx.message.peer_id,
        deleted: false,
      })
      .exec((err, docs) => {
        if (err) return bot.error(err, ctx);

        docs.length !== 0
          ? docs.forEach((value) => {
              ctx.message.text = `/узнать ${value.title}`;
              bot.trigger(`/узнать`, ctx);
            })
          : bot.api.messages.send({
              random_id: 0,
              message: `Заметок нет.`,
              peer_id: ctx.message.peer_id,
            });
      });
  });

  bot.command(`/дз`, { chatOnly: true }, (ctx) => {
    ctx.message.text = `/узнать дз`;
    bot.trigger(`/узнать`, ctx);
  });

  bot.command(`/расписание`, { chatOnly: true }, (ctx) => {
    ctx.message.text = `/узнать расписание`;
    bot.trigger(`/узнать`, ctx);
  });
};
