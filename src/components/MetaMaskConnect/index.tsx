import MetaMaskOnboarding from '@metamask/onboarding';
import React, { useState, useEffect, useRef } from 'react';
import { ellipsizeThis } from '../../common/utils';
import { ButtonProps } from './types';

const ONBOARD_TEXT = 'Click here to install MetaMask!';
const CONNECT_TEXT = 'Connect';

export default function OnboardingButton({ handleNewAccount }: ButtonProps) {
    const [buttonText, setButtonText] = useState(CONNECT_TEXT);
    const [isDisabled, setDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState<string[]>([]);
    const onboarding = useRef<MetaMaskOnboarding>();

    useEffect(() => {
        if (!onboarding.current) {
            onboarding.current = new MetaMaskOnboarding();
        }
    }, []);

    useEffect(() => {
        if(isLoading) {
            return;
        }

        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            if (accounts.length > 0) {
                setButtonText(ellipsizeThis(accounts[0], 4, 3));
                setDisabled(true);
                handleNewAccount(accounts[0]);

                if(onboarding.current) {
                    onboarding.current.stopOnboarding();
                }
            } else {
                setButtonText(CONNECT_TEXT);
                setDisabled(false);
            }
        }
    }, [accounts, isLoading, handleNewAccount]);

    useEffect(() => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            setTimeout(() => {
                if(window.ethereum?.selectedAddress) {
                    setAccounts([window.ethereum.selectedAddress]);
                }

                else {
                    setDisabled(false);
                }

                setIsLoading(false);
            }, 100);

            window.ethereum!.on('accountsChanged', (newAccounts) => {
                if(Array.isArray(newAccounts)) {
                    if(typeof(newAccounts[0] === 'string')) {
                        setAccounts(newAccounts);
                    }
                }
            });

            return () => {
                window.ethereum!.removeListener('accountsChanged', () => {});
            };
        }

        else {
            setDisabled(false);
            setButtonText(ONBOARD_TEXT);
        }
    }, []);

    const onClick = () => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum!
                .request({ method: 'eth_requestAccounts' })
                .then((newAccounts: any) => setAccounts(newAccounts));
        } else {
            if(onboarding.current) {
                onboarding.current.startOnboarding();
            }
        }
    };

    return (
        <button disabled={isDisabled} onClick={onClick}>
            {buttonText}
        </button>
    );
}