import React from 'react';
import { useNavigate } from 'react-router';
import './styles.scss';

const Home = () => {
	const navigate = useNavigate();

    return (
		<div className='home-page'>
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
		</div>
	)
}

export default Home;