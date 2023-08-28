
import { SalesforceChabe } from "@/business/SalesforceChabe";
import {NextRequest, NextResponse} from "next/server";
import {revalidatePath} from "next/cache";

export const POST = async (request: NextRequest) => {

    const path = request.nextUrl.searchParams.get('path') || '/'
    revalidatePath(path)

    const sf_allhotels = await SalesforceChabe.getAllParentHotels();

    const r = NextResponse.json(sf_allhotels);
    r.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');

    return r;
    
}