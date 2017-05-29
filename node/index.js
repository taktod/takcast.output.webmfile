"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var fs = require("fs");
var WebmFile = (function () {
    function WebmFile() {
        this.name = "webmFile";
        this.type = "output";
        this.targetFile = null;
    }
    WebmFile.prototype.setPlugins = function (plugins) {
        var _this = this;
        // ここでnode側でセットアップする何某を作成することが可能になる
        // あとは初アクセスの場合に前のデータを削除する動作が必要なくらいかな
        electron_1.ipcMain.on(this.name + "append", function (event, args) {
            // データ追記動作
            fs.appendFile(_this.targetFile, args, function () { });
        });
        electron_1.ipcMain.on(this.name + "setFile", function (event, args) {
            _this.targetFile = args;
            // 前のファイルを削除しとく
            if (fs.existsSync(_this.targetFile)) {
                fs.unlink(_this.targetFile, function () { });
            }
        });
    };
    return WebmFile;
}());
exports.WebmFile = WebmFile;
exports._ = new WebmFile();
