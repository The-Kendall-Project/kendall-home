import { Blocks, FlaskConical, Gauge, GraduationCap, Network, Warehouse } from "lucide-react";
import type { ProductIconName } from "./products";

const productIcons = {
  blocks: Blocks,
  flask: FlaskConical,
  gauge: Gauge,
  graduationCap: GraduationCap,
  network: Network,
  warehouse: Warehouse,
};

export function ProductIcon({ name }: { name: ProductIconName }) {
  const Icon = productIcons[name];
  return <Icon aria-hidden="true" className="kh-product-icon" size={16} strokeWidth={2.25} />;
}
