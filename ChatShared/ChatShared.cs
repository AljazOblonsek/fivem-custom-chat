using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatShared
{
    public static class ChatEvents
    {
        // Server
        public const string SERVER_CHAT_ADD_MESSAGE = "Server:Chat:AddMessage";

        // Client
        public const string CLIENT_CHAT_ADD_MESSAGE = "Client:Chat:AddMessage";
        public const string CLIENT_CHAT_NUI_LOADED = "Client:Chat:NUILoaded";
        public const string CLIENT_CHAT_ADD_MESSAGE_FROM_NUI = "Client:Chat:MessageFromNUI";
        public const string CLIENT_CHAT_CLEAR = "Client:Chat:Clear";
    }
}
