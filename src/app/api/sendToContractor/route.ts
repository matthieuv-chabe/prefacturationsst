import {NextRequest} from "next/server";
import {Salesforce} from "@/core/salesforce";
import {SalesforceChabe} from "@/business/SalesforceChabe";
import { DataType } from "@/app/(global)/preparation/page";

export async function POST(request: NextRequest) {

    console.log("POST /api/validateContractor")

    // In body
    const body = await request.json() as DataType[];

    for(let i = 0; i < body.length; i++) {

        const mission = body[i];
        const missionId = mission.id;
        await Salesforce.update("Job__c", missionId, { Transmitted_To_Partner__c: "sent"})
    }

    return {status: 200, body: "OK"};

}
