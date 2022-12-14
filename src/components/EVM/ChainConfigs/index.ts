import { ChainConfig } from "./types";
import { ethers } from 'ethers';
import {EvmChain } from '@axelar-network/axelarjs-sdk';

// chains
export const BSC_TEST: ChainConfig = {
    name: 'BNB Chain',
    shortName: 'BSC TEST',
    id: ethers.utils.hexlify(97),
    evmChain: EvmChain.BINANCE,
    rpc: 'https://data-seed-prebsc-2-s1.binance.org:8545',
    nativeCurrency: {
        name: 'BNB',
        decimals: 18,
        symbol: 'BNB',
    },
    blockExplorerUrl: 'https://testnet.bscscan.com',
    linkerContract: '0xB94f603DB09497ee63E320f219585880349dC25f',
    nftContract: '0xd4d6784025f7518DE86E397cdE4522a2056bf6dc'
};
export const POLYGON_TEST: ChainConfig = {
    name: 'Polygon',
    shortName: 'MUMBAI',
    evmChain: EvmChain.POLYGON,
    // id: ethers.utils.hexlify(80001),
    id: '0x13881',
    // rpc: 'https://rpc-mumbai.matic.today/',
    rpc: 'https://polygontestapi.terminet.io/rpc',
    // rpc: 'https://rpc-mumbai.maticvigil.com/',
    nativeCurrency: {
        name: 'MATIC',
        decimals: 18,
        symbol: 'MATIC',
    },
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
    linkerContract: '0xB94f603DB09497ee63E320f219585880349dC25f',
    nftContract: '0x8692157ebE00265F0CE39728110A1FBdF46767E0'
};
export const AVAX_TEST: ChainConfig = {
    name: 'Avalanche C-Chain Testnet',
    shortName: 'AVAX',
    evmChain: EvmChain.AVALANCHE,
    id: '0xa869',
    rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
    nativeCurrency: {
        name: 'AVAX',
        decimals: 18,
        symbol: 'AVAX',
    },
    blockExplorerUrl: 'https://testnet.snowtrace.io/',
    linkerContract: '0xB94f603DB09497ee63E320f219585880349dC25f',
    nftContract: '0x587a55a9a0473346C0a64244721D7F89e6cc16FF'
};
export const ETH: ChainConfig = {
    name: 'Ethereum',
    shortName: 'ETH',
    evmChain: EvmChain.ETHEREUM,
    id: ethers.utils.hexlify(1),
    rpc: '',
    nativeCurrency: {
        name: 'ETH',
        decimals: 18,
        symbol: 'ETH',
    },
};
export const BSC: ChainConfig = {
    name: 'BNB Chain',
    shortName: 'BSC',
    evmChain: EvmChain.BINANCE,
    id: ethers.utils.hexlify(56),
    rpc: 'https://bsc-dataseed1.binance.org',
    nativeCurrency: {
        name: 'BNB',
        decimals: 18,
        symbol: 'BNB',
    },
    blockExplorerUrl: 'https://bscscan.com',
    linkerContract: '0xe571D5Cd76De9a27dc6ca2Ba60369192B1316640',
    nftContract: '0x0Ad8DF5ADc21e8Ad55Fd562B3d1dF47b1D93B2bF'
};
export const AVAX: ChainConfig = {
    name: 'Avalanche C-Chain',
    shortName: 'AVAX',
    evmChain: EvmChain.AVALANCHE,
    id: '0xa86a',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    nativeCurrency: {
        name: 'AVAX',
        decimals: 18,
        symbol: 'AVAX',
    },
    blockExplorerUrl: 'https://snowtrace.io',
};
export const POLYGON: ChainConfig = {
    name: 'Polygon',
    shortName: 'Polygon',
    evmChain: EvmChain.POLYGON,
    id: ethers.utils.hexlify(137),
    rpc: 'https://polygon-rpc.com',
    nativeCurrency: {
        name: 'MATIC',
        decimals: 18,
        symbol: 'MATIC',
    },
    blockExplorerUrl: 'https://polygonscan.com',
    linkerContract: '0xe571D5Cd76De9a27dc6ca2Ba60369192B1316640',
    nftContract: '0xd1bEb88f97fFbB768399265e36Fa33a7599fd848'
};
export const ARB: ChainConfig = {
    name: 'Arbitrum One',
    shortName: 'ARB',
    id: ethers.utils.hexlify(42161),
    rpc: 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: {
        name: 'ETH',
        decimals: 18,
        symbol: 'ETH',
    },
    blockExplorerUrl: 'https://arbiscan.io',
};
export const OP: ChainConfig = {
    name: 'Optimism',
    shortName: 'OP',
    id: ethers.utils.hexlify(10),
    rpc: 'https://mainnet.optimism.io',
    nativeCurrency: {
        name: 'ETH',
        decimals: 18,
        symbol: 'ETH',
    },
    blockExplorerUrl: 'https://optimistic.etherscan.io',
};
export const CRO: ChainConfig = {
    name: 'Cronos Mainnet',
    shortName: 'CRO',
    id: ethers.utils.hexlify(25),
    rpc: 'https://evm.cronos.org',
    nativeCurrency: {
        name: 'CRO',
        decimals: 18,
        symbol: 'CRO',
    },
    blockExplorerUrl: 'https://cronos.org/explorer',
};
export const FTM: ChainConfig = {
    name: 'Fantom Opera',
    shortName: 'FTM',
    evmChain: EvmChain.FANTOM,
    id: ethers.utils.hexlify(250),
    rpc: 'https://rpc.ftm.tools',
    nativeCurrency: {
        name: 'FTM',
        decimals: 18,
        symbol: 'FTM',
    },
    blockExplorerUrl: 'https://ftmscan.com',
};
export const KLAYTN: ChainConfig = {
    name: 'Klaytn Mainnet Cypress',
    shortName: 'KLAYTN',
    id: ethers.utils.hexlify(8217),
    rpc: 'https://public-node-api.klaytnapi.com/v1/cypress',
    nativeCurrency: {
        name: 'KLAY',
        decimals: 18,
        symbol: 'KLAY',
    },
    blockExplorerUrl: 'https://scope.klaytn.com',
};
export const KAVA: ChainConfig = {
    name: 'Kava EVM',
    shortName: 'KAVA',
    id: ethers.utils.hexlify(2222),
    rpc: 'https://evm.kava.io',
    nativeCurrency: {
        name: 'KAVA',
        decimals: 18,
        symbol: 'KAVA',
    },
    blockExplorerUrl: 'https://explorer.kava.io',
};
export const GNO: ChainConfig = {
    name: 'Gnosis',
    shortName: 'GNO',
    id: ethers.utils.hexlify(100),
    rpc: 'https://rpc.gnosischain.com',
    nativeCurrency: {
        name: 'xDAI',
        decimals: 18,
        symbol: 'xDAI',
    },
    blockExplorerUrl: 'https://gnosisscan.io',
};
export const AURORA: ChainConfig = {
    name: 'Aurora Mainnet',
    shortName: 'AURORA',
    evmChain: EvmChain.AURORA,
    id: ethers.utils.hexlify(1313161554),
    rpc: 'https://mainnet.aurora.dev',
    nativeCurrency: {
        name: 'AURORA',
        decimals: 18,
        symbol: 'AURORA',
    },
    blockExplorerUrl: 'https://aurorascan.dev',
};
export const HECO: ChainConfig = {
    name: 'Huobi ECO Chain Mainnet',
    shortName: 'HECO',
    id: ethers.utils.hexlify(128),
    rpc: 'https://http-mainnet.hecochain.com',
    nativeCurrency: {
        name: 'HT',
        decimals: 18,
        symbol: 'HT',
    },
    blockExplorerUrl: 'https://hecoinfo.com',
};
export const FUSION: ChainConfig = {
    name: 'Fusion Mainnet',
    shortName: 'FUSION',
    id: ethers.utils.hexlify(32659),
    rpc: 'https://mainnet.anyswap.exchange',
    nativeCurrency: {
        name: 'FSN',
        decimals: 18,
        symbol: 'FSN',
    },
    blockExplorerUrl: 'https://www.fusion.org/',
};
export const CELO: ChainConfig = {
    name: 'Celo Mainnet',
    shortName: 'CELO',
    id: ethers.utils.hexlify(42220),
    rpc: 'https://forno.celo.org',
    nativeCurrency: {
        name: 'CELO',
        decimals: 18,
        symbol: 'CELO',
    },
    blockExplorerUrl: 'https://explorer.celo.org',
};
export const EVMOS: ChainConfig = {
    name: 'Evmos',
    shortName: 'EVMOS',
    id: ethers.utils.hexlify(9001),
    rpc: 'https://eth.bd.evmos.org:8545',
    nativeCurrency: {
        name: 'EVMOS',
        decimals: 18,
        symbol: 'EVMOS',
    },
    blockExplorerUrl: 'https://evm.evmos.org',
};
export const DOGE: ChainConfig = {
    name: 'Dogechain Mainnet',
    shortName: 'DOGE',
    id: ethers.utils.hexlify(2000),
    rpc: 'https://rpc-sg.dogechain.dog',
    nativeCurrency: {
        name: 'DOGE',
        decimals: 18,
        symbol: 'DOGE',
    },
    blockExplorerUrl: 'https://explorer.dogechain.dog',
};
export const OKX: ChainConfig = {
    name: 'OKXChain Mainnet',
    shortName: 'OKX',
    id: ethers.utils.hexlify(66),
    rpc: 'https://exchainrpc.okex.org',
    nativeCurrency: {
        name: 'OKT',
        decimals: 18,
        symbol: 'OKT',
    },
    blockExplorerUrl: 'https://www.oklink.com/en/okc',
};
export const BOBA: ChainConfig = {
    name: 'Boba Network',
    shortName: 'BOBA',
    id: ethers.utils.hexlify(288),
    rpc: 'https://mainnet.boba.network',
    nativeCurrency: {
        name: 'ETH',
        decimals: 18,
        symbol: 'ETH',
    },
    blockExplorerUrl: 'https://blockexplorer.boba.network',
};
export const MOVR: ChainConfig = {
    name: 'Moonriver',
    shortName: 'MOVR',
    id: ethers.utils.hexlify(1285),
    rpc: 'https://rpc.api.moonriver.moonbeam.network',
    nativeCurrency: {
        name: 'MOVR',
        decimals: 18,
        symbol: 'MOVR',
    },
    blockExplorerUrl: 'https://moonriver.moonscan.io',
};
export const GLMR: ChainConfig = {
    name: 'Moonbeam',
    shortName: 'GLMR',
    evmChain: EvmChain.MOONBEAM,
    id: ethers.utils.hexlify(1284),
    rpc: 'https://rpc.api.moonbeam.network',
    nativeCurrency: {
        name: 'GLMR',
        decimals: 18,
        symbol: 'GLMR',
    },
    blockExplorerUrl: 'https://moonbeam.moonscan.io',
};
export const ONE: ChainConfig = {
    name: 'Harmony One',
    shortName: 'ONE',
    id: ethers.utils.hexlify(1666600000),
    rpc: 'https://api.harmony.one',
    nativeCurrency: {
        name: 'ONE',
        decimals: 18,
        symbol: 'ONE',
    },
    blockExplorerUrl: 'https://explorer.harmony.one',
};