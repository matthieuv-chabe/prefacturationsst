import { SalesforceChabe } from "@/business/SalesforceChabe"

export default async function X() {

    let full = ""

    full += await SalesforceChabe.CreateConciergeForHotel("a", "b", "0016900002bvtS6AAI");
    console.log({full})

    return (<>
    
    {JSON.stringify(full)}
    
    </>)
}
