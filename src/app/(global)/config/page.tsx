"use client";

import { HotelInformations } from "@/business/SalesforceChabe";
import { ProTable } from "@ant-design/pro-components"
import {Alert, Button, Space, Tooltip, Typography, message, InputNumber} from "antd"
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import ConfigDrawer from "./drawerContent";
import {EditOutlined} from "@ant-design/icons";
import {EditableField} from "@/components/EditableField";

const { Text } = Typography


export default function F() {

	const [drawerVisible, setDrawerVisible] = useState(false)
	const [drawerClientName, setDrawerClientName] = useState("")
	const [drawerClientId, setDrawerClientId] = useState("")

	function showDrawer(hotel_id: string, hotel_name: string) {
		setDrawerVisible(true)
		setDrawerClientName(hotel_name)
		setDrawerClientId(hotel_id)
	}

	return (<>

		<ConfigDrawer
			clientId={drawerClientId}
			drawerClientName={drawerClientName}
			drawerVisible={drawerVisible}
			setDrawerVisible={setDrawerVisible}
		/>

		<ProTable<HotelInformations>
			request={async (_params, _sort, _filter): Promise<any> => {

				const hotels: HotelInformations[] = await (fetch("/api/hotels/full", {
					method: "POST",
				})
					.then(res => res.json())
					.then((result) => {
						console.log(result);
						return result;
					})
					.catch((error) => {
						console.log(error);
						message.error("Impossible de charger la liste des Hôtels")
						return { data: [], success: false }
					}))

				return {
					data: hotels,
					success: true,
				}
			}}

			revalidateOnFocus={true}

			columns={[
				{
					title: "Client",
					dataIndex: "Name",
					sorter: (a, b) => (a.Name || "").localeCompare(b.Name || ""),
				},
				{
					title: "Decomposition des commissions Hotel",
					children: [
						{
							title: "Voiture",
							dataIndex: "Commission_Hotel_Voiture_Percent",
							valueType: "percent",
							// sorter: (a, b) => a.hotel_pct_car - b.hotel_pct_car,
							width: 100,
						},
						{
							title: "Service",
							dataIndex: "Commission_Hotel_Service_Percent",
							valueType: "percent",
							// sorter: (a, b) => a.hotel_pct_service - b.hotel_pct_service,
							width: 100,
						},
						{
							title: "Frais",
							dataIndex: "Commission_Hotel_Frais_Percent",
							valueType: "percent",
							// sorter: (a, b) => a.hotel_pct_fees - b.hotel_pct_fees,
							width: 100,
						},
						{
							title: "Accueil",
							dataIndex: "Commission_Hotel_Accueil_Percent",
							valueType: "percent",
							// sorter: (a, b) => a.hotel_pct_welcome - b.hotel_pct_welcome,
							width: 100,
						},
					]
				},
				{
					title: "Decomposition des commissions Loge",
					children: [
						{
							title: "Voiture",
							dataIndex: "Commission_Loge_Voiture_Percent",
							valueType: "percent",
							// sorter: (a, b) => a.loge_pct_car - b.loge_pct_car,
							width: 100,
						},
						{
							title: "Service",
							dataIndex: "Commission_Loge_Service_Percent",
							valueType: "percent",
							// sorter: (a, b) => a.loge_pct_service - b.loge_pct_service,
							width: 100,
						},
						{
							title: "Frais",
							dataIndex: "Commission_Loge_Frais_Percent",
							valueType: "percent",
							// sorter: (a, b) => a.loge_pct_fees - b.loge_pct_fees,
							width: 100,
						},
						{
							title: "Accueil",
							dataIndex: "Commission_Loge_Accueil_Percent",
							valueType: "percent",
							// sorter: (a, b) => a.loge_pct_welcome - b.loge_pct_welcome,
							width: 100,
						},
					]
				},
				{
					title: "Modifier répartitions",
					render: (text, record, index, _action) => (
						<Space>

							<Link
								target="_blank"
								href={"https://chabe.my.salesforce.com/" + "/lightning/r/Account/" + record.Id + "/view"}
							>
								<Tooltip title="L'hôtel s'ouvrira dans Salesforce pour modification">
									<Button
										style={{minWidth: 150}}
									>
										Hotel / Loge
										<Image
											style={{ marginLeft: 7, display:"inline" }}
											src="/salesforce.png"
											alt="Salesforce"
											width={25}
											height={17}
										/>
									</Button>
								</Tooltip>
							</Link>

							<Button
								onClick={() => {
									showDrawer(record.Id, record.Name)
								}}
							>Concierges</Button>
						</Space>
					),
				}
			]}

			options={{
				search: false,
				density: false,
				fullScreen: false,
				reload: false,
				setting: false,
			}}

			cardProps={{
				bodyStyle : {
					padding: 0,
					paddingBottom: 10,
					backgroundColor: "transparent"
				}
			}}

			sticky={{
				offsetHeader: 48,
			}}

			search={false}
			rowKey={"Id"}
			bordered={true}
		/>
		<Alert
			style={{ marginTop: 20 }}
			message="Pour ajouter un Hôtel"
			description={
				<>
					Rendez-vous sur la{" "}
					<Link target="_blank" href={"https://chabe.my.salesforce.com/" + "/lightning/r/Account/home"}>
						liste des hôtels Salesforce
					</Link>
					, ouvrez l{"'"}hôtel souhaité et cochez la case <Text strong>Commission Hotel Parent</Text>.
				</>
			}
			type="info"
			showIcon
		/>

	</>)
}
