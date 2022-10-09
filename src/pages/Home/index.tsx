import React, { useContext } from 'react';
import { useNavigate } from 'react-router';
import { AddressContext } from '../../App';
import './styles.scss';

const Home = () => {
	const { address, } = useContext(AddressContext);
	const navigate = useNavigate();

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