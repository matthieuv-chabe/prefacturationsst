
import { SalesforceChabe } from "@/business/SalesforceChabe";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

    const sf_allhotels = await SalesforceChabe.GetAllParentHotelsBasic();
    return NextResponse.json(sf_allhotels);
    
}