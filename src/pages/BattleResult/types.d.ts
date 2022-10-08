export type BattleResultResponse = {
    result: BattleResult;
    skillsUsed: BattleSkillsUsed[];
}

export type BattleResult = {
    battle_id: number;
	time_start: string;
	time_end: string;
	type: number;
	name: string;
	img_file: string;
	element_id: number;
	attack: number;
	defense: number;
	hp: number;
    hp_left: number;
	crit_chance: number;
	crit_multiplier: number;
	is_shiny: boolean;
    is_captured: boolean;
}

export type BattleSkillsUsed = {
    monster_id: number;
    monster_name: string;
    monster_img: string;
    monster_element_id: number;
    monster_attack: number;
    monster_defense: number;
    monster_hp: number;
    monster_crit_chance: number;
    monster_crit_multiplier: number;
    skill_name: string;
    element_id: number;
    skill_icon: string;
    total_damage_dealt: number;
    crit_damage_dealt: number;
    hits: number;
    crits: number;
    misses: number;
    total_cooldown: number;
    is_shiny: boolean;
}

export type SkillsUsageTableProps = { 
    skills: BattleSkillsUsed[];
}

export type MVP = {
    damage: number;
    imgFile: string;
    monsterElement: number;
    isShiny: boolean;
    name: string;
    attack: number;
    defense: number;
    hp: number;
    crit_chance: number;
    crit_multiplier: number;
}