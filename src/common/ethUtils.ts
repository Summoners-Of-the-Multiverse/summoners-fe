export const requestSwitchChain = async(
    chainId: string, 
    chainName: string,
    nativeCurrency: {
        name: string,
        decimals: number,
        symbol: string,
    },
    rpcUrls: string[],
) => {
    //handle unsupported network
    try {
        await window.ethereum!.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId }]
        });
    } 
    catch (e: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (e.code === 4902) {
            await window.ethereum!.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainName,
                        chainId,
                        nativeCurrency,
                        rpcUrls
                    }
                ]
            });
        }
    }
}