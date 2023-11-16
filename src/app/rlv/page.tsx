"use client";

import React from "react";
import {NoSSR} from "next/dist/shared/lib/lazy-dynamic/dynamic-no-ssr";

import "./style.css"
import {Button, notification} from "antd";
import {useRouter} from "next/navigation";
import {WAYNIUM_servicetype_id_to_string, WAYNIUM_vehiculetype_id_to_string} from "@/business/waynium";

export interface Root {
    from: string
    to: string
    missions: Mission[]
}

export interface Mission {
    id: string
    date_start: string
    date_end: string
    folder_id: string
    vehicle_type: string
    service_type: string
    partner_id: string
    chauffeur_name: string
    pickup_address: string
    dropoff_address: string
    buying_price: number
    selling_price: number
    profit: number
    status: string
    sent_to_supplier: any
    client: string
}


const X = () => {

    const router = useRouter();

    const str_to_price = (str: string) => {
        const number = parseFloat(str.replace("€", ""));
        return number.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'});
    }

    const isForDemo = true;
    const urlParams = new URLSearchParams((typeof window !== "undefined" && window?.location?.search) || "https://google.com");

    const data = JSON.parse(atob(urlParams.get("p")!)) as Root;

    const sum = data.missions.reduce((acc, mission) => acc + mission.buying_price, 0);

    return (<>
        <div
            id="pdfready"
            style={{
                printColorAdjust: 'exact',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                // alignItems: isForDemo ? 'center' : 'left',
                flexDirection: 'column',
                // boxShadow: isForDemo ? '5px' : '0',
                overflow: 'auto'
            }}
        >


            <div style={{
                // position: 'absolute',
                // top: 0,
                printColorAdjust: 'exact',
                backgroundColor: 'white',
                width: '100%',
                // boxShadow: isForDemo ? 'rgba(22, 18, 18, 1) 0px 0px 10px 10px' : '0',
                // top: 100
            }}>

                <div style={{
                    printColorAdjust: 'exact',
                    margin: '1cm'
                }}>


                    <div style={{
                        printColorAdjust: 'exact',
                        marginBottom: '2cm'
                    }}>

                        <p style={{
                            printColorAdjust: 'exact',
                            padding: '5px',
                            backgroundColor: '#061E3A',
                            color: 'white',
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            textAlign: 'center',
                            fontSize: 'large'
                        }}>
                            MISSIONS DE {data.missions[0].partner_id.split('|')[1]} DU {new Date(data.from).toLocaleDateString()} AU {new Date(data.to).toLocaleDateString()}
                        </p>
                    </div>

                    <div>
                        <p style={{
                            printColorAdjust: 'exact',
                            fontFamily: 'Arial, Helvetica, sans-serif'
                        }}>
                            MONTANT TTC : <b style={{color: '#DE2B4E'}}>{str_to_price(""+sum)}</b>
                        </p>
                    </div>

                    <div>
                        <table style={{width: "100%"}}>
                            <thead>
                                <tr style={{
                                    printColorAdjust: 'exact',
                                    fontSize: 'small',
                                    padding: '2px',
                                    color: 'white',
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    textAlign: 'center',
                                    backgroundColor: '#061E3A'
                                }}>

                                    <th>Date de Début</th>
                                    <th>Date de Fin</th>
                                    <th>Type de Service</th>
                                    <th>Client</th>
                                    <th>Adresse départ</th>
                                    <th>Adresse arrivée</th>
                                    <th>Chauffeur</th>
                                    <th>Véhicule</th>
                                    <th>Prix TTC</th>
                                </tr>
                            </thead>
                            <tbody>

                            {
                                data.missions.map((mission, index) => {
                                    return (
                                        <>
                                            <tr>

                                                <td>
                                                    {
                                                        ""
                                                        + new Date(mission.date_start).toLocaleDateString()
                                                        + " "
                                                        + new Date(mission.date_start).toLocaleTimeString()
                                                    }
                                                </td>

                                                <td>
                                                    {new Date(mission.date_end).toLocaleTimeString()}
                                                </td>

                                                <td>
                                                    {WAYNIUM_servicetype_id_to_string(mission.service_type)}
                                                </td>

                                                <td>
                                                    {mission.client}
                                                </td>

                                                <td>
                                                    {mission.pickup_address}
                                                </td>

                                                <td>
                                                    {mission.dropoff_address}
                                                </td>

                                                <td>
                                                    {mission.chauffeur_name}
                                                </td>

                                                <td>
                                                    {WAYNIUM_vehiculetype_id_to_string(mission.vehicle_type)}
                                                </td>

                                                <td style={{textAlign: "right"}}>
                                                    {str_to_price(""+mission.buying_price)}
                                                </td>
                                            </tr>
                                        </>
                                    )
                                })
                            }

                            </tbody>
                        </table>
                    </div>

                </div>

            </div>

        </div>


    </>)
}

const Page = () => {

    const openNotification = (placement: any) => {
        notification.info({
            message: `Relevé envoyé au sous-traitant`,
            placement,
        });
    }

    const urlParams = new URLSearchParams((typeof window !== "undefined" && window?.location?.search) || "https://google.com");
    let data: Root = {to: "", from: "", missions: []}

    try {
        data = JSON.parse(atob(urlParams.get("p")!)) as Root;
    } catch (e) {
        return <></>
    }

    return (<NoSSR>
        <>
            <X/>
            <Button
                className={"noprint"}
                type={"primary"}
                onClick={() => {
                    fetch("/api/sendToContractor", {
                    	method: "POST",
                    	body: JSON.stringify({
                    		missions: urlParams.get("p")!,
                    	}),
                    }).then(e => {
                    	openNotification("topRight");
                    });
                }}
            >
                Envoyer le relevé au sous-traitant
            </Button>
            <Button
                className={"noprint"}
                style={{marginLeft: 10}}
            >
                Le sous-traitant a déjà envoyé sa facture
            </Button>
        </>
    </NoSSR>)
}

export default Page;
