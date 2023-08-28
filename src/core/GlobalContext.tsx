
import { createContext } from 'react';

export type GlobalState_t = {

	// Theme
	dark: boolean,
	switchDark?: () => void,

	// User
	token?: string,

} | null;

export const GlobalContext = createContext<GlobalState_t>(null  );
export default GlobalContext;
