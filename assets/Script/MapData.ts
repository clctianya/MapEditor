/*
 * @Author: Justin
 * @Date: 2021-01-11 23:08:10
 * @LastEditTime: 2021-01-12 16:49:49
 * @Description: 0 表示可过，1 表示不可过
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

    public _width: number = 0;
    public get width(): number { return this._width; }
    public set width(width: number) { this._width = width; }

    private _mapInfo: any = {}
    public get mapInfo(): any { return this._mapInfo; }

    public static getInstance(): MapData {
        if (MapData._instance == null) {
            MapData._instance = new MapData();
        }
        return MapData._instance;
    }

    public initGrids(size: cc.Size) {
        this.width = size.width;
        this.height = size.height;
        this.col = Math.ceil(size.width / this.cel);
        this.row = Math.ceil(size.height / this.cel);
        console.log("格子数量", this.col, this.row);
        this.init();
    }

    public init() {
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
        // cc.loader.load();
        // cc.assetManager.loadAny()
        cc.resources.load(fileName, cc.Asset, (err, data) => {
            console.log("data", JSON.stringify(data));
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
            downloadLink.download = fileName;
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