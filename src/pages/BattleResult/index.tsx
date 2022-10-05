import { AxiosResponse } from 'axios';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import { AddressContext } from '../../App';
import { getMonsterIcon, getSkillIcon, toLocaleDecimal } from '../../common/utils';
import ElementIcon from '../../components/ElementIcon';
import MonsterCard from '../../components/MonsterCard';
import LoadingIndicator from '../../components/Spinner';
import instance from '../Axios';
import './styles.scss';
import { BattleResult, BattleResultResponse, BattleSkillsUsed, SkillsUsageTableProps } from './types';

const BattleResultPage = () => {
	const { address, chain, } = useContext(AddressContext);
	const { id } = useParams();
	
	const [ isLoading, setIsLoading ] = useState(true);
	const [ result, setResult ] = useState<BattleResult | undefined>();
	const [ skillsUsed, setSkillsUsed ] = useState<BattleSkillsUsed[]>([]);
	const [ duration, setDuration ] = useState(0);

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
				let duration = (moment(result.time_end).unix() - moment(result.time_start).unix());
				console.log(duration);
				setDuration(duration);
			}

			catch {
				toast.error('Unable to get battle result');
			}
			
			setIsLoading(false);
		}

		getBattleResult();
	}, [address, id]);

    return (
		<div className='battle-result-page'>
			<LoadingIndicator
				text='Loading..'
				show={isLoading}
				type="pulse"
				mode='light'
			/>
			{
				!isLoading &&
				result &&
				<>
					<h1>{result.hp_left < 0? "Victory" : "Defeat"}</h1>
					<h2>Encounter</h2>
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
					<button>Mint button</button>
					<SkillsUsageTable
						skills={skillsUsed}
						duration={duration}
					/>
				</>
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

const SkillsUsageTable = ({ skills, duration }: SkillsUsageTableProps ) => {
	if(skills.length === 0) return null;

	//sort by dps
	skills = skills.sort((a,b) => (a.total_damage_dealt / a.total_cooldown) > (b.total_damage_dealt / b.total_cooldown)? -1 : 1);
	
	return (
		<div className="card">
			<div className="card-body">
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
									<td><ElementIcon elementId={x.element_id}/></td>
									<td>{toLocaleDecimal(x.total_damage_dealt, 0, 0)}</td>
									<td>{toLocaleDecimal(x.crit_damage_dealt, 0, 0)}</td>
									<td>{toLocaleDecimal(x.hits, 0, 0)}</td>
									<td>{toLocaleDecimal(x.crits, 0, 0)}</td>
									<td>{toLocaleDecimal(x.misses, 0, 0)}</td>
									<td>{toLocaleDecimal(x.total_damage_dealt / (x.total_cooldown / 1000), 2, 2)}</td>
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