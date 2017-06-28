/*
  Custom types
 */

export interface Map {
    map: Object;
    settings: Object;
    reactionData: Object;
    geneData: Object;
    metaboliteData: Object;
    growthRate: number;
    removedReactions: string[];
}

export interface Model {
    compartments: any;
    genes: any;
    id: string;
    uid: string;
    metabolites: any;
    notes: any;
    reactions: Reaction[];
    version: number;
}

export interface Reaction {
    annotation: Object;
    gene_reaction_rule: any;
    id: string;
    lower_bound: number;
    metabolites: Object;
    name: string;
    notes: Object;
    subsystem: string;
    upper_bound: number;
}

export interface Shared {
    loading?: number;
    map?: Map;
    model?: Model;
    sections?: any;
    method?: string;
    removedReactions?: string[];
}

export interface MapData {
    map?: Map;
    model?: Model;
    sections?: any;
    method?: string;
    removedReactions?: string[];
    info?: object;
    selected?: SelectedItems;
}

export interface MapObject{
    id: number;
    mapData: MapData;
    selected: SelectedItems;
}

export interface SelectedItems {
    experiment?: number;
    sample?: string;
    phase?: string;
    method?: string;
    map?: string;
    model?: string;
}

export interface Message {
    name: string;
    data: any;
}

export interface Method {
    id: string;
    name: string;
}

interface APIitem {
    id: number;
    name: string;
}

export interface Phase extends APIitem {}
export interface Sample {
    id: number[];
    name: string;
	organism: string;
}
export interface Experiment extends APIitem {}

export interface Action {
    type: string;
    label: string;
    callback: any;
    canDisplay: any;
}

export interface Species{
    id: string;
    name: string;
}

export enum ObjectType {
    Experiment,
    Reference
}
