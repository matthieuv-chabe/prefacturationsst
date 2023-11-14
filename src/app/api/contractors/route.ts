import {NextRequest, NextResponse} from "next/server";
import {Salesforce} from "@/core/salesforce";
import {SalesforceChabe} from "@/business/SalesforceChabe";

export async function GET(req: NextRequest) {

    try { await Salesforce.get("Account", "i_dont_exist") } catch (e) { console.log(e) }

    const r = await Salesforce.soql<{Id:string, Partner_ERP_ID__c:string}[]>(
        "SELECT Id, Partner_ERP_ID__c FROM Job__c WHERE Start_Date_Time__c >= 2022-12-31T23:00:00.0000 AND End_Date_Time__c <= 2022-12-31T23:00:00.000Z AND Partner_ERP_ID__c <> '0' AND Partner_ERP_ID__c <> '1' AND Partner_ERP_ID__c <> 'null' AND Transmitted_To_Partner__c = ''"
    )

    const partner_names = await SalesforceChabe.getPartnerNames(r.records.map(e => e.Partner_ERP_ID__c))

  return NextResponse.json(partner_names)
}
