const fetch = require('node-fetch');

/**
 * Retrieves the date of a blockchain block by its height
 * @param {number} blockHeight - The height of the block to get the date for
 * @returns {Promise<string|null>} The date string of the block or null if an error occurs
 */
async function retrieveBlockDate(blockHeight) {
	// Input validation
	if (typeof blockHeight !== 'number' || blockHeight < 0 || !Number.isInteger(blockHeight)) {
		console.error('Invalid block height:', blockHeight);
		return null;
	}

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
			'Content-Type': 'application/json',
			'Authorization': `Basic ${auth}`,
		};

		const body = JSON.stringify({
			jsonrpc: '1.0',
			id: 'curltest',
			method,
			params,
		});

		return fetch(rpcUrl, {
			method: 'POST',
			headers: headers,
			body: body,
		})
			.then(response => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				return response.json();
			})
			.then(data => {
				if (data.error) {
					throw new Error(`RPC error: ${data.error.message}`);
				}
				return data.result;
			})
			.catch(error => {
				console.error('Error during RPC call:', error);
				throw error;
			});
	}

	try {
		const blockHash = await rpcCall('getblockhash', [blockHeight]);
		const blockInfo = await rpcCall('getblock', [blockHash]);

		const timestampInSeconds = blockInfo.time;
		const date = new Date(timestampInSeconds * 1000);

		// Format and return the date string
		return date.toString();
	} catch (error) {
		console.error(`Could not retrieve block date for height ${blockHeight}:`, error.message);
		return null;
	}
}

module.exports = { retrieveBlockDate };
