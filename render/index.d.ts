/// <reference types="react" />
/**
 * webmとして出力させる
 * 出力plugin
 * ファイルとして保存します。
 */
import * as React from "react";
import { IPlugin } from "takcast.interface";
import { IOutputPlugin } from "takcast.interface";
import { IMediaPlugin } from "takcast.interface";
export interface SaveEventListener {
    onStop(): any;
    onProcess(info: any): any;
}
export declare class WebmFile implements IOutputPlugin {
    name: string;
    type: string;
    private activeMedia;
    private targetMedia;
    private event;
    private recorder;
    private basePlugin;
    private startTime;
    private saveSize;
    constructor();
    setPlugins(plugins: {
        [key: string]: Array<IPlugin>;
    }): void;
    refSettingComponent(): React.ComponentClass<{}>;
    onChangeActiveMedia(media: IMediaPlugin): void;
    onRemoveMedia(media: IMediaPlugin): void;
    _startRecording(event: SaveEventListener, filename: string): boolean;
    _finishRecording(): void;
}
export declare var _: WebmFile;
