/**
 * The First Dungeon - Constants
 * Game configuration and global constants
 */

export const CONFIG = {
    title: 'The First Dungeon DEMO',
    version: '1.1.0',
    autoSaveInterval: 60,
    maxLevel: 100,
    worldWidth: 5000,
    worldHeight: 1500
};

export const ASSETS_PATH = 'assets/';

export const DEVELOPMENT = true;

export const ASSETS = {
    player_sprite: 'sprites/player.png',
    goblin_sprite: 'sprites/goblin.png',
    mushroom_sprite: 'sprites/mushroom.png',
    demon_sprite: 'sprites/demon.png',
    map_tileset: 'tilesets/empire1.png',
    map_data: 'maps/empire1.json',
    monster_proto: 'proto/monster_proto.json',
    collision_proto: 'proto/collision.json',
    item_proto: 'proto/item_proto.json'
};

export const ENTITY_TYPES = {
    PLAYER: 'player',
    MONSTER: 'monster',
    NPC: 'npc',
    ITEM: 'item'
};

export const MONSTER_TYPES = {
    GOBLIN: 'goblin',
    MUSHROOM: 'mushroom',
    DEMON_BOSS: 'demon_boss'
};

export const DIRECTIONS = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

export const GAME_STATES = {
    MENU: 'menu',
    LOADING: 'loading',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};
