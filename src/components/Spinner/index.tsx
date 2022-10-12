import React from 'react';
import { PulseLoader, RotateLoader, PropagateLoader, ScaleLoader, ClipLoader } from 'react-spinners';
import './styles.scss';

interface P{
    show: boolean,
    mode: "light" | "dark" | "white",
    type: "pulse" | "rotate" | "propagate" | "scale" | "clip" | "bridging" | "packing",
    text: string
    fullScreen?: boolean;
}
interface S{}

export default class Spinner extends React.Component<P,S> {

    constructor(props: P){
        super(props);

        this.state = {

        }
    }

    render() {
        if ( this.props.show ){
            return (
                <div className={`spinner-container ${this.props.mode} ${this.props.fullScreen? 'fullscreen' : ''}`}>
                    { this._renderLoader() }
                </div>
            )
        }

        return null
    }

    _renderLoader = () => {
        const { type, text } = this.props
        let dom;
        switch( type ){
            case "pulse":
                dom = <PulseLoader size={ 15 } margin='10px' color={"#aa8c34"}/>
                break;

            case "rotate":
                dom = <RotateLoader size={ 15 } margin='1px' color={"#aa8c34"}/>
                break;

            case "propagate":
                dom = <PropagateLoader size={ 15 } color={"#aa8c34"}/>
                break;

            case "scale":
                dom = <ScaleLoader height={ 25 } width={ 5 } radius={ 5 } margin='5px' color={"#aa8c34"}/>
                break;

            case "clip":
                dom = <ClipLoader size={ 25 } color={"#aa8c34"}/>
                break;

            case "bridging":
                dom = <img src="/assets/gif/mob.gif" alt="bridging"/>
                break;

            case "packing":
                dom = <img src="/assets/gif/packing.webp" alt="packing"/>
                break;

            default:
                dom = <PulseLoader size={ 15 } margin='10px' color={"#aa8c34"}/>
                break;
        }

        return (
            <div className='spinner'>
                <div>{text}</div>
                {dom}
            </div>
        );
    }
}