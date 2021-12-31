var Chat = /** @class */ (function () {
    function Chat(messageHistoryLimit) {
        var _this = this;
        this.initializeNUIListener = function () {
            window.addEventListener('message', function (e) {
                if (e.data.type === 'ADD_MESSAGE') {
                    if (e.data.text === null)
                        return;
                    _this.addMessage(e.data.text);
                    return;
                }
                if (e.data.type === 'CLEAR_CHAT') {
                    _this.clear();
                    return;
                }
            });
        };
        this.setChatInitialized = function () {
            // @ts-ignore
            fetch("https://" + GetParentResourceName() + "/Client:Chat:NUILoaded", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify({})
            });
        };
        this.initializeKeyUp = function () {
            document.addEventListener('keyup', function (e) {
                switch (e.key) {
                    case 't':
                        _this.createInput();
                        _this.CurrentHistoryIndex = 0;
                        e.preventDefault();
                        return;
                    case 'ArrowUp':
                        _this.handleMessageHistorySelection('ArrowUp');
                        return;
                    case 'ArrowDown':
                        _this.handleMessageHistorySelection('ArrowDown');
                        return;
                    case 'Enter':
                        _this.sendMessage();
                        return;
                    default:
                        return;
                }
            });
        };
        this.createInput = function () {
            if (_this.InputElement !== null)
                return;
            if (_this.ChatElement === null)
                return;
            _this.InputElement = document.createElement('input');
            _this.InputElement.id = 'chatInput';
            _this.InputElement.type = 'text';
            _this.ChatElement.append(_this.InputElement);
            _this.InputElement.focus();
        };
        this.removeInput = function () {
            _this.InputElement.remove();
            _this.InputElement = null;
        };
        this.handleMessageHistorySelection = function (key) {
            if (!_this.InputElement)
                return;
            if (!_this.MessageHistory)
                return;
            if (_this.MessageHistory.length === 0)
                return;
            if (key === 'ArrowUp') {
                if (_this.MessageHistory.length === _this.CurrentHistoryIndex)
                    return;
                _this.InputElement.value = _this.MessageHistory[_this.CurrentHistoryIndex];
                setTimeout(function () {
                    _this.InputElement.setSelectionRange(_this.MessageHistory[_this.CurrentHistoryIndex].length, _this.MessageHistory[_this.CurrentHistoryIndex].length);
                    _this.CurrentHistoryIndex = _this.CurrentHistoryIndex + 1;
                }, 1);
            }
            else {
                _this.CurrentHistoryIndex = _this.CurrentHistoryIndex - 1;
                if (_this.CurrentHistoryIndex < 0) {
                    _this.InputElement.value = '';
                    _this.CurrentHistoryIndex = _this.CurrentHistoryIndex + 1;
                    return;
                }
                _this.InputElement.value = _this.MessageHistory[_this.CurrentHistoryIndex];
                setTimeout(function () {
                    _this.InputElement.setSelectionRange(_this.MessageHistory[_this.CurrentHistoryIndex].length, _this.MessageHistory[_this.CurrentHistoryIndex].length);
                }, 1);
            }
        };
        this.sendMessage = function () {
            if (_this.InputElement === null)
                return;
            var value = _this.InputElement.value;
            if (value.length < 0)
                return;
            // Escapes !{#000000} color strings
            value = value.replace(new RegExp('!{#.*?}', 'gm'), '');
            _this.MessageHistory.unshift(value);
            // @ts-ignore
            fetch("https://" + GetParentResourceName() + "/Client:Chat:MessageFromNUI", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                body: JSON.stringify({
                    text: value
                })
            });
            _this.removeInput();
            return;
        };
        this.addMessage = function (text) {
            var chatElement = '<li>';
            var colorPositions = [];
            var colors = [];
            for (var i = 0; i < text.length; i++) {
                var colorCheck = "" + text[i] + text[i + 1] + text[i + 2];
                if (colorCheck !== '!{#')
                    continue;
                colorPositions.push(i);
            }
            colorPositions.forEach(function (colorPositionItem) {
                var subString = text.slice(colorPositionItem, -1);
                colors.push(subString.slice(3, 9));
            });
            colorPositions.forEach(function (colorPositionItem, colorPositionIndex) {
                var subString = text.slice(colorPositions[colorPositionIndex] + 10, colorPositions[colorPositionIndex + 1]);
                chatElement += "<span style='color: " + colors[colorPositionIndex] + "'>" + subString + "</span>";
            });
            chatElement += '</li>';
            if (_this.ContainerElement === null)
                return;
            if (chatElement === '<li></li>') {
                var textElement = document.createElement('li');
                textElement.innerHTML = text;
                _this.ContainerElement.prepend(textElement);
            }
            else {
                var textElement = document.createElement('li');
                // Add text before color spans
                var spanElement = document.createElement('span');
                spanElement.innerHTML = text.slice(0, colorPositions[0]);
                textElement.appendChild(spanElement);
                // Add color spans
                for (var i = 0; i < colorPositions.length; i++) {
                    var subString = text.slice(colorPositions[i] + 10, colorPositions[i + 1]);
                    var spanElement_1 = document.createElement('span');
                    spanElement_1.style.color = colors[i];
                    spanElement_1.innerHTML = subString;
                    textElement.appendChild(spanElement_1);
                }
                _this.ContainerElement.prepend(textElement);
            }
            _this.Size = _this.Size + 1;
            if (_this.Size >= _this.MessageHistoryLimit)
                _this.ContainerElement.removeChild(_this.ContainerElement.lastChild);
        };
        this.clear = function () {
            if (_this.ContainerElement === null)
                return;
            _this.ContainerElement.innerHTML = '';
        };
        this.ChatElement = document.getElementById('chat');
        this.ContainerElement = document.getElementById('chatMessages');
        this.InputElement = null;
        this.MessageHistory = [];
        this.MessageHistoryLimit = messageHistoryLimit;
        this.CurrentHistoryIndex = 0;
        this.ContainerElement.style.display = 'block';
        this.initializeKeyUp();
        this.initializeNUIListener();
        this.setChatInitialized();
        this.addMessage('Chat started.');
    }
    return Chat;
}());
document.addEventListener('DOMContentLoaded', function () {
    new Chat(50);
});
