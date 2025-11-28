


const API_URL = 'http://localhost:3000/api';

async function verifyPersistence() {
    console.log('Starting persistence verification...');

    try {
        // 1. Create a tree
        console.log('Creating tree...');
        const treeRes = await fetch(`${API_URL}/trees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Verification Tree',
                description: 'Tree for verifying persistence'
            })
        });

        if (!treeRes.ok) throw new Error(`Failed to create tree: ${treeRes.statusText}`);
        const tree = await treeRes.json() as any;
        console.log('Tree created:', tree.id);

        // 2. Create a node
        console.log('Creating node...');
        const nodeRes = await fetch(`${API_URL}/nodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                label: 'Test Node',
                type: 'FILE',
                parentId: tree.rootNodeId
            })
        });

        if (!nodeRes.ok) throw new Error(`Failed to create node: ${nodeRes.statusText}`);
        const node = await nodeRes.json() as any;
        console.log('Node created:', node.id);

        // 3. Update node with sources (simulating AlignmentStep)
        console.log('Updating node with sources...');
        const sourceData = {
            cardId: 'test-card-1',
            title: 'Test Card',
            summary: 'This is a test summary',
            timestamp: '00:00',
            action: 'ADD',
            confidence: 90,
            importedAt: new Date().toISOString(),
            // New fields
            sourceType: 'article',
            sourceTitle: 'Original Article',
            sourceUrl: 'http://example.com',
            originalText: 'This is the original text.',
            priority: 3, // High
            reviewStatus: 'approved'
        };

        const updateRes = await fetch(`${API_URL}/nodes/${node.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sources: [sourceData]
            })
        });

        if (!updateRes.ok) throw new Error(`Failed to update node: ${updateRes.statusText}`);
        console.log('Node updated');

        // 4. Verify data
        console.log('Verifying data...');
        const verifyRes = await fetch(`${API_URL}/nodes/${node.id}/sources`);
        if (!verifyRes.ok) throw new Error(`Failed to fetch sources: ${verifyRes.statusText}`);
        const sources = await verifyRes.json() as any[];

        const savedSource = sources[0];
        console.log('Saved source:', savedSource);

        if (savedSource.sourceType !== 'article') throw new Error('sourceType mismatch');
        if (savedSource.originalText !== 'This is the original text.') throw new Error('originalText mismatch');
        if (savedSource.priority !== 3) throw new Error('priority mismatch');

        console.log('Verification SUCCESS!');

        // Cleanup
        await fetch(`${API_URL}/trees/${tree.id}`, { method: 'DELETE' });

    } catch (error) {
        console.error('Verification FAILED:', error);
        process.exit(1);
    }
}

verifyPersistence();
