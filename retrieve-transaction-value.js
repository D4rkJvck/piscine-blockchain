const fetch = require('node-fetch');

/**
 * Retrieves the total value transferred in a Bitcoin transaction
 * @param {string} txHash - The hash of the transaction to analyze
 * @returns {Promise<number>} The total value transferred in bitcoins
 */
async function retrieveTxValue(txHash) {
    const rpcUrl = 'http://localhost:18443';
    const rpcUser = 'leeloo';
    const rpcPassword = 'multipass';

    /**
     * Makes an RPC call to the Bitcoin node
     * @param {string} method - The RPC method to call
     * @param {Array} params - The parameters to pass to the method
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
        // Get the raw transaction data
        const rawTx = await rpcCall('getrawtransaction', [txHash]);
        
        // Decode the raw transaction to get the details
        const decodedTx = await rpcCall('decoderawtransaction', [rawTx]);

        // Sum up all the output values (in satoshis)
        const totalSatoshis = decodedTx.vout.reduce((sum, output) => {
            return sum + output.value * 100000000; // Convert BTC to satoshis
        }, 0);

        // Convert satoshis back to BTC
        return totalSatoshis / 100000000;
    } catch (error) {
        console.error(`Could not retrieve transaction value for ${txHash}:`, error.message);
        return null;
    }
}

module.exports = { retrieveTxValue }; 