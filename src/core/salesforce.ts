import { env } from "process";
import {revalidatePath, revalidateTag} from "next/cache";

export type SFRecord<T={}> = {
    attributes: {
        type: string;
        url: string;
    };
    
    [key: string]: any;
} & T;

export type SoqlReturn_t<T={}> = {
    totalSize: number;
    done: boolean;
    records: SFRecord<T>[];
}

export type SFAddress_t = {
    city: string | null;
country: string | null;
countryCode: string | null;
geocodeAccuracy: string | null;
latitude: number | null;
longitude: number | null;
postalCode: string | null;
state: string | null;
stateCode: string | null;
street: string | null;
}

class CSalesforce {

    private _loginpage = env.SF_LOGIN_URL;
    private _username = env.SF_USERNAME;
    private _password = env.SF_PASSWORD;
    private _clientid = env.SF_CLIENT_ID;
    private _clientsecret = env.SF_CLIENT_SECRET;
    private _token = env.SF_SECURITY_TOKEN;
    private _baseurl = env.NEXT_PUBLIC_SF_ACCOUNT_URL;
    private _version = env.SF_VERSION ?? "v58.0";

    private _access_token = '';

    static instance: CSalesforce | null = null;

    static getInstance() {
        if(!CSalesforce.instance) {
            CSalesforce.instance = new CSalesforce();
        }

        return CSalesforce.instance;
    }

    // Authenticates to Salesforce and stores the access token for future calls
    private async auth(): Promise<void> {

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("grant_type", "password");
        urlencoded.append("client_id", env.SF_CLIENT_ID ?? "");
        urlencoded.append("client_secret", encodeURIComponent(env.SF_CLIENT_SECRET ?? ""));
        urlencoded.append("username", env.SF_USERNAME ?? "");
        urlencoded.append("password", (env.SF_PASSWORD ?? "") + (env.SF_SECURITY_TOKEN ?? ""));

        var requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            //   redirect: 'follow'
            // cache: 'no-cache',
        };

        const r = await fetch(`${env.SF_LOGIN_URL}/services/oauth2/token`, requestOptions)
            .then(response => response.json())
            //   .then(result => console.log(result))
            .catch(error => console.log('error', error));

            // console.log(r);
            this._access_token = r.access_token;

            // console.log("Access token: " + this._access_token)
    }

    private async _internal_call(full_url: string, type:string = "POST", body: any = {}) {
        revalidatePath(full_url);
        //revalidateTag("salesforce")

        console.log("_internal_call: " + full_url)
        if(type == "PATCH") {
            console.log(body);
        }

        let result = await fetch(full_url, {
            method: type,
            headers: {
                'Authorization': `Bearer ${this._access_token}`,
                "Content-Type": 'application/json',
            },
            body: type != "GET" ? JSON.stringify(body) : undefined,
            //cache: "no-cache",
            next: {
                //revalidate: 0,
                tags: ["salesforce"]
            }
        }).then(async response => {
            const text = await response.text();

            if(type == "PATCH") {
                // console.log({response:text});
                return {};
            }

            return JSON.parse(text);
        })
        return result;
    }
    

    private async call(url: string, type:string = "POST", body: any = {}) {

        if(!this._access_token) {
            // console.log("No access token, getting one")
            await this.auth();
        }

        const full_url = `${env.SF_ACCOUNT_URL}/services/data/${this._version}/${url}`;

        let result = await this._internal_call(full_url, type, body)

        if(result[0]?.errorCode) {
            if(result[0].errorCode === "INVALID_SESSION_ID"){
                // console.log("Invalid session ID, getting a new one");
                await this.auth();
                result = await this._internal_call(full_url, type, body)
            }
            else {
                console.log("Error: " + result[0].errorCode + " - " + result[0].message);
            }
        }

        return result;
    }

    /**
     * Executes a SOQL query and returns the result.
     * The T type is the type of the record that is returned.
     */
    public async soql<T>(query: string): Promise<SoqlReturn_t<T>> {
        const x = await this.call(`query?q=${query}`, "GET");
        return x;
    }

    public async get<T={}>(type: string, id: string): Promise<SFRecord<T>> {
        const x = await this.call(`sobjects/${type}/${id}`, "GET");
        return x;
    }

    public async update<T={}>(type: string, id: string, data: T): Promise<SFRecord<T>> {
        // console.log("Updating " + type + " " + id)
        // console.log(data);
        const x = await this.call(`sobjects/${type}/${id}`, "PATCH", data);
        return x;
    }

    public async create<T={}>(type: string, data: T): Promise<SFRecord<T>> {
        const x = await this.call(`sobjects/${type}`, "POST", data);
        return x;
    }

    public async delete<T={}>(type: string, id: string): Promise<SFRecord<T>> {
        const x = await this.call(`sobjects/${type}/${id}`, "DELETE");
        return x;
    }

}

export const Salesforce = CSalesforce.getInstance();
