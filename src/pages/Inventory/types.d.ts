export type Mob = {
    attack: string;
    crit_chance: string;
    crit_multiplier: number;
    curr_token_id: string;
    defense: string;
    element: string;
    element_id: number;
    equipped: boolean;
    hp: string;
    id: number;
    img_file: string;
    is_shiny: boolean;
    name: string;
    origin_chain: string;
    skills: Skill[];
    token_id: string;
}

export type Skill = {
    accuracy: string;
    cooldown: string;
    damage: string;
    element: string;
    element_id: number;
    hits: string;
    icon_file: string;
    name: string;
}

export type BridgeLogData = {
    address: string;
    created_at: string;
    from_chain_id: string;
    id: number;
    monster_id: number;
    status: number;
    to_chain_id: string;
    token_id: string;
    tx_hash: string;
    updated_at: string | null;
}