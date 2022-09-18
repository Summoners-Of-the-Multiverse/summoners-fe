import { Socket } from "socket.io-client";

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
}

export type BattleDetails = {
    playerMonsters: { [monsterId: string]: MonsterStats };
    playerMonsterSkills: {[monsterId: string]: MonsterEquippedSkillById };
    encounter: MonsterStats;
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
}

export type StartBattleParams = {
    socket: Socket; 
    isInBattle: boolean;
    address: string; 
    chainId: string; 
    areaId: number; 
    onLoad: (battleDetails: BattleDetails) => void;
    onEncounterReceivedDamage: ({attacks, encounterHpLeft}: EncounterDamageReceived) => void;
    onDamageReceived: ({ damage, playerHpLeft }: EncounterHit) => void;
    onMonsterOffCd: (monsterId: number) => void;
    onEndSkillsReceived: (usage: SkillUsage) => void;
    onBattleEnd: (hasWon: boolean) => void;
}

export type EncounterHit = { 
    damage: number; 
    playerHpLeft: number;
}

export type EncounterDamageReceived = {
    attacks: Attack[];
    encounterHpLeft: number;
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
    socket: Socket;
    address: string;
    details: BattleDetails | undefined;
    playerCurrentHp: number;
    encounterCurrentHp: number;
    monsterIdOffCd: string | undefined;
}

export type EncounterImageProps = { 
    encounter: MonsterStats;
    attacks: Attack[][];
}

export type EncounterEffectProps = {
    attacks: Attack[];
    effect: string;
    attackIndex: number;
    show: boolean;
}

export type PlayerHpBarProps = {
    maxHp: number;
    currentHp: number;
}

export type PlayerMonsterBarProps = {
    playerMonsters: {[monsterId: string]: MonsterStats};
    onPlayerMonsterClick: (monsterId: string) => void;
    monstersOnCd: string[];
}

export type PlayerSkillBarProps = {
    socket: Socket;
    address: string;
    playerMonsterSkills: {[monsterId: string]: MonsterEquippedSkillById};
    activeMonsterId: string;
    isOnCd: boolean;
    onSkillClick: (mosnterId: string) => void;
}