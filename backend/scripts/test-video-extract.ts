
import { extractVideoInfo } from '../src/controllers/VideoController';
import { Request, Response } from 'express';

// Mock Request and Response
const mockRequest = (url: string) => ({
    body: { url }
}) as Request;

const mockResponse = () => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        console.log('Response Status:', res.statusCode || 200);
        console.log('Response Data:', JSON.stringify(data, null, 2));
        return res;
    };
    return res as Response;
};

// Test with a sample Bilibili URL (We need a real one to test scraping)
// Test with user provided video: "为何散户加杠杆注定失败？" (BV1pKSLBMENr)
const TEST_URL = 'https://www.bilibili.com/video/BV1pKSLBMENr/?share_source=copy_web&vd_source=c1df107d4ff1ef8a5ccb93c259703f6d';

console.log(`Testing extraction for: ${TEST_URL}`);
extractVideoInfo(mockRequest(TEST_URL), mockResponse());
