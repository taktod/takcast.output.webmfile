// 出力の下部にある設定コンポーネントを作る動作

import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";

import {WebmFile} from "..";
import {SaveEventListener} from "..";

var Form = ReactBootstrap.Form;
var FormGroup = ReactBootstrap.FormGroup;
var Navbar = ReactBootstrap.Navbar;
var Button = ReactBootstrap.Button;

import * as electron from "electron";
var dialog = null;
if(electron) {
  dialog = electron.remote.dialog;
}

// 出力の部分にある保存動作のGUI処理
export var settingComponent = (webmFile:WebmFile):any => {
  return class SettingComponent extends React.Component<{}, {}> implements SaveEventListener {
    state = {file: "", recording:false, size:0, time:0};
    constructor() {
      super();
      this.file = this.file.bind(this);
      this.toggleSave = this.toggleSave.bind(this);
    }
    private file() {
      // ファイル選択ダイアログ処理
      if(location.protocol.match(/^http/)) {
        alert("ファイル保存動作はstandaloneでのみ動作します。");
      }
      else {
        dialog.showSaveDialog(
          null,
          {
            title: "save",
            defaultPath: ".",
            filters: [
              {name: "webm movie file", extensions: ["webm"]}
            ]
          },
          (filename) => {
            // ここにデータを保存する
            // 保存してたら、停止する
            if(!filename) {
              return;
            }
            webmFile._finishRecording();
            this.setState({file: filename});
          }
        )
      }
    }
    private toggleSave() {
      // 保存ボタンがおされたときの処理
      if(this.state.recording) {
        webmFile._finishRecording();
      }
      else {
        this.setState({recording: true});
        if(!webmFile._startRecording(this, this.state.file)) {
          webmFile._finishRecording();
        }
      }
    }
    public onProcess(info) {
      // 更新情報がきたので、更新しなければならない
      this.setState(info);
    }
    public onStop(genAddress) {
      this.setState({file: genAddress, recording: false});
    }
    public render() {
      return (
        <div>
          <div>
            <Navbar.Text>
              <Button onClick={this.file}><span className="glyphicon glyphicon-folder-open" aria-hidden="true"></span></Button>
              <Button onClick={this.toggleSave} active={this.state.recording == true}><span className="glyphicon glyphicon-save" aria-hidden="true"></span></Button>
            </Navbar.Text>
            <Navbar.Text>
              {((file) => {
                // ファイル名を表示する
                if(location.protocol.match(/^http/)) {
                  if(file == "") {
                    return "";
                  }
                  else {
                    // downloadのリンクを出す動作
                    return <a href={file} target="_blank">download {file}</a>
                  }
                }
                else {
                  var matches = file.match(/[^/]+$/);
                  if(matches != null && matches.length > 0) {
                    return matches[0];
                  }
                  else {
                    return "";
                  }
                }
              })(this.state.file)}
              <br />
              {((time) => {
                // 処理時間を表示する
                var t = Math.ceil(time / 1000);
                var string = "";
                var sec = "0" + (t % 60);
                t = Math.floor(t / 60);
                var min = "" + t % 60;
                return min + ":" + sec.substr(-2);
              })(this.state.time)} / {
               ((size) => {
                // 処理データサイズを表示する
                if(size < 10000) {
                  return size + " B";
                }
                else if(size < 10000000) {
                  return (Math.ceil(size / 100)/10) + " kB"
                }
                return (Math.ceil(size / 100000)/10) + " MB"
              })(this.state.size)}
            </Navbar.Text>
          </div>
        </div>
      );
    }
  }
}
