import React, { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AddressContext } from '../../App';
import CloseButton from '../../components/CloseButton';
import instance from '../Axios';
import './styles.scss';
import { MapProps } from './types';

const travel = async(address: string, areaId: number) => {
    try {

        if(!window.confirm('Travel to this location?')) return;

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
    const navigate = useNavigate();

    const onTravelClick = useCallback(async (areaId: number) => {
        let hasTravelled = await travel(address, areaId);

        if(hasTravelled) {
            onAreaChange(areaId);
            navigate("/");
        }
    }, [address, onAreaChange, navigate]);

    const onCloseClick = useCallback(() => {
        navigate("/");
    }, [navigate]);

    return (
		<div className='map-page'>
            <div className="map-container">
			    <img className='map' src="/assets/maps/starter_map.jpg" alt="starter_map" />
                <button className={`map-button ${areaId === 1? 'active' : ''}`} style={{ bottom: '10%', left: '10%' }} onClick={() => { onTravelClick(1) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 2? 'active' : ''}`} style={{ bottom: '19%', left: '30%' }} onClick={() => { onTravelClick(2) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 3? 'active' : ''}`} style={{ bottom: '24%', left: '54%' }} onClick={() => { onTravelClick(3) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 4? 'active' : ''}`} style={{ bottom: '10%', left: '40%' }} onClick={() => { onTravelClick(4) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 5? 'active' : ''}`} style={{ bottom: '51%', left: '18%' }} onClick={() => { onTravelClick(5) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 6? 'active' : ''}`} style={{ bottom: '56%', left: '30%' }} onClick={() => { onTravelClick(6) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 7? 'active' : ''}`} style={{ bottom: '55%', left: '68%' }} onClick={() => { onTravelClick(7) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 8? 'active' : ''}`} style={{ bottom: '73%', left: '70%' }} onClick={() => { onTravelClick(8) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 9? 'active' : ''}`} style={{ bottom: '80%', left: '16%' }} onClick={() => { onTravelClick(9) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <CloseButton
                    onButtonClick={onCloseClick}
                />
            </div>
		</div>
	)
}

export default Map;