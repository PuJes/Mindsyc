import { AudioService } from '../src/services/AudioService';

async function testSiliconFlowASR() {
    console.log('=== Testing SiliconFlow ASR Integration ===\n');

    const SILICONFLOW_API_KEY = 'sk-nwtmpudgffrcibrmkdgxnbfqoqnumfjfqotgqdbmerxtiogw';
    const SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1';

    // Test video info from user
    const bvid = 'BV1pKSLBMENr';
    const videoUrl = 'https://www.bilibili.com/video/BV1pKSLBMENr';

    console.log(`Video URL: ${videoUrl}`);
    console.log(`API Key: ${SILICONFLOW_API_KEY.substring(0, 10)}...`);
    console.log(`Base URL: ${SILICONFLOW_BASE_URL}\n`);

    // Step 1: Get video info to extract cid and aid
    console.log('Step 1: Fetching video info...');
    const videoInfoUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
    const videoInfoResponse = await fetch(videoInfoUrl);
    const videoInfo = await videoInfoResponse.json() as any;

    if (videoInfo.code !== 0) {
        console.error('Failed to fetch video info:', videoInfo.message);
        return;
    }

    const { aid, cid, title } = videoInfo.data;
    console.log(`✓ Video Title: ${title}`);
    console.log(`✓ AID: ${aid}, CID: ${cid}\n`);

    // Step 2: Get audio stream URL
    console.log('Step 2: Fetching audio stream URL...');
    const audioService = new AudioService();
    const audioUrl = await audioService.getAudioStreamUrl(bvid, cid, aid);

    if (!audioUrl) {
        console.error('✗ Failed to get audio stream URL');
        return;
    }
    console.log(`✓ Audio URL: ${audioUrl.substring(0, 50)}...\n`);

    // Step 3: Download audio
    console.log('Step 3: Downloading audio...');
    try {
        const audioPath = await audioService.downloadAudio(audioUrl, videoUrl);
        console.log(`✓ Audio downloaded to: ${audioPath}\n`);

        // Step 4: Transcribe with SiliconFlow
        console.log('Step 4: Transcribing with SiliconFlow...');
        console.log('Model: FunAudioLLM/SenseVoiceSmall');

        const segments = await audioService.transcribeAudio(
            audioPath,
            SILICONFLOW_API_KEY,
            SILICONFLOW_BASE_URL
        );

        if (segments.length > 0) {
            console.log(`\n✓ SUCCESS! Transcription completed with ${segments.length} segments\n`);
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

testSiliconFlowASR().catch(console.error);
