export interface TradingOrder {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  country: string;
  accountId: string;
  submittedAt: string;
}

export interface ComplianceHook {
  validateOrder(order: TradingOrder): Promise<{ approved: boolean; reasons: string[] }>;
}

export interface OrderRouter {
  route(order: TradingOrder): Promise<{ accepted: boolean; route: string; note: string }>;
}

export interface VirtualWallet {
  accountId: string;
  availableBalance: number;
  reservedBalance: number;
  currency: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export class PlaceholderTradingService {
  async submitOrder() {
    return {
      accepted: false,
      note: "Trading execution is disabled in this phase. Architecture is active; live routing is not enabled."
    };
  }
}
