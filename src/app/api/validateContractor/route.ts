import {NextRequest} from "next/server";
import {Salesforce} from "@/core/salesforce";
import {SalesforceChabe} from "@/business/SalesforceChabe";

export async function POST(request: NextRequest) {

    console.log("POST /api/validateContractor")

    // In body
    const bodystr = await request.text();
    const body: {contractorId: string, from: string, to: string, shouldSendEmail: string} = JSON.parse(bodystr);
    const {contractorId, from, to, shouldSendEmail} = body;

    console.log({contractorId, from, to, shouldSendEmail})

    if(!contractorId) return {status: 400, body: "Missing contractorId"};
    if(!from) return {status: 400, body: "Missing from"};
    if(!to) return {status: 400, body: "Missing to"};
    if(!shouldSendEmail) return {status: 400, body: "Missing shouldSendEmail"};

    const all_missions_for_contractor =
        await SalesforceChabe.get_all_missions_for_contractor(contractorId, new Date(from), new Date(to));

    console.log({count: all_missions_for_contractor.length})

    for(let i = 0; i < all_missions_for_contractor.length; i++) {

        console.log("Mission " + all_missions_for_contractor[i].Id + " " + (i+1) + "/" + all_missions_for_contractor.length);

        const mission = all_missions_for_contractor[i];
        const missionId = mission.Id;
        const missionStatus = mission.Status_ERP_ID__c;
        if(missionStatus === "99" || true) {
            await Salesforce.update("Job__c", missionId, {
                Transmitted_To_Partner__c: "sent"
            });
        }
    }

    return {status: 200, body: "OK"};

}
