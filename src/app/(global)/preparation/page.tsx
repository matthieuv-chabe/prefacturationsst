"use client";

import {
	Button,
	DatePicker,
	Select,
	Table,
	Typography,
	notification
} from 'antd';
import React, { useState, useEffect } from "react";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
	WAYNIUM_servicetype_id_to_string,
	WAYNIUM_statut_id_to_string,
	WAYNIUM_vehiculetype_id_to_string
} from "@/business/waynium";
import { NotificationPlacement } from 'antd/es/notification/interface';

import xlsx from "json-as-xlsx";

type SetValue<T> = (newValue: T | ((prevValue: T) => T)) => void;

function useURLState<T>(
	paramName: string,
	initialValue: T
): [T, SetValue<T>] {
	const getInitialValueFromURL = (): T | null => {
		const searchParams = new URLSearchParams(window.location.search);
		const valueFromURL = searchParams.get(paramName);
		if (valueFromURL !== null) {
			try {
				return JSON.parse(valueFromURL) as T;
			} catch (error) {
				console.error('Error parsing URL parameter:', error);
			}
		}
		return null;
	};

	const [value, setValue] = useState<T>(
		getInitialValueFromURL() ?? initialValue
	);

	useEffect(() => {
		const serializedValue = JSON.stringify(value);
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set(paramName, serializedValue);

		const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
		window.history.replaceState({ path: newUrl }, '', newUrl);

		const handlePopstate = (event: PopStateEvent) => {
			const updatedValueFromURL = getInitialValueFromURL();
			if (updatedValueFromURL !== null) {
				setValue(updatedValueFromURL);
			}
		};

		window.addEventListener('popstate', handlePopstate);

		return () => {
			window.removeEventListener('popstate', handlePopstate);
		};
	}, [value, paramName]);

	return [value, setValue];
}

export type DataType = {
	id: string,
	date_start: string,
	date_end: string,
	folder_id: string,
	mission_id: string,
	vehicle_type: string,
	service_type: string,
	partner_id: string,
	chauffeur_name: string,
	pickup_address: string,
	dropoff_address: string,
	buying_price: string,
	selling_price: string,
	profit: string,
	status: string,
	sent_to_supplier: string,
	client: string,
}

const get_substring_by_brackets = (str: string, offset: number, open: string, close: string) => {
	let count = 0;
	let start = 0;
	let end = 0;
	for (let i = offset; i < str.length; i++) {
		if (str[i] === open) {
			count++;
			if (count === 1) {
				start = i;
			}
		}
		if (str[i] === close) {
			count--;
			if (count === 0) {
				end = i;
				break;
			}
		}
	}
	return str.substring(start + 1, end);
}

function unique(inp: { text: string, value: string }[]) {
	const seen = new Set<string>();
	return inp.filter(el => {
		const duplicate = seen.has(el.value);
		seen.add(el.value);
		return !duplicate;
	});
}

export default function X() {


	// Date interval
	const [interval_from, setInterval_from] = useURLState<string>("if", new Date().toISOString().split("T")[0]);
	const [interval_to, setInterval_to] = useURLState<string>("it", new Date().toISOString().split("T")[0]);

	const { RangePicker } = DatePicker;
	const { Text, Title } = Typography;
	const dateFormat = 'YYYY-MM-DD';

	const [allPartnersX, setAllPartnersX] = useState<any[]>([]);
	const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
	const [allMissions, setAllMissions] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [selected, setSelected] = useState<string[]>([]);

	const [forceUpdate, setForceUpdate] = useState<number>(0);

	const render_address = (t: string, _: any) => {

		if (t != null && t.indexOf("%DIC_LIEU_A_DEFINIR%") !== -1) {
			return <div>Lieu à définir</div>
		};

		if (t != null && t.length > 12 && t.startsWith("Libellé : [")) {
			const brackets_a = get_substring_by_brackets(t, 0, "[", "]");
			const brackets_b = get_substring_by_brackets(t, 12, "[", "]");

			if (brackets_a.length > 2) {
				return <div>{brackets_a}</div>
			}

			if (brackets_b.length > 2) {
				return <div>{brackets_b}</div>
			}
		}

		return <div>{t}</div>
	}

	const columns: ColumnsType<DataType> = [
		// {
		// 	title: 'id',
		// 	dataIndex: 'id',
		// },
		{
			title: 'Date de début',
			dataIndex: 'date_start',
			key: 'date_start',
			render: (_, r) => {
				return <div style={{ textAlign: "right" }}>{dayjs(r.date_start).format("DD/MM/YYYY HH:mm")}</div>
			},
			// filterDropdown: filter_dropdown,
			sorter: (a, b) => dayjs(a.date_start).unix() - dayjs(b.date_start).unix(),
		},
		{
			title: 'Heure de fin',
			dataIndex: 'date_end',
			key: 'date_end',
			render: (_, r) => {
				return <div style={{ textAlign: "right" }}>{dayjs(r.date_end).format("HH:mm")}</div>
			},
			// filterDropdown: filter_dropdown,
			sorter: (a, b) => dayjs(a.date_end).unix() - dayjs(b.date_end).unix(),
		},
		{
			title: 'Dossier',
			// dataIndex: 'folder_id',
			key: 'folder_id',
			render: (t, line) => <>{line.folder_id}-{line.mission_id}</>,
			sorter: (a, b) => {
				// Sort by folder_id first then by mission_id
				const folder_id_cmp = a.folder_id.localeCompare(b.folder_id);
				if (folder_id_cmp !== 0) return folder_id_cmp;
				return a.mission_id.localeCompare(b.mission_id);
			},
			filters: unique(allMissions.map((x) => ({ text: x.folder_id, value: x.folder_id }))),
			onFilter: (value, record) => record.folder_id.indexOf(value as string) === 0,
		},
		{
			title: 'Type de véhicule',
			dataIndex: 'vehicle_type',
			key: 'vehicle_type',
			render: (t) => <>{WAYNIUM_vehiculetype_id_to_string(t)}</>,
			sorter: (a, b) => a.folder_id.localeCompare(b.folder_id),
			filters: unique(allMissions.map((x) => ({ text: WAYNIUM_vehiculetype_id_to_string(x.vehicle_type), value: x.vehicle_type }))),
			onFilter: (value, record) => record.vehicle_type.indexOf(value as string) === 0,
		},
		{
			title: 'Type de service',
			dataIndex: 'service_type',
			render: (t) => <>{WAYNIUM_servicetype_id_to_string(t)}</>,
			sorter: (a, b) => a.folder_id.localeCompare(b.folder_id),
			filters: unique(allMissions.map((x) => ({ text: WAYNIUM_servicetype_id_to_string(x.service_type), value: x.service_type }))),
			onFilter: (value, record) => record.service_type.indexOf(value as string) === 0,
		},
		{
			title: 'Client',
			dataIndex: 'client',
			render: (t) => <>{t}</>,
			sorter: (a, b) => a.folder_id.localeCompare(b.folder_id),
			filters: unique(allMissions.map((x) => ({ text: x.client, value: x.client }))),
			onFilter: (value, record) => record.client.indexOf(value as string) === 0,
		},
		{
			title: 'Chauffeur',
			dataIndex: 'chauffeur_name',
			render: (t) => {
				return t?.replace("null", "")
			},
			sorter: (a, b) => a.chauffeur_name.localeCompare(b.chauffeur_name),
			filters: unique(allMissions.map((x) => ({ text: x.chauffeur_name, value: x.chauffeur_name }))),
			onFilter: (value, record) => record.chauffeur_name.indexOf(value as string) === 0,
		},
		{
			title: 'Adresse de prise en charge',
			dataIndex: 'pickup_address',
			render: render_address,
			sorter: (a, b) => a.pickup_address.localeCompare(b.pickup_address),
		},
		{
			title: 'Adresse de dépose',
			dataIndex: 'dropoff_address',
			render: render_address,
			sorter: (a, b) => a.dropoff_address.localeCompare(b.dropoff_address),
		},
		{
			title: 'Prix d\'achat TTC',
			dataIndex: 'buying_price',
			sorter: (a, b) => {
				return parseFloat(a.buying_price) - parseFloat(b.buying_price);
			}
		},
		{
			title: 'Prix de vente TTC',
			dataIndex: 'selling_price',
			sorter: (a, b) => {
				return parseFloat(a.selling_price) - parseFloat(b.selling_price);
			}
		},
		{
			title: 'Profit',
			dataIndex: 'profit',
			render: (t, obj) => {

				const p_achat = parseFloat(obj.buying_price);
				const p_vente = parseFloat(obj.selling_price);

				const percent = (p_vente - p_achat) / p_vente * 100;
				return <Text>{percent.toFixed(2)} %</Text>
			},
			sorter: (a, b) => {
				return parseFloat(a.profit) - parseFloat(b.profit);
			}
		},
		{
			title: 'Statut',
			dataIndex: 'status',
			render: (t) => {
				return <>{WAYNIUM_statut_id_to_string(t)}</>
			},
			sorter: (a, b) => a.status.localeCompare(b.status),
			filters: unique(allMissions.map((x) => ({ text: WAYNIUM_statut_id_to_string(x.status), value: x.status }))),
			onFilter: (value, record) => record.status.indexOf(value as string) === 0,
		}
		// ,
		// {
		// 	title: 'Envoyé au fournisseur',
		// 	dataIndex: 'sent_to_supplier',
		// }
	];


	useEffect(() => {

		setLoading(true);

		fetch("/api/contractors", {
			method: "POST",
			body: JSON.stringify({
				start: interval_from,
				end: interval_to,
			}),
		}).then((res) => res.json()).then((res) => {
			setAllPartnersX(res);

			if (selectedPartner == "") {
				setLoading(false);
			}
		});

		if (selectedPartner != "") {
			fetch("/api/missions", {
				method: "POST",
				body: JSON.stringify({
					start: interval_from,
					end: interval_to,
					partner: selectedPartner,
				}),
			})
				.then((res) => {
					console.log({ res })
					return res.json()
				})
				.then((res) => {
					setAllMissions(res.jobs);
					setLoading(false);
				});
		}

	}, [interval_from, interval_to, selectedPartner, forceUpdate]);

	const filterOption = (input: string, option?: { label: string; value: string }) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

	const [api, contextHolder] = notification.useNotification();
	const openNotification = (placement: NotificationPlacement) => {
		api.info({
			message: `Notification ${placement}`,
			description: "Done !",
			placement,
		});
	};

	const [exportAllLoading, setExportAllLoading] = useState<boolean>(false);

	return (<>

		<div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>

			<RangePicker
				defaultValue={[dayjs(interval_from), dayjs(interval_to)]}
				format={dateFormat}
				onChange={(dates, dateStrings) => {
					setInterval_from(dateStrings[0]);
					setInterval_to(dateStrings[1]);
				}}
			/>

			<div style={{ width: 15 }}></div>

			<Select
				showSearch
				// value={selectedPartner}
				placeholder={"Choisissez un partenaire (" + allPartnersX.length + ")"}
				onChange={(e) => { console.log({ e }); setSelectedPartner(e); }}
				options={allPartnersX.map(x => ({ value: x.id, label: x.name }))}
				filterOption={filterOption}
			/>


			<div style={{ width: 15 }}></div>

			<Button
				disabled={selected.length === 0}
				type={"primary"}
				onClick={async () => {

					// @ts-ignore
					let data: PageParams = {};
					data.from = interval_from;
					data.to = interval_to;
					// @ts-ignore
					// data.missions = selected;
					data.missions = [selected[0]]

					const target = window.open("/rlv?p=" + btoa(JSON.stringify(data)), "_blank");
					if (!target) {
						alert("Veuillez autoriser les popups pour ce site");
					}

					// Send data to the target window
					await new Promise((resolve) => setTimeout(resolve, 3000));
					// @ts-ignore
					try {
						console.log({ data });
						target?.postMessage({ ...data, missions: selected }, "*");
					} catch (error) {
						console.error(error);
					}
				}}
			>
				Exporter
			</Button>

			<div style={{ width: 15 }}></div>


			<div>
				<Text>
					{ /* @ts-ignore */}
					Total prix achat : {selected.reduce((a, b) => a + parseFloat(b.buying_price), 0).toFixed(2)} €
				</Text>
			</div>

		</div>


		<Table
			pagination={{ pageSize: 200, hideOnSinglePage: true }}
			loading={loading}
			columns={columns}
			rowKey="id"
			dataSource={allMissions}
			rowSelection={{
				type: "checkbox",
				onChange: (selectedRowKeys, selectedRows) => {
					setSelected(selectedRows);
				}
			}}
			locale={{
				filterConfirm: "OK",
			}}
		/>

		<div style={{ display: "flex", justifyContent: "space-between", marginTop: 15 }}>

			<div>
				<Text>Nombre de missions : {allMissions.length}</Text>
			</div>

			<div>
				<Text>Nombre de missions sélectionnées : {selected.length}</Text>
			</div>


		</div>
		<Button
			onClick={() => {
				const data = [{
					sheet: "Data",
					columns: [
						{ label: "Date de début", value: (row: any) => dayjs(row.date_start).format("DD/MM/YYYY HH:mm") },
						{ label: "Heure de fin", value: (row: any) => dayjs(row.date_end).format("HH:mm") },
						{ label: "ID Mission", value: (row: DataType) => (row.folder_id + "-" + row.mission_id) },
						{ label: "Type de véhicule", value: (row: DataType) => WAYNIUM_vehiculetype_id_to_string(row.vehicle_type) },
						{ label: "Type de service", value: (row: DataType) => WAYNIUM_servicetype_id_to_string(row.service_type) },
						{ label: "Client", value: "client" },
						{ label: "Chauffeur", value: "chauffeur_name" },
						{ label: "Adresse de prise en charge", value: "pickup_address" },
						{ label: "Adresse de dépose", value: "dropoff_address" },
						{ label: "Prix d'achat TTC", value: "buying_price" },
						{ label: "Prix de vente TTC", value: "selling_price" },
						{ label: "Profit", value: (row: DataType) => ((parseFloat(row.selling_price) - parseFloat(row.buying_price)) / parseFloat(row.selling_price) * 100).toFixed(2) + "%" },
						{ label: "Statut", value: (row: DataType) => WAYNIUM_statut_id_to_string(row.status) },
					],
					content: allMissions,
				}];

				// @ts-ignore
				xlsx(data, {
					fileName: "missions"
				})
			}}
		>Download Excel</Button>

		<Button
			loading={exportAllLoading}
			type='dashed'
			style={{ marginLeft: 10 }}
			onClick={async () => {

				setExportAllLoading(true);

				const all_data = await fetch('/api/missions/all', {
					method: "POST",
					body: JSON.stringify({
						start: interval_from,
						end: interval_to,
					}),
				}).then((res) => res.json());

				console.log(all_data)

				const data = [{
					sheet: "Data",
					columns: [
						{ label: "Date de début", value: (row: any) => dayjs(row.date_start).format("DD/MM/YYYY HH:mm") },
						{ label: "Heure de fin", value: (row: any) => dayjs(row.date_end).format("HH:mm") },
						{ label: "ID Mission", value: (row: DataType) => (row.folder_id + "-" + row.mission_id) },
						{ label: "Type de véhicule", value: (row: DataType) => WAYNIUM_vehiculetype_id_to_string(row.vehicle_type) },
						{ label: "Type de service", value: (row: DataType) => WAYNIUM_servicetype_id_to_string(row.service_type) },
						{ label: "Client", value: "client" },
						{ label: "Chauffeur", value: "chauffeur_name" },
						{ label: "Adresse de prise en charge", value: "pickup_address" },
						{ label: "Adresse de dépose", value: "dropoff_address" },
						{ label: "Prix d'achat TTC", value: "buying_price" },
						{ label: "Prix de vente TTC", value: "selling_price" },
						{ label: "Profit", value: (row: DataType) => ((parseFloat(row.selling_price) - parseFloat(row.buying_price)) / parseFloat(row.selling_price) * 100).toFixed(2) + "%" },
						{ label: "Statut", value: (row: DataType) => WAYNIUM_statut_id_to_string(row.status) },
					],
					content: all_data.jobs,
				}];

				// @ts-ignore
				xlsx(data, {
					fileName: "missions"
				})

				openNotification("bottomRight");

				setExportAllLoading(false);
			}}
		>
			Télécharger les missions de tous les partenaires
		</Button>

	</>
	);
};