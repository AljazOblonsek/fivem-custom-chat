interface ChatMessageEvent {
    type: 'ADD_MESSAGE';
    text: string | null;
}

class Chat {
    private readonly ChatElement: HTMLDivElement | null;
    private readonly ContainerElement: HTMLUListElement | null;
    private InputElement: HTMLInputElement | null;
    private Size: number;
    private Enabled: boolean;
    private MessageHistory: string[];
    private readonly MessageHistoryLimit: number;
    private CurrentHistoryIndex: number;

    constructor(messageHistoryLimit: number) {
        this.ChatElement = <HTMLDivElement>document.getElementById('chat');
        this.ContainerElement = <HTMLUListElement>document.getElementById('chatMessages');
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

    private initializeNUIListener = (): void => {
        window.addEventListener('message', (e: MessageEvent<ChatMessageEvent>) => {

            if (e.data.type === 'ADD_MESSAGE') {
                if (e.data.text === null)
                    return;

                this.addMessage(e.data.text);
                return;
            }

            if (e.data.type === 'CLEAR_CHAT') {
                this.clear();
                return;
            }
        });
    }

    private setChatInitialized = (): void => {
        // @ts-ignore
        fetch(`https://${GetParentResourceName()}/Client:Chat:NUILoaded`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({})
        });
    }

    private initializeKeyUp = (): void => {
        document.addEventListener('keyup', e => {
            switch (e.key) {
                case 't':
                    this.createInput();
                    this.CurrentHistoryIndex = 0;
                    e.preventDefault();
                    return;
                case 'ArrowUp':
                    this.handleMessageHistorySelection('ArrowUp');
                    return;
                case 'ArrowDown':
                    this.handleMessageHistorySelection('ArrowDown');
                    return;
                case 'Enter':
                    this.sendMessage();
                    return;
                default:
                    return;
            }
        });
    }

    private createInput = (): void => {
        if (this.InputElement !== null)
            return;

        if (this.ChatElement === null)
            return;

        this.InputElement = document.createElement('input') as HTMLInputElement;
        this.InputElement.id = 'chatInput';
        this.InputElement.type = 'text';

        this.ChatElement.append(this.InputElement);
        this.InputElement.focus();
    }

    private removeInput = (): void => {
        this.InputElement.remove();
        this.InputElement = null;
    }

    private handleMessageHistorySelection = (key: 'ArrowUp' | 'ArrowDown'): void => {
        if (!this.InputElement)
            return;

        if (!this.MessageHistory)
            return;

        if (this.MessageHistory.length === 0)
            return;

        if (key === 'ArrowUp') {
            if (this.MessageHistory.length === this.CurrentHistoryIndex)
                return;

            this.InputElement.value = this.MessageHistory[this.CurrentHistoryIndex];

            setTimeout(() => {
                this.InputElement.setSelectionRange(this.MessageHistory[this.CurrentHistoryIndex].length, this.MessageHistory[this.CurrentHistoryIndex].length);
                this.CurrentHistoryIndex = this.CurrentHistoryIndex + 1;
            }, 1);

        } else {
            this.CurrentHistoryIndex = this.CurrentHistoryIndex - 1;

            if (this.CurrentHistoryIndex < 0) {
                this.InputElement.value = '';
                this.CurrentHistoryIndex = this.CurrentHistoryIndex + 1;
                return;
            }

            this.InputElement.value = this.MessageHistory[this.CurrentHistoryIndex];

            setTimeout(() => {
                this.InputElement.setSelectionRange(this.MessageHistory[this.CurrentHistoryIndex].length, this.MessageHistory[this.CurrentHistoryIndex].length);
            }, 1);
        }
    }

    private sendMessage = (): void => {
        if (this.InputElement === null)
            return;

        let value = this.InputElement.value;

        if (value.length < 0)
            return;

        // Escapes !{#000000} color strings
        value = value.replace(new RegExp('!{#.*?}', 'gm'), '');

        this.MessageHistory.unshift(value);

        // @ts-ignore
        fetch(`https://${GetParentResourceName()}/Client:Chat:MessageFromNUI`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({
                text: value
            })
        });

        this.removeInput();
        return;
    }

    private addMessage = (text: string): void => {
        let chatElement = '<li>';

        const colorPositions: number[] = [];
        const colors: string[] = [];

        for (let i = 0; i < text.length; i++) {
            const colorCheck = `${text[i]}${text[i + 1]}${text[i + 2]}`;

            if (colorCheck !== '!{#')
                continue;

            colorPositions.push(i);
        }

        colorPositions.forEach(colorPositionItem => {
            const subString = text.slice(colorPositionItem, -1);
            colors.push(subString.slice(3, 9));
        });

        colorPositions.forEach((colorPositionItem, colorPositionIndex) => {
            const subString = text.slice(colorPositions[colorPositionIndex] + 10, colorPositions[colorPositionIndex + 1]);
            chatElement += `<span style='color: ${colors[colorPositionIndex]}'>${subString}</span>`;
        });

        chatElement += '</li>';

        if (this.ContainerElement === null)
            return;

        if (chatElement === '<li></li>') {
            const textElement = document.createElement('li') as HTMLLIElement;
            textElement.innerHTML = text;

            this.ContainerElement.prepend(textElement);
        }
        else {
            const textElement = document.createElement('li') as HTMLLIElement;

            // Add text before color spans
            const spanElement = document.createElement('span') as HTMLSpanElement;
            spanElement.innerHTML = text.slice(0, colorPositions[0]);
            textElement.appendChild(spanElement);

            // Add color spans
            for (let i = 0; i < colorPositions.length; i++) {
                const subString = text.slice(colorPositions[i] + 10, colorPositions[i + 1]);
                const spanElement = document.createElement('span') as HTMLSpanElement;
                spanElement.style.color = colors[i];
                spanElement.innerHTML = subString;
                textElement.appendChild(spanElement);
            }

            this.ContainerElement.prepend(textElement);
        }

        this.Size = this.Size + 1;

        if (this.Size >= this.MessageHistoryLimit)
            this.ContainerElement.removeChild(this.ContainerElement.lastChild);
    }

    private clear = (): void => {
        if (this.ContainerElement === null)
            return;

        this.ContainerElement.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Chat(50);
});