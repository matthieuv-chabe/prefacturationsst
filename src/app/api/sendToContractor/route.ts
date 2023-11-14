import {NextRequest} from "next/server";
import {Salesforce} from "@/core/salesforce";
import {SalesforceChabe} from "@/business/SalesforceChabe";
import { DataType } from "@/app/(global)/preparation/page";

export async function POST(request: NextRequest) {

    console.log("POST /api/validateContractor")

    // In body
    const body = await request.json() as DataType;

    // for(let i = 0; i < all_missions_for_contractor.length; i++) {

    //     console.log("Mission " + all_missions_for_contractor[i].Id + " " + (i+1) + "/" + all_missions_for_contractor.length);

    //     const mission = all_missions_for_contractor[i];
    //     const missionId = mission.Id;
    //     const missionStatus = mission.Status_ERP_ID__c;
    //     if(missionStatus === "99" || true) {
    //         await Salesforce.update("Job__c", missionId, {
    //             Transmitted_To_Partner__c: "sent"
    //         });
    //     }
    // }

    return {status: 200, body: "OK"};

}
