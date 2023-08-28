"use client";

import { useMsal } from "@azure/msal-react"

export default async function Logout() {
	const m = useMsal();
	await m.instance.logoutPopup()
	return (<>empty.</>)
}
