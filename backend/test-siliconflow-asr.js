#!/usr/bin/env node

/**
 * 测试 SiliconFlow ASR API
 * 用于诊断 API Key 和音频格式问题
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

async function testSiliconFlowASR() {
    console.log('🧪 测试 SiliconFlow ASR API\n');

    // 从环境变量或命令行参数获取 API Key
    const apiKey = process.env.SILICONFLOW_API_KEY || process.argv[2];

    if (!apiKey) {
        console.error('❌ 错误: 未提供 API Key');
        console.log('\n使用方法:');
        console.log('  SILICONFLOW_API_KEY=your_key node test-siliconflow-asr.js');
        console.log('  或');
        console.log('  node test-siliconflow-asr.js your_key');
        process.exit(1);
    }

    console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

    // 初始化客户端
    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.siliconflow.cn/v1'
    });

    // 检查测试音频文件
    const testAudioPath = path.join(__dirname, 'test-audio.mp3');

    if (!fs.existsSync(testAudioPath)) {
        console.log('⚠️  未找到测试音频文件，将尝试从 temp_audio 目录查找...');
        const tempDir = path.join(__dirname, 'temp_audio');

        if (fs.existsSync(tempDir)) {
            const files = fs.readdirSync(tempDir).filter(f => f.endsWith('.mp3') || f.endsWith('.mp4'));
            if (files.length > 0) {
                const testFile = path.join(tempDir, files[0]);
                console.log(`📁 使用测试文件: ${files[0]}\n`);
                await testTranscription(client, testFile);
                return;
            }
        }

        console.error('❌ 错误: 未找到测试音频文件');
        console.log('\n请提供测试音频文件:');
        console.log('  方法1: 在 backend 目录创建 test-audio.mp3');
        console.log('  方法2: 确保 temp_audio 目录中有音频文件');
        process.exit(1);
    }

    await testTranscription(client, testAudioPath);
}

async function testTranscription(client, audioPath) {
    console.log('📡 测试参数:');
    console.log(`  文件: ${path.basename(audioPath)}`);
    console.log(`  模型: FunAudioLLM/SenseVoiceSmall`);
    console.log(`  格式: json\n`);

    try {
        console.log('⏳ 正在调用 ASR API...\n');

        const transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: 'FunAudioLLM/SenseVoiceSmall',
            response_format: 'json'
        });

        console.log('✅ 转录成功!\n');
        console.log('📝 响应类型:', typeof transcription);
        console.log('📄 响应内容:');
        console.log(JSON.stringify(transcription, null, 2));

    } catch (error) {
        console.error('❌ 转录失败:\n');
        console.error('错误类型:', error.constructor.name);
        console.error('错误消息:', error.message);

        if (error.status) {
            console.error('HTTP 状态码:', error.status);
        }

        if (error.response) {
            console.error('响应头:', error.response.headers);
            console.error('响应体:', error.response.data);
        }

        console.error('\n完整错误:', error);

        console.log('\n🔍 可能的原因:');
        console.log('  1. API Key 无效或已过期');
        console.log('  2. API Key 没有音频转录权限');
        console.log('  3. 音频格式不支持（使用 MP3 格式最佳）');
        console.log('  4. 音频文件太大（尝试使用较小的文件）');
        console.log('  5. SiliconFlow 服务暂时不可用');

        process.exit(1);
    }
}

// 运行测试
testSiliconFlowASR().catch(error => {
    console.error('💥 发生未预期的错误:', error);
    process.exit(1);
});
