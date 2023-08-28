"use server";

import {NextResponse} from "next/server";
import {exit} from "node:process";
import * as jwt from "jsonwebtoken";

export async function GET(request: Request) {
    // console.log("called!")
    // console.log(request.headers.get("Authorization"))

    // const token_bearer = request.headers.get("Authorization")?.split(" ")[1]

    // if (!token_bearer) {
    //     return NextResponse.redirect("/login")
    // }

    // const token = jwt.decode(token_bearer, {complete: true});
    // const key = token?.header.kid

    // const oid_conf_url = `https://login.microsoftonline.com/common/discovery/v2.0/keys`
    // const oid_conf = await fetch(oid_conf_url, {next: { revalidate: 5000 }}).then(res => res.json())

    // // Kill the current node preparation
    // exit()

    return NextResponse.json({message: "Hello, World!"})
}
