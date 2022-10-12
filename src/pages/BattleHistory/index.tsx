import { AxiosResponse } from 'axios';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { AddressContext } from '../../App';
import BackButton from '../../components/BackButton';
// import Spinner from '../../components/Spinner';
import instance from '../Axios';
import { BattleResult } from './types';
import './styles.scss';
import { getMonsterIcon } from '../../common/utils';
import { BasePage } from '../../types';

const getDuration = (time_start: string, time_end: string) => {
    //in seconds
	let start = moment(time_start); // some random moment in time (in ms)
	let end = moment(time_end); // some random moment after start (in ms)
	let diff = end.diff(start);

	// execution
	return moment.utc(diff).format("mm:ss");
}

const RESULT_PER_PAGE = 10;

const BattleHistory = ({ setAudio }: BasePage) => {
	const { address, } = useContext(AddressContext);
	const navigate = useNavigate();

    const [ results, setResults ] = useState<BattleResult[]>([]); 
	// const [ isLoading, setIsLoading ] = useState(true);
	const [ page, setPage ] = useState(0);
	const [ maxPage, setMaxPage ] = useState(0);

	useEffect(() => {
		if(!address) {
			return;
		}

		const getBattleResult = async() => {
			if(!address) {
				return;
			}
			
			try {
				let res = await instance.post<any, AxiosResponse<BattleResult[]>>(`/battleResults`, { address });
				setResults(res.data);
				setMaxPage(Math.ceil((res.data.length) / RESULT_PER_PAGE) - 1);
			}

			catch {
				toast.error('Logs are messed up');
			}
			
			// setIsLoading(false);
		}

		getBattleResult();
	}, [address]);

	const paginated = useMemo(() => {
		if(results.length === 0) {
			return [];
		}
		
		let paginated: BattleResult[] = [];
		let initialIndex = page * RESULT_PER_PAGE;

		// for optimization purposes
		for(let i = 0; i < RESULT_PER_PAGE; i++) {
			let currentIndex = i + initialIndex;
			if(currentIndex >= results.length) {
				break;
			}
			paginated.push(results[currentIndex]);
		}

		return paginated;
	}, [page, results]);

	const onRightClick = useCallback(() => {
		let nextPage = page + 1;
		if(nextPage <= maxPage) {
			setPage(nextPage);
		}
	}, [page, maxPage]);

	const onLeftClick = useCallback(() => {
		let nextPage = page - 1;
		if(nextPage >= 0) {
			setPage(nextPage);
		}
	}, [page]);

    return (
        <div className="battle-history-page">
			{/* <Spinner
				show={isLoading}
				mode={"dark"}
				type={"pulse"}
				text="Loading"
				fullScreen
			/> */}
			<BackButton
				onButtonClick={() => { navigate('/home'); }}
			/>
			{
				paginated.length > 0 &&
				<div className="pagination">
					<button onClick={onLeftClick}><i className="fa fa-chevron-left"></i></button>
					<span>{page + 1} / {maxPage + 1}</span>
					<button onClick={onRightClick}><i className="fa fa-chevron-right"></i></button>
				</div>
			}
			<div className="battle-history-container">
			{
				paginated.length === 0 &&
				<>
					<div className="h1">It's Empty..</div>
					<div className="h3">Pls go hunt</div>
				</>
			}
			{
				paginated.map((x, index) => {
					let result = "defeat";

					if(x.is_captured) {
						result = "captured";
					}

					else if(x.hp_left <= 0) {
						result = "victory";
					}

					return (
						<button 
							className="history" 
							key={`battle-history-${index}`}
							onClick={() => { navigate(`/battleResult/${x.battle_id}/battleHistory`) }}
						>
							<img src={getMonsterIcon(x.img_file, x.element_id, x.is_shiny)} alt="monster_icon" />
							<div className="d-flex flex-column w-100">
								{/* <div className="row">
									<div className="col-6 text-start">
										<span>{moment(x.time_start).format('YYYY-MM-DD HH:mm:ss')}</span>
									</div>
									<div className="col-6 text-end">
										<i className="fa fa-clock"></i>
										<span>{getDuration(x.time_start, x.time_end)}</span>
									</div>
									<div className="col-12 h-100">
										<strong>Victory</strong>
									</div>
								</div> */}
								<div className="battle-stats">
									<div className="d-flex flex-row justify-content-between">
										<span>{moment(x.time_start).format('YYYY-MM-DD HH:mm:ss')}</span>
										<div className="d-flex flex-row">
											<span>{getDuration(x.time_start, x.time_end)}</span>
										</div>
									</div>
									<div className={`result-container ${result}`}>
										<span>{result}</span>
									</div>
								</div>
							</div>
						</button>
					)
				})
			}
			</div>
        </div>
    )
}

export default BattleHistory;