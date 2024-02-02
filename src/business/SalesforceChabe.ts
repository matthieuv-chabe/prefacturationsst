import { Salesforce, SFAddress_t } from "@/core/salesforce";
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
	): Promise<{ count: number, jobs: SFJobInformation[] }> {
		const query = `SELECT Id, Start_Date_Time__c, End_Date_Time__c, ServiceType_ERP_ID__c,MIS_NUMERO__c, Purchase_Price__c, Calculated_Incl_VAT_Price__c, Purchase_Invoice_Number__c, Pick_Up_Location__c, Drop_Off_Location__c, Partner_ERP_ID__c, OrderedVehicleType_ERP_ID__c, Status_ERP_ID__c, Client_Salesforce_Code__c, COM_ID__c, Chauffeur_ERP_ID__c, Transmitted_To_Partner__c, Sage_Number__c FROM Job__c WHERE Start_Date_Time__c >= ${dateBegin.toISOString()} AND Start_Date_Time__c <= ${dateEnd.toISOString()} AND Partner_ERP_ID__c = '${partnerId}' AND Dispatch__c = 'chabe' AND Transmitted_To_Partner__c <> 'sent' AND Transmitted_To_Partner__c <> 'ignored'`;
		console.log("gmbd: ", query)
		const qresult = await Salesforce.soql(query);
		console.log("gmbd2: ", qresult)
		return { count: qresult.totalSize, jobs: qresult.records as unknown as SFJobInformation[] };
	}

	public async getMissionsBetweenDatesAllPartners(
		dateBegin: Date,
		dateEnd: Date
	): Promise<{ count: number, jobs: SFJobInformation[] }> {
		const query = `SELECT Id, Start_Date_Time__c, End_Date_Time__c, ServiceType_ERP_ID__c,MIS_NUMERO__c, Purchase_Price__c, Calculated_Incl_VAT_Price__c, Purchase_Invoice_Number__c, Pick_Up_Location__c, Drop_Off_Location__c, Partner_ERP_ID__c, OrderedVehicleType_ERP_ID__c, Status_ERP_ID__c, Client_Salesforce_Code__c, COM_ID__c, Chauffeur_ERP_ID__c, Transmitted_To_Partner__c, Sage_Number__c FROM Job__c WHERE Start_Date_Time__c >= ${dateBegin.toISOString()} AND Start_Date_Time__c <= ${dateEnd.toISOString()} AND Dispatch__c = 'chabe' AND Transmitted_To_Partner__c <> 'sent' AND Transmitted_To_Partner__c <> 'ignored'`;
		console.log("gmbdap: ", query)
		const qresult = await Salesforce.soql(query);
		console.log("gmbd2ap: ", qresult)
		return { count: qresult.totalSize, jobs: qresult.records as unknown as SFJobInformation[] };
	}

	public async getSentMissionsBetweenDates(
		dateBegin: Date,
		dateEnd: Date,
		partnerId: string = "0",
	): Promise<{ count: number, jobs: SFJobInformation[] }> {
		const nextDay = new Date(dateEnd.getTime() + 24 * 60 * 60 * 1000);
		const query = `SELECT Id, Start_Date_Time__c, End_Date_Time__c, ServiceType_ERP_ID__c, Purchase_Price__c, Calculated_Incl_VAT_Price__c, Purchase_Invoice_Number__c, Pick_Up_Location__c, Drop_Off_Location__c, Partner_ERP_ID__c, OrderedVehicleType_ERP_ID__c, Status_ERP_ID__c, Client_Salesforce_Code__c, COM_ID__c, Chauffeur_ERP_ID__c, Transmitted_To_Partner__c, Sage_Number__c FROM Job__c WHERE Start_Date_Time__c >= ${dateBegin.toISOString()} AND Start_Date_Time__c <= ${nextDay.toISOString()} AND Partner_ERP_ID__c = '${partnerId}' AND (Transmitted_To_Partner__c = 'sent' OR Transmitted_To_Partner__c = 'ignored') AND (Sage_Number__c = null OR Sage_Number__c = '') AND Dispatch__c = 'chabe'`;
		const qresult = await Salesforce.soql(query);
		return { count: qresult.totalSize, jobs: qresult.records as unknown as SFJobInformation[] };
	}

	public async getFinishedMissionsBetweenDates(
		dateBegin: Date,
		dateEnd: Date,
		partnerId: string = "0",
	): Promise<{ count: number, jobs: SFJobInformation[] }> {
		const nextDay = new Date(dateEnd.getTime() + 24 * 60 * 60 * 1000);
		const query = `SELECT Id, Start_Date_Time__c, End_Date_Time__c, ServiceType_ERP_ID__c, Purchase_Price__c, Calculated_Incl_VAT_Price__c, Purchase_Invoice_Number__c, Pick_Up_Location__c, Drop_Off_Location__c, Partner_ERP_ID__c, OrderedVehicleType_ERP_ID__c, Status_ERP_ID__c, Client_Salesforce_Code__c, COM_ID__c, Chauffeur_ERP_ID__c, Transmitted_To_Partner__c, Sage_Number__c FROM Job__c WHERE Start_Date_Time__c >= ${dateBegin.toISOString()} AND Start_Date_Time__c <= ${nextDay.toISOString()} AND Partner_ERP_ID__c = '${partnerId}' AND Transmitted_To_Partner__c = 'sent' AND Sage_Number__c != '' AND Sage_Number__c != null AND Dispatch__c = 'chabe'`;
		const qresult = await Salesforce.soql(query);
		return { count: qresult.totalSize, jobs: qresult.records as unknown as SFJobInformation[] };
	}

	unique = <T>(arr: T[]): T[] => {
		const ret: any[] = [];
		for (let i = 0; i < arr.length; i++) {
			if (!ret.includes(arr[i]))
				ret.push(arr[i]);
		}
		return ret;
	}

	public async getPartnerNames(ids: string[]): Promise<{ id: string, name: string }[]> {
		const query = `SELECT ERP_ID__c, ERP_Label__c FROM Partner__c WHERE ERP_ID__c IN ('${this.unique(ids).join("','")}') AND Dispatch__c = 'chabe'`;
		console.log({ query })
		const qresult = await Salesforce.soql(query);
		return qresult.records.map(e => ({ id: e.ERP_ID__c, name: e.ERP_Label__c }));
	}



	public async getChauffeurNames(ids: string[]): Promise<{ id: string, name: string }[]> {
		const query = `SELECT ERP_ID__c, FullName__c FROM Chauffeur__c WHERE ERP_ID__c IN ('${this.unique(ids).join("','")}') AND Dispatch__c = 'chabe'`;
		const qresult = await Salesforce.soql(query);
		return qresult.records.map(e => ({ id: e.ERP_ID__c, name: e.FullName__c }));
	}

	public async get_all_missions_for_contractor(contractorId: string, from: Date, to: Date): Promise<SFJobInformation[]> {
		const query = `SELECT Id FROM Job__c WHERE Partner_ERP_ID__c = '${contractorId}' AND Start_Date_Time__c >= ${from.toISOString()} AND End_Date_Time__c <= ${to.toISOString()} AND Dispatch__c = 'chabe'`;
		const qresult = await Salesforce.soql(query);
		return qresult.records as unknown as SFJobInformation[];
	}

}

export const SalesforceChabe = new CSalesforceChabe();
