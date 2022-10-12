import React, { useCallback, useEffect, useState, useContext, useMemo } from 'react';
import { AddressContext } from '../../App';
import instance from '../Axios';
import './styles.scss'
import _ from 'lodash';
import { getMonsterIcon, cloneObj, getSkillIcon, copyToClipboard, getBridgingIcon, truncateStr, getChainLogo } from '../../common/utils';
import LoadingIndicator from '../../components/Spinner';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import BackButton from '../../components/BackButton';
import ElementIcon from '../../components/ElementIcon';
import ContractCall from '../../components/EVM/ContractCall';
import { BSC_TEST, POLYGON_TEST, BSC, POLYGON } from '../../components/EVM/ChainConfigs';
import { ChainConfigs } from '../../components/EVM';
// import {
//     AxelarGMPRecoveryAPI,
//     Environment,
//     GMPStatusResponse
// } from "@axelar-network/axelarjs-sdk";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Card, Popover, Button, OverlayTrigger } from 'react-bootstrap';
import moment from 'moment';
import { BasePage } from '../../types';
import { sleep } from '@axelar-network/axelarjs-sdk';

const PREPARING_TEXT = "Packing..";
const BRIDGING_TEXT = "Travelling..";
const isTestnet = process.env.REACT_APP_CHAIN_ENV === "testnet";

// assign chain info based on env
const BscChain = isTestnet ? BSC_TEST : BSC;
const PolygonChain = isTestnet ? POLYGON_TEST : POLYGON;

// Polyfill error solution
// https://stackoverflow.com/questions/70398678/i-tried-to-polyfill-modules-in-webpack-5-but-not-working-reactjs

// https://github.com/facebook/create-react-app/issues/11756

// https://stackoverflow.com/questions/71562875/node-js-webpack5-error-module-not-found-breaking-change-webpack-5-used-to-i

/* const sdk = new AxelarGMPRecoveryAPI({
    environment: Environment.TESTNET,
}); */
const chains = ChainConfigs;

const axelarScan = isTestnet ? `https://testnet.axelarscan.io/gmp/` : `https://axelarscan.io/gmp/`;
const SuccessBridgeToast = (tx:any) => (
    <div className='link-toast'>
        Journey Started
        <a target="_blank" rel="noopener noreferrer" href={`${axelarScan}${tx.transactionHash}`}>⮕ Follow Them ⬅</a> 
    </div>
);

const Inventory = ({ setAudio }: BasePage) => {
    const navigate = useNavigate();

    const { address, chain, } = useContext(AddressContext);
    // store previous selected mob (for untoggle mob highlight purpose)
    const [selected, setSelected] = useState<any>(null);
    // set loading state
    const [isLoading, setIsLoading] = useState(false);
    // set bridging state
    const [isBridging, setIsBridging] = useState(false);
    const [bridgingText, setBridgingText] = useState(PREPARING_TEXT);
    // display travelling paws on mob icon
    const [travellingMob, setTravellingMob] = useState<any[]>([]);
    // store all monster
    const [mob, setMob] = useState<any[]>([]);
    // store selected monster (onclick)
    const [selectedMob, setSelectedMob] = useState<any>(null);
    // for pagination purpose
    const [skip, setSkip] = useState(0);
    // each page up/page down will reload 1 row (5mobs)
    const skipStep = 5;
    // limit monster display per pagination
    const take = 15;
    const maxEquipped = 4;

    const getInventory = useCallback(async (chain: string, address: string) => {
        if (address && chain) {
            try {
                setIsLoading(true);
                let res = await instance.post(`/inventory`, {
                    address: address,
                    chainId: chain
                });

                let mob = res.data;
                // set mob isBridging (so we can display more bridging info based on state here)
                setMob(mob);

                setIsLoading(false);
            } catch(e) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (selected) {
            selected.classList.toggle('selected');
        }
        setSelected(false);
        setSelectedMob(false);
        setTravellingMob([]);
        getInventory(chain, address);
    }, [chain, address, getInventory]);

    const equippedMonster = useMemo(() => {
        return _.filter(mob, { equipped: 1 });
    }, [mob]);

    const unequippedMonsterPaginated = useMemo(() => {
        let unequippedMobs = _.filter(mob, { equipped: 0 });
        return _.slice(unequippedMobs, skip, skip + take);
    }, [mob, skip]);

    const selectMob = useCallback((event: any, m: any) => {
        if (selected) {
            selected.classList.toggle('selected');
        }
        setSelectedMob(m);
        // 👇️ toggle class on click
        event.currentTarget.classList.toggle('selected');
        setSelected(event.currentTarget);
    }, [selected]);

    const navigateUp = useCallback(() => {
        const newSkip = skip - skipStep >= 0 ? skip - skipStep : skip;
        setSkip(newSkip)
    }, [skip])

    const navigateDown = useCallback(() => {
        // if item less than 15, do not let it scroll down
        if (_.size(mob) > take) {
            const newSkip = skip + skipStep < mob.length ? skip + skipStep : skip;
            setSkip(newSkip)
        }
    }, [skip, mob])

    const EquippedMonster = useCallback(() => {
        let component: JSX.Element[] = [];
        for (let index = 0; index < maxEquipped; index++) {
            const m = equippedMonster[index];

            if (m) {
                component.push(
                    <div key={`mob-${index}`} className="mob-slot" onClick={(e) => selectMob(e, m)}>
                        <div className="slotLabel">{index+1}</div>
                        <img src={getMonsterIcon(m.img_file, m.element_id, m.is_shiny)} alt="monster_icon"/>
                    </div>
                )
            } else {
                component.push(
                    <div key={`mob-${index}`} className="mob-slot">
                        <div className="slotLabel">{index+1}</div>
                    </div>
                )
            }
        }
        return component;
    }, [equippedMonster, selectMob]);


    /**
     * Use mob in battle
     * @date 2022-10-06
     */
     const equipMob = useCallback(async () => {
        try {
            // setIsLoading(true);
            let res = await instance.post(`/equipMob`, {
                address: address,
                chainId: chain,
                monsterId: selectedMob.id
            });

            if (res.data) {
                // set unequipped in state
                const currMob = cloneObj(mob);
                _.map(currMob, (m, mIndex) => {
                    // console.log(`m.id: ${m.id} | selectedMob.id: ${selectedMob.id}`);
                    if (m.id === selectedMob.id) {
                        // console.log(`set equip to 1`);
                        currMob[mIndex].equipped = 1;
                    }
                });
                setMob(currMob);

                // unselect target mob
                selected.classList.toggle('selected');
                setSelected(null);
                setSelectedMob(null);

                // refresh subMob list & equipped list
                setSkip(0);
                toast.success(<div>Added <b>{selectedMob.name}</b> to party</div>);
            } else {
                toast.error(<div>Failed to equip <b>{selectedMob.name}</b></div>);
            }

            // setIsLoading(false);
        } catch(e) {
            // console.log(e);
            // setIsLoading(false);
        }
    }, [address, chain, mob, selected, selectedMob]);

    /**
     * Remove mob from battle
     * @date 2022-10-06
     */
     const unEquipMob = useCallback(async () => {
        try {
            // setIsLoading(true);
            let res = await instance.post(`/unequipMob`, {
                address: address,
                chainId: chain,
                monsterId: selectedMob.id
            });

            if (res.data) {
                // set unequipped in state
                const currMob = cloneObj(mob);
                _.map(currMob, (m, mIndex) => {
                    if (m.id === selectedMob.id) {
                        currMob[mIndex].equipped = 0;
                    }
                });
                // update all mob
                setMob(currMob);

                // unselect target mob
                selected.classList.toggle('selected');
                setSelected(null);
                setSelectedMob(null);

                // refresh subMob list & equipped list
                setSkip(0);
                toast.success(<div>Removed <b>{selectedMob.name}</b> from party</div>);
            } else {
                toast.error(<div>Failed to unequip <b>{selectedMob.name}</b></div>);
            }

            // setIsLoading(false);
        } catch(e) {
            // console.log(e);
            // setIsLoading(false);
        }
    }, [address, chain, mob, selected, selectedMob]);

    /**
     * Bridging
     * @date 2022-10-06
     */
    const sendMob = useCallback(async (destChainId: string) => {
        try {
            setIsBridging(true);
            await sleep(1);
            setTravellingMob(_.concat(travellingMob, [selectedMob.id]));

            // destination this
            const destChain: any = _.find(chains, { id: destChainId });
            const currChain: any = _.find(chains, { id: chain });
            const contract = new ContractCall(chain);
            setBridgingText(BRIDGING_TEXT);
            const tx = await contract.bridgeNft(destChain, selectedMob);

            // save record in be
            await instance.post(`/bridgeLog`, {
                monsterId: selectedMob.id,
                tokenId: selectedMob.token_id,
                address: address,
                fromChainId: currChain.id,
                toChainId: destChain.id,
                txHash: tx.transactionHash
            });

            toast.success(SuccessBridgeToast(tx));
            localStorage.setItem(`${selectedMob.curr_token_id}`, tx.transactionHash);
            // selected.classList.toggle('selected');
            // setSelected(false);
            // setSelectedMob(false);
            setIsBridging(false);
            setBridgingText(PREPARING_TEXT);
            // while (true) {
            //     const txStatus: GMPStatusResponse = await sdk.queryTransactionStatus(tx.transactionHash);
            //     console.log(txStatus);
            //     await sleep(2000);
            // }
        }
        catch(e) {
            setTravellingMob(_.filter(travellingMob, (i) => i !== selectedMob.id));
            setBridgingText(PREPARING_TEXT);
            setIsBridging(false);
            toast.warning(`Trip cancelled..`)
            // console.log(e);
            return false;
        }
    }, [chain, selectedMob, travellingMob, address]);

    const copyText = async (text: string) => {
        await copyToClipboard(text);
        toast.success(`Copied token: ${truncateStr(text, 10)}`);
    }

    const InfoSlot = useCallback(() => {
        let mobSkils: JSX.Element[] = [];
        let mobName = '';
        let mobTokenId = '';
        let mobOriginChain = '';
        let shortMobTokenId = '';
        let mobStats: JSX.Element = (<div className="mob-stats-slot"></div>);
        let elementId = null;

        if (selectedMob) {
            mobName = selectedMob.name;
            mobTokenId = selectedMob.token_id;
            const mobOriChainName:any = _.find(chains, { id: selectedMob.origin_chain });
            mobOriginChain = getChainLogo(mobOriChainName.evmChain);
            shortMobTokenId = ` ${truncateStr(selectedMob.token_id, 10)}`;
            elementId = selectedMob.element_id;
            _.map(selectedMob.skills, (sm, smIndex) => {
                const popover = (
                    <Popover id="popover-basic">
                        <Popover.Header as="h3">
                            <div className="mob-skill-stats">
                                <ElementIcon
                                    elementId={sm.element_id}
                                />{sm.name}
                            </div>
                        </Popover.Header>
                        <Popover.Body>
                            Hits: {sm.hits}<br/>
                            Damage: {sm.damage}%<br/>
                            Accuracy: {sm.accuracy}<br />
                            Cooldown: {sm.cooldown}s<br />
                        </Popover.Body>
                    </Popover>
                );

                mobSkils.push(
                    <OverlayTrigger rootClose={true} trigger="click" placement="right-end" overlay={popover} delay={{ show: 50, hide: 50 }}>
                        <button className="mob-skill-icon">
                            <img className={sm.element} alt={sm.name} src={getSkillIcon(sm.icon_file)} />
                        </button>
                    </OverlayTrigger>
                )
            })

            mobStats = (
                <div className="mob-stats-slot">
                    <div>
                        <div className="mob-stats">
                            <span>ATT</span>
                            <span>{selectedMob.attack}</span>
                        </div>
                        <div className="mob-stats">
                            <span>LIFE</span>
                            <span>{selectedMob.hp}</span>
                        </div>
                    </div>
                    <div>
                        <div className="mob-stats">
                            <span>DEF</span>
                            <span>{selectedMob.defense}</span>
                        </div>
                        <div className="mob-stats">
                            <span>CRIT</span>
                            <span>{selectedMob.crit_chance}</span>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="big-slot">
                <div className="mob-skills">
                    {mobSkils}
                </div>
                <div className="mob-info">
                    <Button className='mob-token-id' variant="outline-secondary" onClick={() => {copyText(mobTokenId)}}>{mobOriginChain && <img className="origin-chain-logo" src={mobOriginChain} alt="original_chain_logo"/>}{shortMobTokenId}</Button>
                    <div className="mob-name">
                        <h5>
                            {elementId && <ElementIcon
                                elementId={elementId}
                            />}

                            {mobName}
                        </h5>
                    </div>
                    {mobStats}
                </div>
            </div>
        )
    }, [selectedMob]);

    const MonsterListing = useCallback(() => {
        let component: JSX.Element[] = [];
        for (let index = 0; index < take; index++) {
            const m = unequippedMonsterPaginated[index];
            if (m) {
                // const isEquipped = m.equipped === 1 ? 'slot equipped' : 'slot';
                component.push(
                    <div key={`mob-${index}`} className="slot" onClick={(e) => selectMob(e, m)}>
                        <img src={getMonsterIcon(m.img_file, m.element_id, m.is_shiny)} alt="monster_icon"/>
                        <img className={ travellingMob.includes(m.id) ? 'travelling' : 'not-travelling' } src={getBridgingIcon('white_paws')} alt="sotm bridging" />
                    </div>
                )
            } else {
                component.push(
                    <div key={`mob-${index}`} className="slot">
                    </div>
                )
            }
        }
        return component;
    }, [unequippedMonsterPaginated, selectMob, travellingMob]);

    const BridgeLog = useCallback((data: any) => {
        let component: JSX.Element[] = [];
        for (let d of data) {
            const currChain: any = _.find(chains, { id: d.from_chain_id });
            const destChain: any = _.find(chains, { id: d.to_chain_id });
            const cardFooterEnd = ( d.updated_at &&
                <div className="card-footer-start">
                    <i className="mdi mdi-check-all"></i>{' '}{moment(d.updated_at).format('YYYY-MM-DD HH:mm:ss')}
                </div>
            )
            component.push(
                <Card className="bridge-ticket" border="light">
                    <Card.Header className={destChain.evmChain}>
                        <div className="ticket-header">
                            <span className="ticket-header-title">
                                {moment.duration(moment().diff(d.created_at)).asMinutes() < 10 && _.isNil(d.updated_at) ? <i className='mdi mdi-new-box mdi-red'></i> : !_.isNil(d.updated_at) ? <i className='mdi mdi-check-all'></i> : ''}
                                {' '}Axelar
                            </span>
                            <span className="ticket-header-info">
                                Boarding Pass
                            </span>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <Card.Title>
                            <div className="ticket-bridging-location">
                                <div className="ticket-bridging-location-info">
                                    <img className="ticket-bridging-chain" src={getChainLogo(currChain.evmChain)} alt="bridging"/> {currChain.shortName}
                                </div>
                                <i className="mdi mdi-airplane-takeoff"></i>
                                <div className="ticket-bridging-location-info">
                                    <img className="ticket-bridging-chain" src={getChainLogo(destChain.evmChain)} alt="bridging"/> {destChain.shortName}
                                </div>
                            </div>
                        </Card.Title>
                        <Card.Text className="card-text">
                            <div className="ticket-body">
                                <table className='ticket-body-table'>
                                    <tbody>
                                        <tr>
                                            <th>Token</th>
                                            <th>Receipt</th>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="ticket-body-token" onClick={() => {copyText(d.token_id)}}>{truncateStr(d.token_id, 10)}</div>
                                            </td>
                                            <td>
                                                <a target="_blank" rel="noopener noreferrer" href={`${axelarScan}${d.tx_hash}`}>{truncateStr(d.tx_hash, 10)}</a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className={`card-footer ${destChain.evmChain}`}>
                                <div className="card-footer-start">
                                    <i className="mdi mdi-alarm"></i>{' '}{moment(d.created_at).format('YYYY-MM-DD HH:mm:ss')}
                                </div>
                                {cardFooterEnd}
                            </div>
                        </Card.Text>
                    </Card.Body>
                </Card>
            );
        }

        return <>{component}</>
    }, []);

    const showBridgeLog = useCallback (async () => {
        const data: any = await instance.get(`/bridgeLog/${address}`);
        const MySwal = withReactContent(Swal)

        MySwal.fire({
            title: (<p>Bridge History</p>),
            html: BridgeLog(data.data),
            customClass: {
                container: "swal-bridge-log"
            }
        })
    }, [BridgeLog, address])

    const BridgeLogButton = () => {
        return (
            <div onClick={()=> {
                showBridgeLog()
            }} className='bridge-history-btn' style={{float: "right"}}>Bridge History</div>
        )
    }

    const ActionButton = useCallback(() => {
        let component: JSX.Element;
        if (selectedMob && selectedMob.equipped === 1) {
            component = (
                <div className="actions">
                    <button onClick={unEquipMob}>DROP</button>
                </div>
            );
        } else if (selectedMob && travellingMob.includes(selectedMob.id)) {
            component = (
                <div className="actions">
                    <button onClick={() => showBridgeLog()}>Track</button>
                </div>
            );
        } else {
            const disabledBSC = chain === BscChain.id || _.isNil(selectedMob) ? true : false;
            const disabledPoly = chain === PolygonChain.id || _.isNil(selectedMob) ? true : false;
            const popover = (
                <Popover id="popover-basic">
                    <Popover.Header as="h3">
                        Send guardian to?
                    </Popover.Header>
                    <Popover.Body>
                        <div className="d-grid gap-1">
                            <Button variant="outline-warning" onClick={() => sendMob(BscChain.id)} disabled={disabledBSC} size="lg">BSC</Button>
                            <Button variant="outline-info" onClick={() => sendMob(PolygonChain.id)} disabled={disabledPoly}  size="lg">Polygon</Button>
                        </div>
                    </Popover.Body>
                </Popover>
            );

            component = (
                <div className="actions">
                    <button onClick={equipMob}>USE</button>
                    <OverlayTrigger rootClose={true} trigger="click" placement="top-end" overlay={popover} delay={{ show: 50, hide: 50 }}>
                        <button>SEND</button>
                    </OverlayTrigger>
                </div>
            );
        }
        return component;
    }, [chain, selectedMob, equipMob, unEquipMob, sendMob, showBridgeLog, travellingMob]);

    const currChain: any = _.find(chains, { id: chain });
    const currChainLogo: string = _.has(currChain, 'evmChain') ? getChainLogo(currChain.evmChain) : '';

    return (
        <div className="position-relative w-100 vh-100">

            <div className="inventory-page container">
                <BackButton
                    onButtonClick={() => navigate('/home')}
                />

                <BridgeLogButton></BridgeLogButton>

                <div className="inventory">
                    <div className="title groovy">
                        <img className="chain-logo" src={currChainLogo} alt="chain_logo"/>
                        <div className="text">INVENTORY</div>
                    </div>

                    {/* equipped */}
                    <div className="equipment groovy">
                        <div className="label-slot">
                            <div className="label-placeholder">
                                <span className="equipped">In-Use</span>
                                <i className="label-icon fa fa-optin-monster" aria-hidden="true"></i>
                            </div>
                        </div>
                        { EquippedMonster() }
                    </div>

                    <div className="bag groovy">
                        <div className="top-part">
                            { MonsterListing() }
                        </div>

                        {/* description part */}
                        <div className="divider">
                            <div className="small-slot"></div>
                        </div>

                        {/* description box */}
                        <div className="description">
                            <InfoSlot></InfoSlot>
                        </div>
                        <ActionButton></ActionButton>
                    </div>
                    <ul className="tabs">
                        <li>
                            <button
                                className="navigation"
                                onClick={navigateUp}
                            >
                                <i className="fa fa-arrow-up" aria-hidden="true"></i>
                            </button>
                        </li>
                        <li>
                            <button
                                className="navigation"
                                onClick={navigateDown}
                            >
                                <i className="fa fa-arrow-down" aria-hidden="true"></i>
                            </button>
                        </li>
                        <li>
                            <button
                                className="navigation"
                                onClick={() => getInventory(chain, address)}
                            >
                                <i className="fa fa-refresh" aria-hidden="true"></i>
                            </button>
                        </li>
                        {/* <li>
                            <button
                                className="navigation"
                            >
                                <i className="fa fa-sort-alpha-asc" aria-hidden="true"></i>
                            </button>
                        </li> */}
                    </ul>
                </div>
            </div>

            <LoadingIndicator
                show={isBridging}
                type={bridgingText === "Packing.." ? "packing" : "bridging"}
                mode={"dark"}
                text={bridgingText}
            ></LoadingIndicator>

            <LoadingIndicator
                show={isLoading}
                type={"pulse"}
                mode={"dark"}
                text={"Loading.."}
                fullScreen
            ></LoadingIndicator>
        </div>
    )
}


export default Inventory;