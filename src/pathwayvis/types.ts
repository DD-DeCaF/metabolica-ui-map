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
}

export interface SelectedItems {
    experiment?: number;
    sample?: number;
    phase?: number;
    method?: string;
    map?: string;
    model?: string;
}

export interface Message {
    name: string;
    data: any;
}

interface APIitem {
    id: number;
    name: string;
}

export interface Phase extends APIitem {}
export interface Sample extends APIitem {
	organism: string;
}
export interface Experiment extends APIitem {}

export interface Action {
    type: string;
    label: string;
    callback: any;
    canDisplay: any;
}
