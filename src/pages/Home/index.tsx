import React, { useContext } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AddressContext } from '../../App';
import { getAreaAudio } from '../../common/utils';
import { BasePage } from '../../types';
import './styles.scss';

const Home = ({ setAudio }: BasePage) => {
	const { address, areaId } = useContext(AddressContext);
	const navigate = useNavigate();

	useEffect(() => {
		setAudio(getAreaAudio(areaId));
	}, [setAudio, areaId,]);

    return (
		<div className='home-page'>
			{
				address &&
				<>
					<button
						className='navigate-button'
						onClick={() => navigate('/map')}
					>
						Travel
					</button>
					<button
						className='navigate-button'
						onClick={() => navigate('/portal')}
					>
						Portal
					</button>
					<button
						className='navigate-button'
						onClick={() => navigate('/battle')}
					>
						Hunt!
					</button>
                    <button
                        className='navigate-button'
                        onClick={() => navigate('/inventory')}
                    >
                        Inventory
                    </button>
                    <button
                        className='navigate-button'
                        onClick={() => navigate('/battleHistory')}
                    >
                        History
                    </button>
                    <button
                        className='navigate-button coming-soon'
						disabled
                    >
                        Challenge
						<div className="ribbon">
							<div>Soon<sup>tm</sup></div>
						</div>
                    </button>
                    <button
                        className='navigate-button coming-soon'
						disabled
                    >
                        Marketplace
						<div className="ribbon">
							<div>Soon<sup>tm</sup></div>
						</div>
                    </button>
				</>
			}
		</div>
	)
}

export default Home;