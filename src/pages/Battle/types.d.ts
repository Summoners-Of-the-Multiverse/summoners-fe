export type MonsterEquippedSkillById = {
    [monsterId: string]: MonsterSkill
}

export type MonsterSkill = {
    id: number;
    name: string;
    element_id: number;
    element_name: string;
    element_file: string;
    hits: number;
    accuracy: number;
    cooldown: number;
    multiplier: number;
    effect_file: string;
    icon_file: string;
}

export type BattleDetails = {
    playerMonsters: { [monsterId: string]: MonsterStats };
    playerMonsterSkills: {[monsterId: string]: MonsterEquippedSkillById };
    encounter: MonsterStats;
    battle_id: number;
}

export type MonsterStats = {
    name: string;
    img_file: string;
    attack: number;
    defense: number;
    hp: number;
    hp_left: number;
    element_id: number;
    crit_chance: number;
    crit_multiplier: number;
    element_name: string;
    element_file: string;
    is_shiny: boolean;
    type: MonsterType;
}

export type Attack = {
    damage: number;
    type: "normal" | "crit" | "immune" | "miss";
    element_id: number;
}

export type StartBattleParams = {
    address: string; 
    chainId: string; 
}

export type ListenBattleParams = {
    address: string; 
    onLoad: (battleDetails: BattleDetails) => void;
    onEncounterReceivedDamage: ({attacks, encounterHpLeft, monsterId, skillId}: EncounterDamageReceived) => void;
    onDamageReceived: ({ damage, playerHpLeft }: EncounterHit) => void;
    onMonsterOffCd: (monsterId: number) => void;
    onEndSkillsReceived: (usage: SkillUsage) => void;
    onBattleEnd: (hasWon: boolean, isInvalid: boolean = false) => void;
}

export type EncounterHit = { 
    damage: number; 
    cd: number;
    playerHpLeft: number;
}

export type EncounterDamageReceived = {
    attacks: Attack[];
    encounterHpLeft: number;
    monsterId: number;
    skillId: number;
}

export type SkillUsage = {
    [monsterId: number]: {
        [skillId: number]: {
            hit: number;
            miss: number;
            damage: number;
            crit_damage: number;
        }
    }
}

export type BattlePageProps = {
    address: string;
    details?: BattleDetails;
    playerCurrentHp: number;
    encounterCurrentHp: number;
    monsterIdOffCd?: string;
    encounterDamageReceived?: EncounterDamageReceived;
    encounterCd: number;
    encounterMaxCd: number;
}

export type EncounterImageProps = { 
    encounter: MonsterStats;
    encounterDamageReceived?: EncounterDamageReceived;
    playerMonsterSkills: {[monsterId: string]: MonsterEquippedSkillById};
}

export type EncounterEffectProps = {
    encounterDamageReceived?: EncounterDamageReceived;
    skills: MonsterEquippedSkillById;
    attackIndex: number;
    monsterId: string;
}

export type BaseHpBarProps = {
    maxHp: number;
    currentHp: number;
    name?: string;
    cd?: number;
    maxCd?: number;
}
export interface EncounterHpBarProps extends BaseHpBarProps {
    elementId: number;
    cd?: number;
    maxCd?: number;
}

export interface PlayerHpBarProps extends BaseHpBarProps {
    cd?: number;
    maxCd?: number;
}

export type PlayerMonsterBarProps = {
    playerMonsters: {[monsterId: string]: MonsterStats};
    onPlayerMonsterClick: (monsterId: string) => void;
    monstersOnCd: {[monsterId: string] : number};
    activeMonsterId: string;
    playerMonsterSkills: {[monsterId: string]: MonsterEquippedSkillById};
    onSkillClick: (mosnterId: string, endTime: number) => void;
    address: string;
}

export type PlayerSkillBarProps = {
    address: string;
    playerMonsterSkills: {[monsterId: string]: MonsterEquippedSkillById};
    activeMonsterId: string;
    isOnCd: boolean;
    onSkillClick: (mosnterId: string) => void;
}

export type PlayerMonsterImageProps = {
    monster: MonsterStats;
    endTime?: number;
}