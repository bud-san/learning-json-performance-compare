# 巨大JSON一覧 Before/After比較

同じダミーデータ・同じUIで「未対策版（Before）」と「対策版（After）」を比較できる検証用実装です。

## セットアップ

```bash
mise install
bun install
bun run generate:mock-data   # public/mock-mt-data/mt-export.json を生成（初回のみ）
bun run dev
```

`/compare/before` と `/compare/after` をブラウザで開き、上部のナビゲーションで行き来しながら画面下部のデバッグパネル（fetch時間 / parse時間 / Long Tasks合計 / CLS値）を見比べてください。デバッグパネルは画面下部に常時固定表示され、スクロールしても数値を見ながら操作できる。Long Tasks合計が200ms以上、CLS値が0.1以上になると、その項目が赤字・太字・点滅表示になり一目で分かるようにしている。

## Before/Afterの違い

| 観点 | Before（未対策版） | After（対策版） |
| --- | --- | --- |
| データ取得・パース | メインスレッドで直接fetch・JSON.parse | Web Worker内でfetch・parse・フィルタを実行し、メインスレッドは表示分だけ受け取る |
| キャッシュ | なし（毎回フルフェッチ） | IndexedDBにETagとともにキャッシュし、再訪問時の無駄な再フェッチを回避（TTLあり） |
| フィルタ処理 | 条件ごとに配列を舐め直す素朴な書き方 | 条件を1関数ずつに分解し、1回の走査で判定 |
| 初回表示 | 何も表示せず待たせる | スケルトンを即座に表示し、データ到着後に中身だけ差し替え |
| 画像 | サイズ未指定で読み込み時にガクつく | width/height・aspect-ratioを固定し読み込み前後でサイズが変わらない |
| フィルタ変更中 | 都度そのまま再計算・表示 | 直前の結果を薄く表示しつつコンテナサイズは維持 |
| 表示判定を伴うコンテンツ（例：同意バナー） | Reactのマウント後（useEffect）にlocalStorageを判定して消すため、判定が終わるまでの間表示されたページ全体が詰まってガクつく | HTMLパース中に同期実行するインラインscriptでlocalStorageを判定し、ページのレイアウトが確定する前に取り除くためガクつかない |

## 体感でも差を確認したい場合

数百ms程度のLong Tasksは、画面を眺めているだけでは気づきにくい。より明確に体感するには、Chrome DevToolsの **Performance** タブで実際の処理を録画するとよい。`bun run dev`のままでも傾向は確認できるが、より正確な数値を見たい場合は後述のとおり `bun run build` → `bun run preview` の本番相当ビルドに対して録画すること（`dev`はVite/Astroの開発用スクリプトが余分なLong Taskとして記録に混ざりうる）。

1. `/compare/before?from=2023-01-01&to=2024-12-31` のように、開始日・終了日を指定したURLで開く（Before版の日付フィルタが最も重くなる条件）
2. DevToolsを開き、Performanceタブで record（●）ボタンを押してからページをリロード
3. 数秒後に停止し、タイムラインに現れる赤い帯（Long Task）の長さと数を確認する。同じ操作をAfter版（`/compare/after?from=...&to=...`）でも録画し、赤い帯がほぼ消えることと比較する
4. 低スペック端末を模したい場合は、DevToolsの「Performance」タブ内でCPU設定を「4x slowdown」等にしてから同様に録画すると、体感差がさらに分かりやすくなる

表示判定を伴うコンテンツ（同意バナーを例に実装）のガクツキは、初回アクセス時ではなく「同意済みの状態で再訪問したとき」に発生する。以下の手順で確認できる。

1. `/compare/before`（または`/compare/after`）を開き、画面上部のバナーで「同意する」を押す（`localStorage`に同意済みの状態が保存される）
2. DevToolsのPerformanceタブでrecordボタンを押してからページをリロードする
3. Beforeはリロード直後にバナーが一瞬表示されてから消え、その分ページ全体が上に詰まってレイアウトシフトが記録される。Afterはバナーが最初から表示されずレイアウトシフトが発生しない
4. `localStorage`をクリアすると再び未同意の状態に戻る（DevToolsのApplicationタブ、またはシークレットウィンドウでの再アクセスで確認できる）

## Lighthouseで計測する場合の注意

**Lighthouseは必ず本番ビルド（`bun run build` → `bun run preview`）に対して実行すること。** `bun run dev`（開発サーバー）に対して実行すると、Viteの`@vite/client`やAstro devtoolbarなど本番には存在しない読み込みが乗り、Before/Afterの差が正しく計測できない（実際に開発サーバーに対して計測すると、両者のPerformanceスコアがほぼ同じ値になってしまう）。

```bash
bun run build
bun run preview   # http://localhost:4321 で本番相当のビルドを配信
```

その状態で `http://localhost:4321/compare/before` と `http://localhost:4321/compare/after` をそれぞれLighthouseで計測すると、次のように明確な差が出る（実測例。データ件数・実行環境によって変動する）。

| 指標 | Before | After |
| --- | --- | --- |
| Performanceスコア | 0.73 | 0.95 |
| LCP (Largest Contentful Paint) | 16.7 s | 2.9 s |
| TBT (Total Blocking Time) | 150 ms | 0 ms |
| TTI (Time to Interactive) | 16.7 s | 2.9 s |

LCPが両ページとも数秒〜十数秒とかなり大きいのは、ダミー画像を外部サービス（picsum.photos）から取得しているため（実運用ではCDN配信された自社ドメインの画像になり、もっと短くなる）。それでも対策の有無の差がLCP・TBT・TTIに明確に表れている。
CLS値はLighthouseの単発計測では両ページとも`0`と出ることがある（画像の読み込みタイミングがLighthouseの計測ウィンドウと重ならない場合があるため）。CLSの差を確認したい場合は、前述のPlaywright実測や画面下部のデバッグパネル、または実際にブラウザで操作しながらの目視確認を使うこと。
