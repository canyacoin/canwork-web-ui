'use strict';

$(function () {

    const botui = new BotUI('bot');
    console.log('BotUI', botui);

    botui.message.bot({
      delay: 1000,
      content: 'Hi, I\'m CanYa! Welcome to the world’s best blockchain-powered marketplace of services.',
      loading: true,
    }).then( () => {
      return botui.message.bot({
        delay: 1000,
        loading: true,
        content: 'Let me help you create your profile.',
      });
    }).then( () => {
      return botui.action.button({
        delay: 600,
        action: [
          {
            text: 'Good',
            value: 'good'
          },
          {
            text: 'Really Good',
            value: 'really_good'
          },
          {
            text: 'Really, really Good',
            value: 'awfully_good'
          }
        ]
      });
    }).then( (res) => {
      return botui.message.bot({
        delay: 400,
        loading: true,
        content: 'You are feeling ' + res.text.toLowerCase() + '!'
      });
    }).then( () => {
      botui.message
        .bot({
          delay: 700,
          loading: true,
          content: 'By the way, what\'s your name ?'
        })
        .then(function () {
          return botui.action.text({
            delay: 400,
            action: {
              size: 18,
              icon: 'user-circle-o',
              sub_type: 'text',
              placeholder: 'John?'
            }
          });
        }).then((res) => {
          const name = res.value;
          return botui.message
            .bot({
              delay: 300,
              loading: true,
              content: 'Nice to meet you ' + name + '! ![hello image](https://media.giphy.com/media/DwXOS8RqHocEM/giphy.gif)'
            });
        });
    });

});