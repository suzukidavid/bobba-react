import Room from "./rooms/Room";
import MainEngine from './graphics/MainEngine';
import AvatarImager from "./imagers/avatars/AvatarImager";
import FurniImager from "./imagers/furniture/FurniImager";
import BaseItemManager from "./items/BaseItemManager";
import { ROOM_TILE, ROOM_SELECTED_TILE, ROOM_WALL_L, ROOM_WALL_R, ROOM_TILE_SHADOW, FLOOR_ITEM_PLACEHOLDER, WALL_ITEM_PLACEHOLDER, ROOM_WALL_DOOR_L, ROOM_WALL_DOOR_BEFORE_L } from "./graphics/GenericSprites";
import AvatarContainer, { GHOST_LOOK } from "./rooms/users/AvatarContainer";
import CommunicationManager from "./communication/CommunicationManager";
import RoomModel from "./rooms/RoomModel";
import RequestRoomData from "./communication/outgoing/roomdata/RequestRoomData";
import ChatImager from "./imagers/bubbles/ChatImager";
import MeMenuImager from "./imagers/bubbles/MeMenuImager";
import BobbaEnvironment from "./BobbaEnvironment";
import UIManager from "./ui/UIManager";
import UserManager from "./users/UserManager";
import Inventory from "./inventory/Inventory";
import RequestInventoryItems from "./communication/outgoing/users/RequestInventoryItems";
import Catalogue from "./catalogue/Catalogue";
import RequestCatalogueIndex from "./communication/outgoing/catalogue/RequestCatalogueIndex";
import SoundManager from "./sound/SoundManager";
import Nav from "./navigator/Nav";
import RequestHeightMap from "./communication/outgoing/roomdata/RequestHeightMap";
import RequestNavigatorGoToRoom from "./communication/outgoing/navigator/RequestNavigatorGoToRoom";

export default class Game {
    currentRoom?: Room;
    engine: MainEngine;
    avatarImager: AvatarImager;
    furniImager: FurniImager;
    chatImager: ChatImager;
    meMenuImager: MeMenuImager;
    baseItemManager: BaseItemManager;
    userManager: UserManager;
    ghostTextures: AvatarContainer;
    communicationManager: CommunicationManager;
    inventory: Inventory;
    catalogue: Catalogue;
    navigator: Nav;
    uiManager: UIManager;
    soundManager: SoundManager;
    isStarting: boolean;

    constructor() {
        this.engine = new MainEngine(this.gameLoop, this.onResize, this.onMouseMove, this.onTouchStart, this.onTouchMove, this.onMouseClick, this.onMouseDoubleClick);
        this.soundManager = new SoundManager();
        this.ghostTextures = new AvatarContainer(GHOST_LOOK, true);
        this.avatarImager = new AvatarImager();
        this.furniImager = new FurniImager();
        this.chatImager = new ChatImager();
        this.meMenuImager = new MeMenuImager();
        this.userManager = new UserManager();
        this.baseItemManager = new BaseItemManager(this.furniImager);
        this.communicationManager = new CommunicationManager();
        this.inventory = new Inventory();
        this.catalogue = new Catalogue();
        this.navigator = new Nav();
        this.uiManager = new UIManager(this);
        this.isStarting = false;
    }

    loadGame(): Promise<void> {
        this.isStarting = true;
        const sprites: string[] = [
            ROOM_TILE,
            ROOM_SELECTED_TILE,
            FLOOR_ITEM_PLACEHOLDER,
            WALL_ITEM_PLACEHOLDER,
            ROOM_WALL_L,
            ROOM_WALL_R,
            ROOM_WALL_DOOR_BEFORE_L,
            ROOM_WALL_DOOR_L,
            ROOM_TILE_SHADOW
        ];
        BobbaEnvironment.getGame().uiManager.postLoading("Initializing game engine");
        return Promise.all([
            this.avatarImager.initialize().then(() => this.ghostTextures.initialize()),
            this.furniImager.initialize(),
            this.chatImager.initialize(),
            this.meMenuImager.initialize(),
            this.engine.loadGlobalTextures(sprites),
        ]).then(() => {
            BobbaEnvironment.getGame().uiManager.postLoading("Connecting to server");
            return this.communicationManager.connect("localhost", 8080, false);
        });
    }

    handleUserData(id: number, name: string, look: string, motto: string) {
        this.uiManager.onSetUserData(this.userManager.setCurrentUser(id, name, motto, look));
        if (this.currentRoom == null) {
            BobbaEnvironment.getGame().uiManager.log("Logged in!");
            this.communicationManager.sendMessage(new RequestInventoryItems());
            this.communicationManager.sendMessage(new RequestCatalogueIndex());
            this.soundManager.playPixelsSound();

            this.communicationManager.sendMessage(new RequestNavigatorGoToRoom(1));
        }
    }

    handleRoomModelInfo(modelId: string, roomId: number) {
        this.communicationManager.sendMessage(new RequestHeightMap());
    }

    handleHeightMap(model: RoomModel) {
        this.unloadRoom();

        this.currentRoom = new Room(model);
        this.engine.getLogicStage().addChild(this.currentRoom.engine.getLogicStage());
        this.engine.getMainStage().addChild(this.currentRoom.engine.getStage());
        BobbaEnvironment.getGame().uiManager.log("Loaded heightmap");
        BobbaEnvironment.getGame().uiManager.onCloseNavigator();
        BobbaEnvironment.getGame().uiManager.onCloseCreateRoom();
        BobbaEnvironment.getGame().uiManager.onCloseCatalogue();
        BobbaEnvironment.getGame().uiManager.onCloseInventory();
        BobbaEnvironment.getGame().uiManager.onCloseChangeLooks();
        this.communicationManager.sendMessage(new RequestRoomData());
    }

    unloadRoom() {
        if (this.currentRoom != null) {
            this.currentRoom.dispose();
        }
        this.currentRoom = undefined;
    }

    onMouseMove = (x: number, y: number, isMouseDragging: boolean) => {
        if (this.currentRoom != null) {
            this.currentRoom.engine.handleMouseMovement(x, y, isMouseDragging);
        }
    }

    onTouchStart = (x: number, y: number) => {
        if (this.currentRoom != null) {
            this.currentRoom.engine.handleTouchStart(x, y);
        }
    }

    onTouchMove = (x: number, y: number) => {
        if (this.currentRoom != null) {
            this.currentRoom.engine.handleTouchMove(x, y);
        }
    }

    onMouseClick = (x: number, y: number, shiftKey: boolean, ctrlKey: boolean, altKey: boolean) => {
        if (this.currentRoom != null) {
            this.currentRoom.engine.handleMouseClick(x, y, shiftKey, ctrlKey, altKey, true);
        }
    }

    onMouseDoubleClick = (x: number, y: number) => {
        if (this.currentRoom != null) {
            this.currentRoom.engine.handleMouseDoubleClick(x, y);
        }
    }

    onResize = () => {
        if (this.currentRoom != null) {
            this.currentRoom.engine.onResize();
        }
    }

    gameLoop = (delta: number) => {
        if (this.currentRoom != null) {
            this.currentRoom.tick(delta * (1 / 60) * 1000);
        }
    }

    stop() {
        this.unloadRoom();
        this.uiManager.onGameStop();
        console.log("Stopping game...");
    }
}