import { NextRequest, NextResponse } from "next/server";
import { Salesforce } from "@/core/salesforce";

import puppeteer from "puppeteer";
import { mailService } from "@/core/MailService";

import mailchimpTx from "@mailchimp/mailchimp_transactional"

const mc = mailchimpTx("md-4NJETXRIdOzY8UlTbTqUKg")
import * as fs from "fs"

// @ts-ignore
import {encode, decode} from 'uint8-to-base64';

async function printPDF(url: string, path: string, missions: any[]) {

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');

    await page.evaluate(() => {

        const elements = document.getElementsByClassName("noprint");
        while (elements.length > 0) {
            // @ts-ignore
            elements[0].parentNode.removeChild(elements[0]);
        }

        const elements2 = document.getElementsByClassName("nextjs-toast-errors-parent");
        while (elements2.length > 0) {
            // @ts-ignore
            elements2[0].parentNode.removeChild(elements2[0]);
        }

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

        const bg = document.getElementById("pdfready");
        if (bg)
            bg.style.backgroundImage = "none";
    });
    await page.waitForTimeout(500);

    let data: any = {};
    // @ts-ignore
    // data.missions = selected;
    data.missions = missions.missions;

    // Send data to the target window
    await new Promise((resolve) => setTimeout(resolve, 3000));
    // @ts-ignore
    await page.evaluate(async (data) => {
        // @ts-ignore
        try {
            window.postMessage(data, "*");
        }
        catch (e) {
            console.log(e);
        }
        await new Promise((resolve) => setTimeout(resolve, 4000));
    }, { ...data, from: data.missions[0].date_start, to: data.missions[data.missions.length - 1].date_end });


    await page.pdf({ path: path, landscape: true, printBackground: true });
    await browser.close();
}

export async function POST(request: NextRequest) {

    console.log("POST /api/validateContractor")

    // In body
    const body = await request.json();

    // console.log(body.missions)

    const page = "http://localhost:3000/rlv?p=" + btoa(`{"from":"2023-12-01","to":"2024-01-01","missions":[]}`);
    await printPDF(page, "public/rlv.pdf", JSON.parse(body.missions));

    const ms = JSON.parse(body.missions).missions
    const contractor = ms[0].partner_id.split('|')[1]
    const endMonth = new Date(ms[ms.length - 1].date_end).toLocaleString('default', { month: 'long' });

    // console.log(JSON.stringify(body))
    // console.log({contractor, endMonth})

    await mc.messages.send({
        message: {
            subject: `Relevé de missions ${contractor}`,
            to: [
                {
                    email: "matthieu.vancayzeele@chabe.com",
                    type: "to"
                },
                {
                    email: "sst_a_envoyer@chabe.fr",
                    type: "to"
                }
            ],
            from_email: "prefac_sst@sendmail_tmp.chabe.com",
            attachments: [
                {
                    type: "application/pdf",
                    name: `releve_${contractor}_${endMonth}.pdf`,
                    content: encode(fs.readFileSync("public/rlv.pdf"))
                }
            ]
        }
    })

    // mailService.sendMail(
    //     "factures-artisans@chabe.fr",
    //     "sst_a_envoyer@chabe.fr",
    //     //"matthieu.vancayzeele@chabe.fr",
    //     "Relevé de missions Chabé",
    //     [
    //         { path: "public/rlv.pdf", filename: `releve_${contractor}_${endMonth}.pdf`, contentType: "application/pdf" }
    //     ],
    //     "Bonjour,\n\n" +
    //     "Veuillez trouver ci-joint le relevé de missions Chabé.\n\n" +
    //     "Cordialement,\n" +
    //     "L'équipe Chabé"
    // );

    const m = JSON.parse(body.missions) as { missions: any[] };

    console.log("=====================================")
    console.log("=====================================")
    console.log("=====================================")
    console.log("=====================================")
    console.log("=====================================")
    console.log("=====================================")
    console.log("=====================================")
    console.log("=====================================")
    console.log("=====================================")
    console.log("=====================================")
    console.log("=====================================")
    console.log("=====================================")
    console.log(m)

    for (let i = 0; i < m.missions.length; i++) {

        const mission = m.missions[i];
        console.log("Mission " + mission.id + " " + (i + 1) + "/" + m.missions.length);

        const missionId = mission.id;
        await Salesforce.update("Job__c", missionId, { Transmitted_To_Partner__c: "sent" })
    }

    return NextResponse.json("OK");
    // return {status: 200, body: "OK"};

}
