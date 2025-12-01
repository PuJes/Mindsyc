
// import fetch from 'node-fetch'; // Use global fetch

const BVID = 'BV1pKSLBMENr';
// From previous log
const CID = '272668589'; // Wait, let me fetch the CID again to be sure, the previous log showed a weirdly large number, maybe I misread or it was parsed wrong?
// Let's fetch the page first to get current CID.

async function run() {
    console.log('Fetching page for', BVID);
    const pageResp = await fetch(`https://www.bilibili.com/video/${BVID}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    const html = await pageResp.text();
    const match = html.match(/window\.__INITIAL_STATE__=(.*?);\(function/);
    if (!match) {
        console.error('No initial state found');
        return;
    }
    const state = JSON.parse(match[1]);
    const videoData = state.videoData || {};
    const aid = videoData.aid || state.aid;
    const cid = videoData.cid || state.cid;

    console.log('AID:', aid, 'CID:', cid);

    // 1. PlayURL API
    console.log('--- PlayURL API ---');
    const playUrl = `https://api.bilibili.com/x/player/playurl?avid=${aid}&cid=${cid}&qn=16&type=&platform=html5&high_quality=1`;
    const playResp = await fetch(playUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': `https://www.bilibili.com/video/${BVID}`
        }
    });
    const playData = await playResp.json() as any;

    if (playData.data?.durl) {
        console.log('Found DURL:', playData.data.durl.length);
        console.log('First URL:', playData.data.durl[0].url);
    } else if (playData.data?.dash) {
        console.log('Found DASH:', playData.data.dash);
    } else {
        console.log('No stream found. Message:', playData.message || 'Unknown error');
        console.log('Data keys:', Object.keys(playData.data || {}));
    }

    // 2. Player V2 with DASH (fnval=16)
    console.log('--- 2. Player V2 (DASH) ---');
    const v2Url = `https://api.bilibili.com/x/player/v2?cid=${cid}&aid=${aid}&fnval=16`;
    const v2Resp = await fetch(v2Url);
    const v2Data = await v2Resp.json() as any;
    // console.log(JSON.stringify(v2Data, null, 2));

    if (v2Data.data?.dash?.audio) {
        console.log('Found DASH Audio Streams:', v2Data.data.dash.audio.length);
        console.log('First Audio URL:', v2Data.data.dash.audio[0].baseUrl);
        console.log('Backup Audio URL:', v2Data.data.dash.audio[0].backupUrl?.[0]);
    } else {
        console.log('No DASH audio found. Data keys:', Object.keys(v2Data.data || {}));
        if (v2Data.data?.durl) {
            console.log('Found DURL (FLV/MP4):', v2Data.data.durl.length);
            console.log('First URL:', v2Data.data.durl[0].url);
        }
    }

    // 3. Web Interface View
    console.log('--- 3. Web Interface View ---');
    const viewUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${BVID}`;
    const viewResp = await fetch(viewUrl);
    const viewData = await viewResp.json() as any;
    // console.log(JSON.stringify(viewData, null, 2)); // Too large, check subtitle field
    console.log('Subtitle field:', JSON.stringify(viewData.data?.subtitle, null, 2));

    // 3. WBI Player (sometimes has different info)
    // Skipping complex WBI signing for now, just trying simple endpoints.
}

run();
