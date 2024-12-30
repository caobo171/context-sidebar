export enum MessageType {
    clickExtIcon = "clickExtIcon",
    changeTheme = "changeTheme",
    changeLocale = "changeLocale",
	sidePanelOpen = "sidePanelOpen",
	navigate = "navigate",
	injectCSS = "injectCSS",
	injectJS = "injectJS",
	OpenWebsite = "OpenWebsite",
	GoToWebsite = "GoToWebsite",
}

export enum MessageFrom {
    contentScript = "contentScript",
    background = "background",
    popUp = "popUp",
    sidePanel = "sidePanel",
}

class ExtMessage {
    content?: string;
    from?: MessageFrom;

    constructor(messageType: MessageType) {
        this.messageType = messageType;
    }

    messageType: MessageType;
}

export default ExtMessage;
