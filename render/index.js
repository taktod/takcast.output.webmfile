"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var settingComponent_1 = require("./ui/settingComponent");
var electron = require("electron");
var ipcRenderer = electron.ipcRenderer;
var WebmFile = (function () {
    function WebmFile() {
        this.name = "webmFile";
        this.type = "output";
        this.activeMedia = null;
        this.targetMedia = null;
        this.event = null;
        //    this.stream = null;
        this.recorder = null;
        //    this.node = null;
        this.startTime = 0;
        this.saveSize = 0;
    }
    WebmFile.prototype.setPlugins = function (plugins) {
        this.basePlugin = plugins["base"][0];
    };
    WebmFile.prototype.refSettingComponent = function () {
        // 下部の設定の部分のコンポーネントをつくって応答しなければならない。
        return settingComponent_1.settingComponent(this);
    };
    WebmFile.prototype.onChangeActiveMedia = function (media) {
        // activeなmediaが変更になった場合の通知
        // 設定をするときには、activeなmediaのデータをベースに変換をかける的な感じにする予定
        // なお、activeなmediaはサイズが変更になったときとか、mediaは変更しないけど、設定がかわったときにもcallするものとしたいと思う。
        // 現在activeになっているmediaを保持しておいて、その動作を実施するときにこのmediaからデータを取得するようにすればよいという次第で・・・
        if (this.targetMedia == media) {
            // 現在処理しているmediaがactiveになった場合は、設定がかわっている可能性がある。
            // その場合は切断しないと処理できなくなる。
        }
        this.activeMedia = media;
    };
    WebmFile.prototype.onRemoveMedia = function (media) {
        // 特定のmediaが破棄されるときの動作
        // 該当mediaを利用して配信しているoutputがある場合は
        // mediaがなくなって動作できなくなるので、停止を実施する必要があると思う。
        // 基本現状の動作だとこっちにくることはない。
        if (this.targetMedia == media) {
            // clearされたのが放送しているやつでした。
            // 現在の処理を完了させて終わらせます。
            this._finishRecording();
        }
    };
    WebmFile.prototype._startRecording = function (event, filename) {
        var _this = this;
        // 録画を開始します。
        this.event = event;
        // activeMediaをつくって保存するようにする。
        // recorderを作ろうと思う。
        if (this.activeMedia == null) {
            this._finishRecording();
            return false;
        }
        if (!filename || filename.length <= 0) {
            alert("ファイル名が設定されていません");
            return false;
        }
        this.targetMedia = this.activeMedia;
        var stream = new MediaStream();
        // 映像(fpsはここで指定)
        var videoStream = this.targetMedia.refCanvas().captureStream(15);
        stream.addTrack(videoStream.getTracks()[0]);
        // 音声
        var node = this.basePlugin.refAudioContext().createMediaStreamDestination();
        this.targetMedia.refNode().connect(node);
        node.connect(this.basePlugin.refDevnullNode());
        stream.addTrack(node.stream.getTracks()[0]);
        if (this.recorder) {
            this.recorder.stop();
        }
        // ファイル名を送っておく。
        ipcRenderer.send(this.name + "setFile", filename);
        // 開始時刻、録画データサイズをクリア
        this.startTime = new Date().getTime();
        this.saveSize = 0;
        // recorder作成
        this.recorder = new MediaRecorder(stream, {
            mimeType: "video/webm; codecs=vp9,opus",
            videoBitsPerSecond: 600000,
            audioBitsPerSecond: 64000
        });
        // データ生成時のcallback
        this.recorder.ondataavailable = function (event) {
            // 本当にデータの中身があるか確認
            if (event.data.size > 0) {
                _this.saveSize += event.data.size;
                // blobのままだと転送できないのでArrayBuffer -> Uint8Arrayにする
                var fr = new FileReader();
                fr.onloadend = function (ev) {
                    ipcRenderer.send(_this.name + "append", new Uint8Array(fr.result));
                };
                fr.readAsArrayBuffer(event.data);
            }
            // データのcallbackがきたら、保存情報を更新してやる
            _this.event.onProcess({
                size: _this.saveSize,
                time: (new Date().getTime() - _this.startTime)
            });
        };
        // 1秒ごとに録画処理をすることにする
        this.recorder.start(1000);
        return true;
    };
    WebmFile.prototype._finishRecording = function () {
        if (this.recorder) {
            this.recorder.stop();
            this.recorder = null;
        }
        if (this.event) {
            this.event.onStop();
        }
    };
    return WebmFile;
}());
exports.WebmFile = WebmFile;
exports._ = new WebmFile();
