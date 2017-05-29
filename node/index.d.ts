import { IPlugin } from "takcast.interface";
export declare class WebmFile {
    name: string;
    type: string;
    targetFile: any;
    setPlugins(plugins: {
        [key: string]: Array<IPlugin>;
    }): void;
}
export declare var _: WebmFile;
