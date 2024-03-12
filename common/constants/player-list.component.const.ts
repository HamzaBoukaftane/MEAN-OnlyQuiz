export const STATUS_INDEX = 3;
export const CAN_TALK = 4;

export enum SortType {
    SORT_BY_NAME = 0,
    SORT_BY_SCORE = 1,
    SORT_BY_STATUS = 2,
}

export const ORDER_INITIAL_MULTIPLIER = 1;
export const ORDER_MULTIPLIER = -1;

export const ORDER_ICON_UP = 'fa-solid fa-up-long';
export const ORDER_ICON_DOWN = 'fa-solid fa-down-long';
export const PLAYER_NOT_FOUND_INDEX = -1;

export type Player = [string, number, number, string, boolean];
