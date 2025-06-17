import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

function HotRoomSwiper({ onItemClick }) {
	return (
		<div className="hot-room-box">
			<h2 className="title">지금 가장 핫해요!</h2>
			<Swiper
				spaceBetween={12}
				slidesPerView={1}
				centeredSlides={true}
				className="hot-room-swiper"
			>
				{[1, 2, 3, 4].map((_, i) => (
					<SwiperSlide key={i}>
						<button type="button" className="room-in-button" aria-haspopup="dialog" onClick={onItemClick}>
							<figure className="img-box">
								<img
									src="./assets/imgs/img/studyroom__button"
									alt="스터디 룸 썸네일"
								/>
							</figure>
							<div className="txts">
								<strong className="main-txt">짜장면 코딩 수업 팀 과제</strong>
								<p className="sub-txt">
									Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores quasi commodi deleniti dolore perspiciatis nam aspernatur quas, provident temporibus, magnam, iusto odio tempore quam est laboriosam cum? At, odio deleniti!
								</p>
								<ul className="room-info">
									<li>서울</li>
									<li>오후</li>
									<li>8명/3명</li>
								</ul>
							</div>
						</button>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
}

export default HotRoomSwiper;