import type { SvgIconComponent } from "@mui/icons-material";
import { NETWORK_NAME } from "./network";

export interface Portfolio {
  network: NETWORK_NAME;
  Icon?: SvgIconComponent;
  variation24h: number;
  amount: number;
  cryptocurrency: string;
}
