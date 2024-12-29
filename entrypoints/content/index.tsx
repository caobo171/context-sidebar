import './style.css';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import {i18nConfig} from "@/components/i18nConfig.ts";
import initTranslations from "@/components/i18n.ts";
import {ThemeProvider} from "@/components/theme-provider.tsx";
import { MessageType } from '../types.ts';

export default defineContentScript({
    matches: ['*://*/*'],
	allFrames: true,
    cssInjectionMode: 'ui',
	matchAboutBlank: true,
    async main(ctx) {

		/* global navigation */
		if(window.top !== window && window.parent === window.top){
			chrome.runtime.sendMessage({messageType: MessageType.sidePanelOpen}, (response) => {
				console.log('content response',response)
				

				if (response){

					const sendNavigateMessage = () => {
						chrome.runtime.sendMessage({messageType: MessageType.navigate, href: location.href});
					};

					addEventListener("hashchange", sendNavigateMessage);
					addEventListener("load", () => {
						const observeUrlChange = () => {
							let oldHref = document.location.href;
							const body = document.querySelector('body');
							const observer = new MutationObserver(mutations => {
							  if (oldHref !== document.location.href) {
								oldHref = document.location.href;
								/* Changed ! your code here */
								sendNavigateMessage();
							  }
							});
							observer.observe(body, { childList: true, subtree: true });
						  };
					});
					addEventListener("popstate", sendNavigateMessage);

					// setInterval(() => {
					// 	sendNavigateMessage();
					// }, 1000);

					addEventListener("message", (e) => {
						console.log('FRAME MESSAGE', e.data);

						if(e.data?.messageType === MessageType.injectCSS){
							document.querySelector('#injected-css')?.remove();
							const style = document.createElement('style');
							style.id = 'injected-css';
							style.textContent = e.data?.rawCSS; // Set the raw CSS as the text content
							document.head.appendChild(style);
							
						}


						if(e.data?.messageType === MessageType.injectJS){

							document.querySelector('#injected-js')?.remove();

							const script = document.createElement('script');
							script.id = 'injected-js';
							script.textContent = e.data?.rawJS; // Set the raw JS as the text content
							document.head.appendChild(script);
							
						}
					});
				}
			});
		}
		
        // initTranslations(i18nConfig.defaultLocale, ["common", "content"])
        // const ui = await createShadowRootUi(ctx, {
        //     name: 'language-learning-content-box',
        //     position: 'inline',
        //     onMount: (container) => {
        //         console.log(container);
        //         const root = ReactDOM.createRoot(container);
        //         root.render(
        //             <ThemeProvider>
        //                 <App/>
        //             </ThemeProvider>
        //         );
        //         return root;
        //     },
        //     onRemove: (root) => {
        //         root?.unmount();
        //     },
        // });

        // ui.mount();
    },
});
