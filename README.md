# @promarker/cli — ProMarker Stencil Validator

**ProMarker CLI** は、ProMarker ステンシル定義を **ローカルで検証する**ための公式ツールです。  
現行フェーズでは **生成は一切行いません**。雛形生成は **サーバ側の責務**として設計されています。

## What this is / is not
- ✅ **IS**: ステンシル定義（`stencil-settings.yml` 等）の初歩的ローカル検証ツール  
- ❌ **NOT**: 雛形生成器（生成は ProMarker サーバ／SaaS が担当）

## Roadmap
1. **Phase 1（現状）**: ローカル検証のみ（スキーマ/参照/存在チェック 等）  
2. **Phase 2（Next）**: **ローカル ProMarker サーバ**と結合（CLI は薄いクライアント。生成はサーバ側）  
3. **Phase 3**: **SaaS 接続**（認証・チーム連携）  
4. **Phase 4**: **mirel 等エコシステムと連携**

## Install
```bash
npm i -g @promarker/cli
```

## Usage

```bash
# 1) 定義の検証（ディレクトリ省略時はカレント）
promarker validate ./mirel/service/191207A --format text --fail-on error

# 2) JSON で結果をパースして使いたい場合
promarker validate . --format json > report.json

# 3) 実行環境の健全性確認
promarker doctor
```

## Commands

### `promarker validate [path]`
**Purpose**: Validate ProMarker stencil definitions in the specified directory

**Options**:
- `--format <text|json>`: Output format (default: text)
- `--fail-on <none|warn|error>`: Exit code threshold (default: error)  
- `--strict`: Enable strict validation mode
- `--ignore <patterns...>`: Glob patterns to ignore

**Validation includes**:
- `stencil-settings.yml` schema and required keys validation
- File existence checks for referenced files  
- Reference integrity (include/extend detection)
- Naming convention and basic conflict checks

### `promarker doctor`
**Purpose**: Check CLI environment and requirements

**Checks**:
- Node.js version compatibility (18+)
- CLI installation status
- Current directory stencil detection
- File permissions
- Future: Local ProMarker server connectivity (Phase 2)

## Exit Codes

* `0` = OK
* `1` = 警告あり（`--fail-on=warn` 以上のとき）
* `2` = エラー

## Typical Project Layout

```
/mirel/service/191207A/
├── stencil-settings.yml    # ステンシル定義（必須）
└── files/                  # 参照されるテンプレ群
    ├── src/
    │   └── main.ts.hbs
    ├── package.json.hbs
    └── README.md.hbs
```

## Validation Examples

### Valid `stencil-settings.yml`
```yaml
id: service-template
name: "Service Template"
version: "1.0.0"
type: "service"
description: "Basic service template with TypeScript"
files:
  - "files/package.json.hbs"
  - "files/src/main.ts.hbs"
  - "files/README.md.hbs"
variables:
  serviceName:
    type: string
    description: "Name of the service"
    required: true
```

### Command Usage
```bash
# Basic validation
promarker validate

# Validate specific directory with JSON output
promarker validate ./templates/my-stencil --format json

# Strict mode with warnings as errors
promarker validate --strict --fail-on warn

# Environment check
promarker doctor
```

## Development

### Prerequisites
- Node.js 18+
- npm

### Setup
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link

# Run tests
npm run test

# Lint code
npm run lint

# Type checking
npm run typecheck
```

### Project Structure
```
src/
  index.ts              # Main CLI entry point
  commands/             # Command implementations
    validate.ts         # Stencil validation logic
    doctor.ts           # Environment diagnostics
  test/                 # Tests
bin/
  promarker.mjs         # Executable launcher
dist/                   # Built output (ESM)
```

## Notes

* コマンド名は `promarker`（短縮 `pmkr` は alias）
* Node.js 18+ / ESM 前提
* 生成はサーバ側でのみ提供（CLI は検証＋クライアントに徹する設計）
* Phase 1 では**読み取り専用**。定義ファイル以外へ書き込まない

## Future Phases

**Phase 2** will add:
- Local ProMarker server integration  
- RPC/REST client functionality
- Server-side generation delegation

**Phase 3** will add:
- SaaS connectivity
- Authentication and team features
- Cloud-based generation and sharing

**Phase 4** will add:
- Integration with mirel and other OSS tools
- Enhanced ecosystem workflows

## License

MIT - see [LICENSE](LICENSE) for details.