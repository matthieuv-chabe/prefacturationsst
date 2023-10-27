import {NextRequest} from "next/server";
import {Salesforce} from "@/core/salesforce";

export async function POST(request: NextRequest) {

    console.log("POST /api/validateContractor")

    // In body
    const bodystr = await request.text();
    const body: { missionIds: string[], invoice: string, sage: string } = JSON.parse(bodystr);
    const {missionIds, invoice, sage} = body;

    console.log("missionIds", missionIds)
    console.log("invoice", invoice)
    console.log("sage", sage)

    for(let i = 0; i < missionIds.length; i++) {
        const missionId = missionIds[i];

        await Salesforce.update("Job__c", missionId, {
            Purchase_Invoice_Number__c: invoice,
            Sage_Number__c: sage
        })

    }

    return new Response(JSON.stringify({}));
}