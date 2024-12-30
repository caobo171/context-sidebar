import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    permissions: [
      "activeTab",
      "sidePanel",
	  "contextMenus",
      "storage",
      "tabs",
      "declarativeNetRequest"
    ],
    action: {},
    name: "__MSG_extName__",
    description: "__MSG_extDescription__",
    default_locale: "en",
    web_accessible_resources: [
      {
        resources: ["injected.js"],
        matches: ["*://*/*"],
      },
    ],
  },
  vite: () => ({
    plugins: [react()],
  }),
});
