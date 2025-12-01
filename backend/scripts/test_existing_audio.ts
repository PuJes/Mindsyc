import { AudioService } from '../src/services/AudioService';
import fs from 'fs';
import path from 'path';

async function testExistingAudio() {
    console.log('=== Testing SiliconFlow with Existing Audio ===\n');

    const SILICONFLOW_API_KEY = 'sk-nwtmpudgffrcibrmkdgxnbfqoqnumfjfqotgqdbmerxtiogw';
    const SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1';

    // Check for existing audio files
    const tempDir = path.join(__dirname, '../temp_audio');
    if (!fs.existsSync(tempDir)) {
        console.log('No temp_audio directory found');
        return;
    }

    const files = fs.readdirSync(tempDir);
    if (files.length === 0) {
        console.log('No audio files found in temp_audio');
        return;
    }

    const audioFile = path.join(tempDir, files[0]);
    console.log(`Using audio file: ${audioFile}\n`);

    // Test transcription
    const audioService = new AudioService();

    console.log('Transcribing with SiliconFlow...');
    console.log(`Model: FunAudioLLM/SenseVoiceSmall`);
    console.log(`Base URL: ${SILICONFLOW_BASE_URL}\n`);

    try {
        const segments = await audioService.transcribeAudio(
            audioFile,
            SILICONFLOW_API_KEY,
            SILICONFLOW_BASE_URL
        );

        if (segments && segments.length > 0) {
            console.log(`\n✓ SUCCESS! Got ${segments.length} segments\n`);
            console.log('First 5 segments:');
            segments.slice(0, 5).forEach((seg, idx) => {
                const time = new Date(seg.from * 1000).toISOString().substr(11, 8);
                console.log(`  ${idx + 1}. [${time}] ${seg.content}`);
            });
        } else {
            console.log('\n✗ Transcription returned empty result');
        }
    } catch (error: any) {
        console.error('\n✗ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testExistingAudio().catch(console.error);
