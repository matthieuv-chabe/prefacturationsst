

import { SalesforceChabe } from "@/business/SalesforceChabe";
import { NextRequest, NextResponse } from "next/server";
import {DataType} from "@/app/(global)/preparation/page";

export async function GET(request: NextRequest) {

    const search = request.nextUrl.searchParams;

    const date_start = search.get("date_start");
    const date_end = search.get("date_end");
    const folder_id = search.get("folder_id");
    const vehicle_type = search.get("vehicle_type");
    const service_type = search.get("service_type");
    const client_name = search.get("client_name");
    const chauffeur_name = search.get("chauffeur_name");
    const pickup_address = search.get("pickup_address");
    const dropoff_address = search.get("dropoff_address");
    const buying_price = search.get("buying_price");
    const selling_price = search.get("selling_price");
    const profit = search.get("profit");
    const status = search.get("status");
    const sent_to_supplier = search.get("sent_to_supplier");

    if(!date_start || !date_end) return NextResponse.json({"error": "missing date_start or date_end"});

    const sf = await SalesforceChabe.getMissionsBetweenDates(new Date(date_start), new Date(date_end));
    //return NextResponse.json(sf);

    const all_partner_ids = new Set<string>();
    for(const mission of sf) {
        all_partner_ids.add(mission.Partner_ERP_ID__c);
    }

    const partner_names: {id:string, name:string}[] = await SalesforceChabe.getPartnerNames(Array.from(all_partner_ids));
    console.log({partner_names})

    const mapped = sf.map((mission) => {
        return {
            date_start: mission.Start_Date_Time__c,
            date_end: mission.End_Date_Time__c,
            folder_id: mission.COM_ID__c,
            vehicle_type: mission.OrderedVehicleType_ERP_ID__c,
            service_type: mission.ServiceType_ERP_ID__c,
            partner_id: mission.Partner_ERP_ID__c + "|" + partner_names.find((x) => x.id == mission.Partner_ERP_ID__c)?.name,
            chauffeur_name: "bob",
            pickup_address: mission.Pick_Up_Location__c,
            dropoff_address: mission.Drop_Off_Location__c,
            buying_price: mission.Purchase_Price__c,
            selling_price: 4224,
            profit: ""+(mission.Purchase_Price__c - 4224),
            status: mission.Status_ERP_ID__c,
            sent_to_supplier: mission.Purchase_Invoice_Number__c,
            client: mission.Client_Salesforce_Code__c,
        } as unknown as DataType;
    });

    return NextResponse.json(mapped);
}
