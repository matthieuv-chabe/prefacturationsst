import {usePathname} from "next/navigation";
import React, {useContext} from "react";
import {ActionType, PageContainer, ProLayout} from "@ant-design/pro-components";
import {Breadcrumb, Button, theme, Typography} from "antd";
import Image from "next/image";
import Link from "next/link";
import {PoweroffOutlined, SendOutlined} from "@ant-design/icons";
import {x as customMenuDate} from '@/app/(global)/customMenu';
import {PublicClientApplication} from "@azure/msal-browser";
import GlobalContext from "@/core/GlobalContext";

const {Text} = Typography;
let serviceData: any[] = customMenuDate;


export default function GlobalLayout(props: {
	children: any,
	pca: PublicClientApplication,
	dark: boolean,
	onSetDark: (dark: boolean) => void
}) {

	const path_name = usePathname()
	const actionRef = React.useRef<ActionType>();

	const {useToken} = theme;
	const {token} = useToken();

	const {switchDark} = useContext(GlobalContext)!;

	return (<>
			<ProLayout

				theme={"light"} // fix because theme dark is showing shit colors

				title={'Chabé Préfacturation Sous-traitants'}
				logo={<Image style={{filter: "invert"}} src={"/logo_chabe_bleu_400.png"} width={28} height={22}
				             alt={"logo"}/>}

				actionsRender={() => [<PoweroffOutlined key={"dark"} onClick={switchDark}/>]}

				style={{
					height: '100vh',
				}}

				links={[<Button style={{margin: 0, padding: 0, width: "100%"}} key="1" type="primary" ghost
				                onClick={() => props.pca.logout()}>Déconnexion</Button>,]}

				appList={[{
					title: "Salesforce SST",
					icon: <Image src={"/logo_chabe_bleu_400.png"} width={28} height={22}
					             alt={"logo salesforce"}/>,
					target: "_blank",
					url: "https://chabe.my.salesforce.com/",

				}]}

				actionRef={actionRef}

				menu={{
					request: async () => {
						return serviceData;
					},

				}}
				suppressSiderWhenMenuEmpty={true}

				location={{
					pathname: path_name,
				}}

				layout={"mix"}

				menuItemRender={(item, dom) => {
					return (<>
						<Link href={{pathname: item.path}}>
							{dom}
						</Link>

					</>);
				}}

				avatarProps={{
					src: "/logo_chabe_bleu_400.png", size: 22, title: props.pca.getAllAccounts()[0]?.name,
				}}

				// menuData={serviceData}

				// menuDataRender={(menuData) => {
				// 	return menuData;
				// }}
			>
				<PageContainer
					style={{padding: 0}}
					childrenContentStyle={{padding: 0}}

					header={{
						style: {
							padding: 0,
						},
					}}

					breadcrumb={{
						separator: ' / ',
					}}

					pageHeaderRender={(props) => {
						return <div
							style={{
								backgroundColor: token.colorBgContainer,
								border: "1px solid " + token.colorBorderBg,
								padding: "14px",
								marginBottom: "12px",
							}}
						>
							<div style={{display: "flex", flexDirection: "row", height: "100%"}}>
								<div style={{
									height: "100%",
									aspectRatio: "1/1",
									width: "50px",
									backgroundColor: token.colorPrimaryBg,
									borderRadius: "10px",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									color: "white",
									marginRight: "10px",
								}}>
									{/* Show the name specified in the menu */}
									<SendOutlined style={{fontSize: 27}}/>
								</div>
								<div>
									<Breadcrumb items={[
										{title: "Home", path: "/"},
										...(path_name.split("/").filter(e => e != "").map((value, index) => {
											return {title: value, path: value};
										})),
									]} />
									<Text style={{
										fontSize: "large", fontWeight: "bold",
									}}>
										{props.title}
									</Text>
								</div>
							</div>
						</div>;
					}}

				>
					<div
						style={{
							margin: 0,
							backgroundColor: token.colorBgContainer,
							border: "1px solid " + token.colorBorderBg,
							borderRadius: token.borderRadius,
							padding: "25px",
						}}
					>
						{props.children}
					</div>
				</PageContainer>
			</ProLayout>
		</>);
};