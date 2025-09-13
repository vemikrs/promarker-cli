# ProMarker CLI - Copilot 開発ガイダンス

このドキュメントは GitHub Copilot や開発者がProMarker CLIの開発を支援する際の指針を提供します。

## プロジェクト概要

**ProMarker CLI** は、ProMarkerステンシル定義の**ローカル検証専用**のCLIツールです。

### 設計哲学
- **生成は一切行わない**：雛形生成はサーバ側の責務
- **検証に特化**：定義ファイルの健全性チェックのみ
- **読み取り専用**：ファイルシステムへの書き込み禁止

### フェーズ分離
1. **Phase 1（現状）**：ローカル検証のみ
2. **Phase 2**：ローカルProMarkerサーバ連携
3. **Phase 3**：SaaS接続
4. **Phase 4**：エコシステム連携（mirel等）

## アーキテクチャ

### 技術スタック
```
- TypeScript (strict mode)
- Commander.js (CLI framework)
- Zod (Schema validation)
- tsup (Build tool)
- Vitest (Testing)
- ESM only
```

### ディレクトリ構成
```
src/
├── index.ts           # Entry point
├── commands/          # Command implementations
│   ├── validate.ts    # promarker validate
│   └── doctor.ts      # promarker doctor
└── test/             # Test files
```

## コマンド仕様

### `promarker validate [path]`
**責務**: ステンシル定義の検証
**終了コード**: 0=OK, 1=警告, 2=エラー

**検証項目**:
- `stencil-settings.yml`スキーマ検証
- ファイル存在チェック (`files/`配下)
- 参照整合性 (include/extend)
- 循環参照検出
- 命名規約チェック（strict mode）

**出力形式**: text (人間向け) / json (機械向け)

### `promarker doctor`
**責務**: 実行環境の診断
- Node.js バージョンチェック
- CLI インストール確認
- 権限・パス確認

## 開発時の重要な制約

### DO (推奨)
- 読み取り専用操作
- スキーマベース検証
- 詳細なエラーメッセージ
- 終了コードの厳守 (0/1/2)
- TypeScriptの型安全性
- 包括的テストカバレッジ

### DON'T (禁止)
- ファイル生成・変更・削除
- ネットワーク通信
- サーバ起動・停止
- テンプレート展開
- 外部依存のダウンロード

## コーディング規約

### ファイル命名
- kebab-case for files: `validate-command.ts`
- PascalCase for classes: `ValidationResult`
- camelCase for variables/functions: `validateStencil`

### エラーハンドリング
```typescript
// 良い例
export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// 悪い例 - throw は使わない
throw new Error("Validation failed");
```

### 終了コード
```typescript
// 必ず正しい終了コードを設定
process.exit(result.hasErrors ? 2 : result.hasWarnings ? 1 : 0);
```

## テスト戦略

### テストファイル配置
- `src/test/` 配下に配置
- `*.test.ts` 命名規約
- コマンド別にテストファイル分離

### テストカバレッジ目標
- 各コマンドの正常系/異常系
- スキーマ検証の網羅
- 出力フォーマットの確認
- 終了コードの検証

## よくあるタスクパターン

### 新しい検証ルールの追加
1. `src/commands/validate.ts` に検証ロジック追加
2. スキーマ定義更新 (Zod)
3. エラーメッセージ定義
4. テストケース追加
5. README.md のドキュメント更新

### CLI オプション追加
1. Commander.js の option 定義
2. 型定義更新
3. ヘルプテキスト更新
4. テストケース追加

### 出力フォーマット修正
1. text/json 両方の形式を考慮
2. 機械可読性の確保 (json)
3. 人間可読性の確保 (text)
4. 色付き出力の適切な使用

## デバッグ・開発支援

### 開発コマンド
```bash
npm run dev          # 開発モード (tsx watch)
npm run build        # ビルド
npm run test         # テスト実行
npm run test:run     # 一回のテスト実行
npm run lint         # ESLint
npm run format       # Prettier
```

### デバッグ用サンプル
`src/test/fixtures/` にサンプルステンシル定義を配置

## Phase 2 への準備

Phase 2 (サーバ連携) では以下を追加予定:
- `promarker generate` (サーバ経由)
- `promarker server` (ローカルサーバ管理)
- 設定ファイル (`~/.promarker/config`)
- 認証・接続管理

ただし、**Phase 1 では一切実装しない**ことを厳守。

## 品質基準

### コードレビューポイント
- [ ] 生成処理が含まれていないか
- [ ] ファイル書き込みが発生していないか
- [ ] 終了コードが正しく設定されているか
- [ ] エラーメッセージが分かりやすいか
- [ ] テストが網羅的か

### パフォーマンス基準
- 小さなプロジェクト（10ファイル未満）: 500ms以内
- 中規模プロジェクト（100ファイル未満）: 2s以内
- 大規模プロジェクト（1000ファイル未満）: 10s以内

## 関連リソース

- [ProMarker 公式サイト](https://promarker.jp)
- [ステンシル仕様書](docs/stencil-spec.md)
- [mirel 連携仕様](docs/mirel-integration.md)

---

このガイダンスに従って開発することで、ProMarker CLIの設計思想に沿った高品質なコードを維持できます。