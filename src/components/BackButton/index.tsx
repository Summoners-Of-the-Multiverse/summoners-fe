import React from 'react';
import './styles.scss';

const BackButton = ({onButtonClick}: {onButtonClick: () => void}) => {
    return (
        <button 
            className='back-button'
            onClick={onButtonClick}
        >
            <i className="fa fa-chevron-left"></i>
            <span>Back</span>
        </button>
    )
}

export default BackButton;