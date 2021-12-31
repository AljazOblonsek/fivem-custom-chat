using ChatShared;
using CitizenFX.Core;
using CitizenFX.Core.Native;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatClient
{
    public class ChatClient : BaseScript
    {
        private bool _chatCEFLoaded;
        private bool _chatCEFActive;

        public ChatClient()
        {
            _chatCEFLoaded = false;
            _chatCEFActive = false;

            // NUI events
            API.RegisterNuiCallbackType(ChatEvents.CLIENT_CHAT_NUI_LOADED);
            API.RegisterNuiCallbackType(ChatEvents.CLIENT_CHAT_ADD_MESSAGE_FROM_NUI);

            EventHandlers.Add($"__cfx_nui:{ChatEvents.CLIENT_CHAT_NUI_LOADED}", new Action<IDictionary<string, object>, CallbackDelegate>(OnClientChatNUILoaded));
            EventHandlers.Add($"__cfx_nui:{ChatEvents.CLIENT_CHAT_ADD_MESSAGE_FROM_NUI}", new Action<IDictionary<string, object>, CallbackDelegate>(OnClientAddMessageFromNUI));

            // Custom events
            EventHandlers.Add(ChatEvents.CLIENT_CHAT_ADD_MESSAGE, new Action<string>(OnClientChatAddMessage));
            EventHandlers.Add(ChatEvents.CLIENT_CHAT_CLEAR, new Action(OnClientChatClear));

            // FiveM events
            EventHandlers.Add("onClientResourceStart", new Action<string>(OnClientResourceStart));

            Tick += ChatClient_Tick;
        }

        // NUI events
        private void OnClientChatNUILoaded(IDictionary<string, object> data, CallbackDelegate callback)
        {
            _chatCEFLoaded = true;
            callback(new ChatNUIResponse(true, "NUI is ready on ChatClient."));
        }

        private void OnClientAddMessageFromNUI(IDictionary<string, object> data, CallbackDelegate callback)
        {
            API.SetNuiFocus(false, false);
            _chatCEFActive = false;

            if (data.TryGetValue("text", out var textObj))
            {

            }

            string text = (textObj as string) ?? null;

            if (text == null)
            {
                callback(new ChatNUIResponse(false, "Text is null."));
                return;
            }

            if (text.Length == 0)
            {
                callback(new ChatNUIResponse(false, "Text length is 0."));
                return;
            }

            if (text.Substring(0, 1) == "/")
            {
                string commandText = text.Substring(1);

                if (commandText.Length <= 0)
                {
                    callback(new ChatNUIResponse(false, "Command length is less or equal to 0."));
                    return;
                }

                API.ExecuteCommand(commandText);
                callback(new ChatNUIResponse(true, "Successfully executed command."));
                return;
            }

            TriggerServerEvent(ChatEvents.SERVER_CHAT_ADD_MESSAGE, text);
            callback(new ChatNUIResponse(true, "Successfully sent text to server."));
        }

        // Custom events
        private void OnClientChatAddMessage(string text)
        {
            API.SendNuiMessage("{" +
                "\"type\": \"ADD_MESSAGE\"," +
                $"\"text\": \"{text}\"" +
                "}");
        }

        private void OnClientChatClear()
        {
            API.SendNuiMessage("{" +
                "\"type\": \"CLEAR_CHAT\"," +
                $"\"text\": \"...\"" +
                "}");
        }

        // FiveM events
        private void OnClientResourceStart(string resourceName)
        {
            if (API.GetCurrentResourceName() != resourceName)
                return;
        }

        private async Task ChatClient_Tick()
        {
            if (!_chatCEFLoaded)
                return;

            if (_chatCEFActive)
                return;

            if (!API.IsControlJustPressed(0, 309))
                return;

            API.SetNuiFocus(true, true);
            _chatCEFActive = true;
            await Delay(1000);
        }
    }
}
