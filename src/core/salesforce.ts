
import * as dotenv from "dotenv";
dotenv.config();

const env = process.env;

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
    next: () => Promise<SoqlReturn_t<T>>;
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
    private _baseurl = env.SF_URL;
    private _version = env.SF_VERSION ?? "v58.0";

    private _access_token = '';

    // Authenticates to Salesforce and stores the access token for future calls
    private async auth(): Promise<void> {

        let myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        let urlencoded = new URLSearchParams();
        urlencoded.append("grant_type", "password");
        urlencoded.append("client_id", env.SF_CLIENT_ID ?? "");
        urlencoded.append("client_secret", encodeURIComponent(env.SF_CLIENT_SECRET ?? ""));
        urlencoded.append("username", env.SF_USERNAME ?? "");
        urlencoded.append("password", (env.SF_PASSWORD ?? "") + (env.SF_SECURITY_TOKEN ?? ""));

        console.log({urlencoded})

        let requestOptions: RequestInit = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
        };

        console.log("Authenticating to Salesforce")
        const r = await fetch(`${env.SF_LOGIN_URL}/services/oauth2/token`, requestOptions)
            .then(response => response.json())
            .then((r) => {
                console.log("Authentication successful", r)
                return r;
            })
            .catch(error => console.log('error', error));
        this._access_token = r.access_token;

        // console.log("Access token: " + this._access_token)
    }

    private async _internal_call(full_url: string, type:string = "POST", body: any = {}) {
        // console.log("Full URL: " + full_url)
        let result = await fetch(full_url, {
            method: type,
            headers: {
                'Authorization': `Bearer ${this._access_token}`,
                "Content-Type": 'application/json',
            },
            body: type != "GET" ? JSON.stringify(body) : undefined,
        }).then(async response => {
            const text = await response.text();
            
            if(type == "PATCH") {
                return "";
            }

            return JSON.parse(text);
        })
        return result;
    }


    private async call(url: string, type:string = "POST", body: any = {}, omitServiceData: boolean = false) {

        if(!this._access_token) {
            // console.log("No access token, getting one")
            await this.auth();
        }

        const full_url = omitServiceData
            ? `${env.SF_ACCOUNT_URL}${url}`
            : `${env.SF_ACCOUNT_URL}/services/data/${this._version}/${url}`;

        let result = await this._internal_call(full_url, type, body)

        if(result[0]?.errorCode) {
            if(result[0].errorCode === "INVALID_SESSION_ID"){
                await this.auth();
                result = await this._internal_call(full_url, type, body)
            }
            else {
                console.log("Error: " + result[0].errorCode + " - " + result[0].message);
            }
        }

        if(!result.done && type != "PATCH") {
            result.next = async () => {
                return await this.call(result.nextRecordsUrl, type, body, true);
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

    public async listObjects(): Promise<SoqlReturn_t> {
        const x = await this.call(`sobjects`, "GET");
        return x;
    }

    public async listFields(type: string): Promise<SoqlReturn_t> {
        const x = await this.call(`sobjects/${type}/describe`, "GET");
        return x;
    }

}

class EzSf {

    // Salesforce has two fields that can be used to determine when a record was last modified:
    // - SystemModstamp : this is the date when the record was last modified
    // - LastModifiedDate : this is the date when the record was last modified by a user
    private use_systemmodstamp = true;
    private LastModifiedDate = this.use_systemmodstamp ? "SystemModstamp" : "LastModifiedDate";

    public async getElementsModifiedAfter<T, U>(type: string, date: Date, additionalFields?: (keyof(U))[]): Promise<SoqlReturn_t<T & U & {date:string}>> {
        const x = await Salesforce.soql<T & U & {date:string}>(`
                    SELECT Id, Name, ${this.LastModifiedDate} ${additionalFields ? "," + additionalFields.join(",") : ""}
                    FROM ${type}
                    WHERE ${this.LastModifiedDate} > ${date.toISOString()}
                    ORDER BY ${this.LastModifiedDate} ASC
                `);

        // Change the key of the date field to be "date" instead of "SystemModstamp"
        x.records.forEach((r) => {
            r.date = this.use_systemmodstamp ? r.SystemModstamp : r.LastModifiedDate;
            delete r.SystemModstamp;
        })

        return x;
    }

}

export const Salesforce = new CSalesforce();
export const EzSalesforce = new EzSf();
