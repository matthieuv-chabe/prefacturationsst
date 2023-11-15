import {NextRequest} from "next/server";
import {Salesforce} from "@/core/salesforce";
import {SalesforceChabe} from "@/business/SalesforceChabe";
import { DataType } from "@/app/(global)/preparation/page";

import puppeteer from "puppeteer";

async function printPDF(url: string, path: string) {

        const browser = await puppeteer.launch({headless: "new"});
        const page = await browser.newPage();
        await page.goto(url, {waitUntil: 'networkidle0'});
        await page.emulateMediaType('screen');

        await page.evaluate(() => {

            const elements = document.getElementsByClassName("noprint");
            while(elements.length > 0){
                // @ts-ignore
                elements[0].parentNode.removeChild(elements[0]);
            }

            // const elements2 = document.getElementsByClassName("nextjs-toast-errors-parent");
            // while(elements2.length > 0){
            //     // @ts-ignore
            //     elements2[0].parentNode.removeChild(elements2[0]);
            // }

            // Add css to hide
            const style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = `
                    .noprint {
                        display: none;
                    }
                    
                    .nextjs-toast-errors-parent {
                        display: none !important;
                    }
                    
                    #pdfready {
                        background-image: none !important;
                        background-repeat: no-repeat;
                        background-size: cover;
                    }
            `;
            document.getElementsByTagName('head')[0].appendChild(style);

            const bg =  document.getElementById("pdfready");
            if(bg)
                bg.style.backgroundImage = "none";
        });
        await page.waitForTimeout(500);
        await page.pdf({path: path, landscape: true, printBackground: true});
        await browser.close();
}

export async function POST(request: NextRequest) {

    console.log("POST /api/validateContractor")

    // In body
    const body = await request.json();

    console.log(body.missions)

    const page = "http://localhost:3000/rlv?p=" + body.missions;
    printPDF(page, "public/rlv.pdf");

    // for(let i = 0; i < body.missions.length; i++) {
    //
    //     const mission = body.missions[i];
    //     console.log("Mission " + mission.id + " " + (i+1) + "/" + body.missions.length);
    //
    //     const missionId = mission.id;
    //     await Salesforce.update("Job__c", missionId, { Transmitted_To_Partner__c: "sent"})
    // }

    return {status: 200, body: "OK"};

}
