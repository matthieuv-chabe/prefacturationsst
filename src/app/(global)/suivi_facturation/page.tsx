"use client";

import { Tabs, TabsProps } from "antd";
import UnboundMissions from "./UnboundMissions";

function BoundInvoices() {
    return "Z"
}

export default function SuiviFacturation() {

    const items: TabsProps['items'] = [
        {
          key: '1',
          label: 'Missions non attribuées à une facture',
          children: <UnboundMissions />,
        },
        {
          key: '2',
          label: 'Liste des factures et des missions',
          children: <BoundInvoices />,
        }
      ];


    return(<>
    
        <Tabs defaultActiveKey="1" items={items} />
    
    </>)

}
