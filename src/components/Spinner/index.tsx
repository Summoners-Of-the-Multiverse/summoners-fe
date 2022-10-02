import React from 'react';

import { PulseLoader, RotateLoader, PropagateLoader, ScaleLoader, ClipLoader } from 'react-spinners';

interface P{
    show: boolean,
    mode: "light" | "dark" | "white",
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

    COLOR = this.props.mode === 'dark'? "rgb( 12, 255, 0 )" : "rgb( 57, 196, 51 )"
    BG_COLOR = this.props.mode === 'dark'? "rgba( 0, 0, 0, 0.08 )" : "rgba( 255, 255, 255, 0.08 )"

    render() {
        if ( this.props.show ){
            return (
                <div
                    className='layer-1'
                    style={{
                        position: 'absolute',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        width: '100%',
                        top: 0,
                        left: 0,
                        backgroundColor: this.BG_COLOR,
                        borderRadius: "inherit",
                    }}
                >
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
                dom = <PulseLoader size={ 15 } margin='10px' color={ this.COLOR }/>
                break;

            case "rotate":
                dom = <RotateLoader size={ 15 } margin='1px' color={ this.COLOR }/>
                break;

            case "propagate":
                dom = <PropagateLoader size={ 15 } color={ this.COLOR }/>
                break;

            case "scale":
                dom = <ScaleLoader height={ 25 } width={ 5 } radius={ 5 } margin='5px' color={ this.COLOR }/>
                break;

            case "clip":
                dom = <ClipLoader size={ 25 } color={ this.COLOR }/>
                break;

            default:
                dom = <PulseLoader size={ 15 } margin='10px' color={ this.COLOR }/>
                break;
        }

        return (
            <div
                style={{
                    position: 'relative',
                    borderRadius: '10px',
                    width: '140px',
                    height: '100px',
                    background: '#efefef',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexFlow: 'column'
                }}
            >
                <div style={{display: 'block', position: 'relative'}}>{text}</div>
                {dom}
            </div>
        );
    }
}