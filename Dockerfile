FROM ubuntu:22.04

# Set Bitcoin Core version
ENV BITCOIN_CORE_VERSION="24.0.1"

# Install required dependencies
RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

# Download and install Bitcoin Core
RUN wget -q "https://bitcoincore.org/bin/bitcoin-core-${BITCOIN_CORE_VERSION}/bitcoin-${BITCOIN_CORE_VERSION}-x86_64-linux-gnu.tar.gz" && \
    tar xzf "bitcoin-${BITCOIN_CORE_VERSION}-x86_64-linux-gnu.tar.gz" && \
    mv "bitcoin-${BITCOIN_CORE_VERSION}/bin/"* /usr/local/bin && \
    rm -rf "bitcoin-${BITCOIN_CORE_VERSION}" && \
    rm "bitcoin-${BITCOIN_CORE_VERSION}-x86_64-linux-gnu.tar.gz"

# Create bitcoin user and data directory
RUN useradd -m -d /home/bitcoin bitcoin && \
    mkdir -p /home/bitcoin/.bitcoin/regtest/wallets && \
    chown -R bitcoin:bitcoin /home/bitcoin/.bitcoin

# Copy configuration
COPY --chown=bitcoin:bitcoin bitcoin.conf /home/bitcoin/.bitcoin/bitcoin.conf

# Expose RPC port
EXPOSE 18443

USER bitcoin
WORKDIR /home/bitcoin

# Start bitcoind with explicit regtest mode
CMD ["bitcoind", "-printtoconsole", "-regtest"] 