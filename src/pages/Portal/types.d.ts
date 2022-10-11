import { BasePage } from "../../types";

export interface PortalProps extends BasePage {
    onChainChange: (chain: string) => void;
}