import { useCallback, useState } from 'react';
import './App.css';
import MetaMaskConnect from './components/MetaMaskConnect';

function App() {
    const [address, setAddress] = useState([]);

    const handleNewAccount = useCallback((address) => {
        setAddress(address);
    }, []);

    return (
        <div className="App">
            <MetaMaskConnect
                handleNewAccount={handleNewAccount}
            />
        </div>
    );
}

export default App;
