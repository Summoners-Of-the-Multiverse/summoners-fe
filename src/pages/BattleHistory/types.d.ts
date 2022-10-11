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