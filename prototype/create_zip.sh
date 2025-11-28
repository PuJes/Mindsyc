#!/bin/bash

# 1. 定义项目名称
ZIP_FILENAME="knowledge-flow-app.zip"
PROJECT_DIR="knowledge-flow"

# 2. 创建目录结构
mkdir -p "$PROJECT_DIR/src"

# 3. 写入 package.json
cat << 'EOF' > "$PROJECT_DIR/package.json"
{
  "name": "knowledge-flow",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
EOF

# 4. 写入配置文件
cat << 'EOF' > "$PROJECT_DIR/tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

cat << 'EOF' > "$PROJECT_DIR/tsconfig.node.json"
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

cat << 'EOF' > "$PROJECT_DIR/vite.config.ts"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
EOF

cat << 'EOF' > "$PROJECT_DIR/tailwind.config.js"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

cat << 'EOF' > "$PROJECT_DIR/postcss.config.js"
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

cat << 'EOF' > "$PROJECT_DIR/index.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KnowledgeFlow - AI 知识融合</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# 5. 写入源代码基础
cat << 'EOF' > "$PROJECT_DIR/src/main.tsx"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

cat << 'EOF' > "$PROJECT_DIR/src/index.css"
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: #f1f1f1; }
::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
EOF

# 6. 创建 App.tsx 占位符 (请将完整代码粘贴至此)
cat << 'EOF' > "$PROJECT_DIR/src/App.tsx"
import React from 'react';

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-4">
      <h1 className="text-2xl font-bold text-indigo-600 mb-4">项目初始化成功！</h1>
      <p className="text-gray-600 max-w-md">
        请回到 AI 对话界面，复制 <b>OneFile.tsx</b> 中的所有代码，
        并覆盖粘贴到本项目中的 <code>src/App.tsx</code> 文件里。
      </p>
    </div>
  );
}
EOF

# 7. 打包为 ZIP
# -r 递归, -X 不包含 MacOS 特有的资源文件(如 __MACOSX)
zip -r -X "$ZIP_FILENAME" "$PROJECT_DIR"

# 8. 清理临时目录
rm -rf "$PROJECT_DIR"

echo "✅ 成功生成 $ZIP_FILENAME"
echo "👉 请按照以下步骤操作："
echo "1. 解压 $ZIP_FILENAME"
echo "2. 将 AI 生成的完整 React 代码覆盖到 src/App.tsx"
echo "3. 在终端运行: npm install && npm run dev"
```

### Mac 使用步骤：

1.  **保存脚本**：
    * 打开 Mac 的“终端 (Terminal)”。
    * 输入 `nano create_zip.sh` 创建文件。
    * 将上面的代码复制粘贴进去。
    * 按 `Ctrl + O` 保存，然后按 `Enter` 确认，最后按 `Ctrl + X` 退出。

2.  **运行脚本**：
    * 在终端输入命令赋予执行权限：
        ```bash
        chmod +x create_zip.sh
        ```
    * 运行脚本：
        ```bash
        ./create_zip.sh