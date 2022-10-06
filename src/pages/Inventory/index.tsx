import React, { useCallback, useEffect, useState, useContext, useMemo } from 'react';
import { AddressContext } from '../../App';
import instance from '../Axios';
import './styles.scss'
import _ from 'lodash';
import { getMonsterIcon, cloneObj, getSkillIcon } from '../../common/utils';
import LoadingIndicator from '../../components/Spinner';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import BackButton from '../../components/BackButton';
import ElementIcon from '../../components/ElementIcon';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

const Inventory = () => {
    const navigate = useNavigate();

    const { address, chain, } = useContext(AddressContext);
    // store previous selected mob (for untoggle mob highlight purpose)
    const [selected, setSelected] = useState<any>(null);
    // set loading state
    const [isLoading, setIsLoading] = useState(false);
    // store all monster
    const [mob, setMob] = useState<any[]>([]);

    // store selected monster (onclick)
    const [selectedMob, setSelectedMob] = useState<any>();

    // for pagination purpose
    const [skip, setSkip] = useState(0);

    // each page up/page down will reload 1 row (5mobs)
    const skipStep = 5;
    // limit monster display per pagination
    const take = 15;
    const maxEquipped = 4;

    // load popover
    useEffect(() => {
        const script = document.createElement('script');

        script.src = "https://use.typekit.net/foobar.js";
        script.async = true;

        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        }
    }, []);

    useEffect(() => {
        const getInventory = async(chain: string, address: string) => {
            if (address && chain) {
                try {
                    setIsLoading(true);
                    let res = await instance.post(`/inventory`, {
                        address: address,
                        chainId: chain
                    });

                    setMob(res.data);
                    setIsLoading(false);
                } catch(e) {
                    console.log(e);
                    setIsLoading(false);
                }
            }
        }

        getInventory(chain, address);
    }, [chain, address]);

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

    const ActionButton = () => {
        let component: JSX.Element;
        if (selectedMob && selectedMob.equipped === 1) {
            component = (
                <div className="actions">
                    <button onClick={unEquipMob}>DROP</button>
                </div>
            );
        } else {
            component = (
                <div className="actions">
                    <button onClick={equipMob}>USE</button>
                    <button onClick={sendMob}>SEND</button>
                </div>
            );
        }
        return component;
    }

    const InfoSlot = useCallback(() => {
        let mobSkils: JSX.Element[] = [];
        let mobName = '';
        let mobStats: JSX.Element = (<div className="bottom-slot"></div>);
        let elementId = null;

        if (selectedMob) {
            mobName = selectedMob.name;
            elementId = selectedMob.element_id;
            _.map(selectedMob.skills, (sm, smIndex) => {
                const popover = (
                    <Popover id="popover-basic">
                        <Popover.Header as="h3">{sm.name}</Popover.Header>
                        <Popover.Body>
                            Hits: {sm.hits}<br/>
                            Cooldown: {sm.cooldown}<br />
                            Accuracy: {sm.accuracy}<br />
                            Damage: {sm.damage}%<br/>
                        </Popover.Body>
                    </Popover>
                );

                mobSkils.push(
                    <OverlayTrigger rootClose={true} trigger="click" placement="right-end" overlay={popover} delay={{ show: 100, hide: 100 }}>
                        <button className="mob-skill-icon">
                            <img className={sm.element} alt={sm.name} src={getSkillIcon(sm.icon_file)} />
                        </button>
                    </OverlayTrigger>
                )
            })

            mobStats = (
                <div className="mob-stats-slot">
                    <div>
                        <div className="mob-stats">ATT {selectedMob.attack}</div>
                        <div className="mob-stats">LIFE {selectedMob.hp}</div>
                    </div>
                    <div>
                        <div className="mob-stats">DEF {selectedMob.defense}</div>
                        <div className="mob-stats">CRIT {selectedMob.crit_chance}</div>
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

    /**
     * Use mob in battle
     * @date 2022-10-06
     */
    const equipMob = async () => {
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
                toast.success(<div>Added <b>{selectedMob.name}</b> from party</div>);
            } else {
                toast.error(<div>Failed to equip <b>{selectedMob.name}</b></div>);
            }

            // setIsLoading(false);
        } catch(e) {
            console.log(e);
            // setIsLoading(false);
        }
    }

    /**
     * Remove mob from battle
     * @date 2022-10-06
     */
     const unEquipMob = async () => {
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
            console.log(e);
            // setIsLoading(false);
        }
    }

    /**
     * Bridging
     * @date 2022-10-06
     */
    const sendMob = () => {

    }

    const MonsterListing = useCallback(() => {
        let component: JSX.Element[] = [];
        for (let index = 0; index < take; index++) {
            const m = unequippedMonsterPaginated[index];
            if (m) {
                const isEquipped = m.equipped === 1 ? 'slot equipped' : 'slot';
                component.push(
                    <div key={`mob-${index}`} className={isEquipped} onClick={(e) => selectMob(e, m)}>
                        <img src={getMonsterIcon(m.img_file, m.element_id, m.is_shiny)} alt="monster_icon"/>
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
    }, [unequippedMonsterPaginated, selectMob]);

    return (

        <div className="inventory-page container">
            <BackButton
                onButtonClick={() => navigate('/')}
            />

            <div className="inventory">
                <div className="title groovy">
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
                    {/* <li>
                        <button
                            className="navigation"
                        >
                            <i className="fa fa-sort-alpha-asc" aria-hidden="true"></i>
                        </button>
                    </li> */}
                </ul>
            </div>

            <LoadingIndicator
                show={isLoading}
                type={"pulse"}
                mode={"white"}
                text={"Loading..."}
            ></LoadingIndicator>
        </div>
    )
}


export default Inventory;