import { browser } from "wxt/browser";
import ExtMessage, { MessageFrom, MessageType } from "@/entrypoints/types.ts";

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id }); // background.js

  // @ts-ignore
  browser.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error: any) => console.error(error));

  //monitor the event from extension icon click
  browser.action.onClicked.addListener((tab) => {
    // 发送消息给content-script.js
    browser.tabs.sendMessage(tab.id!, {
      messageType: MessageType.clickExtIcon,
    });
  });

  browser.runtime.onInstalled.addListener(async () => {
    browser.contextMenus.create({
      id: "openSidePanel",
      title: "Open this page in side panel",
      contexts: ["all"],
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openSidePanel") {
      browser.sidePanel.open(
        {
          windowId: tab.windowId,
        },
        () => {
          setTimeout(() => {
            console.log("OpenWebsite");
            chrome.runtime.sendMessage({
              messageType: MessageType.OpenWebsite,
              url: tab.url,
            });
          }, 1000);
        }
      );
    }
  });

  // // background.js
  chrome.runtime.onMessage.addListener(
    async (
      message: ExtMessage,
      sender,
      sendResponse: (message: any) => void
    ) => {
      console.log("background:");
      console.log(message, sender);

      if (message.messageType === MessageType.sidePanelOpen) {
        sendResponse(!sender.documentId);
      } else if (message.messageType === MessageType.clickExtIcon) {
        console.log(message);
        return true;
      } else if (
        message.messageType === MessageType.changeTheme ||
        message.messageType === MessageType.changeLocale ||
        message.messageType === MessageType.GoToWebsite
      ) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          console.log("tabs", tabs);
          const activeTabId = tabs[0].id;
          chrome.tabs.sendMessage(activeTabId, {
            ...message,
            tabId: activeTabId,
          });
        });
      }
    }
  );

 
  browser.runtime.onConnect.addListener(function(port){

	if (port.name == 'side_panel'){
		port.onDisconnect.addListener(() => {
			browser.declarativeNetRequest.updateSessionRules({
				removeRuleIds: [1]
			});
		})
	}
  })
});
