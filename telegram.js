// telegram.js
(function(){
  if (!window.Telegram || !window.Telegram.WebApp) {
    // Not inside Telegram — no-op but keep app usable
    console.info('Telegram WebApp not detected');
    return;
  }
  const web = window.Telegram.WebApp;
  web.ready();
  web.expand();
  // Optionally set main button
  if (web.MainButton) {
    web.MainButton.setText('Message');
    web.MainButton.show();
    web.MainButton.onClick(()=> {
      // Send a small payload to the bot (bot receives via getUpdates)
      try { web.sendData(JSON.stringify({action:'main_button_click'})); } catch(e){}
      window.open('https://t.me/Real1editorBot','_blank');
    });
  }
})();
