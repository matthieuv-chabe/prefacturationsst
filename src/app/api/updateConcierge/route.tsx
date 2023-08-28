import { SalesforceChabe } from "@/business/SalesforceChabe";
import { NextRequest, NextResponse } from "next/server";

export type ConciergeUpdateQuery = {
    hotelId: string;
    concierges: {
        id: string;
        repartition: number;
    }[]
}

export async function POST(request: NextRequest) {

    const body = await request.text();

    if(!body) {
        return NextResponse.json({"error": "missing parameters"}, {status: 400});
    }
    const data: ConciergeUpdateQuery = JSON.parse(body);

    // Check sum is 100
    const sum = data.concierges.reduce((acc, c) => acc + c.repartition, 0);
    if(sum !== 100) {
        return NextResponse.json({"error": "sum is not 100"}, {status: 400});
    }

    // Check repartitions are between 0 and 100
    const invalidRepartitions = data.concierges.filter((c) => c.repartition < 0 || c.repartition > 100);
    if(invalidRepartitions.length > 0) {
        return NextResponse.json({"error": "repartition is not between 0 and 100"}, {status: 400});
    }

    await Promise.all(data.concierges.map((c) => SalesforceChabe.updateConciergePercent(c.id, c.repartition)));

    return NextResponse.json({"success": true});
}