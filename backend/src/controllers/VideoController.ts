import { Request, Response } from 'express';
import fetch from 'node-fetch'; // Or use global fetch in Node 18+
import { AudioService } from '../services/AudioService';

interface Subtitle {
    from: number;
    to: number;
    content: string;
}

interface VideoInfo {
    title: string;
    desc: string;
    pic: string;
    duration: number;
    subtitles: Subtitle[];
}

// Initialize AudioService with API Key from env
const audioService = new AudioService(process.env.OPENAI_API_KEY);

export const extractVideoInfo = async (req: Request, res: Response) => {
    try {
        let { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Clean URL - extract only the actual URL from text that might contain title
        // Example: "【标题】 https://..." -> "https://..."
        const urlMatch = url.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
            url = urlMatch[1];
        }

        // Remove trailing spaces and query params that might cause issues
        url = url.trim();

        console.log(`Fetching video page: ${url}`);
        const pageResponse = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const pageHtml = await pageResponse.text();

        // 2. Extract Initial State
        const match = pageHtml.match(/window\.__INITIAL_STATE__=(.*?);\(function/);
        if (!match) {
            console.error('Failed to find initial state in page HTML');
            return res.status(500).json({ error: 'Failed to parse video page' });
        }

        const initialState = JSON.parse(match[1]);

        const videoData = initialState.videoData || {};

        // Fallback to root properties if not in videoData
        const bvid = videoData.bvid || initialState.bvid;
        const aid = videoData.aid || initialState.aid;
        const cid = videoData.cid || initialState.cid;

        // Scrape from HTML tags if missing in JSON
        let title = videoData.title || initialState.title;
        if (!title) {
            const titleMatch = pageHtml.match(/<title data-vue-meta="true">([^<]+)<\/title>/) || pageHtml.match(/<title>([^<]+)<\/title>/);
            if (titleMatch) title = titleMatch[1].replace('_哔哩哔哩_bilibili', '').trim();
        }

        let pic = videoData.pic || initialState.pic;
        if (!pic) {
            const picMatch = pageHtml.match(/<meta itemprop="image" content="([^"]+)"/);
            if (picMatch) pic = picMatch[1];
        }

        let desc = videoData.desc || initialState.desc;
        if (!desc) {
            const descMatch = pageHtml.match(/<meta name="description" content="([^"]+)"/);
            if (descMatch) desc = descMatch[1];
        }

        const duration = videoData.duration || initialState.duration || 0;

        console.log(`Found video: ${title} (cid: ${cid}, aid: ${aid})`);

        if (!cid || !aid) {
            console.error('Missing CID or AID');
            // Try to find CID in cidMap if available
            if (initialState.cidMap) {
                const cids = Object.keys(initialState.cidMap);
                if (cids.length > 0) {
                    console.log('Found CID in cidMap:', cids[0]);
                    // We still need AID...
                }
            }
            return res.status(404).json({ error: 'Video ID not found' });
        }

        // 3. Fetch Subtitle List
        let subtitles: Subtitle[] = [];
        try {
            // Bilibili API to get player view info which contains subtitle list
            const playerApiUrl = `https://api.bilibili.com/x/player/v2?cid=${cid}&aid=${aid}`;
            const playerResponse = await fetch(playerApiUrl);
            const playerData = await playerResponse.json() as any;
            const subtitleList = playerData.data?.subtitle?.subtitles;

            if (subtitleList && subtitleList.length > 0) {
                // Prefer JSON subtitle
                const subUrl = 'https:' + subtitleList[0].subtitle_url;
                console.log(`Fetching subtitle from: ${subUrl}`);

                const subResponse = await fetch(subUrl);
                const subData = await subResponse.json() as any;

                subtitles = subData.body.map((item: any) => ({
                    from: item.from,
                    to: item.to,
                    content: item.content
                }));
            }
        } catch (subError) {
            console.warn('Failed to fetch subtitles from Bilibili API, falling back to ASR:', subError);
            // Continue to ASR logic below
        }

        if (subtitles.length === 0) {
            console.log('No subtitles found for this video');

            // Try ASR if no subtitles
            // Use provided API key or fallback to env
            const effectiveApiKey = req.body.apiKey || process.env.OPENAI_API_KEY;
            const effectiveBaseUrl = req.body.apiBaseUrl; // Optional
            const effectiveCookie = req.body.cookie; // Bilibili SESSDATA for Bcut

            // Allow ASR if Key is present OR if using Bcut (free)
            if (effectiveApiKey || effectiveBaseUrl === 'bcut') {
                console.log('Attempting AI Transcription...');
                const audioUrl = await audioService.getAudioStreamUrl(bvid, cid, aid);

                if (audioUrl) {
                    try {
                        const audioPath = await audioService.downloadAudio(audioUrl, url);
                        // Pass dynamic config including cookie
                        const transcript = await audioService.transcribeAudio(audioPath, effectiveApiKey, effectiveBaseUrl, effectiveCookie);

                        if (transcript && transcript.length > 0) {
                            console.log(`ASR Success: ${transcript.length} segments`);
                            subtitles = transcript;
                        }
                    } catch (asrError) {
                        console.error('ASR failed:', asrError);
                        // Fallback to empty subtitles, will use metadata card
                    }
                } else {
                    console.log('No audio stream found for ASR');
                }
            } else {
                console.log('No API Key provided for ASR');
            }
        }

        res.json({
            title,
            desc,
            pic,
            duration,
            subtitles
        });

    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({ error: 'Failed to extract video info' });
    }
};
