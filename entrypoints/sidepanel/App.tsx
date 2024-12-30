import React, { useEffect, useRef, useState } from 'react';
import './App.module.css';
import '../../assets/main.css'
import Sidebar, { SidebarType } from "@/entrypoints/sidebar.tsx";
import { PublicPath, browser } from "wxt/browser";
import ExtMessage, { MessageType } from "@/entrypoints/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Home } from "@/entrypoints/sidepanel/home.tsx";
import { SettingsPage } from "@/entrypoints/sidepanel/settings.tsx";
import { useTheme } from "@/components/theme-provider.tsx";
import { useTranslation } from 'react-i18next';
import Header from "@/entrypoints/sidepanel/header.tsx";
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Minus, Plus, SquareArrowOutUpRight } from 'lucide-react';
import urlMapper from '../regex.mapper';

export default () => {
	const [showButton, setShowButton] = useState(true)
	const [hiddenURLBar, setHiddenURLBar] = useState(true)
	const { theme, toggleTheme } = useTheme();
	const { t, i18n } = useTranslation();
	const [url, setURL] = useState<string>('');
	const [iframeLoading, setIframeLoading] = useState<boolean>(true);

	const iframeRef = useRef<HTMLIFrameElement>(null);

	async function initI18n() {
		let data = await browser.storage.local.get('i18n');
		if (data.i18n) {
			await i18n.changeLanguage(data.i18n)
		}
	}


	const onPlusHandle = () => {

	};


	const onMinusHandle = () => {

	};


	const handleGoToWebsite = () => {
		browser.runtime.sendMessage({ messageType: MessageType.GoToWebsite, url: url });
	};


	useEffect(() => {
		browser.runtime.connect({ name: 'side_panel' });
		window.addEventListener('beforeunload', ()=> {

			browser.declarativeNetRequest.updateSessionRules({
				removeRuleIds: [1],
			});
			alert('before unload')
		});

		browser.storage.sync.get('activeUrl').then((data) => {

			if (data.activeUrl) {
				setURL(data.activeUrl)
				openweb(data.activeUrl)
			}
		});

		browser.runtime.onMessage.addListener((message: ExtMessage, sender, sendResponse) => {
			console.log('sidepanel:', message?.messageType)
			console.log(message)
			if (message.messageType == MessageType.changeLocale) {
				i18n.changeLanguage(message.content)
			} else if (message.messageType == MessageType.changeTheme) {
				toggleTheme(message.content)
			} else if (message.messageType == MessageType.navigate) {

				if (message.href) {
					setURL(message.href);
					browser.storage.sync.set({ activeUrl: message.href });
				}

			} else if (message.messageType == MessageType.OpenWebsite) {
				if (message.url && message.url != url) {
					setURL(message.url)
					openweb(message.url)
				}

			}
		});


		initI18n();
		
		return () => {
			browser.declarativeNetRequest.updateSessionRules({
				removeRuleIds: [1],
			});
		}
	}, []);


	function actionGo() {
		console.log('actionGo')
		var searchInput = url;
		if (searchInput != "") {
			// Check if the input is a valid URL
			// capture groups:
			// 1: protocol (https://)
			// 2: domain (mail.google.com)
			// 3: path (/chat/u/0/)
			// 4: query string (?view=list)
			// 5: fragment (#chat/home)
			var urlRegex = /^(https?:\/\/)?((?:[\da-z.-]+)+\.(?:[a-z.]{2,})+)?((?:\/[-a-z\d%_.~+]*)*)(\?[;&a-z\d%_.~+=-]*)?(#.*)?$/i;
			if (urlRegex.test(searchInput)) {
				// If it is a URL, navigate to the page
				if (searchInput.startsWith("http://www.") || searchInput.startsWith("https://www.")) {
					openweb(searchInput);
				} else if (searchInput.startsWith("http://") || searchInput.startsWith("https://")) {
					openweb(searchInput);
				} else {
					openweb("https://" + searchInput);
				}
			} else {
				if (searchInput.startsWith("file:///")) {
					openweb(searchInput);
				} else {
					// // If it is not a URL, perform a text search
					// performSearch(selectedsearch, searchInput);
				}
			}
		}
	}


	const openweb = async (currenturl: string) => {
		setIframeLoading(true);
		await browser.declarativeNetRequest.updateSessionRules({
			removeRuleIds: [1],
			addRules: [{
				id: 1,
				priority: 1,
				action: {
					type: "modifyHeaders",
					responseHeaders: [
						{ header: "x-frame-options", operation: "remove" },
						{ header: "content-security-policy", operation: "remove" },
						{ header: "frame-ancestors", operation: "remove" },

						// Allow CORS by setting Access-Control-Allow-Origin
						// { header: "Access-Control-Allow-Origin", operation: "set", value: "*" },
						// { header: "Access-Control-Allow-Methods", operation: "set", value: "GET, POST, OPTIONS, PUT, DELETE" },
						// { header: "Access-Control-Allow-Headers", operation: "set", value: "Content-Type, Authorization" },
					],
				},
				condition: {
					urlFilter: "*",
					resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "websocket"],
				},
			}],
		});


		window.addEventListener('message', (event) => {
			console.log('received message:', event.data);
		});


		if (iframeRef && iframeRef.current) {
			// set active panel
			// open that web page
			iframeRef.current.src = currenturl;
			iframeRef.current.onload = async () => {
				setIframeLoading(false);
				let value = urlMapper.get(currenturl);
				let file_url = null;
				if (value) {
					file_url = browser.runtime.getURL('preconfig/' + value + '/style.css' as PublicPath);
				}

				if (file_url && value) {
					let text = await fetch(file_url).then((res) => res.text());
					iframeRef.current?.contentWindow?.postMessage({ messageType: MessageType.injectCSS, rawCSS: text }, '*');
				}


			}



			browser.storage.sync.set({ activeUrl: currenturl });
		}
	};


	return (
		<div className={cn(theme, 'h-full flex flex-col')}>

			{hiddenURLBar && (
				<Button variant={'outline'} size='sm' onClick={() => handleGoToWebsite()}>
					<SquareArrowOutUpRight size={16}  /> &nbsp; Go to website
				</Button>
			)}
			<div className='flex flex-row gap-x-2'>

				{
					!hiddenURLBar && <Input type="text" value={url} placeholder="Type something" onKeyDown={(e) => {
						if (e.key === 'Enter') {
							actionGo();
						}
					}} onChange={(e) => {
						setURL(e.target.value)
					}} />
				}

				{!hiddenURLBar && !iframeLoading &&
					<div className='flex flex-row gap-x-2'>
						<Button variant="outline" size="icon" onClick={onPlusHandle}>
							<Plus />
						</Button>
						<Button variant="outline" size="icon" onClick={onMinusHandle}>
							<Minus />
						</Button>
					</div>
				}

				{
					!hiddenURLBar && <Button onClick={() => {
						actionGo();
					}}
					>
						Go
					</Button>
				}

			</div>

			<div className='flex relative flex-col w-full h-full'>
				{iframeLoading && <div className="absolute grid h-full w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
					<svg className="text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"
						width="24" height="24">
						<path
							d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
							stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"></path>
						<path
							d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
							stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
						</path>
					</svg>
				</div>
				}


				<iframe className={cn(iframeLoading ? 'hidden' : '', 'w-full h-full')} ref={iframeRef}>

				</iframe>
			</div>



		</div>

	)
};
