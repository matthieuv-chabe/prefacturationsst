
import { SalesforceChabe } from "@/business/SalesforceChabe";
import { useSearchParams } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { URLSearchParams } from "url";

export async function GET(request: NextRequest) {

    const sp = new URLSearchParams(request.nextUrl.search);
    const hid = sp.get('hotelId');

    const sf_allhotels = await SalesforceChabe.getConciergesForHotel(hid!);
    return NextResponse.json(sf_allhotels);
    
}