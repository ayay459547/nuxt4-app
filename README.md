# demo

### 常用
```sh
#### 安裝套件
npm install
#### 強制安裝依賴，忽略衝突和錯誤的依賴關係
npm install --force
#### 使用舊版的依賴解析策略，忽略對等依賴衝突
npm install --legacy-peer-deps

#### 代碼類型檢查
npm run type-check

#### 運行開發環境
npm run dev

#### 運行上線環境
npm run pro

### 代碼格式檢查+修正
npm npm run lint

#### 代碼格式化 (全部的檔案)
npm run format
```

### 套件管理
```sh
#### 檢查package版本漏洞(不一定要修, 由於不是直接安裝)
npm audit

#### 更新套件
npm update

#### 線上最新版本, 本地套件版本 比對
npm outdated
```

### commit message
* feat: 新增/修改功能 (feature)。
* fix: 修補 bug (bug fix)。
* docs: 文件 (documentation)。
* style: 格式 (不影響程式碼運行的變動 white-space, formatting, missing semi colons, etc)。
* refactor: 重構 (既不是新增功能，也不是修補 bug 的程式碼變動)。
* perf: 改善效能 (A code change that improves performance)。
* test: 增加測試 (when adding missing tests)。
* chore: 建構程序或輔助工具的變動 (maintain)。
* revert: 撤銷回覆先前的 commit 例如：revert: type(scope): subject (回覆版本：xxxx)
