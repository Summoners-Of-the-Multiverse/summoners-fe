import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { SocketContext } from '../../../App';
import { toast } from 'react-toastify';
import { ethers, Contract } from 'ethers';
import { ChainConfigs } from '../../../components/EVM';
import ERC721 from '../../../abi/Sotm721.json';
import NftLinker from '../../../abi/SotmNftLinker.json';
import _ from 'lodash';
import { IMintType } from './types';
const chains = ChainConfigs;

export const Mint = ({type}: IMintType) => {
    // const socket = useContext(SocketContext);
    // const { address, chain } = useContext(AddressContext);
    const label = type == 'capture' ? 'Capture' : 'Obtain';

    const mintNft = async(tokenId: number, hash: string, metadata: string) => {
        if (typeof window.ethereum == "undefined") {
            throw new Error(("Please install MetaMask"));
        }
        // const accounts = await provider.send("eth_requestAccounts", []);

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum as any);

            const chainId: number = (await provider.getNetwork()).chainId;

            const signer: ethers.providers.JsonRpcSigner = provider.getSigner();
            // const address = signer.getAddress();

            let nftContract: string | undefined = '';
            _.map(chains, (c, index) => {
                if (c.id == ethers.utils.hexlify(chainId) && !_.isNil(c.nftContract)) {
                    console.log(c);
                    nftContract = c.nftContract;
                }
            });

            if (!_.isEmpty(nftContract)) {
                const erc721 = new ethers.Contract(nftContract, ERC721.abi, signer);

                // const nftTokenId = 66;
                // const hash = '7a8a7902a4ee5625dec4'
                // const metadata = `https://api.npoint.io/7a8a7902a4ee5625dec4`;

                console.log(erc721);

                const tx = await (await erc721.mintWithMetadata(tokenId, hash, metadata)).wait(1);

                console.log(tx);
            }

        } catch(err: any) {
            throw new Error(err.message);
        }
    }

    return (
        <div className='mint-button'>
            <div className='d-flex'>
                <button
                    className='btn btn-sm btn-warning'
                    onClick={() => mintNft(6, `7a8a7902a4ee5625dec4`, `https://api.npoint.io/7a8a7902a4ee5625dec4`)}
                >
                    {label}
                </button>
            </div>
        </div>
    )
}