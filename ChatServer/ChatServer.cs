using ChatShared;
using CitizenFX.Core;
using CitizenFX.Core.Native;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer
{
    public class ChatServer : BaseScript
    {
        public ChatServer()
        {
            // FiveM events
            EventHandlers.Add("onServerResourceStart", new Action<string>(OnServerResourceStart));

            // Custom events
            EventHandlers.Add(ChatEvents.SERVER_CHAT_ADD_MESSAGE, new Action<Player, string>(OnServerChatAddMessage));
        }

        // FiveM events
        private void OnServerResourceStart(string resourceName)
        {
            if (API.GetCurrentResourceName() != resourceName)
                return;

            API.RegisterCommand("clear", new Action<int, List<object>, string>(ClearCommand), false);
        }

        // Custom events
        private void OnServerChatAddMessage([FromSource] Player player, string text)
        {
            TriggerClientEvent(ChatEvents.CLIENT_CHAT_ADD_MESSAGE, $"{player.Name}: {text}");
        }

        // Commands
        private void ClearCommand(int source, List<object> args, string raw)
        {
            var player = new PlayerList()[source];

            if (player.Ping == 0)
                return;

            player.TriggerEvent(ChatEvents.CLIENT_CHAT_CLEAR);
        }
    }
}
