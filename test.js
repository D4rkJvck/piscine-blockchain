import { retrieveBlockDate } from './retrieve-block-date.js';

async function test() {
    try {
        const date = await retrieveBlockDate(0);
        console.log('Block date:', date);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

test(); 