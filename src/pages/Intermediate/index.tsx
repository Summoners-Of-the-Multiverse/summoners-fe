import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import './styles.scss';

const Intermediate = () => {
    const navigate = useNavigate();
    const [showButton, setShowButton] = useState(true);

    const enterRealm = useCallback(() => {
        setShowButton(false);
        setTimeout(() => {
            navigate('/starter');
        }, 1100);
    }, [navigate]);

    return (
        <div className='intermediate-page'>
            <div className={`intermediate-bg ${!showButton? 'transitioning' : ''}`}>
                <img src={'/assets/bg/transition_bg.jpg'} alt="intermediate_bg" />
                {
                    showButton &&
                    <div className="fog-container">
                        {
                            window.innerWidth > 900 &&
                            <>
                            <div className="foglayer_01 fog">
                                <div className="image01"></div>
                                <div className="image02"></div>
                            </div>
                            <div className="foglayer_02 fog">
                                <div className="image01"></div>
                                <div className="image02"></div>
                                </div>
                            <div className="foglayer_03 fog">
                                <div className="image01"></div>
                                <div className="image02"></div>
                            </div>
                            </>
                        }
                        {
                            window.innerWidth <= 900 &&
                            <>
                            <div className="foglayer_01 fog">
                                <div className="image01"></div>
                                <div className="image02"></div>
                            </div>
                            <div className="foglayer_02 fog">
                                <div className="image01"></div>
                                <div className="image02"></div>
                                </div>
                            <div className="foglayer_03 fog">
                                <div className="image01"></div>
                                <div className="image02"></div>
                            </div>
                            <div className="foglayer_01 fog second">
                                <div className="image01"></div>
                                <div className="image02"></div>
                            </div>
                            <div className="foglayer_02 fog second">
                                <div className="image01"></div>
                                <div className="image02"></div>
                                </div>
                            <div className="foglayer_03 fog second">
                                <div className="image01"></div>
                                <div className="image02"></div>
                            </div>
                            </>
                        }
                    </div>
                }
            </div>
            {
                showButton &&
                <button onClick={enterRealm}>
                    <span>This</span>
                    <span>Way</span>
                </button>
            }
        </div>
    );
}

export default Intermediate;