export type StarterStatusResponse = { hasMinted: boolean };

export type MintPromptProps = {
    monsters: MonsterBaseMetadata[];
    onMint: () => void;
    address: string;
    chain: string;
    startMinting: () => void;
    endMinting: () => void;
}

export type MonsterBaseMetadata = {
    id: number;
    name: string;
    element_id: number;
    element_name: string;
    img_file: string;
    base_attack: number;
    max_attack: number;
    base_defense: number;
    max_defense: number;
    base_hp: number;
    max_hp: number;
    base_crit_chance: number;
    max_crit_chance: number;
    base_crit_multiplier: number;
    max_crit_multiplier: number;
    shiny_chance: number;
}