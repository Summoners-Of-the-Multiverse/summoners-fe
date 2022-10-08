import { ethers, Contract } from 'ethers';
import { ChainConfigs } from '../../../components/EVM';
import ERC721 from '../../../abi/Sotm721.json';
import NftLinker from '../../../abi/SotmNftLinker.json';
import _ from 'lodash';
import { getBaseUrl, ucFirst } from '../../../common/utils';
import { ChainConfig } from '../ChainConfigs/types';
import { AxelarQueryAPI, Environment, EvmChain, GasToken } from '@axelar-network/axelarjs-sdk';
const isTestnet = true;

const chains = ChainConfigs;
export default class ContractCall {
    provider: ethers.providers.JsonRpcProvider;
    chainConfig: ChainConfig;
    signer: ethers.providers.JsonRpcSigner;
    erc721: Contract;
    ntfLinker: Contract;

    constructor(chainId: string) {
        // get chain nft contract address
        const chain: any = _.find(chains, { id: chainId });

        this.chainConfig = chain;
        this.provider = new ethers.providers.Web3Provider(window.ethereum as any);
        this.signer = this.provider.getSigner();
        this.erc721 = new ethers.Contract(chain.nftContract, ERC721.abi, this.signer);
        this.ntfLinker = new ethers.Contract(chain.linkerContract, NftLinker.abi, this.signer);
    }

    checkNftClaimed = async(tokenId: number) => {
        return await this.erc721.isClaimed(tokenId);
    }

    mintNft = async(nextTokenData: any) => {
        if (typeof window.ethereum == "undefined") {
            throw new Error(("Please install MetaMask"));
        }
        // const accounts = await provider.send("eth_requestAccounts", []);

        try {
            if (_.has(this.chainConfig, 'nftContract')) {
                const tokenId: Number = nextTokenData.data.id;
                const hash: string = nextTokenData.data.hash
                const metadata: string = `${getBaseUrl()}/${nextTokenData.data.hash}`;

                const tx = await (await this.erc721.mintWithMetadata(tokenId, hash, metadata)).wait(1);
                return tx;
            }

        } catch(err: any) {
            throw new Error(err.message);
        }
    }

    bridgeNft = async (destChain: ChainConfig, tokenId: string) => {
        console.log(this.chainConfig);
        const owner = await this._ownerOf(this.chainConfig, tokenId);

        console.log({owner})

        console.log('--- Initially ---', owner);
        // await this._print(tokenId);

        const gasFee = await this._getGasFee(ucFirst(this.chainConfig.evmChain!) as EvmChain, ucFirst(destChain.evmChain!) as EvmChain, this.chainConfig.nativeCurrency.symbol);

        // await (await this.erc721.approve(this.ntfLinker.address, owner.tokenId)).wait();
        const isApproved = await this.erc721.isApprovedForAll(owner.address, this.ntfLinker.address);
        console.log(await this.erc721.getApproved(owner.tokenId));
        if (!isApproved) {
            await (await this.erc721.setApprovalForAll(this.ntfLinker.address, true)).wait();
        }

        const tx = await (
            await this.ntfLinker.sendNFT(this.erc721.address, owner.tokenId, ucFirst(destChain.evmChain!), await this.signer.getAddress(), {
                value: gasFee,
            })
        ).wait();

        console.log('tx', tx);

        // axelar tx
        return tx;
        // onSrcConfirmed(tx.transactionHash);

        // while (true) {
        //     const owner = await this._ownerOf(this.chainConfig, tokenId);
        //     if (owner.chain == destChain.name) {
        //         onSent(owner);
        //         break;
        //     }
        //     await sleep(2000);
        // }

        // console.log('--- Then ---');
        // await print();
    }

    _print = async (tokenId: string) => {
        await Promise.all(_.map(chains, async(chain, index) => {
            try {
                const owner = await this._ownerOf(chain, tokenId);
                console.log(`Token that was originally minted at ${chain.name} is at ${owner.chain}.`);
            } catch (e) {
                // console.log(`ownerOf ${chain.name} failed`);
            }
        }))
    }

    _ownerOf = async (chain: ChainConfig, tokenId: string) => {
        const operator: Contract = this.erc721;
        try {
            const owner = await operator.ownerOf(tokenId);
            console.log(owner);
            const metadata = await operator.tokenURI(tokenId);
            console.log(metadata);

            // owner here is owner's wallet address
            if (owner !== chain.linkerContract) {
                // if not equal to nft linker address (original chain NFT)
                return { chain: chain.name, address: owner, tokenId: tokenId, tokenURI: metadata };
            } else {
                // if equal to linker address (for cross-chained NFT)
                const provider = new ethers.providers.Web3Provider(window.ethereum as any);
                const signer = provider.getSigner();

                // generate cross chain token id here
                await Promise.all(_.map(ChainConfigs, async (checkingChain) => {
                    if (checkingChain != chain) {
                        try {
                            const checkingChainContract = new ethers.Contract(checkingChain.linkerContract as string, NftLinker.abi, signer);

                            const address = await checkingChainContract.ownerOf(tokenId);
                            console.log(address);
                            return { chain: checkingChain.name, address: address, tokenId: tokenId, tokenURI: metadata };
                        } catch (e) {
                            console.log(e);
                            throw new Error(`You are not the owner of nft`)
                        }
                    }
                }))
            }
            return { chain: '' };
        } catch(e) {
            console.log(e);
            throw new Error(`You are not the owner of nft`);
        }

    };

    _getGasFee = async (
        sourceChainName: EvmChain,
        destinationChainName: EvmChain,
        sourceChainTokenSymbol: GasToken | string,
        estimatedGasUsed?: number
    ) => {
        const environment = isTestnet ? Environment.TESTNET : Environment.MAINNET;
        const api = new AxelarQueryAPI({ environment: environment });

        const gasFee = await api.estimateGasFee(sourceChainName, destinationChainName, sourceChainTokenSymbol, 1000000);

        console.log(gasFee);
        return gasFee;
    };

}
