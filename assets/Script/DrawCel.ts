/*
 * @Author: Justin
 * @Date: 2021-01-11 11:40:33
 * @LastEditTime: 2021-01-12 17:25:35
 * @Description: 设计分辨率为 1920*1080，地图切割为32*32的方块
 */

import { DrawData, CelIndex, DrawType } from "./DrawData";
import { MapData } from "./MapData";
import OnFire from "./OnFire"

const { ccclass, property } = cc._decorator;

@ccclass
export class DrawCel extends cc.Component {

    @property({ type: cc.Node, displayName: "右键菜单", tooltip: "menus" })
    private menus: cc.Node = null;

    private _width: number;
    private _height: number;

    //x,y 表示索引（非坐标）
    private touchIndex: cc.Vec2 = new cc.Vec2(0, 0);

    private curCelIndex: CelIndex = new CelIndex(0, 0);

    private _drawNode: cc.Node;

    private _drawData: DrawData;
    private _drawSprite: cc.Sprite;


    public onLoad() {
        this.initEvent();
        this.initDraw();
    }

    private initEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.MOUSE_DOWN, this._onMouseDown, this);

        OnFire.on('loadExternalMapInfo', this.loadExternalMapInfo, this);
    }

    /**
     * @description: 初始化绘图数据
     * @param {*}
     * @return {*}
     */
    private initDraw(): void {
        let size: cc.Size = this.node.getContentSize();
        this._width = size.width;
        this._height = size.height;
        this._drawNode = new cc.Node();
        this._drawNode.setAnchorPoint(0, 0);
        this._drawNode.parent = this.node;
        this._drawNode.width = size.width;
        this._drawNode.height = size.height;
        this._drawSprite = this._drawNode.addComponent(cc.Sprite);
        this._drawSprite.spriteFrame = new cc.SpriteFrame();
        this._drawData = new DrawData(size.width, size.height);
        this._drawData.setColor(255, 0, 0, 50);

        let data: Uint8Array = this._drawData.getData();
        let texture: cc.Texture2D = new cc.Texture2D();
        texture.initWithData(data, 16, this._width, this._height);
        texture.setFlipY(true);
        this._drawSprite.spriteFrame.setTexture(texture);
    }

    /**
     * @description: 获取点击点的 CelIndex 数据
     * @param {cc} point
     * @return {*}
     */
    private _getTouchCelIndex(point: cc.Vec2): CelIndex {
        let cel = MapData.getInstance().cel;
        let row = Math.floor(point.y / cel);
        let col = Math.floor(point.x / cel);
        row = row >= MapData.getInstance().row ? MapData.getInstance().row - 1 : row;
        col = col >= MapData.getInstance().col ? MapData.getInstance().col - 1 : col;
        return new CelIndex(row, col);
    }

    /**
     * @description:
     * @param {cc} event
     * @return {*}
     */
    private _onTouchStart(event: cc.Touch): void {
        this.menus.active = false;
        let point = event.getLocation();
        let celIndex = this._getTouchCelIndex(point);
        this.touchIndex.x = celIndex.row;
        this.touchIndex.y = celIndex.col;
        this.curCelIndex = celIndex;
        let cel = MapData.getInstance().cel;
        let rect = { x: celIndex.col * cel, y: celIndex.row * cel, width: cel, height: cel }
        this.draw(DrawType.RECT, rect);
        console.log("onTouchStart");
        MapData.getInstance().updateCel(this.curCelIndex.row, this.curCelIndex.col, 1);
    }

    /**
     * @description: 
     * @param {cc} event
     * @return {*}
     */
    private _onTouchMove(event: cc.Touch): void {
        let point = event.getLocation();
        let celIndex = this._getTouchCelIndex(point);
        if (this.touchIndex.x != celIndex.row || this.touchIndex.y != celIndex.col) {
            this.touchIndex.x = celIndex.row;
            this.touchIndex.y = celIndex.col;
            this.curCelIndex = celIndex;
            let cel = MapData.getInstance().cel;
            let rect = { x: celIndex.col * cel, y: celIndex.row * cel, width: cel, height: cel }
            this.draw(DrawType.RECT, rect);
            MapData.getInstance().updateCel(this.curCelIndex.row, this.curCelIndex.col, 1);

        }
    }

    /**
     * @description: 
     * @param {cc} event
     * @return {*}
     */
    private _onTouchEnd(event: cc.Touch) {
        this.touchIndex.x = 0;
        this.touchIndex.y = 0;
    }

    /**
     * @description: 清除单元格数据
     * @param {*}
     * @return {*}
     */
    private onClickClearCel(): void {
        this._drawData.setColor(0, 0, 0, 0);
        let cel = MapData.getInstance().cel;
        let rect = { x: this.curCelIndex.col * cel, y: this.curCelIndex.row * cel, width: cel, height: cel }
        this.draw(DrawType.RECT, rect);
        MapData.getInstance().updateCel(this.curCelIndex.row, this.curCelIndex.col, 0);
        this.menus.active = false;
        this._drawData.setColor(255, 0, 0, 50);
    }

    /**
     * @description: 保存地图数据
     * @param {*}
     * @return {*}
     */
    private onClickSave(): void {
        OnFire.fire('showSaveInfo', true);
        this.menus.active = false;
    }

    private onClickImportMapInfo(): void {
        this.menus.active = false;
        OnFire.fire('showSaveInfo', false);
    }

    /**
     * @description: 右键弹出选择按钮(保存，清除单元格)
     * @param {cc} event
     * @return {*}
     */
    private _onMouseDown(event: cc.Event.EventMouse): void {
        // 鼠标右键
        if (event.getButton() == cc.Event.EventMouse.BUTTON_RIGHT) {
            console.log('点击了鼠标右键', event.getLocation().x, event.getLocation().y);
            this.menus.active = true;
            this.menus.zIndex = 10;
            let point = event.getLocation();
            let celIndex = this._getTouchCelIndex(point);
            let row = MapData.getInstance().row;
            let col = MapData.getInstance().col;
            let cel = MapData.getInstance().cel;
            if (celIndex.col < 3) {
                if (celIndex.row >= row - 3) {
                    this.menus.setAnchorPoint(0, 1);
                    this.menus.setPosition(cel * (celIndex.col + 1), cel * celIndex.row);
                } else {
                    this.menus.setAnchorPoint(0, 0);
                    this.menus.setPosition(cel * (celIndex.col + 1), cel * (celIndex.row + 1));
                }
            } else if (celIndex.col >= col - 3) {
                if (celIndex.row >= row - 3) {
                    this.menus.setAnchorPoint(1, 1);
                    this.menus.setPosition(cel * celIndex.col, cel * celIndex.row);
                } else {
                    this.menus.setAnchorPoint(1, 0);
                    this.menus.setPosition(cel * celIndex.col, cel * (celIndex.row + 1));
                }
            } else {
                if (celIndex.row >= row - 3) {
                    this.menus.setAnchorPoint(0, 1)
                    this.menus.setPosition(cel * celIndex.col, cel * celIndex.row);
                } else {
                    this.menus.setAnchorPoint(0, 0);
                    this.menus.setPosition(cel * celIndex.col, cel * (celIndex.row + 1));
                }
            }
            this.curCelIndex = celIndex;
        }
    }

    /**
     * @description: 绘图，根据绘制类型绘制，目前只用到 DrawType.LINE 与 DrawType.RECT
     * @param {DrawType} drawType
     * @param {*} data
     * @return {*}
     */
    public draw(drawType: DrawType, data) {
        switch (drawType) {
            case DrawType.RECT: {
                this.drawRect(data.x, data.y, data.width, data.height);
                break;
            }
            default: {
                break;
            }
        }
    }

    /**
     * @description: 绘制矩形填充框
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @return {*}
     */
    public drawRect(x: number, y: number, w: number, h: number): void {
        this._drawData.rect(x, y, w, h);
        let data: Uint8Array = this._drawData.getData();
        let texture: cc.Texture2D = this._drawSprite.spriteFrame.getTexture();
        let opts = texture._getOpts();
        opts.image = data;
        opts.images = [opts.image];
        texture.update(opts);
    }

    /**
     * @description: 展示地图配置数据，先清空当前地图显示
     * @param {*}
     * @return {*}
     */
    private loadExternalMapInfo() {
        this._drawData.setColor(0, 0, 0, 0);
        let width = MapData.getInstance().width;
        let height = MapData.getInstance().height;
        let cel = MapData.getInstance().cel;
        let rect = { x: 0, y: 0, width: width, height: height }
        this.draw(DrawType.RECT, rect);
        this._drawData.setColor(255, 0, 0, 50);

        let mapInfo = MapData.getInstance().mapInfo;
        for (let row in mapInfo) {
            for (let col in mapInfo[row]) {
                if (1 == mapInfo[row][col]) {
                    let rect = { x: Number(col) * cel, y: Number(row) * cel, width: cel, height: cel }
                    this.draw(DrawType.RECT, rect);
                }
            }
        }
    }
} 