import { ConciergeUpdateQuery } from "@/app/api/updateConcierge/route";
import { ConciergeInformation } from "@/business/SalesforceChabe";
import { ActionType, ProTable } from "@ant-design/pro-components";
import { Alert, Button, Drawer, InputNumber, Timeline, Typography, message } from "antd";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const { Title } = Typography

export type DrawerParams = {
	drawerVisible: boolean,
	setDrawerVisible: (visible: boolean) => void,
	drawerClientName: string,
	clientId: string,
}

export default function ConfigDrawer(props: DrawerParams) {

	const { drawerVisible, drawerClientName, clientId, setDrawerVisible } = props

	const [sum, setSum] = useState(0)
	const [repartitions, setRepartitions] = useState<{id:string, value:number}[]>([])
	function resetRepartitions() {
		setRepartitions([])
		setSum(0)
	}

	function updateRepartitions(id:string, value:number) {

		if(value < 0 || value > 100 || isNaN(value) || id === "") return;
		// console.log("updateRepartitions", id, value)

		const index = repartitions.findIndex((r) => r.id === id)
		if (index === -1) {
			repartitions.push({id, value})
		} else {
			repartitions[index].value = value
		}

		// console.log("repartitions:", repartitions)
		setRepartitions(repartitions)

		const sum = repartitions.reduce((acc, r) => acc + r.value, 0)
		setSum(sum)
	}

	useEffect(() => {
		ref?.current?.reload();
		resetRepartitions()
	}, [props])

	const ref = useRef<ActionType>();

	return(<>

		<Drawer
			open={drawerVisible}
			title={"Répartition des commissions pour " + drawerClientName}
			placement="right"
			closable={true}
			onClose={() => {
				setDrawerVisible(false)
			}}
			size="large"
			footer={[
				(sum == 100) && <Button key={1} type="primary" onClick={async () => {
					await fetch("/api/updateConcierge", {
						method: "POST",
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							hotelId: clientId,
							concierges: repartitions.map((r) => {
								return {
									id: r.id,
									repartition: r.value,
								}
							})
						} as ConciergeUpdateQuery)
					});
					message.success("Répartitions sauvegardées")
					setDrawerVisible(false)
				}}>Sauvegarder</Button>,
			]}
		>

			<Title level={3}>Répartitions {drawerClientName}</Title>

			{sum !== 100 && repartitions.length != 0 &&
                <Alert
                    message={"Attention, la somme des répartitions est de " + sum + "%, elle doit être égale à 100%"}
                    type="error"
                    showIcon
                    style={{ marginBottom: 20 }}
                />
			}

			<ProTable<ConciergeInformation>

				actionRef={ref}
				expandable={{
					expandedRowRender: (_record) => {
						return (
							<Timeline
								style={{ margin: 10, padding: 0, marginTop: 10 }}
								pending="2425€ restant à payer"
								reverse={true}
								items={[
									{
										key: '1',
										color: 'green',
										children: '2023-01-01 : 1000€',
									},
									{
										key: '2',
										color: 'green',
										children: '2022-01-01 : 1000€',
									},
									{
										key: '3',
										color: 'green',
										children: '2022-01-01 : 1000€',
									},
									{
										key: '4',
										color: 'green',
										children: '2022-01-01 : 1000€',
									},
								]}
							/>
						)
					}
				}}

				request={async (params, sort, _filter): Promise<any> => {

					const concierges: ConciergeInformation[] = await (fetch("/api/hotels/concierge?hotelId=" + clientId)
						.then(res => res.json())
						.catch((error) => {
							// console.log(error);
							message.error("Impossible de charger la liste des concierges pour cet hôtel")
							console.log("error", error)
							return { data: [], success: false }
						}))

					resetRepartitions()
					concierges.forEach((c) => {
						// console.log("c", c)
						updateRepartitions(c.Id!, c.repartition || 0)
					})

					return {
						data: concierges,
						success: true,
					}
				}}

				rowKey={"Id"}

				columns={[
					{
						title: "Concierge",
						dataIndex: "Name",
						sorter: (a, b) => (a.Name || "").localeCompare(b.Name || ""),
					},
					{
						title: "Répartition",
						render: (text, record, index, _action) => {
							return (<>

								<InputNumber
									defaultValue={record.repartition || 0}
									min={0}
									max={100}
									formatter={(value) => `${value}%`}
									onChange={(value) => {
										updateRepartitions(record.Id!, value || 0)
									}}

								/>

							</>)
						},
					}
				]}
				search={false}
				options={{
					setting: false,
					density: false,
				}}
				// revalidateOnFocus={true}
				bordered={true}

			/>

			<Alert
				message="Pour ajouter un concierge"
				description={<>Rendez-vous sur la fiche <Link target="_blank" href={"https://chabe--copieprod1.sandbox.my.salesforce.com/" + "/lightning/r/Account/" + clientId + "/view"} >contact du concierge</Link>, et saisissez {'"'}Chef concierge / Concierge{'"'} dans le champ {'"'}Fonction nommée{'"'}, puis rafraichissez ce tableau.</>}
				type="info"
				showIcon

				key={Math.random()}

			/>

		</Drawer>

	</>)
}