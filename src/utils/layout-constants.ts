export const RECORD_ITEM_HEIGHT_PX = 132;
export const PAGE_SIZE_FOR_LAYOUT = 10;
export const LIST_MIN_HEIGHT_PX = RECORD_ITEM_HEIGHT_PX * PAGE_SIZE_FOR_LAYOUT;
// DebugPanelをposition:fixedで画面下部に固定するための、本文側に確保すべき余白。
// sm未満（grid-cols-2、2行組）では高さが増えるため、狭幅時を基準にやや余裕を持たせている。
export const DEBUG_PANEL_HEIGHT_PX = 140;
