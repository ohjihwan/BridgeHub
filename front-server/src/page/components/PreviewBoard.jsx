import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function PreviewBoard() {
	const [posts, setPosts] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchPreviewPosts = async () => {
			const token = localStorage.getItem('token');
			if (!token) {
				console.warn('미리보기 요청 차단: 로그인 필요');
				setPosts([]);
				return;
			}
		
			try {
				const res = await axios.get('/api/board', {
					params: { size: 5 },
					headers: { Authorization: `Bearer ${token}` }
				});
				if (res.data.success && Array.isArray(res.data.data.boards)) {
					setPosts(res.data.data.boards);
				} else {
					setPosts([]);
				}
			} catch (err) {
				console.error('게시판 미리보기 조회 실패:', err);
				setPosts([]);
			}
		};

		fetchPreviewPosts();
	}, []);

	return (
		<div className="hot-room-box">
			<div className="more-box">
				<h2 className="more-box__title">BOARD</h2>
				<Link to="/board" className="more-box__link">게시판</Link>
			</div>
			<Swiper spaceBetween={12} slidesPerView={1} centeredSlides={true} className="hot-room-swiper">
				{posts.map((post) => (
					<SwiperSlide key={post.boardId}>
						<button type="button" className="room-in-button" onClick={() => navigate(`/board/${post.boardId}`)} aria-haspopup="dialog">
							{/* <figure className="img-box">
								<img src={`/uploads/thumbnail/${post.thumbnail || 'default.jpg'}`} alt={`${post.title} 썸네일`} />
							</figure> */}
							<div className="txts">
								<strong className="main-txt">{post.title}</strong>
								<p className="sub-txt">{post.content?.slice(0, 50) || '내용 미리보기 없음'}</p>
								<ul className="room-info">
									<li>❤ {post.likeCount}</li>
									<li>{post.commentCount}</li>
									<li>{new Date(post.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</li>
								</ul>
							</div>
						</button>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
}

export default PreviewBoard;
