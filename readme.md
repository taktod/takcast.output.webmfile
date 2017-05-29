# takcast.output.webmfile

# 作者

taktod

https://twitter.com/taktod

poepoemix@hotmail.com

# 概要

electronで作ってみる配信ツールのtakcastで利用する
webmとしてファイル保存するプラグイン

# 使い方

takcastのプロジェクトで

```
$ npm install taktod/takcast.output.webmfile
$ npm run setup
```

を実行するとプラグインがインストールされて
必要な情報がセットアップされます。

# takcastとは

electronを使って作ってみた、映像と音声を合成して配信するツール
元ネタは、勤めている会社にopenGLで映像合成をしたらどのようになるか提示するのに作ってみたプログラムです。
せっかくなので公開してみようと思いました。

# 構成

## node/index.ts

node側処理用のpluginエントリー
このサンプルでは、ipcMainによる通信の受信口を作成し、MediaRecorderで生成したwebmデータを
受け取りファイルに書き出しています。

## render/index.ts

render側処理用のpluginエントリー
media pluginが作成したデータをMediaRecorderを利用して、webm化しnode側に投げています。

## render/ui/settingComponent.tsx

このpluginの動作を設定するfooterに表示される設定項目のGUI設定

