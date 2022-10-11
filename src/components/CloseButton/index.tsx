import React from 'react';
import './styles.scss';

const CloseButton = ({onButtonClick}: {onButtonClick: () => void}) => {
    return (
        <button 
            className='close-button'
            onClick={onButtonClick}
        >
            <i className="fa fa-times"></i>
        </button>
    )
}

export default CloseButton;