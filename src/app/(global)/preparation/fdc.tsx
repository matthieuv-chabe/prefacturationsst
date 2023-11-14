import { Input, Divider, Checkbox, CheckboxOptionType, Button, Typography } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import { useState } from "react";

const { Title } = Typography;
const CheckboxGroup = Checkbox.Group;

export const FilterDropdownCheckboxes = (props: { choices: any[], type: string, setSelectedKeys: (keys: string[]) => void, confirm: () => void }) => {

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
                            style: {
                                display: search.length > 0 && !e.text.toLowerCase().includes(search.toLowerCase()) ? "none" : ""
                            }
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