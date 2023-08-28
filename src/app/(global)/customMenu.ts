import { MenuDataItem } from "@ant-design/pro-layout";

const mdi: MenuDataItem[] = [
	{
		path: '/dashboard',
		name: 'Accueil'
	},
	{
		path: '/preparation',
		name: 'Préparation',
	},
	{
		path: '/suivi_facturation',
		name: 'Suivi de facturation',
	}
]

export const x = [
	{
		path: '/',
		name: 'Accueil',
		routes: mdi,
	},
];