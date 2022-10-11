export type MonsterCardProps = {
    imageFile: string;
    elementId: number;
    isShiny: boolean;

    attack: number | string;
    defense: number | string;
    hp: number | string;
    crit: number | string;

    additionalInfo?: string | JSX.Element;
    children?: JSX.Element | JSX.Element[];

    showMintButton?: boolean;
    mintButtonText?: string;
    disableMintButton?: boolean;
    onMintButtonClick?: () => void;
}