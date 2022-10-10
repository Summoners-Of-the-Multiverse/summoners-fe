import React, { useCallback, useContext, useMemo } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AddressContext } from '../../App';
import { getAreaAudio, getAreaName } from '../../common/utils';
import CloseButton from '../../components/CloseButton';
import instance from '../Axios';
import './styles.scss';
import { MapProps } from './types';

const travel = async(address: string, areaId: number) => {
    try {

        let areaName = getAreaName(areaId);
        if(!window.confirm(`Travel to the ${areaName}?`)) return;

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

const Map = ({ onAreaChange, setAudio }: MapProps) => {
    const { address, areaId, chainName } = useContext(AddressContext);
    const navigate = useNavigate();

    useEffect(() => {
        setAudio("map_world");
    }, [setAudio]);

    const onTravelClick = useCallback(async (areaId: number) => {
        let hasTravelled = await travel(address, areaId);

        if(hasTravelled) {
            setAudio(getAreaAudio(areaId));
            onAreaChange(areaId);
            navigate("/home");
        }
    }, [address, onAreaChange, navigate, setAudio]);

    const onCloseClick = useCallback(() => {
        navigate("/home");
    }, [navigate]);

    const map = useMemo(() => {
        switch(chainName) {
            case "mumbai":
                return "starter_map_polygon";
            case "bsc test":
                return "starter_map_bsc";
            case "polygon":
                return "starter_map_polygon";
            case "bsc":
                return "starter_map_bsc";
            default:
                return "starter_map";
        }
    }, [chainName]);

    return (
		<div className='map-page'>
            <div className="map-container">
			    <img className='map' src={`/assets/maps/${map}.jpg`} alt="starter_map" />
                <button className={`map-button ${areaId === 1? 'active' : ''}`} style={{ bottom: '11%', left: '10%' }} onClick={() => { onTravelClick(1) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 2? 'active' : ''}`} style={{ bottom: '19%', left: '30%' }} onClick={() => { onTravelClick(2) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 3? 'active' : ''}`} style={{ bottom: '24%', left: '50%' }} onClick={() => { onTravelClick(3) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 4? 'active' : ''}`} style={{ bottom: '51%', left: '18%' }} onClick={() => { onTravelClick(4) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 5? 'active' : ''}`} style={{ bottom: '56%', left: '30%' }} onClick={() => { onTravelClick(5) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 6? 'active' : ''}`} style={{ bottom: '52%', left: '68.5%' }} onClick={() => { onTravelClick(6) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 7? 'active' : ''}`} style={{ bottom: '73%', left: '70%' }} onClick={() => { onTravelClick(7) }}>
                    <i className="fa fa-map-marker"></i>
                </button>
                <button className={`map-button ${areaId === 8? 'active' : ''}`} style={{ bottom: '80%', left: '16%' }} onClick={() => { onTravelClick(8) }}>
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