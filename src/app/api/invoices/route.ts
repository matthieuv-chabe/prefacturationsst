import {NextRequest} from "next/server";

export async function POST(request: NextRequest) {

    console.log("POST /api/invoices")

    // In body
    const bodystr = await request.text();
    const body: {from: string, to: string} = JSON.parse(bodystr);
    const {from, to} = body;

}