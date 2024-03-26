"use client";

import {ConfigProvider, Typography} from 'antd';
import {x as customMenuDate} from './customMenu';
import NotLoggedInBlock from "@/components/NotLoggedInBlock";

import {PublicClientApplication} from "@azure/msal-browser";
import React, {useEffect} from "react";
import {AuthenticatedTemplate, MsalProvider, UnauthenticatedTemplate, useMsal} from "@azure/msal-react";
import {ProConfigProvider} from "@ant-design/pro-components";
import GlobalContext, {GlobalState_t} from "@/core/GlobalContext";

import XLayout from "@/components/GlobalLayout";

const msalConfig = {
	auth: {
		clientId: '97480561-e4b7-4616-adf6-c3eb9c6e75ed',
		authority: 'https://login.microsoftonline.com/bcbedbf1-982a-4634-b8fd-7361216ff810',
		redirectUri: (typeof (window) != "undefined" && window.location.href.indexOf("localhost") != -1) ? "http://localhost:3000/" : 'https://prefacturation-sst.chabe.com',
	}
};

const pca = new PublicClientApplication(msalConfig);

let serviceData: any[] = customMenuDate;

function Authentifier(props: { onSuccessAuth?: (token: string) => void }) {

	const msal = useMsal();

	useEffect(() => {

		// If no account is signed in, start the login flow
		if (!msal.instance.getAllAccounts().length) {
			msal.instance.loginPopup().then(() => {
				// The user is authenticated here.
				// Let's get a token and save it in the token cache

				const account = msal.instance.getAllAccounts()[0];
				const tokenRequest = {
					scopes: ["user.read"],
					account: account
				}

				msal.instance.acquireTokenSilent(tokenRequest).then((response) => {
					// Save in the token cache
					window.sessionStorage.setItem("msal.idToken", response.accessToken);
					props.onSuccessAuth && props.onSuccessAuth(response.accessToken);
				}).catch(() => {
					msal.instance.acquireTokenPopup({
						scopes: ["user.read"],
						account: msal.instance.getAllAccounts()[0]
					}).then((response) => {
						window.sessionStorage.setItem("msal.idToken", response.accessToken);
						props.onSuccessAuth && props.onSuccessAuth(response.accessToken);
					});
				});


			});
		}
	}, []);

	return (<></>)
}

const {Text} = Typography;

export default function Layout({children}: { children: any }) {

	const [dark, setDark] = React.useState<boolean>(false);
	const [token, setToken] = React.useState<string>("");

	const [globalcontext, setGlobalContext] = React.useState<GlobalState_t>(null);

	useEffect(() => {
		setGlobalContext({

			// Theme
			dark,
			switchDark: () => { setDark(!dark); },

			// User
			token: token,

		})
	}, [dark, token]);

	return (<ConfigProvider locale={{locale: "fr"}} csp={{nonce: "test"}} >
	<ProConfigProvider dark={dark}>
		<GlobalContext.Provider value={globalcontext}>
			<XLayout pca={pca} dark={dark} onSetDark={(d) => setDark(d)}>
				{children}
			</XLayout>
		</GlobalContext.Provider>
	</ProConfigProvider>
</ConfigProvider>)

	return (
		<>
			<MsalProvider instance={pca}>
				<Authentifier onSuccessAuth={setToken} />
				<AuthenticatedTemplate>
					<ConfigProvider locale={{locale: "fr"}} csp={{nonce: "test"}} >
						<ProConfigProvider dark={dark}>
							<GlobalContext.Provider value={globalcontext}>
								<XLayout pca={pca} dark={dark} onSetDark={(d) => setDark(d)}>
									{children}
								</XLayout>
							</GlobalContext.Provider>
						</ProConfigProvider>
					</ConfigProvider>
				</AuthenticatedTemplate>
				<UnauthenticatedTemplate>
					<NotLoggedInBlock pca={pca} />
				</UnauthenticatedTemplate>
			</MsalProvider>
		</>
	);
}