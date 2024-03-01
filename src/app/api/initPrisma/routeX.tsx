import {NextRequest, NextResponse} from "next/server";
import {Prisma, PrismaClient} from "@prisma/client";
import {EzSalesforce} from "@/core/salesforce";

const prisma = new PrismaClient();
let instance: any = null;

let last_retrieve_date = new Date("2023-01-01");
let set_interval_paused = false;

async function HandleJobs(jobs: any[]) {
    console.log(`Handling ${jobs.length} jobs...`);
    // await prisma.job.createMany({
    //     data: jobs.map((job) => {
    //         return {
    //             id: job.id,
    //             clientid: job.Client_Salesforce_Code__c,
    //             comid: job.COM_ID__c,
    //             pickup_location: job.Pick_Up_Location__c,
    //             dropoff_location: job.Drop_Off_Location__c,
    //         }
    //     }).filter((job,index) => (index < 100))
    // })

    const escape_quotes = (str: string) => {
        return str?str.replace(/'/g, "''"):"";
    }

    const transform = (job: any) => {
        return `('${job.Id}','${job.Client_Salesforce_Code__c}','${job.COM_ID__c}','${escape_quotes(job.Pick_Up_Location__c)}','${escape_quotes(job.Drop_Off_Location__c)}')`;
    }

    // Group by 1000
    let i,j,temparray,chunk = 1000;
    for (i=0,j=jobs.length; i<j; i+=chunk) {
        temparray = jobs.slice(i,i+chunk);
        // console.log(`// INSERT INTO [dbo].[job] (clientid,folderid,pickup_location,dropoff_location) VALUES ${temparray.map(transform).join(",")};`);
        await prisma.$executeRawUnsafe(`INSERT INTO [dbo].[job] (id,clientid,folderid,pickup_location,dropoff_location) VALUES ${temparray.map(transform).join(",")};`);
    }

    // console.log(`INSERT INTO [dbo].[job] (clientid,comid,pickup_location,dropoff_location) VALUES ${jobs.map(transform).join(",")};`);
    // await prisma.$executeRawUnsafe(`INSERT INTO [dbo].[job] (id,clientid,comid,pickup_location,dropoff_location) VALUES ${jobs.map(transform).join(",")};`);

    console.log(`Done handling ${jobs.length} jobs...`);
}

export async function GET(request: NextRequest) {

    if(instance) return NextResponse.json({result:"already initialized"});

    instance = setInterval(async () => {

        if(set_interval_paused) return;

        set_interval_paused = true;
        EzSalesforce.getElementsModifiedAfter("Job__c", last_retrieve_date, [
            "Client_Salesforce_Code__c",
            "COM_ID__c",
            "Pick_Up_Location__c",
            "Drop_Off_Location__c"
        ]).then(async (jobs) => {
            await HandleJobs(jobs.records);
            last_retrieve_date = new Date(jobs.records[jobs.records.length-1].date); // Date is last modified date
            console.log(`Intermediate Done until ${last_retrieve_date}`)

            while(!jobs.done) {
                console.log(`Fetching next ${jobs.records.length} jobs...`);
                jobs = await jobs.next();
                await HandleJobs(jobs.records);

                last_retrieve_date = new Date(jobs.records[jobs.records.length-1].date); // Date is last modified date
                console.log(`Intermediate Done until ${last_retrieve_date}`)
            }

            console.log(`Done until ${last_retrieve_date}`)
            last_retrieve_date = new Date();
            set_interval_paused = false;
        });

        clearInterval(instance);


    }, 1);

    return NextResponse.json({result:"ok"});
}
