import { createContext, useContext } from 'react';
export const DemoLayoutContext = createContext(false);
export function useDemoLayout() { return useContext(DemoLayoutContext); }
