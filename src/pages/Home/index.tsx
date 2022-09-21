import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { AddressContext } from '../../App';


const Home = () => {
    const options = {method: 'GET', headers: {Accept: 'application/json', 'X-API-Key': 'Uz4nx8socOf6C6o0qyZ4ELGUm0SKdzODYS6yrhmnRCmF9vKMObZ0Qfc9tyG2XhdX'}};
    const { address, chain, } = useContext(AddressContext);

    /* fetch(`https://deep-index.moralis.io/api/v2/${address}/nft?chain=polygon&format=decimal`, options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err)); */

    return (<div>Home: {chain}</div>)
}

export default Home;