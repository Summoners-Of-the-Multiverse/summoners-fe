import React, { useCallback, useContext } from 'react';
import { toast } from 'react-toastify';
import { AddressContext } from '../../App';
import instance from '../Axios';
import './styles.scss';
import { MapProps } from './types';

const travel = async(address: string, areaId: number) => {
    try {

        window.confirm('Travel to this location?');

        await instance.post('/travel', {
            address,
            areaId
        });

        return true;
    }

    catch {
        toast.error('Unable to travel!');
        return false;
    }
}

const Map = ({ onAreaChange }: MapProps) => {
    const { address, areaId } = useContext(AddressContext);

    const onTravelClick = useCallback(async (areaId: number) => {
        let hasTravelled = await travel(address, areaId);

        if(hasTravelled) {
            onAreaChange(areaId);
        }
    }, [address, onAreaChange]);

    return (
		<div className='map-page'>
            <div className="map-container">
			    <img className='map' src="/assets/maps/starter_map.jpeg" alt="starter_map" />
                <button className={`map-button ${areaId === 1? 'active' : ''}`} style={{ bottom: '22%', left: '13.8%' }} onClick={() => { onTravelClick(1) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 2? 'active' : ''}`} style={{ bottom: '24%', left: '63.2%' }} onClick={() => { onTravelClick(2) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 3? 'active' : ''}`} style={{ bottom: '52%', left: '41%' }} onClick={() => { onTravelClick(3) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 4? 'active' : ''}`} style={{ bottom: '55%', left: '64%' }} onClick={() => { onTravelClick(4) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 5? 'active' : ''}`} style={{ bottom: '70%', left: '64%' }} onClick={() => { onTravelClick(5) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 6? 'active' : ''}`} style={{ bottom: '80%', left: '16%' }} onClick={() => { onTravelClick(6) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 7? 'active' : ''}`} style={{ bottom: '85%', left: '64%' }} onClick={() => { onTravelClick(7) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
            </div>
		</div>
	)
}

export default Map;