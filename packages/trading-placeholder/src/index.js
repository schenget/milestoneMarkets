export class PlaceholderTradingService {
    async submitOrder() {
        return {
            accepted: false,
            note: "Trading execution is disabled in this phase. Architecture is active; live routing is not enabled."
        };
    }
}
