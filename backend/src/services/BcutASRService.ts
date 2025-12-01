import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

/**
 * Bilibili 必剪（Bcut）ASR 服务
 * 需要 Bilibili 登录状态（SESSDATA Cookie）
 */
export class BcutASRService {
    private readonly uploadUrl = 'https://member.bilibili.com/x/bcut/rubick-interface/resource/create';
    private readonly createTaskUrl = 'https://member.bilibili.com/x/bcut/rubick-interface/task';
    private readonly resultUrl = 'https://member.bilibili.com/x/bcut/rubick-interface/task/result';

    constructor(private sessdata?: string) { }

    /**
     * 上传音频文件
     */
    async uploadAudio(filePath: string): Promise<string> {
        console.log(`📤 上传音频到必剪: ${path.basename(filePath)}`);

        const ext = path.extname(filePath).toLowerCase().replace('.', '');
        // Map common extensions to Bcut types if needed, or just pass through
        // Bcut supports: flac, aac, m4a, mp3, wav
        const validTypes = ['flac', 'aac', 'm4a', 'mp3', 'wav'];
        const fileType = validTypes.includes(ext) ? ext : 'mp3';
        const stats = fs.statSync(filePath);

        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));
        form.append('type', '2'); // 2 表示音频
        form.append('name', path.basename(filePath));
        form.append('size', stats.size.toString());
        form.append('resource_file_type', fileType);

        const response = await fetch(this.uploadUrl, {
            method: 'POST',
            body: form,
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                ...(this.sessdata ? { 'Cookie': `SESSDATA=${this.sessdata}` } : {})
            }
        });

        const data = await response.json() as any;

        if (data.code !== 0) {
            throw new Error(`上传失败: ${data.message}`);
        }

        const resourceId = data.data.resource_id;
        console.log(`✅ 上传成功，资源ID: ${resourceId}`);
        return resourceId;
    }

    /**
     * 创建识别任务
     */
    async createTask(resourceId: string): Promise<string> {
        console.log(`🎯 创建识别任务: ${resourceId}`);

        const response = await fetch(this.createTaskUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                ...(this.sessdata ? { 'Cookie': `SESSDATA=${this.sessdata}` } : {})
            },
            body: JSON.stringify({
                resource_id: resourceId,
                text: '',
                business: 4,  // 4 表示语音转文字
                model_id: "1"   // Add model_id as string
            })
        });

        const data = await response.json() as any;

        if (data.code !== 0) {
            throw new Error(`创建任务失败: ${data.message}`);
        }

        const taskId = data.data.task_id;
        console.log(`✅ 任务创建成功，任务ID: ${taskId}`);
        return taskId;
    }

    /**
     * 轮询获取结果
     */
    async pollResult(taskId: string, maxAttempts: number = 180, intervalMs: number = 2000): Promise<any> {
        console.log(`⏳ 等待识别结果...`);

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const response = await fetch(`${this.resultUrl}?task_id=${taskId}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                    ...(this.sessdata ? { 'Cookie': `SESSDATA=${this.sessdata}` } : {})
                }
            });

            const data = await response.json() as any;

            if (data.code !== 0) {
                throw new Error(`获取结果失败: ${data.message}`);
            }

            // 修复：state 在 data.data.state，不是 data.data.result.state
            const state = data.data.state;
            const result = data.data.result;

            // 添加调试日志
            if (attempt === 0 || attempt % 10 === 0) {
                console.log(`轮询第 ${attempt + 1} 次，状态: ${state}, result:`, result);
            }

            if (state === 2) {
                // 识别完成
                console.log(`✅ 识别完成！`);
                return result;
            } else if (state === 3 || state === -1) {
                // 失败 (state=3 或 state=-1)
                const errorMsg = typeof result === 'string' ? result : JSON.stringify(result);
                throw new Error(`识别任务失败: ${errorMsg}`);
            }

            // 等待并重试
            if (attempt < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, intervalMs));
            }
        }

        throw new Error('识别超时');
    }

    /**
     * 解析字幕数据
     */
    parseSubtitles(result: any): Array<{ from: number; to: number; content: string }> {
        if (!result.utterances || result.utterances.length === 0) {
            return [];
        }

        return result.utterances.map((utterance: any) => ({
            from: utterance.words[0]?.start_time || 0,
            to: utterance.words[utterance.words.length - 1]?.end_time || 0,
            content: utterance.words.map((word: any) => word.text).join('')
        }));
    }

    /**
     * 完整转录流程
     */
    async transcribe(filePath: string): Promise<Array<{ from: number; to: number; content: string }>> {
        try {
            // 1. 上传音频
            const resourceId = await this.uploadAudio(filePath);

            // 2. 创建任务
            const taskId = await this.createTask(resourceId);

            // 3. 轮询结果
            const result = await this.pollResult(taskId);

            // 4. 解析字幕
            const subtitles = this.parseSubtitles(result);

            console.log(`📝 识别到 ${subtitles.length} 条字幕`);
            return subtitles;

        } catch (error) {
            console.error('❌ 必剪识别失败:', error);
            throw error;
        }
    }
}
