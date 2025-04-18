const fetch = require('node-fetch');

/**
 * Retrieves the date of a blockchain block by its height or hash
 * @param {number|string} blockIdentifier - The height of the block or the block hash
 * @returns {Promise<string|null>} The date string of the block or null if an error occurs
 */
async function retrieveBlockDate(blockIdentifier) {
	const rpcUrl = 'http://localhost:18443';
	const rpcUser = 'leeloo';
	const rpcPassword = 'multipass';

	/**
	 * Makes an RPC call to the Bitcoin node
	 * @param {string} method - The RPC method to call
	 * @param {Array} params - The optional parameters to pass to the method
	 * @returns {Promise<any>} The result of the RPC call
	 */
	async function rpcCall(method, params = []) {
		const auth = Buffer.from(`${rpcUser}:${rpcPassword}`).toString('base64');
		const headers = {
			'content-type': 'text/plain;',
			'Authorization': `Basic ${auth}`,
		};

		const body = JSON.stringify({
			jsonrpc: '1.0',
			id: 'curltest',
			method,
			params,
		});

		try {
			const response = await fetch(rpcUrl, {
				method: 'POST',
				headers: headers,
				body: body,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
			}

			const data = await response.json();
			if (data.error) {
				throw new Error(`RPC error: ${data.error.message}`);
			}
			return data.result;
		} catch (error) {
			console.error('Error during RPC call:', error);
			throw error;
		}
	}

	try {
		let blockHash;
		// If blockIdentifier is a number, treat it as a block height
		if (typeof blockIdentifier === 'number') {
			blockHash = await rpcCall('getblockhash', [blockIdentifier]);
		} else {
			// Otherwise, treat it as a block hash
			blockHash = blockIdentifier;
		}

		const blockInfo = await rpcCall('getblock', [blockHash]);
		return blockInfo.time; // Return the timestamp directly
	} catch (error) {
		console.error(`Could not retrieve block date for ${blockIdentifier}:`, error.message);
		return null;
	}
}

module.exports = { retrieveBlockDate }; 