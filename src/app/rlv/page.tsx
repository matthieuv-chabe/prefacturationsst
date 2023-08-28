"use client";

import React from "react";
import {NoSSR} from "next/dist/shared/lib/lazy-dynamic/dynamic-no-ssr";

import "./style.css"
import {Button} from "antd";
import {useRouter} from "next/navigation";

export type FactureParams = {
    id: string;
    date: string;
    client_name: string;
    ttc: string;

    com_part: ComParam[]
}

export type ComParam = {
    type: "voiture" | "service" | "frais" | "accueil",
    base_commisionable: number,
    com_rate: number,
    com_amount: number,
}

export type PageParams = {
    hotel: {
        name: string;
        address: string;
        city: string;
        tva: string;
    }

    factures: FactureParams[]
};

const X = () => {

    const router = useRouter();

    const str_to_price = (str: string) => {
        const number = parseFloat(str.replace("€", ""));
        return number.toLocaleString('fr-FR', {style: 'currency', currency: 'EUR'});
    }

    const isForDemo = true;
    const urlParams = new URLSearchParams((typeof window !== "undefined" && window?.location?.search) || "https://google.com");

    let data: PageParams = {
        factures: [],
        hotel: {
            address: "",
            city: "",
            name: "",
            tva: ""
        }
    };

    if (urlParams.has("p") || urlParams.has("t")) {
        if (urlParams.has("t")) {
            const one_fac: FactureParams = {
                id: "FPA123456879",
                date: "2021-01-01",
                ttc: "1000€",
                client_name: "LUTETIA",
                com_part: [
                    {
                        type: "voiture",
                        base_commisionable: 1000,
                        com_rate: 0.5,
                        com_amount: 500,
                    },
                    {
                        type: "service",
                        base_commisionable: 1000,
                        com_rate: 0.5,
                        com_amount: 500,
                    }
                ]
            }

            const data_to_write: PageParams = {

                hotel: {
                    name: 'Hotel Lutecia',
                    address: 'Rua de Arroios, 23',
                    city: 'Lisboa',
                    tva: 'PT123456789',
                },

                factures: [
                    one_fac,
                    one_fac,
                    one_fac,
                    one_fac,
                    one_fac,
                    one_fac,
                ],

            };

            data = data_to_write;
        } else {
            data = JSON.parse(urlParams.get("p")!) as PageParams;
            console.log("p=", data)
        }
    }


    const sum_of_com = data.factures.reduce((acc, facture) => {
        return acc + facture.com_part.reduce((acc2, com_part) => {
            return acc2 + com_part.com_amount
        }, 0)
    }, 0);


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
                alignItems: isForDemo ? 'center' : 'left',
                flexDirection: 'column',
                boxShadow: isForDemo ? '5px' : '0',
                overflow: 'auto'
            }}
        >


            <div style={{
                position: 'relative',
                printColorAdjust: 'exact',
                backgroundColor: 'white',
                width: '21cm',
                height: '29.7cm',
                boxShadow: isForDemo ? 'rgba(22, 18, 18, 1) 0px 0px 10px 10px' : '0'
            }}>

                <div style={{
                    printColorAdjust: 'exact',
                    marginLeft: '1cm',
                    marginTop: '1cm'
                }}>

                    <p style={{
                        printColorAdjust: 'exact',
                        fontFamily: 'Arial, Helvetica, sans-serif'
                    }}>

                        <b>HOTEL {data.hotel.name}</b><br/>
                        {data.hotel.address}<br/>
                        {data.hotel.city}<br/>
                        {data.hotel.tva}<br/>
                    </p>

                </div>

                <div style={{
                    printColorAdjust: 'exact',
                    margin: '1cm'
                }}>

                    <p style={{
                        printColorAdjust: 'exact',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        textAlign: 'right'
                    }}>
                        <b>CHABE</b><br/>
                        91-99 Av. Jules Quentin<br/>
                        92000 Nanterre, France<br/>
                        TVA INTRA FR 35 314 613 720<br/>
                    </p>
                </div>

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
                            textAlign: 'center'
                        }}>
                            FACTURE DE COMMISSION EN EUROS
                        </p>
                    </div>

                    <div>
                        <p style={{
                            printColorAdjust: 'exact',
                            fontFamily: 'Arial, Helvetica, sans-serif'
                        }}>
                            Facture du {new Date().toLocaleDateString()}
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

                                <th>N. Facture<br/>Chabé</th>
                                <th>Date Facture<br/>Chabé</th>
                                <th>Référence<br/>Chabé</th>
                                <th>Montant<br/>TTC</th>
                                <th>Base<br/>commissionnable<br/>HT</th>
                                <th>Taux<br/>commission</th>
                                <th>Montant<br/>commission<br/>HT</th>
                            </tr>
                            </thead>
                            <tbody>

                            {
                                data.factures.map((facture, index) => {
                                    return (
                                        <>
                                            {facture.com_part.map((com_part, index2) => {
                                                return (
                                                    <tr
                                                        key={index * 1e9 + index2}
                                                        style={{
                                                            borderBottom: index2 === facture.com_part.length - 1 ? 'solid #061E3A 4px' : 'none'
                                                        }}
                                                    >
                                                        {index2 === 0 &&
                                                            <>
                                                                <td rowSpan={facture.com_part.length}>
                                                                    {facture.id}
                                                                </td>
                                                                <td rowSpan={facture.com_part.length}>
                                                                    {facture.date}
                                                                </td>
                                                                <td rowSpan={facture.com_part.length}>
                                                                    {facture.client_name}
                                                                </td>
                                                                <td
                                                                    rowSpan={facture.com_part.length}
                                                                    style={{
                                                                        printColorAdjust: 'exact',
                                                                        textAlign: 'right',
                                                                        verticalAlign: 'middle'
                                                                    }}>
                                                                    {str_to_price("" + facture.ttc)}
                                                                </td>
                                                            </>
                                                        }

                                                        <td style={{
                                                            printColorAdjust: 'exact',
                                                            textAlign: 'right'
                                                        }}>
                                                            {str_to_price("" + com_part.base_commisionable)}
                                                        </td>
                                                        <td style={{
                                                            printColorAdjust: 'exact',
                                                            textAlign: 'right'
                                                        }}>
                                                            {com_part.com_rate * 100} %
                                                        </td>
                                                        <td style={{
                                                            printColorAdjust: 'exact',
                                                            textAlign: 'right',
                                                        }}>
                                                            {str_to_price("" + com_part.com_amount)}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </>
                                    )
                                })
                            }

                            <tr style={{
                                printColorAdjust: 'exact',
                                fontFamily: 'Arial, Helvetica, sans-serif',
                                border: 'none',
                                borderLeft: 'solid white 4px',
                                borderRight: 'solid white 2px',
                            }}>
                                <td colSpan={4} style={{border: 'none',}}></td>
                                <td style={{border: 'none'}}></td>
                                <td style={{border: 'none'}}></td>
                                <td style={{
                                    printColorAdjust: 'exact',
                                    borderTop: 'solid #061E3A 4px !important',
                                    textAlign: 'right',
                                    border: 'none',
                                }}>
                                    <b style={{textAlign: "right"}}>
                                        {str_to_price("" + sum_of_com)}
                                    </b>
                                </td>
                            </tr>

                            </tbody>
                        </table>
                    </div>

                    <div style={{
                        printColorAdjust: 'exact',
                        display: 'flex',
                        flexDirection: 'row-reverse',
                        marginTop: '2cm'
                    }}>

                        <table>
                            <thead></thead>
                            <tbody>
                            <tr>
                                <td style={{
                                    printColorAdjust: 'exact',
                                    padding: '2px',
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    fontSize: 'small',
                                    backgroundColor: '#061E3A',
                                    color: 'white'
                                }}>
                                    <p>
                                        <b>
                                            TOTAL HT
                                        </b>
                                    </p>
                                </td>
                                <td style={{
                                    printColorAdjust: 'exact',
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    textAlign: 'right'
                                }}>
                                    {str_to_price("" + sum_of_com)}
                                </td>
                            </tr>
                            <tr>
                                <td style={{
                                    printColorAdjust: 'exact',
                                    padding: '2px',
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    fontSize: 'small',
                                    backgroundColor: '#061E3A',
                                    color: 'white'
                                }}>
                                    <p>
                                        <b>
                                            TVA 20%
                                        </b>
                                    </p>
                                </td>
                                <td style={{
                                    printColorAdjust: 'exact',
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    textAlign: 'right'
                                }}>
                                    {str_to_price("" + sum_of_com * 0.2)}
                                </td>
                            </tr>
                            <tr>
                                <td style={{
                                    padding: '2px',
                                    printColorAdjust: 'exact',
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    fontSize: 'small',
                                    backgroundColor: '#061E3A',
                                    color: 'white'
                                }}>
                                    <p>
                                        <b>
                                            TOTAL TTC
                                        </b>
                                    </p>
                                </td>
                                <td style={{
                                    printColorAdjust: 'exact',
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    textAlign: 'right'
                                }}>
                                    {str_to_price("" + sum_of_com * 1.2)}
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>

        </div>


    </>)
}

const Page = () => {
    return (<NoSSR>
        <>
            <X/>
            <Button className={"noprint"} type={"primary"}>Envoyer la facture à l{"'"}hôtel</Button>
        </>
    </NoSSR>)
}

export default Page;
