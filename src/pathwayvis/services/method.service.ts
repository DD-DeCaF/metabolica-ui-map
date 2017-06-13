/**
 * Created by dandann on 07/06/2017.
 */
import {Method} from "../types"

export class MethodService{

    public methods: Method[] = [
        {'id': 'fba', 'name': 'FBA'},
        {'id': 'pfba', 'name': 'pFBA'},
        {'id': 'fva', 'name': 'FVA'},
        {'id': 'pfba-fva', 'name': 'pFBA-FVA'},
        {'id': 'moma', 'name': 'MOMA'},
        {'id': 'lmoma', 'name': 'lMOMA'},
        {'id': 'room', 'name': 'ROOM'}
    ];

    public defaultMethod(): string{
        return this.methods[1].id;
    }

    public getMethodName(id: string): string{
        let result = "_";
        this.methods.some((item: Method) =>{
            if(id.localeCompare(item.id) === 0){
                result = item.name;
                return true
            }
        });
        return result;
    }
}
