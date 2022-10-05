import { ethers, Contract } from 'ethers';
import { ChainConfigs } from '../../../components/EVM';
import ERC721 from '../../../abi/Sotm721.json';
import NftLinker from '../../../abi/SotmNftLinker.json';
import _ from 'lodash';
import { getBaseUrl } from '../../../common/utils';
import { ChainConfig } from '../ChainConfigs/types';

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
                const metadata: string = `${getBaseUrl}/${nextTokenData.data.hash}`;

                const tx = await (await this.erc721.mintWithMetadata(tokenId, hash, metadata)).wait(1);
                return tx;
            }

        } catch(err: any) {
            throw new Error(err.message);
        }
    }
}
