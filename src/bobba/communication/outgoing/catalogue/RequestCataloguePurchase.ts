import ClientMessage from "../../protocol/ClientMessage";
import { REQUEST_CATALOGUE_PURCHASE } from "../../protocol/OpCodes/ClientOpCodes";

export default class RequestCataloguePurchase extends ClientMessage {
    constructor(itemId: number) {
        super(REQUEST_CATALOGUE_PURCHASE);
        this.appendInt(itemId);
    }
}