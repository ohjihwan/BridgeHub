import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Detail from './detail';
import CreateStudy from './create';
import Header from './common/Header';

const Main = () => {
	const navigate = useNavigate();
	const [showDetail, setShowDetail] = useState(false);
	const [showCreateStudy, setShowCreateStudy] = useState(false);

	const handleItemClick = () => {
		setShowDetail(true);
	};

	const handleDetailClose = () => {
		setShowDetail(false);
	};

	const handleCreateStudyClick = () => {
		setShowCreateStudy(true);
	};

	const handleCreateStudyClose = () => {
		setShowCreateStudy(false);
	};

	return (
		<div className="main-container">
			<Header />
			
			<div className='create-studyroom'>
				<button className="create-studyroom__button" onClick={handleCreateStudyClick}>
					스터디 개설하기
					<span class="sub-txt">나만의 스터디를 만들고<br />함께 할 팀원을 모집해보세요!</span>
				</button>
			</div>
			
			<div className="search-box">
				<button className="filter-btn">
					<span className="hide">필터링</span>
				</button>
				<button className="search-btn">
					<span className="hide">검색</span>
				</button>
			</div>
		
			<ul className="studyroom">
                <li className="studyroom__item" onClick={handleItemClick}>
                    <div className="studyroom__info">
                        <h3 className='studyroom__title'>제목</h3>
                        <div className='studyroom__details'>
                            <span className="studyroom__detail">지역</span>
                            <span className="studyroom__detail">시간</span>
                            <span className="studyroom__detail">정원</span>
                        </div>
                    </div>
                </li>
                <li className="studyroom__item" onClick={handleItemClick}>
                    <div className="studyroom__info">
                        <h3 className='studyroom__title'>제목</h3>
                        <div className='studyroom__details'>
                            <span className="studyroom__detail">지역</span>
                            <span className="studyroom__detail">시간</span>
                            <span className="studyroom__detail">정원</span>
                        </div>
                    </div>
                </li>
			</ul>
			
			{showDetail && <Detail onClose={handleDetailClose} />}
			{showCreateStudy && (
				<>
					<div className="overlay" onClick={handleCreateStudyClose}></div>
					<CreateStudy onClose={handleCreateStudyClose} />
				</>
			)}
		</div>
	);
};

export default Main; 