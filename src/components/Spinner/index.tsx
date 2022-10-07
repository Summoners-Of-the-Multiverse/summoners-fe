import React from 'react';
import { PulseLoader, RotateLoader, PropagateLoader, ScaleLoader, ClipLoader } from 'react-spinners';
import './styles.scss';

interface P{
    show: boolean,
    mode: "light" | "dark",
    type: "pulse" | "rotate" | "propagate" | "scale" | "clip",
    text: string
}
interface S{}

export default class LoadingIndicator extends React.Component<P,S> {

    constructor(props: P){
        super(props);

        this.state = {

        }
    }

    render() {
        if ( this.props.show ){
            return (
                <div className={`spinner-container ${this.props.mode}`}>
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