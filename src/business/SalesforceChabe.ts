import {Salesforce, SFAddress_t} from "@/core/salesforce";
import SQLQueryBuilder from "@/core/SqlQueryBuilder/SQLQueryBuilder";

type SFJobInformation = {
	Id: string;
	Start_Date_Time__c: string;
	End_Date_Time__c: string;
	ServiceType_ERP_ID__c: string;
	Purchase_Price__c: number;
	Calculated_Incl_VAT_Price__c: number; // Selling price
	Purchase_Invoice_Number__c: string;
	Pick_Up_Location__c: string;
	Drop_Off_Location__c: string;
	Partner_ERP_ID__c: string;
	OrderedVehicleType_ERP_ID__c: string;
	Status_ERP_ID__c: string;
	Client_Salesforce_Code__c: string;
	COM_ID__c: string;
	MIS_NUMERO__c: string;
	Chauffeur_ERP_ID__c: string;
	Transmitted_To_Partner__c: string;
	Sage_Number__c: string;
}

type SFChauffeur = {
	Id: string;
	CHU_NOM__c: string;
	CHU_PRENOM__c: string;
}

class CSalesforceChabe {

	public async getMissionsBetweenDates(
		dateBegin: Date,
		dateEnd: Date,
		partnerId: string = "0",
	): Promise<{count: number, jobs: SFJobInformation[]}>
	{
		const query = `SELECT Id, Start_Date_Time__c, End_Date_Time__c, ServiceType_ERP_ID__c,MIS_NUMERO__c, Purchase_Price__c, Calculated_Incl_VAT_Price__c, Purchase_Invoice_Number__c, Pick_Up_Location__c, Drop_Off_Location__c, Partner_ERP_ID__c, OrderedVehicleType_ERP_ID__c, Status_ERP_ID__c, Client_Salesforce_Code__c, COM_ID__c, Chauffeur_ERP_ID__c, Transmitted_To_Partner__c, Sage_Number__c FROM Job__c WHERE Start_Date_Time__c >= ${dateBegin.toISOString()} AND End_Date_Time__c <= ${dateEnd.toISOString()} AND Partner_ERP_ID__c = '${partnerId}' AND Dispatch__c = 'chabe'`;
		const qresult = await Salesforce.soql(query);
		return { count: qresult.totalSize, jobs: qresult.records as unknown as SFJobInformation[]};
	}

	public async getSentMissionsBetweenDates(
		dateBegin: Date,
		dateEnd: Date,
		partnerId: string = "0",
	): Promise<{count: number, jobs: SFJobInformation[]}>
	{
		const query = `SELECT Id, Start_Date_Time__c, End_Date_Time__c, ServiceType_ERP_ID__c, Purchase_Price__c, Calculated_Incl_VAT_Price__c, Purchase_Invoice_Number__c, Pick_Up_Location__c, Drop_Off_Location__c, Partner_ERP_ID__c, OrderedVehicleType_ERP_ID__c, Status_ERP_ID__c, Client_Salesforce_Code__c, COM_ID__c, Chauffeur_ERP_ID__c, Transmitted_To_Partner__c, Sage_Number__c FROM Job__c WHERE Start_Date_Time__c >= ${dateBegin.toISOString()} AND End_Date_Time__c <= ${dateEnd.toISOString()} AND Partner_ERP_ID__c = '${partnerId}' AND Transmitted_To_Partner__c = 'sent' AND Sage_Number__c = null AND Dispatch__c = 'chabe'`;
		const qresult = await Salesforce.soql(query);
		return { count: qresult.totalSize, jobs: qresult.records as unknown as SFJobInformation[]};
	}

	public async getFinishedMissionsBetweenDates(
		dateBegin: Date,
		dateEnd: Date,
		partnerId: string = "0",
	): Promise<{count: number, jobs: SFJobInformation[]}>
	{
		const query = `SELECT Id, Start_Date_Time__c, End_Date_Time__c, ServiceType_ERP_ID__c, Purchase_Price__c, Calculated_Incl_VAT_Price__c, Purchase_Invoice_Number__c, Pick_Up_Location__c, Drop_Off_Location__c, Partner_ERP_ID__c, OrderedVehicleType_ERP_ID__c, Status_ERP_ID__c, Client_Salesforce_Code__c, COM_ID__c, Chauffeur_ERP_ID__c, Transmitted_To_Partner__c, Sage_Number__c FROM Job__c WHERE Start_Date_Time__c >= ${dateBegin.toISOString()} AND End_Date_Time__c <= ${dateEnd.toISOString()} AND Partner_ERP_ID__c = '${partnerId}' AND Transmitted_To_Partner__c = 'sent' AND Sage_Number__c != '' AND Sage_Number__c != null AND Dispatch__c = 'chabe'`;
		const qresult = await Salesforce.soql(query);
		return { count: qresult.totalSize, jobs: qresult.records as unknown as SFJobInformation[]};
	}

	public async getPartnerNames(ids: string[]) : Promise<{id:string, name:string}[]> {
		const query = `SELECT PAR_ID__c, Name FROM Partenaire__c WHERE PAR_ID__c IN ('${ids.join("','")}')`;
		console.log({query})
		const qresult = await Salesforce.soql(query);
		return qresult.records.map(e => ({id: e.PAR_ID__c, name: e.Name}));
	}

	public async getChauffeurNames(ids: string[]) : Promise<{id:string, name:string}[]> {
		const query = `SELECT CHU_ID__c, CHU_NOM__c, CHU_PRENOM__c FROM Chauffeur__c WHERE CHU_ID__c IN ('${ids.join("','")}')`;
		console.log({query})
		const qresult = await Salesforce.soql(query);
		return qresult.records.map(e => ({id: e.CHU_ID__c, name: e.CHU_PRENOM__c + " " + e.CHU_NOM__c}));
	}

	public async get_all_missions_for_contractor(contractorId: string, from: Date, to: Date) : Promise<SFJobInformation[]> {
		const query = `SELECT Id FROM Job__c WHERE Partner_ERP_ID__c = '${contractorId}' AND Start_Date_Time__c >= ${from.toISOString()} AND End_Date_Time__c <= ${to.toISOString()} AND Dispatch__c = 'chabe'`;
		const qresult = await Salesforce.soql(query);
		return qresult.records as unknown as SFJobInformation[];
	}

}

export const SalesforceChabe = new CSalesforceChabe();
