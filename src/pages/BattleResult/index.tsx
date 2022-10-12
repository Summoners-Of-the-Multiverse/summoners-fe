import { AxiosResponse } from 'axios';
// import moment from 'moment';
import React, { useCallback, useEffect, useState, useContext, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { AddressContext } from '../../App';
import { getElementTooltip, getMonsterIcon, getSkillIcon, toLocaleDecimal, truncateStr } from '../../common/utils';
import BackButton from '../../components/BackButton';
import ElementIcon from '../../components/ElementIcon';
import ContractCall from '../../components/EVM/ContractCall';
import { ChainConfig } from '../../components/EVM/ChainConfigs/types';
import MonsterCard from '../../components/MonsterCard';
import Spinner from '../../components/Spinner';
import instance from '../Axios';
import './styles.scss';
import { BattleResult, BattleResultResponse, BattleSkillsUsed, MVP, SkillsUsageTableProps } from './types';
import { ChainConfigs } from '../../components/EVM';
import _ from 'lodash';
import { BasePage } from '../../types';

const PREPARING_TEXT = "Preparing Nets";
const CAPTURING_TEXT = "Capturing";

const SuccessMintToast = (chainConfig: ChainConfig|undefined, tx:any) => (
    <div className='link-toast'>
		Captured
        <a target="_blank" rel="noopener noreferrer" href={`${chainConfig?.blockExplorerUrl}/tx/${tx.transactionHash}`}>⮕ Capture Details ⬅</a> 
    </div>
);

const BattleResultPage = ({ setAudio }: BasePage) => {
	const { address, chain, } = useContext(AddressContext);
	const { id, returnToPage } = useParams();
	const navigate = useNavigate();
	
	const [ isLoading, setIsLoading ] = useState(true);
	const [ isMinting, setIsMinting ] = useState(false);
	const [ isCaptured, setIsCaptured ] = useState(false);
	const [ mintText, setMintText ] = useState(PREPARING_TEXT);

	const [ result, setResult ] = useState<BattleResult | undefined>();
	const [ skillsUsed, setSkillsUsed ] = useState<BattleSkillsUsed[]>([]);
	// const [ duration, setDuration ] = useState(0);
	const [ mvp, setMvp ] = useState<MVP | undefined>();

	useEffect(() => {
		if(!address) {
			return;
		}

		const getBattleResult = async() => {
			if(!address || !id) {
				return;
			}
			
			try {
				let res = await instance.post<any, AxiosResponse<BattleResultResponse>>(`/battleResult`, { address, battleId: id });
				let { result, skillsUsed } = res.data;
				setResult(result);
				setSkillsUsed(skillsUsed);
				
				// in seconds
				// let duration = (moment(result.time_end).unix() - moment(result.time_start).unix());
				// setDuration(duration);

				//set mvp
				let monsterTotalDamage: {[monster_id: number]: number } = {};
				let mvp: MVP = {
					damage: 0,
					imgFile: "",
					monsterElement: 0,
					isShiny: false,
					name: "",
					attack: 0,
					defense: 0,
					hp: 0,
					crit_chance: 0,
					crit_multiplier: 0,
				};
				
				let mvpDamageDealt = 0;

				for(const skill of skillsUsed) {
					if(!monsterTotalDamage[skill.monster_id]) {
						monsterTotalDamage[skill.monster_id] = 0;
					}
					monsterTotalDamage[skill.monster_id] += skill.total_damage_dealt;

					if(monsterTotalDamage[skill.monster_id] > mvpDamageDealt){
						mvpDamageDealt = monsterTotalDamage[skill.monster_id];
						mvp.damage = mvpDamageDealt;
						mvp.imgFile = skill.monster_img;
						mvp.monsterElement = skill.monster_element_id;
						mvp.isShiny = skill.is_shiny;
						mvp.name = skill.monster_name;
						mvp.attack = skill.monster_attack;
						mvp.defense = skill.monster_defense;
						mvp.hp = skill.monster_hp;
						mvp.crit_chance = skill.monster_crit_chance;
						mvp.crit_multiplier = skill.monster_crit_multiplier;
					}
				}
				
				setMvp(mvp);
			}

			catch {
				toast.error('Another waterlogged diary');
			}
			
			setIsLoading(false);
		}

		getBattleResult();
	}, [address, id]);

	const capture = useCallback(async() => {
		let tokenId: number = 0;
		let tokenHash: number = 0;

		try {
			setIsMinting(true);
			const contract = new ContractCall(chain);
			const mintData: { [ key:string]: any} = await instance.post(`/premint/${chain}`);

			setMintText(CAPTURING_TEXT);
			const tx = await contract.mintNft(mintData);
	
			if (tx.status === 1) {
				const chainConfig: ChainConfig|undefined = _.find(ChainConfigs, { id: chain,  })
	
				tokenId = mintData.data.id;
				tokenHash = mintData.data.hash;
	
				const result: any = await instance.post(`/capture`, {
					address: address,
					battleId: id,
					tokenId: tokenId,
					tokenHash: tokenHash
				});
	
				if (result.data.success) {
					toast.success(SuccessMintToast(chainConfig, tx));
					setIsCaptured(true);
					setIsMinting(false);
					setMintText(PREPARING_TEXT);
					return true;
				}
			}
			setMintText(PREPARING_TEXT);
			setIsMinting(false);
			return false;
		}
		catch(e: any) {
			if(e.toString().includes('user rejected transaction')) {
				toast.error("You've gone soft!")
	
				//temporarily ignore
				/* if(tokenId !== 0 && tokenHash !== 0) {
					try {
						//cleanup
						await instance.post(`/unmint`, {
							address: address,
							battleId: id,
							tokenId: tokenId,
							tokenHash: tokenHash
						});
					}
	
					catch {
						// do nothing
					}
				} */
			}
			setMintText(PREPARING_TEXT);
			setIsMinting(false);
			return false;
		}
	}, [address, id, chain]);

	const encounterTooltip = useMemo(() => {
		if(!result) return "";

		let { attack, defense, hp, crit_chance, crit_multiplier, is_shiny, is_captured, element_id } = result;
		let tooltip = `Attack\t\t${attack}\n`;
		tooltip += `Defense\t\t${defense}\n`;
		tooltip += `HP\t\t\t${hp}\n`;
		tooltip += `Crit Chance\t${crit_chance}\n`;
		tooltip += `Crit Multiplier\t${crit_multiplier}x\n`;
		tooltip += `Shiny\t\t${is_shiny? 'Yes' : 'No'}\n`;
		tooltip += `Captured\t\t${is_captured? 'Yes' : 'No'}\n`;
		tooltip += getElementTooltip(element_id);
		return tooltip;
	}, [result]);

	const mvpTooltip = useMemo(() => {
		if(!mvp) return "";

		let { attack, defense, hp, crit_chance, crit_multiplier, isShiny, monsterElement } = mvp;
		let tooltip = `Attack\t\t${attack.toFixed(0)}\n`;
		tooltip += `Defense\t\t${defense.toFixed(0)}\n`;
		tooltip += `HP\t\t\t${hp.toFixed(0)}\n`;
		tooltip += `Crit Chance\t${crit_chance.toFixed(0)}\n`;
		tooltip += `Crit Multiplier\t${crit_multiplier.toFixed(0)}x\n`;
		tooltip += `Shiny\t\t${isShiny? 'Yes' : 'No'}\n`;
		tooltip += getElementTooltip(monsterElement);
		return tooltip;
	}, [mvp]);

    return (
		<div className='battle-result-page'>
			<Spinner
				text='Loading'
				show={isLoading}
				type="pulse"
				mode='light'
				fullScreen
			/>
			<Spinner
				text={mintText}
				show={isMinting}
				type="pulse"
				mode='dark'
				fullScreen
			/>
			{
				!isLoading &&
				result &&
				<div className='battle-result-container'>
					<BackButton
						onButtonClick={() => {
							if(returnToPage) {
								navigate("/" + returnToPage);

							}

							else {
								navigate("/home");
							}
						}}
					/>
					<h1 className={`${result.hp_left < 0? 'victory' : 'defeat'}`}>{result.hp_left < 0? "Victory" : "Defeat"}</h1>

					<div className="row p-0 m-0">
						<div className={`col-md-${mvp && mvp.damage > 0? '6' : '12'}`}>
							<h2>Encountered</h2>
							<div className="monster-card-container">
								<MonsterCard
									imageFile={result.img_file}
									elementId={result.element_id}
									attack={result.attack}
									defense={result.defense}
									hp={result.hp}
									crit={result.crit_chance}
									additionalInfo={encounterTooltip}
									isShiny={result.is_shiny}

									showMintButton={result.hp_left < 0}
									mintButtonText={result.is_captured || isCaptured? 'Captured' : 'Capture'}
									onMintButtonClick={capture}
									disableMintButton={result.is_captured || isCaptured}
								/>
							</div>
						</div>
					
						{
							mvp && mvp.damage > 0 &&
							<div className="col-md-6">
								<h2>MVP</h2>
								<MonsterCard
									imageFile={mvp.imgFile}
									elementId={mvp.monsterElement}
									attack={mvp.attack}
									defense={mvp.defense}
									hp={mvp.hp}
									crit={mvp.crit_chance}
									additionalInfo={mvpTooltip}
									isShiny={mvp.isShiny}
								>
									<span className='mvp-damage'>Damage: {toLocaleDecimal(mvp.damage, 0, 0)}</span>
								</MonsterCard>
							</div>
						}
					</div>

					{
						skillsUsed.length > 0 &&
						<>
							<h2>Skills Used</h2>
							<SkillsUsageTable
								skills={skillsUsed}
							/>
						</>
					}
				</div>
			}
			{
				!isLoading &&
				!result &&
				<>
				<span>Error</span>
				</>
			}
		</div>
	);
}

const SkillsUsageTable = ({ skills }: SkillsUsageTableProps ) => {
	if(skills.length === 0) return null;

	//sort by dps
	skills = skills.sort((a,b) => (a.total_damage_dealt / a.total_cooldown) > (b.total_damage_dealt / b.total_cooldown)? -1 : 1);
	
	return (
		<div className="skills-usage-container">
			<div className="result-table-container">
				<table className='table result-table'>
					<thead>
						<tr>
							<th>Guardian</th>
							<th>Skill</th>
							<th>Element</th>
							<th>Total Damage</th>
							<th>Crit Damage</th>
							<th>Hits</th>
							<th>Crits</th>
							<th>Misses</th>
							<th>DPS</th>
						</tr>
					</thead>
					<tbody>
						{
							skills.map((x, index) => (
								<tr key={`battle-skills-${index}`}>
									<td><img src={getMonsterIcon(x.monster_img, x.monster_element_id, x.is_shiny)} alt="monster_icon" /></td>
									<td><img src={getSkillIcon(x.skill_icon)} alt="skill_icon" /></td>
									<td><ElementIcon elementId={x.element_id} size={30}/></td>
									<td><div>{toLocaleDecimal(x.total_damage_dealt, 0, 0)}</div></td>
									<td><div>{toLocaleDecimal(x.crit_damage_dealt, 0, 0)}</div></td>
									<td><div>{toLocaleDecimal(x.hits, 0, 0)}</div></td>
									<td><div>{toLocaleDecimal(x.crits, 0, 0)}</div></td>
									<td><div>{toLocaleDecimal(x.misses, 0, 0)}</div></td>
									<td><div>{toLocaleDecimal(x.total_damage_dealt / (x.total_cooldown / 1000), 2, 2)}</div></td>
								</tr>
							))
						}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default BattleResultPage;