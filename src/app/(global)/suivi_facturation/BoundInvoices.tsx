"use client";

import {Button, Checkbox, DatePicker, Divider, Drawer, Input, message, Table, TableColumnProps, Typography} from 'antd';
import React, { useState, useEffect } from "react";
import { useAntdTable } from 'ahooks';
import { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import { CheckboxOptionType, CheckboxValueType } from "antd/es/checkbox/Group";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import {
    WAYNIUM_servicetype_id_to_string,
    WAYNIUM_statut_id_to_string,
    WAYNIUM_vehiculetype_id_to_string
} from "@/business/waynium";
import Card from 'antd/es/card/Card';

import {
    DownloadOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
// import SendToContractor, { Contractor_t } from './SendToContractor';

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

export default function X() {

    const [allClients, setAllClients] = useState<{ text: string, value: string }[]>([]);
    const [allServices, setAllServices] = useState<{ text: string, value: string }[]>([]);
    const [allPartners, setAllPartners] = useState<any[]>([]);

    // Date interval
    const [interval_from, setInterval_from] = useURLState<string>("if", "2023-01-01");
    const [interval_to, setInterval_to] = useURLState<string>("it", "2023-01-01");

    const getTableData = async (x: { current: number, pageSize: number, sorter: any, filters: any }) => {

        const array_to_string = (arr: string[] | undefined) => {

            if (arr == null) return "";

            return arr.map((x) => {
                return `${x}`;
            }).join(",");
        }

        let filters = x.filters || {};
        filters.only_done_prefacturation = true;

        const query = ` 
			&limit=${x.pageSize}
			&offset=${(x.current - 1) * x.pageSize}
			&filters=${JSON.stringify(filters)}
			&sorter=${JSON.stringify(x.sorter)}
		`;



        return fetch(`/api/missions?date_start=${interval_from}&date_end=${interval_to}&${query}`)
            .then((res) => res.json())
            .then((res: { count: number, jobs: DataType[] }) => {

                console.log({ res })

                let all_clients = new Set<string>();
                res.jobs.forEach((x: any) => { all_clients.add(x.client); });
                setAllClients(
                    Array.from(all_clients).map((x: string) => {
                        return { text: x, value: x }
                    }).sort((a, b) => a.text.localeCompare(b.text))
                );

                let all_services = new Set<string>();
                res.jobs.forEach((x: any) => { if (x != null) all_services.add(x.service_type); });
                setAllServices(
                    Array.from(all_services).map((x: string) => {
                        return { text: WAYNIUM_servicetype_id_to_string(x), value: x }
                    })
                        .filter((x) => x.text != null && x.text.length > 0 && x.value != null && x.value.length > 0)
                        .sort((a, b) => a.text.localeCompare(b.text))
                );

                let all_partners = new Set<string>();
                res.jobs.forEach((x: any) => { all_partners.add(x.partner_id); });
                setAllPartners(
                    Array.from(all_partners).map((x: string) => {
                        return { text: x.split('|')[1], value: x.split('|')[0] }
                    }).sort((a, b) => a.text.localeCompare(b.text))
                );

                console.log({ all_clients, all_services, all_partners })

                return {
                    total: res.count,
                    list: res.jobs,
                }
            });
    }

    const {
        tableProps,
        refresh,
    } = useAntdTable(getTableData, {
        refreshOnWindowFocus: false,
    })

    const filter_dropdown = (props: { setSelectedKeys: (keys: string[]) => void, confirm: () => void }) => {
        return (<>
            <input type="text" onChange={(e) => {
                props.setSelectedKeys(e.target.value ? [e.target.value] : []);
            }} />
            <Button onClick={() => {
                props.confirm();
            }}>ok
            </Button>
        </>);
    }

    const CheckboxGroup = Checkbox.Group;

    const FilterDropdownCheckboxes = (props: { choices: any[], type: string, setSelectedKeys: (keys: string[]) => void, confirm: () => void }) => {

        const [checkedList, setCheckedList] = useState<CheckboxValueType[]>([]);
        const checkAll = props.choices.length === checkedList.length;
        const indeterminate = checkedList.length > 0 && checkedList.length < props.choices.length;

        const onCheckAllChange = (e: CheckboxChangeEvent) => {
            setCheckedList(e.target.checked ? props.choices.map(e => e.value) : []);
        };

        const [search, setSearch] = useState<string>("");

        return (<>
            <div style={{ margin: 10 }}>
                <Title level={3}>
                    Liste des {props.type}
                </Title>
                <div style={{ margin: "5px", padding: 10, maxHeight: 400, overflowY: "auto" }}>

                    <Input.Search
                        placeholder="Rechercher"
                        allowClear
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                    ></Input.Search>
                    <Divider />
                    {search.length == 0 &&
                        <>
                            <Checkbox
                                indeterminate={indeterminate}
                                onChange={onCheckAllChange}
                                checked={checkAll}
                            >
                                Selectionner tous les {props.type}
                            </Checkbox>
                            <Divider />
                        </>
                    }
                    <CheckboxGroup
                        style={{ display: "flex", flexDirection: "column" }}
                        value={checkedList}
                        options={props.choices.map(e => {
                            return {
                                value: e.value,
                                label: e.text,
                                style: { display: search.length > 0 && !e.text.toLowerCase().includes(search.toLowerCase()) ? "none" : "" }
                            } as CheckboxOptionType
                        })}
                        onChange={(checkedValues) => {
                            setCheckedList(checkedValues);
                            props.setSelectedKeys(checkedValues.map(x => x as string));
                        }}
                    />
                </div>
                <Button
                    style={{ right: 0 }}
                    type={"primary"} onClick={() => {
                    props.confirm();
                }}>Valider</Button>
            </div>
        </>);
    }

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
        {
            title: 'Sage',
            dataIndex: 'code_sage',
        },
        {
            title: 'Date de début',
            dataIndex: 'date_start',
            key: 'date_start',
            render: (_, r) => {
                return <div style={{ textAlign: "right" }}>{dayjs(r.date_start).format("DD/MM/YYYY HH:mm")}</div>
            },
            filterDropdown: filter_dropdown,
            sorter: (a, b) => dayjs(a.date_start).unix() - dayjs(b.date_start).unix(),
        },
        {
            title: 'Date de fin',
            dataIndex: 'date_end',
            key: 'date_end',
            render: (_, r) => {
                return <div style={{ textAlign: "right" }}>{dayjs(r.date_end).format("DD/MM/YYYY HH:mm")}</div>
            },
            filterDropdown: filter_dropdown,
            sorter: (a, b) => dayjs(a.date_end).unix() - dayjs(b.date_end).unix(),
        },
        {
            title: 'Dossier',
            dataIndex: 'folder_id',
            key: 'folder_id',
            filterDropdown: filter_dropdown,
            sorter: (a, b) => a.folder_id.localeCompare(b.folder_id),
        },
        {
            title: 'Type de véhicule',
            dataIndex: 'vehicle_type',
            key: 'vehicle_type',
            render: (t) => <>{WAYNIUM_vehiculetype_id_to_string(t)}</>,
            filterDropdown: filter_dropdown,
        },
        {
            title: 'Type de service',
            dataIndex: 'service_type',
            render: (t) => <>{WAYNIUM_servicetype_id_to_string(t)}</>,
            filterDropdown: (props) => <FilterDropdownCheckboxes
                choices={allServices}
                type={"services"}
                setSelectedKeys={props.setSelectedKeys}
                confirm={props.confirm}
            />
        },
        {
            title: 'Client',
            dataIndex: 'client',
            filterDropdown: (props) => <FilterDropdownCheckboxes
                choices={allClients}
                type={"clients"}
                setSelectedKeys={props.setSelectedKeys}
                confirm={props.confirm}
            />
        },
        {
            title: 'Partenaire',
            dataIndex: 'partner_id',
            render: (t) => {

                const [partner_id, partner_name] = t.split('|');

                if (partner_id == "null") {
                    return <Text type={"danger"}>Aucun !</Text>
                }
                return <>{t.split('|')[1]}</>
            },
            filterDropdown: (props) => <FilterDropdownCheckboxes
                choices={allPartners}
                type={"partenaires"}
                setSelectedKeys={props.setSelectedKeys}
                confirm={props.confirm}
            />
        },
        {
            title: 'Chauffeur',
            dataIndex: 'chauffeur_name',
        },
        {
            title: 'Adresse de prise en charge',
            dataIndex: 'pickup_address',
            render: render_address,
        },
        {
            title: 'Adresse de dépose',
            dataIndex: 'dropoff_address',
            render: render_address,
        },
        {
            title: 'Prix d\'achat',
            dataIndex: 'buying_price',
            sorter: (a, b) => {
                return parseFloat(a.buying_price) - parseFloat(b.buying_price);
            }
        },
        {
            title: 'Prix de vente',
            dataIndex: 'selling_price',
        },
        {
            title: 'Profit',
            dataIndex: 'profit',
        },
        // {
        //     title: 'Statut',
        //     dataIndex: 'status',
        //     render: (t) => {
        //         return <>{WAYNIUM_statut_id_to_string(t)}</>
        //     }
        // },
        // {
        //     title: 'Envoyé au fournisseur',
        //     dataIndex: 'sent_to_supplier',
        // }
    ];

    const { RangePicker } = DatePicker;
    const { Text, Title } = Typography;
    const dateFormat = 'YYYY/MM/DD';

    const [selectedRows, setSelectedRows] = useState<DataType[]>([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [contractorInvoiceNum, setContractorInvoiceNum] = useState<string>("");
    const [sageInvoiceNum, setSageInvoiceNum] = useState<string>("");

    return (<>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>

                <RangePicker
                    defaultValue={[dayjs(interval_from), dayjs(interval_to)]}
                    format={dateFormat}
                    onChange={(dates, dateStrings) => {
                        setInterval_from(dateStrings[0]);
                        setInterval_to(dateStrings[1]);
                        setTimeout(() => {
                            refresh();
                        }, 100);
                    }}
                />

            </div>

            <Table
                columns={columns}
                rowKey="id"
                {...tableProps}
            />


        </>
    );
};