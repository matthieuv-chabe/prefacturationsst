import {NextRequest} from "next/server";
import {Salesforce} from "@/core/salesforce";
import {SalesforceChabe} from "@/business/SalesforceChabe";
import { DataType } from "@/app/(global)/preparation/page";

export async function POST(request: NextRequest) {

    console.log("POST /api/validateContractor")

    // In body
    const body = await request.json() as {missions:DataType[]};

    console.log({body})

    for(let i = 0; i < body.missions.length; i++) {

        const mission = body.missions[i];
        console.log("Mission " + mission.id + " " + (i+1) + "/" + body.missions.length);

        const missionId = mission.id;
        await Salesforce.update("Job__c", missionId, { Transmitted_To_Partner__c: "sent"})
    }

    return {status: 200, body: "OK"};

}
