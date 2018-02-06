import { Method } from "../types";

export const methods: Method[] = [
  { id: 'fba', name: 'Flux Balance Analysis (FBA)' },
  { id: 'pfba', name: 'parsimonious FBA' },
  { id: 'fva', name: 'Flux Variability Analysis (FVA)' },
  { id: 'pfba-fva', name: 'parsimonious FVA' },
];

export const defaultMethod: Method = methods[1];
