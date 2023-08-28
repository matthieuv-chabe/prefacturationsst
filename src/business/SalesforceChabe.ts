import {Salesforce, SFAddress_t} from "@/core/salesforce";

type SFJobInformation = {
	Id: string;
	Start_Date_Time__c: string;
	End_Date_Time__c: string;
	ServiceType_ERP_ID__c: string;
	Purchase_Price__c: number;
	Purchase_Invoice_Number__c: string;
	Pick_Up_Location__c: string;
	Drop_Off_Location__c: string;
	Partner_ERP_ID__c: string;
	OrderedVehicleType_ERP_ID__c: string;
	Status_ERP_ID__c: string;
	Client_Salesforce_Code__c: string;
	COM_ID__c: string;
}

class CSalesforceChabe {

	public async getMissionsBetweenDates(
		dateBegin: Date,
		dateEnd: Date
	): Promise<SFJobInformation[]> {
		const query = `SELECT Id, Start_Date_Time__c, End_Date_Time__c, ServiceType_ERP_ID__c, Purchase_Price__c,
								Purchase_Invoice_Number__c, Pick_Up_Location__c, Drop_Off_Location__c, Partner_ERP_ID__c,
								OrderedVehicleType_ERP_ID__c, Status_ERP_ID__c, COM_ID__c, Client_Salesforce_Code__c 
								FROM Job__c 
								WHERE Start_Date_Time__c >= ${dateBegin.toISOString()}
								AND End_Date_Time__c <= ${dateEnd.toISOString()}
								AND Partner_ERP_ID__c <> '0'
								AND Partner_ERP_ID__c <> '1'
								AND Partner_ERP_ID__c <> null
								`;

		const qresult = await Salesforce.soql(query);
		return qresult.records as unknown as SFJobInformation[];
	}

	public async getPartnerNames(ids: string[]) : Promise<{id:string, name:string}[]> {
		const query = `SELECT PAR_ID__c, Name FROM Partenaire__c WHERE PAR_ID__c IN ('${ids.join("','")}')`;
		console.log({query})
		const qresult = await Salesforce.soql(query);
		return qresult.records.map(e => ({id: e.PAR_ID__c, name: e.Name}));
	}

}

export const SalesforceChabe = new CSalesforceChabe();
