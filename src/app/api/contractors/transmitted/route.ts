import {NextRequest, NextResponse} from "next/server";
import {Salesforce} from "@/core/salesforce";
import {SalesforceChabe} from "@/business/SalesforceChabe";

export async function POST(req: NextRequest) {

    // try { await Salesforce.get("Account", "i_dont_exist") } catch (e) { console.log(e) }

    const body = await req.json()
    const start = new Date(body.start)
    const end = new Date(body.end)

    if(!start || !end) return NextResponse.error()

    console.log({s:start.toISOString(), e:end.toISOString()})

    const r = await Salesforce.soql<{Id:string, Partner_ERP_ID__c:string}[]>(
        `SELECT Id, Partner_ERP_ID__c FROM Job__c WHERE Start_Date_Time__c >= ${start.toISOString()} AND End_Date_Time__c <= ${end.toISOString()} AND Partner_ERP_ID__c <> '0' AND Partner_ERP_ID__c <> '1' AND Partner_ERP_ID__c <> 'null' AND Transmitted_To_Partner__c != '' AND Sage_Number__c = null`
    )

    const partner_names = await SalesforceChabe.getPartnerNames(r.records.map(e => e.Partner_ERP_ID__c))

  return NextResponse.json(partner_names)
}
