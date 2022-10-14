import React from 'react';
import { useNavigate } from 'react-router';
import { PrivacyPolicyBannerProps } from './types';
import './styles.scss';
import { runIfFunction } from '../../common/utils';

const PrivacyPolicyBanner = ({show, onPrivacyPolicyAccept}: PrivacyPolicyBannerProps) => {
    const navigate = useNavigate();

    if(!show) {
        return null;
    }

    return (
        <div className="privacy-policy-banner">
            <p>We value your privacy</p>
            <p>We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
            
            <div>
                <button onClick={() => navigate('/privacy-policy')}>Privacy Policy</button>
                <button onClick={() => runIfFunction(onPrivacyPolicyAccept)}>Accept All</button>
            </div>
        </div>
    );
}

export default PrivacyPolicyBanner;