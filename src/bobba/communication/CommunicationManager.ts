import IMessageHandler from "../net/IMessageHandler";
import WebSocketClient from "../net/WebSocketClient";
import BobbaEnvironment from "../BobbaEnvironment";
import IIncomingEvent from "./incoming/IIncomingEvent";
import { LOGIN_OK, MAP_DATA, ROOM_ITEM_DATA, PLAYERS_DATA, PLAYER_STATUS, PLAYER_REMOVE, CHAT, PLAYER_WAVE, ITEM_REMOVE, ITEM_STATE } from "./protocol/OpCodes/ServerOpCodes";
import LoginOk from "./incoming/generic/LoginOk";
import ServerMessage from "./protocol/ServerMessage";
import ClientMessage from "./protocol/ClientMessage";
import HandleMap from "./incoming/rooms/HandleMap";
import HandleFloorItems from "./incoming/rooms/HandleFloorItems";
import HandleRoomUsers from "./incoming/rooms/HandleRoomUsers";
import HandleRoomUserStatus from "./incoming/rooms/HandleRoomUserStatus";
import HandleRoomUserRemove from "./incoming/rooms/HandleRoomUserRemove";
import HandleIncomingChat from "./incoming/rooms/HandleIncomingChat";
import HandleRoomUserWave from "./incoming/rooms/HandleRoomUserWave";
import HandleRoomItemRemove from "./incoming/rooms/HandleRoomItemRemove";
import HandleRoomItemState from "./incoming/rooms/HandleRoomItemState";

export default class CommunicationManager implements IMessageHandler {
    client: WebSocketClient;
    requestHandlers: IncomingEventDictionary;

    constructor() {
        this.client = new WebSocketClient(this);
        this.requestHandlers = {};
        this._registerRequests();
    }

    _registerRequests() {
        this.requestHandlers[LOGIN_OK] = new LoginOk();
        this.requestHandlers[MAP_DATA] = new HandleMap();
        this.requestHandlers[PLAYERS_DATA] = new HandleRoomUsers();
        this.requestHandlers[PLAYER_STATUS] = new HandleRoomUserStatus();
        this.requestHandlers[PLAYER_REMOVE] = new HandleRoomUserRemove();
        this.requestHandlers[CHAT] = new HandleIncomingChat();
        this.requestHandlers[PLAYER_WAVE] = new HandleRoomUserWave();
        this.requestHandlers[ROOM_ITEM_DATA] = new HandleFloorItems();
        this.requestHandlers[ITEM_REMOVE] = new HandleRoomItemRemove();
        this.requestHandlers[ITEM_STATE] = new HandleRoomItemState();
    }

    sendMessage(message: ClientMessage) {
        if (this.client.connected) {
            console.log('Sent [' + message.id + ']: ' + message.constructor.name)
            this.client.send(message.body);
        }
    }

    handleMessage = (rawMessage: string): void => {
        const message = new ServerMessage(rawMessage);
        const handler = this.requestHandlers[message.id]
        if (handler == null) {
            console.log('No handler for: ' + message.id);
        } else {
            console.log('Handled [' + message.id + ']: ' + handler.constructor.name);
            handler.handle(message);
        }
    }

    handleOpenConnection = (): void => {
        console.log("Connected!!1");
    }

    handleCloseConnection = (): void => {
        BobbaEnvironment.getGame().stop();
    }

    handleConnectionError = (): void => {

    }

    connect(host: string, port: number, secure: boolean): Promise<any> {
        const connectionURL = (secure ? 'wss' : 'ws') + '://' + host + ':' + port;
        return this.client.connect(connectionURL);
    }
}

interface IncomingEventDictionary {
    [id: number]: IIncomingEvent;
}