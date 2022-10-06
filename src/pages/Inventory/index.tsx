import React, { useCallback, useEffect, useState, useContext } from 'react';
import { AddressContext } from '../../App';
import instance from '../Axios';
import './styles.scss'
import _ from 'lodash';
import { getMonsterIcon, cloneObj } from '../../common/utils';
import LoadingIndicator from '../../components/Spinner';
import { toast } from 'react-toastify';

const Inventory = () => {
    const { address, chain, } = useContext(AddressContext);
    // store previous selected mob
    const [selected, setSelected] = useState<any>(null);
    // set loading state
    const [isLoading, setIsLoading] = useState(false);
    // store all monster
    const [mob, setMob] = useState<any[]>([]);
    // store current monster pagination set data
    const [subMob, setSubMob] = useState<any[]>([]);
    // store selected monster (onclick)
    const [selectedMob, setSelectedMob] = useState<any>();
    // equipped mob
    const [equipped, setEquipped] = useState<any []>([]);
    // for pagination purpose
    const [skip, setSkip] = useState(0);
    const skipStep = 5;
    // limit monster display per pagination
    const take = 15;
    const maxEquipped = 4;

    const pagination = useCallback((m:any) => {
        const newSkip = 0;
        setSkip(newSkip);
        setSubMob(_.slice(m, newSkip, newSkip + take));
    }, [skip, subMob])

    const navigateUp = useCallback(() => {
        const newSkip = skip - skipStep >= 0 ? skip - skipStep : skip;
        setSkip(newSkip)
        setSubMob(_.slice(mob, newSkip, newSkip + take));
    }, [subMob])

    const navigateDown = useCallback(() => {
        // if item less than 15, do not let it scroll down
        if (_.size(mob) > take) {
            const newSkip = skip + skipStep < mob.length ? skip + skipStep : skip;
            setSkip(newSkip)
            setSubMob(_.slice(mob, newSkip, newSkip + take));
        }
    }, [subMob])

    useEffect(() => {
        const getInventory = async(chain: string, address: string) => {
            if (address && chain) {
                try {
                    setIsLoading(true);
                    let res = await instance.post(`/inventory`, {
                        address: address,
                        chainId: chain
                    });
                    setEquipped(_.filter(res.data, { equipped: 1 }));
                    const unequippedMob = _.filter(res.data, { equipped: 0 });
                    setMob(unequippedMob);
                    pagination(unequippedMob);
                    setIsLoading(false);
                } catch(e) {
                    console.log(e);
                    setIsLoading(false);
                }
            }
        }

        getInventory(chain, address);
    }, [chain, address])

    const EquippedMonster = () => {
        let component: JSX.Element[] = [];
        for (let index = 0; index < maxEquipped; index++) {
            const m = equipped[index];

            if (m) {
                component.push(
                    <div key={`mob-${index}`} className="mob-slot" onClick={(e) => selectMob(e, m)}>
                        <div className="slotLabel">{index+1}</div>
                        <img src={getMonsterIcon(m.img_file, m.element_id, m.is_shiny)} />
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
    }

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

    /**
     * Use mob in battle
     * @date 2022-10-06
     */
    const equipMob = async () => {
        try {
            setIsLoading(true);
            let res = await instance.post(`/equipMob`, {
                address: address,
                chainId: chain,
                monsterId: selectedMob.id
            });

            if (res.data) {
                // set unequipped in state
                console.log(mob);
                const currMob = cloneObj(mob);
                _.map(currMob, (m, mIndex) => {
                    console.log(`m.id: ${m.id} | selectedMob.id: ${selectedMob.id}`);
                    if (m.id === selectedMob.id) {
                        console.log(`set equip to 1`);
                        currMob[mIndex].equipped = 1;
                    }
                });
                setMob(currMob);
                // update all update
                // unselect target mob
                selected.classList.toggle('selected');
                setSelected(null);
                setSelectedMob(null);

                // refresh subMob list & equipped list
                pagination(currMob);
                toast.success(<div>Added <b>{selectedMob.name}</b> from party</div>);
            } else {
                toast.error(<div>Failed to equip <b>{selectedMob.name}</b></div>);
            }

            setIsLoading(false);
        } catch(e) {
            console.log(e);
            setIsLoading(false);
        }
    }

    /**
     * Remove mob from battle
     * @date 2022-10-06
     */
     const unEquipMob = async () => {
        try {
            console.log(`unequipping`);
            setIsLoading(true);
            let res = await instance.post(`/unequipMob`, {
                address: address,
                chainId: chain,
                monsterId: selectedMob.id
            });

            if (res.data) {
                // set unequipped in state
                const currMob = cloneObj(mob);
                _.map(currMob, (m, mIndex) => {
                    if (m.id == selectedMob.id) {
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
                pagination(currMob);
                toast.success(<div>Removed <b>{selectedMob.name}</b> from party</div>);
            } else {
                toast.error(<div>Failed to unequip <b>{selectedMob.name}</b></div>);
            }

            setIsLoading(false);
        } catch(e) {
            console.log(e);
            setIsLoading(false);
        }
    }

    /**
     * Bridging
     * @date 2022-10-06
     */
    const sendMob = () => {

    }

    const selectMob = (event: any, m: any) => {
        if (selected) {
            selected.classList.toggle('selected');
        }
        setSelectedMob(m);
        // 👇️ toggle class on click
        event.currentTarget.classList.toggle('selected');
        setSelected(event.currentTarget);
    };

    const MonsterListing = () => {
        let component: JSX.Element[] = [];
        for (let index = 0; index < take; index++) {
            const m = subMob[index];
            if (m) {
                const isEquipped = m.equipped === 1 ? 'slot equipped' : 'slot';
                component.push(
                    <div key={`mob-${index}`} className={isEquipped} onClick={(e) => selectMob(e, m)}>
                        <img src={getMonsterIcon(m.img_file, m.element_id, m.is_shiny)} />
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
    }

    return (
        <div className="inventory-page container">
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
                        <div className="big-slot">
                            RESTORE 60HP
                        </div>
                    </div>
                    <ActionButton></ActionButton>
                </div>
                <ul className="tabs">
                    <li>
                        <a
                            href="#"
                            className="navigation"
                            onClick={navigateUp}
                        >
                            <i className="fa fa-arrow-up" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            className="navigation"
                            onClick={navigateDown}
                        >
                            <i className="fa fa-arrow-down" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            className="navigation"
                        >
                            <i className="fa fa-sort-alpha-asc" aria-hidden="true"></i>
                        </a>
                    </li>
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