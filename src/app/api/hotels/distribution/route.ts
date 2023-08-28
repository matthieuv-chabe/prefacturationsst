import {FactureInformations, HotelInformations, SalesforceChabe} from "@/business/SalesforceChabe";
import {NextRequest, NextResponse} from "next/server";
import {revalidatePath} from "next/cache";

export type DistributionResult = {
	hotel: number;
	loge: number;
	infos: Partial<HotelInformations>,
	factures: {
		fac_num: string;
		fac_client: string;
		fac_voiture_base: number;
		fac_voiture_percent: number;
		fac_service_base: number;
		fac_service_percent: number;
		fac_frais_base: number;
		fac_frais_percent: number;
		fac_accueil_base: number;
		fac_accueil_percent: number;
	}[],
	concierge: {
		name: string;
		percent: number;
		value: number;
	}[]
}

function sumFieldsForFactures(factures: FactureInformations[], fields: (keyof FactureInformations)[]) {
	return factures.reduce((total, facture) => total + fields.reduce((sum, field) => sum + (facture[field] as number || 0), 0), 0);
}

export const revalidate = 0;

export const POST = async (request: NextRequest) => {

	const path = request.nextUrl.searchParams.get('path') || '/'
	revalidatePath(path)

	const sp = new URLSearchParams(request.nextUrl.search);

	const hid = sp.get('hotelId');
	const fid = sp.get('factureIds');

	if (!hid || !fid) return NextResponse.json({error: "Missing parameters"}, {status: 400});

	const hotelParent = await SalesforceChabe.getHotelParent(hid);
	if (!hotelParent) return NextResponse.json({error: "Hotel not found"}, {status: 404});

	const distribution = await SalesforceChabe.getDistributionForHotel(hotelParent);
	console.log({distribution})

	const factures_ids = fid.split(',');
	const all_children_hotels = await SalesforceChabe.getChildrenHotels(hotelParent);
	const all_hotels = [hotelParent, ...all_children_hotels];
	const factures = (await SalesforceChabe.getFacturesForHotel(all_hotels)).filter(e => factures_ids.includes(e.fac_num!));

	const concierges = await SalesforceChabe.getConciergesForHotel(hotelParent);

	const facs_voiture = sumFieldsForFactures(factures, ['fac_voiture_tva0', "fac_voiture_tva10", "fac_voiture_tva20"]);
	const facs_service = sumFieldsForFactures(factures, ['fac_service_tva0', "fac_service_tva10", "fac_service_tva20"]);
	const facs_frais = sumFieldsForFactures(factures, ['fac_frais_tva0', "fac_frais_tva10"]);
	const facs_accueil = sumFieldsForFactures(factures, ['fac_frais_tva20_accueil']);

	console.log({facs_voiture, facs_service, facs_frais, facs_accueil})
	console.log({factures})

	const hotel_accueil = (distribution.Commission_Hotel_Accueil_Percent || 0) / 100 * facs_accueil;
	const hotel_service = (distribution.Commission_Hotel_Service_Percent || 0) / 100 * facs_service;
	const hotel_voiture = (distribution.Commission_Hotel_Voiture_Percent || 0) / 100 * facs_voiture;
	const hotel_frais = (distribution.Commission_Hotel_Frais_Percent || 0) / 100 * facs_frais;
	const total_hotel = hotel_accueil + hotel_service + hotel_voiture + hotel_frais;

	const loge_accueil = (distribution.Commission_Loge_Accueil_Percent || 0) / 100 * facs_accueil;
	const loge_service = (distribution.Commission_Loge_Service_Percent || 0) / 100 * facs_service;
	const loge_voiture = (distribution.Commission_Loge_Voiture_Percent || 0) / 100 * facs_voiture;
	const loge_frais = (distribution.Commission_Loge_Frais_Percent || 0) / 100 * facs_frais;
	const total_loge = loge_accueil + loge_service + loge_voiture + loge_frais;

	console.log("total_hotel=", total_hotel)

	const distrib_concierges: DistributionResult['concierge'] = concierges.map(c => ({
		name: c.Name || "",
		percent: (c.repartition || 0) / 100,
		value: (c.repartition || 0) / 100 * total_loge
	}))

	console.log("after concierges")

	const details_facture = factures.map(f => ({
		fac_num: f.fac_num || "",
		fac_client: f.hotel_subaccount_name || "",
		fac_voiture_base: (f.fac_voiture_tva0 || 0) + (f.fac_voiture_tva10 || 0) + (f.fac_voiture_tva20 || 0),
		fac_voiture_percent: (distribution.Commission_Hotel_Voiture_Percent || 0) / 100,
		fac_service_base: (f.fac_service_tva0 || 0) + (f.fac_service_tva10 || 0) + (f.fac_service_tva20 || 0),
		fac_service_percent: (distribution.Commission_Hotel_Service_Percent || 0) / 100,
		fac_frais_base: (f.fac_frais_tva0 || 0) + (f.fac_frais_tva10 || 0),
		fac_frais_percent: (distribution.Commission_Hotel_Frais_Percent || 0) / 100,
		fac_accueil_base: (f.fac_frais_tva20_accueil || 0),
		fac_accueil_percent: (distribution.Commission_Hotel_Accueil_Percent || 0) / 100,
	}))

	const gifh = await SalesforceChabe.GetInfosForHotel(hotelParent);

	console.log("Youpi ?")

	return NextResponse.json({
		infos: gifh,
		hotel: total_hotel,
		loge: total_loge,
		concierge: distrib_concierges,
		factures: details_facture
	}, {
		headers: {
			"Cache-Control": "no-cache, no-store, must-revalidate",
		}
	});

}