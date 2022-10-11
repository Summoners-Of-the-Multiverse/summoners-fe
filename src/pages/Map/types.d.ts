import { BasePage } from "../../types";

export interface MapProps extends BasePage {
    onAreaChange: (areaId: number) => void;
}