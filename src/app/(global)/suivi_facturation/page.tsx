"use client";

import { Tabs, TabsProps } from "antd";
import UnboundMissions from "./UnboundMissions";
import BoundInvoices from "./BoundInvoices";

export default function SuiviFacturation() {

    const items: TabsProps['items'] = [
        {
          key: '1',
          label: 'Missions à traiter',
          children: <UnboundMissions />,
        },
        {
          key: '2',
          label: 'Missions reliées à une facture',
          children: <BoundInvoices />,
        }
      ];


    return(<>
    
        <Tabs defaultActiveKey="1" items={items} />
    
    </>)

}
