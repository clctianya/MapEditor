/*
 * @Author: Justin
 * @Date: 2021-01-09 20:47:08
 * @LastEditTime: 2021-01-12 17:31:26
 * @Description: 大地图大小超出设计大小时，需要进行切割进行编辑，暂未实现每个地图块的区分
 */

import { MapData } from './MapData.js';
import OnFire from "./OnFire";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MapEdit extends cc.Component {

    @property({ type: cc.Node, tooltip: "相机", displayName: "camera" })
    private camera: cc.Node = null;

    @property({ type: cc.Node, tooltip: "绘图节点", displayName: "drawNode" })
    private drawNode: cc.Node = null;


    @property({ type: cc.Node, tooltip: "保存界面", displayName: "infoWindow" })
    private infoWindow: cc.Node = null;

    @property({ type: cc.EditBox, tooltip: "文件名输入", displayName: "fileNameEditBox" })
    private fileNameEditBox: cc.EditBox = null;

    public onLoad(): void {
        OnFire.on('moveCamera', this.moveCamera, this);
        // onfire.on('clearCel', this.clearCel, this);
        OnFire.on('showSaveInfo', this.showSaveInfo, this);
    }

    private moveCamera(): void {
        // this.camera.x = -640;
        // this.camera.y = -320;
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
