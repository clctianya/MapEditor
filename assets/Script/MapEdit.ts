/*
 * @Author: Justin
 * @Date: 2021-01-09 20:47:08
 * @LastEditTime: 2021-01-13 14:55:28
 * @Description: 大地图大小超出设计大小时，需要进行切割进行编辑，暂未实现每个地图块的区分
 */

import { MapData } from './MapData.js';
import OnFire from "./OnFire";

const mw = 640;
const mh = 320;


const { ccclass, property } = cc._decorator;

@ccclass
export default class MapEdit extends cc.Component {

    @property({ type: cc.Node, tooltip: "相机", displayName: "camera" })
    private camera: cc.Node = null;

    @property({ type: cc.Node, tooltip: "地图节点,需要手动设置其大小", displayName: "mapNode" })
    private mapNode: cc.Node = null;

    @property({ type: cc.Node, tooltip: "保存界面", displayName: "infoWindow" })
    private infoWindow: cc.Node = null;

    @property({ type: cc.EditBox, tooltip: "文件名输入", displayName: "fileNameEditBox" })
    private fileNameEditBox: cc.EditBox = null;

    @property({ type: cc.Node, tooltip: "控制相机移动", displayName: "cameMoveNode" })
    private cameMoveNode: cc.Node = null;

    public onLoad(): void {
        let gridlines = cc.find('gridlines', this.node);
        gridlines.width = this.mapNode.width;
        gridlines.height = this.mapNode.height;
        let gridcel = cc.find('celNode', this.node);
        gridcel.width = this.mapNode.width;
        gridcel.height = this.mapNode.height;
        console.log("width", this.mapNode.width, this.mapNode.height);
    }

    public start() {
        OnFire.on('showSaveInfo', this.showSaveInfo, this);
        OnFire.on('showMoveCamera', this.showMoveCamera, this);
    }

    private showMoveCamera() {
        console.log("展示移动界面");
        this.cameMoveNode.active = true;
    }

    /**
     * @description: 地图移动，同时相机控制板也跟着移动
     * @param {cc} event
     * @param {string} direction
     * @return {*}
     */
    private moveCamera(event: cc.Touch, direction: string): void {
        let x = 0;
        let y = 0;
        switch (Number(direction)) { //一次移动只移动设计分辨率宽度的一半，方便查看已编辑过的区域
            case Direction.right: {
                x = this.camera.x + mw;
                x = x >= MapData.getInstance().width - 2 * mw ? (MapData.getInstance().width - 2 * mw) : x;
                y = this.camera.y;
                break;
            }
            case Direction.top: {
                y = this.camera.y + mh;
                y = y >= (MapData.getInstance().height - 2 * mh) ? (MapData.getInstance().height - 2 * mh) : y;
                x = this.camera.x;
                break;
            }
            case Direction.left: {
                x = this.camera.x - mw;
                x = x <= 0 ? 0 : x;
                y = this.camera.y;
                break;
            }
            case Direction.bottom: {
                y = this.camera.y - mh;
                y = y <= 0 ? 0 : y;
                x = this.camera.x;
                break;
            }
            default: {
                break;
            }
        }
        cc.tween(this.camera)
            .to(0.2, { x: x, y: y })
            .call(() => {
                console.log("相机移动结束");
            })
            .start();
        cc.tween(this.cameMoveNode)
            .to(0.2, { x: x, y: y })
            .call(() => {
                this.cameMoveNode.active = false;
                OnFire.fire('cameraMoveEnd', { offsetX: x, offsetY: y })
            })
            .start();
    }

    private showSaveInfo(data: boolean) {
        this.infoWindow.active = true;
        console.log("data = ", data);
        cc.find('save', this.infoWindow).active = data;
        cc.find('import', this.infoWindow).active = !data;
    }

    private onClickSave() {
        let str = this.fileNameEditBox.string;
        if (str.length > 0) {
            MapData.getInstance().saveData(this.fileNameEditBox.string);
        }
        this.infoWindow.active = false;
    }

    private onClickImportMapInfo() {
        let str = this.fileNameEditBox.string;
        if (str.length > 0) {
            MapData.getInstance().importExternalData(str);
        }
        this.infoWindow.active = false;
    }
}

enum Direction {
    right = 0,
    top,
    left,
    bottom
}