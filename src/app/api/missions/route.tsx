

import { DataType } from "@/app/(global)/preparation/page";
import { SalesforceChabe } from "@/business/SalesforceChabe";
import { NextRequest, NextResponse } from "next/server";

const SafeStr = (string: string | null): string => {
    if(!string) return "";

    // If any character other than alphanumeric or space or accents, replace with space
    return string.replace(/[^a-zA-Z0-9\u00C0-\u017F ]/g, " ");
}

const SafeCommaArray = (string: string | null): string[] => {
    if(!string) return [];

    // If any character other than alphanumeric or space or accents, replace with space
    return string.split(",").map((x) => SafeStr(x.trim()));
}

// export async function GETX(request: NextRequest) {
//
//     const search = request.nextUrl.searchParams;
//
//     // Filters
//     const date_start = SafeStr(search.get("date_start"))
//     const date_end = SafeStr(search.get("date_end"))
//     const folder_id = SafeStr(search.get("folder_id"))
//     const vehicle_types = SafeCommaArray(search.get("vehicle_types"))
//     const service_types = SafeCommaArray(search.get("service_types"))
//     const clients = SafeCommaArray(search.get("clients"))
//     const partners = SafeCommaArray(search.get("partners"))
//     const status = SafeCommaArray(search.get("status"))
//
//     const limit = search.get("limit") || "100";
//     const offset = search.get("offset") || "0";
//
//     if(limit && isNaN(parseInt(limit))) return NextResponse.json({"error": "limit is not a number"});
//     if(offset && isNaN(parseInt(offset))) return NextResponse.json({"error": "offset is not a number"});
//     if(limit && parseInt(limit) > 1000) return NextResponse.json({"error": "limit is too high"});
//     // if(offset && parseInt(offset) > 1000) return NextResponse.json({"error": "offset is too high"});
//
//     if(!date_start || !date_end) return NextResponse.json({"error": "missing date_start or date_end"});
//
//     const sf = await SalesforceChabe.getMissionsBetweenDates(
//         new Date(date_start), new Date(date_end),
//         limit ? parseInt(limit) : undefined,
//         offset ? parseInt(offset) : undefined,
//         folder_id,
//         vehicle_types,
//         service_types,
//         clients,
//         partners,
//         status
//     );
//     //return NextResponse.json(sf);
//
//     const all_partner_ids = new Set<string>();
//     for(const mission of sf.jobs) {
//         all_partner_ids.add(mission.Partner_ERP_ID__c);
//     }
//
//     const all_chauf_ids = new Set<string>();
//     for(const mission of sf.jobs) {
//         all_chauf_ids.add(mission.Chauffeur_ERP_ID__c);
//     };
//
//
//     const partner_names = await SalesforceChabe.getPartnerNames(Array.from(all_partner_ids));
//     const chauf_names = await SalesforceChabe.getChauffeurNames(Array.from(all_chauf_ids));
//
//     const mapped = sf.jobs.map((mission) => {
//         return {
//             date_start: mission.Start_Date_Time__c,
//             date_end: mission.End_Date_Time__c,
//             folder_id: mission.COM_ID__c,
//             vehicle_type: mission.OrderedVehicleType_ERP_ID__c,
//             service_type: mission.ServiceType_ERP_ID__c,
//             partner_id: mission.Partner_ERP_ID__c + "|" + partner_names.find((x) => x.id == mission.Partner_ERP_ID__c)?.name,
//             chauffeur_name: chauf_names.find((x) => x.id == mission.Chauffeur_ERP_ID__c)?.name,
//             pickup_address: mission.Pick_Up_Location__c,
//             dropoff_address: mission.Drop_Off_Location__c,
//             buying_price: mission.Purchase_Price__c,
//             selling_price: 4224,
//             profit: ""+(mission.Purchase_Price__c - 4224),
//             status: mission.Status_ERP_ID__c,
//             sent_to_supplier: mission.Purchase_Invoice_Number__c,
//             client: mission.Client_Salesforce_Code__c,
//         } as unknown as DataType;
//     });
//
//     return NextResponse.json({count: sf.count, jobs: mapped});
// }

export async function POST(request: NextRequest) {

    // const search = request.nextUrl.searchParams;
    // const date_start = SafeStr(search.get("date_start"))
    // const date_end = SafeStr(search.get("date_end"))
    // const partner = SafeStr(search.get("partner"))
    
    const body = await request.json();
    const date_start = body.start;
    const date_end = body.end;
    const partner = body.partner;

    const nextDay = new Date(new Date(date_end).getTime() + 24 * 60 * 60 * 1000);

    console.log({date_start, date_end, partner})

    const sf = await SalesforceChabe.getMissionsBetweenDates(
        new Date(date_start), new Date(nextDay), partner
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
        mission_id: mission.MIS_NUMERO__c,
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
    } as unknown as DataType));

    return NextResponse.json({count: result.length, jobs: result});


    // const mapped = sf.jobs.map((mission) => {
// 
    //     const partner_name = partner_names.find((x) => x.id == mission.Partner_ERP_ID__c)?.name;
    //     const chauf_name = chauf_names.find((x) => x.id == mission.Chauffeur_ERP_ID__c)?.name;

    //     console.log({mission})
    //     console.log({partner_name})
    //     console.log({chauf_name})
    //     console.log("-------------------")

    //     return {
    //         id: mission.Id,
    //         date_start: mission.Start_Date_Time__c,
    //         date_end: mission.End_Date_Time__c,
    //         folder_id: mission.COM_ID__c,
    //         vehicle_type: mission.OrderedVehicleType_ERP_ID__c,
    //         service_type: mission.ServiceType_ERP_ID__c,
    //         partner_id: mission.Partner_ERP_ID__c + "|" + partner_name,
    //         chauffeur_name: mission.Chauffeur_ERP_ID__c + "|" + chauf_name,
    //         pickup_address: mission.Pick_Up_Location__c,
    //         dropoff_address: mission.Drop_Off_Location__c,
    //         buying_price: mission.Purchase_Price__c,
    //         selling_price: mission.Calculated_Incl_VAT_Price__c || 0,
    //         profit: ""+ (mission.Calculated_Incl_VAT_Price__c - mission.Purchase_Price__c),
    //         status: mission.Status_ERP_ID__c,
    //         sent_to_supplier: mission.Transmitted_To_Partner__c,
    //         client: mission.Client_Salesforce_Code__c,
    //         code_sage: mission.Sage_Number__c,
    //     } as unknown as DataType;
    // });

    // return NextResponse.json({count: sf.count, jobs: mapped});
}
