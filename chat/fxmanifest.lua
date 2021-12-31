version '1.0.0'
author 'AljazOblonsek'
description 'Provides inspired by samp-like chat functionality.'
-- repository 'https://github.com/AljazOblonsek/fivem-custom-chat'

ui_page 'dist/index.html'

client_scripts {
  'ChatClient.net.dll',
  'ChatShared.net.dll'
}
  
server_scripts {
  'ChatServer.net.dll',
  'ChatShared.net.dll'
}

files {
  'dist/index.html',
  'dist/style.css',
  'dist/app.js'
}

fx_version 'adamant'
games { 'gta5' }