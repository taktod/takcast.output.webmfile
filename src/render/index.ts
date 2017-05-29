/**
 * webmとして出力させる
 * 出力plugin
 * ファイルとして保存します。
 */
import * as React from "react";

import {IPlugin} from "takcast.interface";
import {IOutputPlugin} from "takcast.interface";
import {IMediaPlugin} from "takcast.interface";
import {IBasePlugin} from "takcast.interface";

import {settingComponent} from "./ui/settingComponent";

import * as electron from "electron";
var ipcRenderer = electron.ipcRenderer;

export interface SaveEventListener {
  // 停止した時の処理
  onStop();
  // 処理情報を通知しておく
  onProcess(info);
}

declare var MediaRecorder: any;

export class WebmFile implements IOutputPlugin {
  public name:string = "webmFile";
  public type:string = "output";

  // 現在activeになっているMedia
  private activeMedia:IMediaPlugin;
  // 現在処理しているMedia
  private targetMedia:IMediaPlugin;

  // 処理イベントを通知する相手保持
  private event:SaveEventListener;
  // 動作stream
//  private stream:MediaStream;
//  private node:AudioNode;
  private recorder:any;
  private basePlugin:IBasePlugin;
  private startTime:number;
  private saveSize:number;
  constructor() {
    this.activeMedia = null;
    this.targetMedia = null;
    this.event = null;
//    this.stream = null;
    this.recorder = null;
//    this.node = null;
    this.startTime = 0;
    this.saveSize = 0;
  }
  public setPlugins(plugins:{[key:string]:Array<IPlugin>}):void {
    this.basePlugin = plugins["base"][0] as IBasePlugin;
  }
  public refSettingComponent():React.ComponentClass<{}> {
    // 下部の設定の部分のコンポーネントをつくって応答しなければならない。
    return settingComponent(this);
  }
  public onChangeActiveMedia(media:IMediaPlugin):void {
    // activeなmediaが変更になった場合の通知
    // 設定をするときには、activeなmediaのデータをベースに変換をかける的な感じにする予定
    // なお、activeなmediaはサイズが変更になったときとか、mediaは変更しないけど、設定がかわったときにもcallするものとしたいと思う。
    // 現在activeになっているmediaを保持しておいて、その動作を実施するときにこのmediaからデータを取得するようにすればよいという次第で・・・
    if(this.targetMedia == media) {
      // 現在処理しているmediaがactiveになった場合は、設定がかわっている可能性がある。
      // その場合は切断しないと処理できなくなる。
    }
    this.activeMedia = media;
  }
  public onRemoveMedia(media:IMediaPlugin):void {
    // 特定のmediaが破棄されるときの動作
    // 該当mediaを利用して配信しているoutputがある場合は
    // mediaがなくなって動作できなくなるので、停止を実施する必要があると思う。
    // 基本現状の動作だとこっちにくることはない。
    if(this.targetMedia == media) {
      // clearされたのが放送しているやつでした。
      // 現在の処理を完了させて終わらせます。
      this._finishRecording();
    }
  }
  public _startRecording(event:SaveEventListener, filename:string):boolean {
    // 録画を開始します。
    this.event = event;
    // activeMediaをつくって保存するようにする。
    // recorderを作ろうと思う。
    if(this.activeMedia == null) {
      this._finishRecording();
      return false;
    }
    if(!filename || filename.length <= 0) {
      alert("ファイル名が設定されていません");
      return false;
    }
    this.targetMedia = this.activeMedia;
    var stream = new MediaStream();
    // 映像(fpsはここで指定)
    var videoStream = (this.targetMedia.refCanvas() as any).captureStream(15) as MediaStream;
    stream.addTrack(videoStream.getTracks()[0]);

    // 音声
    var node = (this.basePlugin.refAudioContext() as any).createMediaStreamDestination();
    this.targetMedia.refNode().connect(node);
    node.connect(this.basePlugin.refDevnullNode());
    stream.addTrack((node as any).stream.getTracks()[0]);

    if(this.recorder) {
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
    this.recorder.ondataavailable = (event) => {
      // 本当にデータの中身があるか確認
      if(event.data.size > 0) {
        this.saveSize += event.data.size;
        // blobのままだと転送できないのでArrayBuffer -> Uint8Arrayにする
        var fr = new FileReader();
        fr.onloadend = (ev) => {
          ipcRenderer.send(this.name + "append", new Uint8Array(fr.result));
        };
        fr.readAsArrayBuffer(event.data as Blob);
      }
      // データのcallbackがきたら、保存情報を更新してやる
      this.event.onProcess({
        size:this.saveSize,
        time:(new Date().getTime() - this.startTime)
      });
    }
    // 1秒ごとに録画処理をすることにする
    this.recorder.start(1000);
    return true;
  }
  public _finishRecording() {
    if(this.recorder) {
      this.recorder.stop();
      this.recorder = null;
    }
    if(this.event) {
      this.event.onStop();
    }
  }
}

export var _ = new WebmFile();
