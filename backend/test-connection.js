#!/usr/bin/env node

/**
 * 前后端连接测试脚本
 * 测试所有主要 API 端点
 */

const API_BASE = 'http://localhost:3000/api';

const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    reset: '\x1b[0m'
};

async function testEndpoint(name, url, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        const data = await response.json();

        if (response.ok) {
            console.log(`${colors.green}✓${colors.reset} ${name}: ${colors.blue}${response.status}${colors.reset}`);
            console.log(`  Response:`, JSON.stringify(data, null, 2).split('\n').slice(0, 5).join('\n'));
            return { success: true, data };
        } else {
            console.log(`${colors.yellow}⚠${colors.reset} ${name}: ${colors.yellow}${response.status}${colors.reset}`);
            console.log(`  Response:`, JSON.stringify(data, null, 2));
            return { success: false, data };
        }
    } catch (error) {
        console.log(`${colors.red}✗${colors.reset} ${name}: ${colors.red}${error.message}${colors.reset}`);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log('\n🧪 开始测试前后端连接...\n');
    console.log(`📡 后端地址: ${API_BASE}\n`);

    const results = [];

    // 1. 健康检查
    console.log('1️⃣  健康检查');
    results.push(await testEndpoint('Health Check', 'http://localhost:3000/health'));
    console.log('');

    // 2. 知识树 API
    console.log('2️⃣  知识树 API');
    results.push(await testEndpoint('GET /api/trees', `${API_BASE}/trees`));
    console.log('');

    // 3. 库项目 API
    console.log('3️⃣  库项目 API');
    results.push(await testEndpoint('GET /api/library', `${API_BASE}/library`));
    console.log('');

    // 4. 工作流 API
    console.log('4️⃣  工作流 API');
    results.push(await testEndpoint('GET /api/workflows', `${API_BASE}/workflows`));
    console.log('');

    // 5. AI 配置 API
    console.log('5️⃣  AI 配置 API');
    results.push(await testEndpoint('GET /api/config', `${API_BASE}/config`));
    console.log('');

    // 6. 创建测试数据 - 库项目
    console.log('6️⃣  创建测试库项目');
    const createLibraryResult = await testEndpoint(
        'POST /api/library',
        `${API_BASE}/library`,
        'POST',
        {
            title: '测试知识库',
            tags: ['测试', 'API'],
            coverColor: '#6366f1'
        }
    );
    results.push(createLibraryResult);
    console.log('');

    // 7. 再次获取库项目列表
    if (createLibraryResult.success) {
        console.log('7️⃣  验证创建的库项目');
        results.push(await testEndpoint('GET /api/library (验证)', `${API_BASE}/library`));
        console.log('');
    }

    // 统计结果
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log('\n' + '='.repeat(50));
    console.log(`\n📊 测试结果: ${successCount}/${totalCount} 通过\n`);

    if (successCount === totalCount) {
        console.log(`${colors.green}✓ 所有测试通过!前后端连接正常${colors.reset}\n`);
    } else {
        console.log(`${colors.yellow}⚠ 部分测试失败,请检查后端服务${colors.reset}\n`);
    }
}

// 运行测试
runTests().catch(console.error);
