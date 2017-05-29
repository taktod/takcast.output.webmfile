import {IPlugin} from "takcast.interface";

import {ipcMain} from "electron";

import * as fs from "fs";

export class WebmFile {
  public name = "webmFile";
  public type = "output";
  public targetFile = null;
  public setPlugins(plugins:{[key:string]:Array<IPlugin>}):void {
    // ここでnode側でセットアップする何某を作成することが可能になる
    // あとは初アクセスの場合に前のデータを削除する動作が必要なくらいかな
    ipcMain.on(this.name + "append", (event:string, args: any) => {
      // データ追記動作
      fs.appendFile(this.targetFile, args as Buffer, () => {});
    });
    ipcMain.on(this.name + "setFile", (event:string, args:any) => {
      this.targetFile = args;
      // 前のファイルを削除しとく
      if(fs.existsSync(this.targetFile)) {
        fs.unlink(this.targetFile, () => {});
      }
    });
  }
}

export var _ = new WebmFile();
