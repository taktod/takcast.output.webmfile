"use strict";
// 出力の下部にある設定コンポーネントを作る動作
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactBootstrap = require("react-bootstrap");
var Form = ReactBootstrap.Form;
var FormGroup = ReactBootstrap.FormGroup;
var Navbar = ReactBootstrap.Navbar;
var Button = ReactBootstrap.Button;
var electron = require("electron");
var dialog = electron.remote.dialog;
// 出力の部分にある保存動作のGUI処理
exports.settingComponent = function (webmFile) {
    return (function (_super) {
        __extends(SettingComponent, _super);
        function SettingComponent() {
            var _this = _super.call(this) || this;
            _this.state = { file: "", recording: false, size: 0, time: 0 };
            _this.file = _this.file.bind(_this);
            _this.toggleSave = _this.toggleSave.bind(_this);
            return _this;
        }
        SettingComponent.prototype.file = function () {
            var _this = this;
            // ファイル選択ダイアログ処理
            dialog.showSaveDialog(null, {
                title: "save",
                defaultPath: ".",
                filters: [
                    { name: "webm movie file", extensions: ["webm"] }
                ]
            }, function (filename) {
                // ここにデータを保存する
                // 保存してたら、停止する
                if (!filename) {
                    return;
                }
                webmFile._finishRecording();
                _this.setState({ file: filename });
            });
        };
        SettingComponent.prototype.toggleSave = function () {
            // 保存ボタンがおされたときの処理
            if (this.state.recording) {
                webmFile._finishRecording();
            }
            else {
                this.setState({ recording: true });
                if (!webmFile._startRecording(this, this.state.file)) {
                    webmFile._finishRecording();
                }
            }
        };
        SettingComponent.prototype.onProcess = function (info) {
            // 更新情報がきたので、更新しなければならない
            this.setState(info);
        };
        SettingComponent.prototype.onStop = function () {
            this.setState({ file: "", recording: false });
        };
        SettingComponent.prototype.render = function () {
            return (React.createElement("div", null,
                React.createElement("div", null,
                    React.createElement(Navbar.Text, null,
                        React.createElement(Button, { onClick: this.file },
                            React.createElement("span", { className: "glyphicon glyphicon-folder-open", "aria-hidden": "true" })),
                        React.createElement(Button, { onClick: this.toggleSave, active: this.state.recording == true },
                            React.createElement("span", { className: "glyphicon glyphicon-save", "aria-hidden": "true" }))),
                    React.createElement(Navbar.Text, null,
                        (function (file) {
                            // ファイル名を表示する
                            var matches = file.match(/[^/]+$/);
                            if (matches != null && matches.length > 0) {
                                return matches[0];
                            }
                            else {
                                return "";
                            }
                        })(this.state.file),
                        React.createElement("br", null),
                        (function (time) {
                            // 処理時間を表示する
                            var t = Math.ceil(time / 1000);
                            var string = "";
                            var sec = "0" + (t % 60);
                            t = Math.floor(t / 60);
                            var min = "" + t % 60;
                            return min + ":" + sec.substr(-2);
                        })(this.state.time),
                        " / ",
                        (function (size) {
                            // 処理データサイズを表示する
                            if (size < 10000) {
                                return size + " B";
                            }
                            else if (size < 10000000) {
                                return (Math.ceil(size / 100) / 10) + " kB";
                            }
                            return (Math.ceil(size / 100000) / 10) + " MB";
                        })(this.state.size)))));
        };
        return SettingComponent;
    }(React.Component));
};
