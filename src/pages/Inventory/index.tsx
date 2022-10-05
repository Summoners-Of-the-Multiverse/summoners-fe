import React, { useCallback, useEffect, useState, useContext } from 'react';
import { AddressContext } from '../../App';
import instance from '../Axios';
import './styles.scss'
import _ from 'lodash';
import { getMonsterIcon } from '../../common/utils';
import LoadingIndicator from '../../components/Spinner';

const Inventory = () => {
    const { address, chain, } = useContext(AddressContext);
    // set loading state
    const [isLoading, setIsLoading] = useState(false);
    // store all monster
    const [mob, setMob] = useState<any[]>([]);
    // store current monster
    const [subMob, setSubMob] = useState<any[]>([]);
    // equipped mob
    const [equipped, setEquipped] = useState<any []>([]);
    // for pagination purpose
    const [skip, setSkip] = useState(0);
    // limit monster display per pagination
    const take = 15;
    const maxEquipped = 4;

    const pagination = useCallback((data: any) => {
        console.log(_.slice(data, skip, skip + take));
        setSubMob(_.slice(data, skip, skip + take));
    }, [skip])

    useEffect(() => {
        const getInventory = async(chain: string, address: string) => {
            if (address && chain) {
                try {
                    setIsLoading(true);
                    let res = await instance.post(`/inventory/${chain}`, {
                        address: address
                    });
                    setEquipped(_.filter(res.data, { equipped: 1 }));
                    setMob(_.filter(res.data, { equipped: 0 }));
                    setSkip(0);
                    pagination(res.data);
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
                    <div key={`mob-${index}`} className="mob-slot">
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

    const MonsterListing = () => {
        let component: JSX.Element[] = [];
        for (let index = 0; index < take; index++) {
            const m = mob[index];
            if (m) {
                const isEquipped = m.equipped === 1 ? 'slot equipped' : 'slot';
                component.push(
                    <div key={`mob-${index}`} className={isEquipped}>
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
                        <span className="equipped">In-Use</span>
                        <i className="label-icon fa fa-optin-monster" aria-hidden="true"></i>
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
                    <div className="actions">
                        <button>USE</button>
                        <button>DROP</button>
                    </div>
                </div>
                <ul className="tabs">
                    <li>
                        <a
                            href=""
                            className="navigation"
                        >
                            <i className="fa fa-arrow-up" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li>
                        <a
                            href=""
                            className="navigation"
                        >
                            <i className="fa fa-arrow-down" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li>
                        <a
                            href=""
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