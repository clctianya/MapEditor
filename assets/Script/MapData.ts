/*
 * @Author: Justin
 * @Date: 2021-01-11 23:08:10
 * @LastEditTime: 2021-01-16 20:41:49
 * @Description: 地图中标记 0 表示可过，1 表示不可过
 */

import OnFire from "./OnFire";

export class MapData {
    private static _instance: MapData;

    private mapIndex: number = 0;

    public cel: number = 64;

    protected _col: number = 0;
    public get col(): number { return this._col; }
    public set col(col: number) { this._col = col; }

    protected _row: number = 0;
    public get row(): number { return this._row; }
    public set row(row: number) { this._row = row; }

    protected _height: number = 0;
    public get height(): number { return this._height; }
    public set height(height: number) { this._height = height; }

    protected _width: number = 0;
    public get width(): number { return this._width; }
    public set width(width: number) { this._width = width; }

    protected _cameraOffsetX: number = 0;
    public get cameraOffsetX(): number { return this._cameraOffsetX }
    public set cameraOffsetX(offsetX: number) { this._cameraOffsetX = offsetX; }

    protected _cameraOffsetY: number = 0;
    public get cameraOffsetY(): number { return this._cameraOffsetY }
    public set cameraOffsetY(offsetY: number) { this._cameraOffsetY = offsetY; }

    private _mapInfo: any = {}
    public get mapInfo(): any { return this._mapInfo; }


    public static getInstance(): MapData {
        if (MapData._instance == null) {
            MapData._instance = new MapData();
            MapData._instance.init();
        }
        return MapData._instance;
    }

    private init() {
        OnFire.on('cameraMoveEnd', this.cameraMoveEnd, this);
    }

    /**
     * @description: 相机移动结束
     * @param {*} data
     * @return {*}
     */
    private cameraMoveEnd(data) {
        this.cameraOffsetX = data.offsetX;
        this.cameraOffsetY = data.offsetY;
    }

    /**
     * @description: 初始化网格
     * @param {cc} size
     * @return {*}
     */
    public initGrids(size: cc.Size) {
        this.width = size.width;
        this.height = size.height;
        this.col = Math.ceil(size.width / this.cel);
        this.row = Math.ceil(size.height / this.cel);
        console.log("格子数量", this.col, this.row);
        this.initMapInfo();
    }

    /**
     * @description: 地图数据初始化
     * @param {*}
     * @return {*}
     */
    public initMapInfo() {
        this._mapInfo.width = this.width;
        this._mapInfo.height = this.height;
        this._mapInfo.col = this.col;
        this._mapInfo.row = this.row;
        this._mapInfo.cel = this.cel;
        for (let i = 0; i < this.row; ++i) {
            this._mapInfo[i] = {};
            for (let j = 0; j < this.col; ++j) {
                this._mapInfo[i][j] = 0;
            }
        }
    }

    /**
     * @description: 加载地图数据并显示
     * @param {string} fileName
     * @return {*}
     */
    public importExternalData(fileName: string): void {
        cc.resources.load(fileName, cc.Asset, (err, data) => {
            this._mapInfo = data['json'];
            OnFire.fire('loadExternalMapInfo');
        })
    }

    /**
     * @description: 更新单元格数据
     * @param {number} row
     * @param {number} col
     * @param {number} state
     * @return {*}
     */
    public updateCel(row: number, col: number, state: number) {
        this._mapInfo[row][col] = state;
    }

    /**
     * @description: 保存地图数据
     * @param {*}
     * @return {*}
     */
    public saveData(fileName: string): void {
        if (cc.sys.isBrowser) {
            let datas = JSON.stringify(this._mapInfo);
            var textFileAsBlob = new Blob([datas], { type: 'application/json' });
            var downloadLink = document.createElement("a");
            downloadLink.download = fileName + '.json';
            downloadLink.innerHTML = "Download File";
            if (window.webkitURL != null) {
                // Chrome允许点击链接
                //而无需实际将其添加到DOM中。
                downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
            }
            else {
                //在点击之前 Firefox要求将链接添加到DOM中
                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                downloadLink.onclick = this.destroyClickedElement;
                downloadLink.style.display = "none";
                document.body.appendChild(downloadLink);
            }
            downloadLink.click();
        }
    }

    public destroyClickedElement(event) {
        // remove the link from the DOM
        document.body.removeChild(event.target);
    }
}