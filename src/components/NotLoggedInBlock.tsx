import { PublicClientApplication } from "@azure/msal-browser";
import { Button, Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function F(props: { pca: PublicClientApplication }) {
	return (<>

		{/* Centered block */}
		<div style={{
			margin: 0,
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			height: "100vh",
			position: "absolute",
			width: "100vw",
			top: 0,
			left: 0,
		}}>
			<Card
				bordered={false}
				actions={[
					<Button key={'auth'} type='primary' onClick={() => props.pca.loginPopup()}>Authentification rapide</Button>,
					<Button key={'help'} type='default' onClick={() => {
						const title = "Chabe Commissions - Impossible de se connecter";
						const body = "Bonjour";
						window.location.href = "mailto:support@chabe.fr?subject=" + title + "&body=" + body;
					}}>J{"'"}ai besoin d{"'"}aide</Button>,
				]}
			>
				<Title level={1}>Chabé Commissions</Title>
				<Paragraph>
					Veuillez vous authentifier pour accéder à l{"'"}application. <br/>
					Si vous n{"'"}avez pas de compte, veuillez contacter votre responsable.
				</Paragraph>
			</Card>
		</div>

	</>)
}
