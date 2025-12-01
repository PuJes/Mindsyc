
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // Ensure node-fetch is available or use global fetch if Node 18+
import FormData from 'form-data'; // Need form-data for file upload if using fetch, or use openai sdk
import { OpenAI } from 'openai'; // Will use OpenAI SDK if available, otherwise fetch

import { BcutASRService } from './BcutASRService';

// We'll use global fetch for Bilibili, but for OpenAI SDK we might need it.
// Let's assume we use OpenAI SDK for simplicity if installed, or raw fetch.
// Given the previous check, I'll see if openai is installed. If not, I'll use raw fetch.

export class AudioService {
    private openai: OpenAI | null = null;

    constructor(apiKey?: string) {
        if (apiKey) {
            this.openai = new OpenAI({ apiKey });
        }
    }

    async getAudioStreamUrl(bvid: string, cid: number, aid: number): Promise<string | null> {
        try {
            const playUrl = `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&qn=16&type=&platform=html5&high_quality=1`;
            const response = await fetch(playUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': `https://www.bilibili.com/video/${bvid}`
                }
            });
            const data = await response.json() as any;
            if (data.data?.durl && data.data.durl.length > 0) {
                return data.data.durl[0].url;
            }
            return null;
        } catch (error) {
            console.error('Error fetching audio stream URL:', error);
            return null;
        }
    }

    async downloadAudio(url: string, referer: string): Promise<string> {
        const tempDir = path.join(__dirname, '../../temp_audio');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const timestamp = Date.now();
        const mp4FileName = `audio_${timestamp}.mp4`;
        const mp3FileName = `audio_${timestamp}.mp3`;
        const mp4FilePath = path.join(tempDir, mp4FileName);
        const mp3FilePath = path.join(tempDir, mp3FileName);

        console.log(`Downloading audio from ${url} to ${mp4FilePath}...`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': referer
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to download audio: ${response.statusText}`);
        }

        const fileStream = fs.createWriteStream(mp4FilePath);
        await new Promise((resolve, reject) => {
            // @ts-ignore
            response.body.pipe(fileStream);
            // @ts-ignore
            response.body.on('error', reject);
            fileStream.on('finish', () => resolve(undefined));
        });

        // Convert MP4 to MP3 using ffmpeg for better ASR compatibility
        console.log(`Converting ${mp4FileName} to MP3 format...`);
        const { execSync } = require('child_process');

        try {
            execSync(`ffmpeg -i "${mp4FilePath}" -vn -ar 16000 -ac 1 -ab 128k -f mp3 "${mp3FilePath}"`, {
                stdio: 'pipe' // Suppress ffmpeg output
            });

            // Clean up the MP4 file
            fs.unlinkSync(mp4FilePath);
            console.log(`✅ Audio converted to MP3: ${mp3FileName}`);

            return mp3FilePath;
        } catch (error) {
            console.error('FFmpeg conversion failed:', error);
            // If conversion fails, try using the original MP4
            console.log('⚠️  Using original MP4 file as fallback');
            return mp4FilePath;
        }
    }

    async transcribeAudio(filePath: string, apiKey?: string, baseUrl?: string, cookie?: string): Promise<any[]> {
        // Check if we should use Bcut (Bilibili's free ASR)
        if (baseUrl === 'bcut') {
            console.log(`Transcribing ${filePath} using Bilibili Bcut ASR (Free)...`);
            try {
                const bcutService = new BcutASRService(cookie);
                const transcriptionResult = await bcutService.transcribe(filePath);
                // Clean up file after successful transcription
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return transcriptionResult;
            } catch (error) {
                console.error('Bcut transcription failed:', error);
                // Clean up file even on error
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return [];
            }
        }

        // If specific config provided, create a temporary client
        const client = new OpenAI({
            apiKey: apiKey || 'dummy', // Some providers don't need a real key but SDK requires one
            baseURL: baseUrl // Optional, for compatible APIs like Groq/SiliconFlow
        });

        // Determine the correct model name based on the provider
        let modelName = 'whisper-1'; // Default for OpenAI
        if (baseUrl) {
            if (baseUrl.includes('groq.com')) {
                modelName = 'whisper-large-v3';
            } else if (baseUrl.includes('siliconflow.cn')) {
                modelName = 'FunAudioLLM/SenseVoiceSmall';
            }
        }

        console.log(`Transcribing ${filePath} using ${baseUrl || 'default OpenAI'} with model ${modelName}...`);
        try {
            const isSiliconFlow = baseUrl?.includes('siliconflow.cn');

            // Build request params based on provider
            const requestParams: any = {
                file: fs.createReadStream(filePath),
                model: modelName
            };

            // SiliconFlow has different API requirements
            if (isSiliconFlow) {
                // SiliconFlow only supports basic 'text' or 'json' format, not 'verbose_json'
                requestParams.response_format = 'json';
                // Do not add timestamp_granularities for SiliconFlow
            } else {
                // For OpenAI and Groq
                requestParams.response_format = 'verbose_json';
                requestParams.timestamp_granularities = ['segment'];
            }

            console.log('Request params:', { model: requestParams.model, response_format: requestParams.response_format });

            const transcription = await client.audio.transcriptions.create(requestParams);

            // Clean up file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            console.log('Transcription response type:', typeof transcription);
            // console.log('Transcription response:', JSON.stringify(transcription).substring(0, 200));

            // Handle different response formats
            if (isSiliconFlow) {
                // SiliconFlow returns simpler format
                // The response might be just text, or a simple object
                const text = typeof transcription === 'string' ? transcription : (transcription as any).text;

                if (text) {
                    // Split text into chunks (since we don't have segment timestamps from SiliconFlow)
                    const sentences = text.split(/[。.!！?？\n]+/).filter((s: string) => s.trim().length > 0);

                    return sentences.map((sentence: string, index: number) => ({
                        from: index * 5,
                        to: (index + 1) * 5,
                        content: sentence.trim()
                    }));
                } else {
                    console.warn('SiliconFlow returned no text');
                    return [];
                }
            } else {
                // For OpenAI/Groq with verbose_json format
                interface TranscriptionSegment {
                    start: number;
                    end: number;
                    text: string;
                }

                const transcriptionWithSegments = transcription as typeof transcription & {
                    segments?: TranscriptionSegment[];
                };

                return transcriptionWithSegments.segments?.map((seg: TranscriptionSegment) => ({
                    from: seg.start,
                    to: seg.end,
                    content: seg.text.trim()
                })) || [];
            }

        } catch (error) {
            console.error('Transcription failed:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            // Clean up file even on error
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            // Don't throw, just return empty to allow fallback
            return [];
        }
    }
}
