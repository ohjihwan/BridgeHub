import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@scss/components/main.scss';
import Detail from './detail';
import CreateStudy from './create';

const Main = () => {
	const navigate = useNavigate();
	const [showDetail, setShowDetail] = useState(false);
	const [showCreateStudy, setShowCreateStudy] = useState(false);
		
	const handleLogout = () => {
		// 로그아웃 처리
		navigate('/login');
	};

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
			<header className="header">
				<h1 className="logo">
					<span className="hide">TeamHub</span>
				</h1>
				<button className="logout-btn" onClick={handleLogout}>LOGOUT</button>
			</header>
			
			<button className="create-study-btn" onClick={handleCreateStudyClick}>
				스터디 개설하기
			</button>
			
			<div className="search-box">
				<button className="filter-btn">
					<span className="hide">필터링</span>
				</button>
				<button className="search-btn">
					<span className="hide">검색</span>
				</button>
			</div>
		
			<ul className="study">
                <li className="study__item" onClick={handleItemClick}>
                    <div className="study__info">
                        <h3 className='study__title'>제목</h3>
                        <div className='study__details'>
                            <span className="study__detail">지역</span>
                            <span className="study__detail">시간</span>
                            <span className="study__detail">정원</span>
                        </div>
                    </div>
                </li>
                <li className="study__item" onClick={handleItemClick}>
                    <div className="study__info">
                        <h3 className='study__title'>제목</h3>
                        <div className='study__details'>
                            <span className="study__detail">지역</span>
                            <span className="study__detail">시간</span>
                            <span className="study__detail">정원</span>
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