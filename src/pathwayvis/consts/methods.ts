import { Method } from "../types";

export const methods: Method[] = [
  { id: 'fba', name: 'FBA' },
  { id: 'pfba', name: 'pFBA' },
  { id: 'fva', name: 'FVA' },
  { id: 'pfba-fva', name: 'pFBA-FVA' },
  { id: 'moma', name: 'MOMA' },
  { id: 'lmoma', name: 'lMOMA' },
  { id: 'room', name: 'ROOM' },
];

export const defaultMethod: Method = methods[1];
