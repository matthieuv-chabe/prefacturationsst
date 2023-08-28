import React, {useState} from "react";
import {EditOutlined} from "@ant-design/icons";
import {Button} from "antd";

export type EditableFieldProps = {
    children: React.ReactNode,
    editField: React.ReactNode,
    onValidate?: () => void,
}

export const EditableField = (props: EditableFieldProps) => {

    const [isHovering, setIsHovering] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "column",
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {!isEditMode && props.children}
            {isEditMode &&
                <>
                    {props.editField}
                    <Button
                        onClick={() => {
                            setIsEditMode(false)
                        }}
                    >
                        Valider
                    </Button>
                </>
            }

            {!isEditMode && isHovering &&
                <EditOutlined
                    onClick={() => {
                        setIsEditMode(true)
                    }}
                />
            }
        </div>
    )
}