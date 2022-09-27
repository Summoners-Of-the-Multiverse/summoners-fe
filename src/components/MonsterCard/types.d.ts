export type MonsterCardProps = {
    imageFile: string;
    elementId: number;

    attack: number | string;
    defense: number | string;
    hp: number | string;
    crit: number | string;

    additionalInfo?: string | JSX.Element;
    children?: JSX.Element | JSX.Element[];
}