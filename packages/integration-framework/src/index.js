export class StubAdapter {
    provider;
    type;
    enabled;
    constructor(provider, type, enabled = true) {
        this.provider = provider;
        this.type = type;
        this.enabled = enabled;
    }
    async health() {
        return { status: this.enabled ? "up" : "down", latencyMs: 50 };
    }
}
export const defaultAdapters = [
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
