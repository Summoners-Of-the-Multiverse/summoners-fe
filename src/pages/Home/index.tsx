import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { AddressContext } from '../../App';
import './styles.scss';

const Home = () => {
    const { address, chain, } = useContext(AddressContext);
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
				onClick={() => navigate('/battle')}
			>
				Hunt!
			</button>
		</div>
	)
}

export default Home;