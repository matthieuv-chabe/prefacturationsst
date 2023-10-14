
import { Button, Card, Modal, Typography, message } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import Image from "next/image";

import img_select_unique_contractor from "@/../public/tuto_select_unique_contractor.png";

const { Text, Paragraph } = Typography;

export type Contractor_t = {
    text: string,
    value: string
}

function OneContractor(props: { contractor: Contractor_t }) {
    return (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>
            <Card
                bordered={true}
                title="Envoyer le relevé au prestataire"
                style={{ backgroundColor: "rgba(100,255,100,.1)", width: "50%", boxShadow: "0px 0px 10px rgba(0,0,0,.1)" }}
                actions={[
                    <Button
                        type={"primary"}
                    >
                        Envoyer le relevé au partenaire
                    </Button>,
                    <Button
                        type={"default"}
                    >
                        Marquer comme "Facture déjà recue"
                    </Button>
                ]}
            >
                Votre relevé est prêt à être envoyé au prestataire <Text type='success'>{props.contractor.text}</Text>. <br />
                Le relevé incluera toutes les missions des différentes pages (si plusieurs pages de résultat).<br />
            </Card>
        </div>
    )
}

function MultipleContractors(props: { contractors: Contractor_t[] }) {

    const [popupVisible, setPopupVisible] = useState(false);

    return (<>

        <Modal
            title="Envoi du relevé au prestataire"
            open={popupVisible}
            onOk={() => {
                setPopupVisible(false);
            }}
            cancelButtonProps={{ style: { display: "none" } }}
            okText={"Compris"}
        >
            <Paragraph>
                Pour envoyer le relevé à un prestataire, vous devez sélectionner un unique prestataire. <br />
                Un envoi en masse sera disponible dans une version ultérieure, mais pour l'instant, vous devez envoyer le relevé à chaque prestataire séparément.
                <br /> <br />
                <b>Comment sélectionner un unique prestataire ?</b> <br />
                Vous pouvez utiliser les filtres pour afficher uniquement les missions d'un prestataire particulier. <br />
            </Paragraph>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 10
                }}
            >
                <Image
                    src={img_select_unique_contractor}
                    alt={"Exemple des boutons à appuyer"}
                    width={200}
                />
            </div>
            <Paragraph>
                Actuellement, {props.contractors.length} prestataires sont sélectionnés.
            </Paragraph>

        </Modal>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <Text type={"secondary"}>
                Sélectionnez un unique partenaire pour envoyer le relevé.
                <InfoCircleOutlined style={{ marginLeft: 5 }} onClick={() => setPopupVisible(true)} />
            </Text>
        </div>
    </>
    )
}

export default function SendToContractor(props: { selectedContractors: Contractor_t[] }) {

    if (props.selectedContractors.length == 1) {
        return <OneContractor contractor={props.selectedContractors[0]} />
    } else {
        return <MultipleContractors contractors={props.selectedContractors} />
    }

}
