import {NextRequest, NextResponse} from "next/server";
import {Prisma, PrismaClient} from "@prisma/client";
import {EzSalesforce, Salesforce} from "@/core/salesforce";

export async function GET(request: NextRequest) {

    Salesforce.listFields("Job__c").then((fields) => {
        console.log(fields);
    });

    return NextResponse.json({result:"ok"});
}
