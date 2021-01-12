/*
 * @Author: Justin
 * @Date: 2021-01-12 17:27:08
 * @LastEditTime: 2021-01-12 17:28:00
 * @Description: 绘制地图上层网络,以网格为区分对地图进行编辑
 */

import { DrawData, DrawType } from "./DrawData";
import { MapData } from "./MapData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Gridlines extends cc.Component {
    private _drawNode: cc.Node;
    private _drawSprite: cc.Sprite;
    private _drawData: DrawData

    public onLoad() {
        this.initGridlines();
        this.drawLines();

    }
    /**
     * @description: 初始化绘图数据
     * @param {*}
     * @return {*}
     */
    private initGridlines(): void {
        let size: cc.Size = this.node.getContentSize();
        MapData.getInstance().initGrids(size)
        let col = Math.ceil(size.width / MapData.getInstance().cel)
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
        texture.initWithData(data, 16, size.width, size.height);
        texture.setFlipY(true);
        this._drawSprite.spriteFrame.setTexture(texture);
    }
    /**
     * @description: 地图分格
     * @param {*}
     * @return {*}
     */
    public drawLines(): void {
        let col = MapData.getInstance().col;
        let row = MapData.getInstance().row;
        let cel = MapData.getInstance().cel;
        let width = MapData.getInstance().width;
        let height = MapData.getInstance().height;
        for (let i = 0; i <= col; i++) {
            this.draw(DrawType.LINE, { x1: i * cel, y1: 0, x2: i * cel, y2: height })
        }

        for (let i = 0; i <= row; i++) {
            this.draw(DrawType.LINE, { x1: 0, y1: i * cel, x2: width, y2: i * cel })
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
            case DrawType.LINE: {
                this.drawLine(data.x1, data.y1, data.x2, data.y2);
                break;
            }
            default: {
                break;
            }
        }
    }

    /**
     * @description: 划直线
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @return {*}
     */
    public drawLine(x1: number, y1: number, x2: number, y2: number) {
        this._drawData.line(x1, y1, x2, y2);
        let data: Uint8Array = this._drawData.getData();
        let texture: cc.Texture2D = this._drawSprite.spriteFrame.getTexture();
        let opts: any = texture._getOpts();
        opts.image = data;
        opts.images = [opts.image];
        texture.update(opts);
    }
}
