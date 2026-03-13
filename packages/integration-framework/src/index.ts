export interface IntegrationAdapter {
  provider: string;
  type:
    | "whatsapp"
    | "ussd"
    | "sms"
    | "mobile_money"
    | "airtime_billing"
    | "news_api"
    | "rss"
    | "stock_exchange"
    | "broker";
  enabled: boolean;
  health(): Promise<{ status: "up" | "degraded" | "down"; latencyMs: number }>;
}

export class StubAdapter implements IntegrationAdapter {
  constructor(
    public provider: string,
    public type: IntegrationAdapter["type"],
    public enabled = true
  ) {}

  async health(): Promise<{ status: "up" | "degraded" | "down"; latencyMs: number }> {
    return { status: this.enabled ? "up" : "down", latencyMs: 50 };
  }
}

export const defaultAdapters: IntegrationAdapter[] = [
  new StubAdapter("Meta WhatsApp Cloud API", "whatsapp"),
  new StubAdapter("Regional USSD Gateway", "ussd"),
  new StubAdapter("Regional SMS Aggregator", "sms"),
  new StubAdapter("M-Pesa", "mobile_money"),
  new StubAdapter("MTN Mobile Money", "mobile_money"),
  new StubAdapter("Airtel Money", "mobile_money"),
  new StubAdapter("EcoCash", "mobile_money"),
  new StubAdapter("Airtime Billing Partner", "airtime_billing"),
  new StubAdapter("News API", "news_api"),
  new StubAdapter("RSS Collector", "rss"),
  new StubAdapter("Exchange Connectors", "stock_exchange"),
  new StubAdapter("Future Broker Layer", "broker", false)
];
