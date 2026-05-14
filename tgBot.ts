/* process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; */

import { Context, Markup, Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

bot.start(async (ctx: Context) => {
  const firstName = ctx.from?.first_name || 'друг';
    
  const welcomeMessage = `
<b>🌿 Добро пожаловать в HAVEN, ${firstName}!</b>

HAVEN — это твое личное убежище для самопомощи и контакта с собой.

<b>✨ Что тебя ждет:</b>
• 🧘‍♀️ Короткие 10-15 минутные практики
• 📊 Трекер настроения и эмоций
• 🎯 Постановка и достижение целей
• 📖 Личный дневник благодарностей

👇 <b>Нажми кнопку ниже, чтобы начать:</b>
  `;
  
  await ctx.replyWithHTML(welcomeMessage, 
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Открыть HAVEN', 'https://yourhaven.ru')]
    ])
  );
});

export const launchBot = async () => {
  try {
    await bot.launch();
    console.log('🤖 Бот успешно запущен!');

    const shutdown = (signal: string) => {
      console.log(`👋 Бот остановлен (${signal})`);
      bot.stop(signal);
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));

    return bot;
  } catch (error) {
    console.error('❌ Ошибка запуска бота:', error);
  }
};
