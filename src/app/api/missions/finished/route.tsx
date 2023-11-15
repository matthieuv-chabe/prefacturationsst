import { DataType } from "@/app/(global)/preparation/page";
import { SalesforceChabe } from "@/business/SalesforceChabe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {

    const body = await request.json();
    const date_start = body.start;
    const date_end = body.end;
    const partner = body.partner;

    const sf = await SalesforceChabe.getFinishedMissionsBetweenDates(
        new Date(date_start), new Date(date_end), partner
    );


    const all_partner_ids = new Set<string>();
    for(const mission of sf.jobs) {
        all_partner_ids.add(mission.Partner_ERP_ID__c);
    }

    const all_chauf_ids = new Set<string>();
    for(const mission of sf.jobs) {
        all_chauf_ids.add(mission.Chauffeur_ERP_ID__c);
    };

    const partner_names = await SalesforceChabe.getPartnerNames(Array.from(all_partner_ids));
    const chauf_names = await SalesforceChabe.getChauffeurNames(Array.from(all_chauf_ids));

    const result = sf.jobs.map((mission) => ({
        id: mission.Id,
        date_start: mission.Start_Date_Time__c,
        date_end: mission.End_Date_Time__c,
        folder_id: mission.COM_ID__c,
        vehicle_type: mission.OrderedVehicleType_ERP_ID__c,
        service_type: mission.ServiceType_ERP_ID__c,
        partner_id: mission.Partner_ERP_ID__c + "|" + partner_names.find((x) => x.id == mission.Partner_ERP_ID__c)?.name,
        chauffeur_name: chauf_names.find((x) => x.id == mission.Chauffeur_ERP_ID__c)?.name,
        pickup_address: mission.Pick_Up_Location__c,
        dropoff_address: mission.Drop_Off_Location__c,
        buying_price: mission.Purchase_Price__c,
        selling_price: mission.Calculated_Incl_VAT_Price__c || 0,
        profit: (mission.Calculated_Incl_VAT_Price__c - mission.Purchase_Price__c) / mission.Calculated_Incl_VAT_Price__c,
        status: mission.Status_ERP_ID__c,
        sent_to_supplier: mission.Purchase_Invoice_Number__c,
        client: mission.Client_Salesforce_Code__c,
        Purchase_Invoice_Number__c: mission.Purchase_Invoice_Number__c,
        Sage_Number__c: mission.Sage_Number__c,
    } as unknown as DataType));

    return NextResponse.json({count: result.length, jobs: result});
}
