import { AxiosResponse } from 'axios';
// import moment from 'moment';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import { AddressContext } from '../../App';
import { getMonsterIcon, getSkillIcon, toLocaleDecimal, truncateStr } from '../../common/utils';
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


const SuccessMintToast = (chainConfig: ChainConfig|undefined, tx:any) => (
    <div>
        <a target="_blank" rel="noopener noreferrer" href={`${chainConfig?.blockExplorerUrl}/tx/${tx.transactionHash}`}>{truncateStr(tx.transactionHash, 10)}</a> Mint success
    </div>
);

const BattleResultPage = () => {
	const { address, chain, } = useContext(AddressContext);
	const { id } = useParams();
	const navigate = useNavigate();
	
	const [ isLoading, setIsLoading ] = useState(true);
	const [ isMinting, setIsMinting ] = useState(false);
	const [ isCaptured, setIsCaptured ] = useState(false);
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
					}
				}
				
				setMvp(mvp);
			}

			catch {
				toast.error('Unable to get battle result');
			}
			
			setIsLoading(false);
		}

		getBattleResult();
	}, [address, id]);

	const capture = useCallback(async() => {
		try {
			setIsMinting(true);
			const contract = new ContractCall(chain);
			const mintData: { [ key:string]: any} = await instance.post(`/premint/${chain}`);
			const tx = await contract.mintNft(mintData);
	
			if (tx.status === 1) {
				const chainConfig: ChainConfig|undefined = _.find(ChainConfigs, { id: chain,  })
	
				const tokenId: number = mintData.data.id;
				const tokenHash: number = mintData.data.hash;
	
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
					return true;
				}
			}
			setIsMinting(false);
			return false;
		}
		catch(e) {
			console.log(e);
			setIsMinting(false);
			return false;
		}
	}, [address, id, chain]);

    return (
		<div className='battle-result-page'>
			<Spinner
				text='Loading'
				show={isLoading}
				type="pulse"
				mode='light'
			/>
			<Spinner
				text='Minting'
				show={isMinting}
				type="pulse"
				mode='dark'
			/>
			{
				!isLoading &&
				result &&
				<div className='battle-result-container'>
					<BackButton
						onButtonClick={() => navigate('/')}
					/>
					<h1>{result.hp_left < 0? "Victory" : "Defeat"}</h1>
					<h2>Encountered</h2>
					<div className="monster-card-container">
						<MonsterCard
							imageFile={result.img_file}
							elementId={result.element_id}
							attack={result.attack}
							defense={result.defense}
							hp={result.hp}
							crit={result.crit_chance}
							additionalInfo={"test"}
							isShiny={result.is_shiny}
						/>
					</div>
					{
						result.hp_left < 0 &&
						<button 
							className={`mint-button ${result.is_captured || isCaptured? 'disabled' : ''}`} 
							disabled={result.is_captured || isCaptured}
							onClick={capture}
						>
							{result.is_captured || isCaptured? 'Captured' : 'Capture'}
						</button>
					}
					
					{
						mvp && mvp.damage > 0 &&
						<>
							<h2>MVP</h2>
							<div className='mvp-container'>
								<span>{mvp.name}</span>
								<img src={getMonsterIcon(mvp.imgFile, mvp.monsterElement, mvp.isShiny)} alt="monster_icon" />
								<span>Damage: {toLocaleDecimal(mvp.damage, 0, 0)}</span>
							</div>
						</>
					}

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
		<div className="card mb-3 mt-3 skills-usage-container">
			<div className="card-body">
				<div className="result-table-container">
					<table className='table result-table'>
						<thead>
							<tr>
								<th>Guardian</th>
								<th>Skill</th>
								<th>Element</th>
								<th>Total Damage</th>
								<th>Total Crit Damage</th>
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
		</div>
	)
}

export default BattleResultPage;