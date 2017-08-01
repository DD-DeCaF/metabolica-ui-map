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

export class MethodService {

  public defaultMethod(): Method {
    return methods[1];
  }

  public getMethod(id: string): Method {
    return methods.find((m: Method) => id.localeCompare(m.id) === 0);
  }
}
