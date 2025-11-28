// 共享类型定义
export interface TreeNodeData {
    id: string;
    label: string;
    type: 'FOLDER' | 'FILE';
    isOpen?: boolean;
    isNew?: boolean;
    isModified?: boolean;
    isAiGenerated?: boolean;
    children?: TreeNodeData[];
    sources?: CardSourceData[];
}

export interface CardSourceData {
    cardId: string;
    title: string;
    summary: string;
    timestamp?: string;
    reasoning?: string;
    action: 'MERGE' | 'ADD';
    confidence: number;
    importedAt: string;
    // 新增字段
    sourceType?: string;
    sourceTitle?: string;
    sourceUrl?: string;
    sourceSection?: string;
    originalText?: string;
    charPosition?: number;
    tags?: string[];
    editedBy?: string;
    priority?: number;
    reviewStatus?: string;
}

export interface CardData {
    id: string;
    title: string;
    timestamp?: string;
    summary: string;
    action: 'MERGE' | 'ADD' | 'CONFLICT' | 'IGNORE';
    confidence: number;
    targetNodeId: string;
    targetLabel: string;
    reasoning?: string;
}

export interface WorkflowData {
    id: string;
    sourceType: string;
    sourceTitle: string;
    sourceUrl?: string;
    sourceContent?: string;
    status: 'IMPORT' | 'PROCESSING' | 'REVIEW' | 'ALIGNMENT' | 'COMPLETED';
    cards?: CardData[];
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export interface LibraryItemData {
    id: string;
    title: string;
    nodeCount: number;
    sourceCount: number;
    coverColor: string;
    tags: string[];
    lastUpdated: string;
}

export interface AiConfigData {
    provider: string;
    apiKey: string;
}
