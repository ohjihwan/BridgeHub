import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Detail from './detail';
import CreateStudy from './create';
import Header from './common/Header';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const Home = () => {
	console.log("✅ home.jsx loaded");

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

	function HotRoomSwiper() {
		return (
			<div className="hot-room-box">
				<h2 className="title">지금 가장 핫해요!</h2>
				<Swiper spaceBetween={12} slidesPerView={1} centeredSlides={true} className="hot-room-swiper">
					<SwiperSlide>
						<button type="button" className="room-in-button" aria-haspopup="dialog">
							<figure className="img-box">
								<img src="./assets/imgs/img/studyroom__button" alt="스터디 룸 썸네일" />
							</figure>
							<div className="txts">
								<strong className="main-txt">짜장면 코딩 수업 팀 과제</strong>
								<p className="sub-txt">Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci cumque reiciendis quod, voluptatibus ipsum est molestias exercitationem ratione temporibus laudantium maxime, optio perspiciatis nesciunt excepturi a nostrum officiis dolore porro.</p>
								<ul className="room-info">
									<li>서울</li>
									<li>오후</li>
									<li>8명/3명</li>
								</ul>
							</div>
						</button>
					</SwiperSlide>
					<SwiperSlide>
						<button type="button" className="room-in-button" aria-haspopup="dialog">
							<figure className="img-box">
								<img src="./assets/imgs/img/thumbnail-room1.jpg" alt="스터디 룸 썸네일" />
							</figure>
							<div className="txts">
								<strong className="main-txt">짜장면 코딩 수업 팀 과제</strong>
								<p className="sub-txt">Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci cumque reiciendis quod, voluptatibus ipsum est molestias exercitationem ratione temporibus laudantium maxime, optio perspiciatis nesciunt excepturi a nostrum officiis dolore porro.</p>
								<ul className="room-info">
									<li>서울</li>
									<li>오전</li>
									<li>8명/5명</li>
								</ul>
							</div>
						</button>
					</SwiperSlide>
					<SwiperSlide>
						<button type="button" className="room-in-button" aria-haspopup="dialog">
							<figure className="img-box">
								<img src="./assets/imgs/img/studyroom__button" alt="스터디 룸 썸네일" />
							</figure>
							<div className="txts">
								<strong className="main-txt">짜장면 코딩 수업 팀 과제</strong>
								<p className="sub-txt">Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci cumque reiciendis quod, voluptatibus ipsum est molestias exercitationem ratione temporibus laudantium maxime, optio perspiciatis nesciunt excepturi a nostrum officiis dolore porro.</p>
								<ul className="room-info">
									<li>서울</li>
									<li>야간</li>
									<li>8명/3명</li>
								</ul>
							</div>
						</button>
					</SwiperSlide>
				</Swiper>
			</div>
		);
	}

	return (
		<div className="main-container">
			<Header />
			
			<div className="create-studyroom">
				<button className="create-studyroom__button" onClick={handleCreateStudyClick}>
					스터디 개설하기
					<span className="sub-txt">나만의 스터디를 만들고<br />함께 할 팀원을 모집해보세요!</span>
				</button>
			</div>

			<HotRoomSwiper />
		
			<ul className="studyroom">
                <li className="studyroom__item" onClick={handleItemClick}>
                    <div className="studyroom__info">
                        <h3 className="studyroom__title">제목</h3>
                        <div className="studyroom__details">
                            <span className="studyroom__detail">지역</span>
                            <span className="studyroom__detail">시간</span>
                            <span className="studyroom__detail">정원</span>
                        </div>
                    </div>
                </li>
                <li className="studyroom__item" onClick={handleItemClick}>
                    <div className="studyroom__info">
                        <h3 className="studyroom__title">제목</h3>
                        <div className="studyroom__details">
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

export default Home; 