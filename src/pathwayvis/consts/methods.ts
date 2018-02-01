import { Method } from "../types";

export const methods: Method[] = [
  { id: 'fba', name: 'FBA' },
  { id: 'pfba', name: 'pFBA' },
  { id: 'fva', name: 'FVA' },
  { id: 'pfba-fva', name: 'pFBA-FVA' },
];

export const defaultMethod: Method = methods[1];
