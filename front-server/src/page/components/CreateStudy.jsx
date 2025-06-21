import { useState, useEffect } from 'react';
import thumbnailList from '@json/Thumbnail';

const CreateStudy = ({ onClose }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [isMounted, setIsMounted] = useState(true);
	const [showThumbnailSelection, setShowThumbnailSelection] = useState(false);
	const [selectedThumbnail, setSelectedThumbnail] = useState(null);
	const handleThumbnailClose = () => {
		setShowThumbnailSelection(false);
	};
	const [category, setCategory] = useState('default');
	const [thumbnails, setThumbnails] = useState(thumbnailList['default']);

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(() => {
			setIsMounted(false); // DOM 제거
			onClose(); // 부모에게 알림
		}, 400);
	};

	useEffect(() => {
		const timer = setTimeout(() => setIsVisible(true), 10);
		return () => clearTimeout(timer);
	}, []);
	useEffect(() => {
		setThumbnails(thumbnailList[category] || []);
	}, [category]);

	if (!isMounted) return null; // 실제 DOM 제거

	return (
		<>
			<div className="overlay" onClick={handleClose}></div>
			<div className={`create-study ${isVisible ? 'slide-up' : ''}`}>
				<div className="create-study__header">
					<h2 className="create-study__title">스터디 개설하기</h2>
					<button className="create-study__close" onClick={handleClose} aria-label="닫기"></button>
				</div>
				
				<form className="create-study__form">
					<div className="create-study__content">
						<div className="field">
							<input type="text" className="text" placeholder="스터디 제목을 입력하세요"/>
						</div>

						<div className="half-field">
							<div className="field">
								<select className="select" name="department1">
									<option value="">학력</option>
									<option value="고졸">고졸</option>
									<option value="대학교">대학교</option>
									<option value="대학원">대학원</option>
								</select>
							</div>
							<div className="field">
								<select className="select" name="department2">
									<option value="">학과/학부 선택</option>
									<option value="컴퓨터공학과">컴퓨터공학과</option>
									<option value="소프트웨어학과">소프트웨어학과</option>
									<option value="정보통신공학과">정보통신공학과</option>
								</select>
							</div>
						</div>

						<div className="half-field">
							<div className="field">
								<select className="select" name="education1">
									<option value="">시/도</option>
									<option value="서울">서울</option>
									<option value="대구">대구</option>
									<option value="부산">부산</option>
								</select>
							</div>
							<div className="field">
								<select className="select" name="education2">
									<option value="">구/군</option>
									<option value="강남구">강남구</option>
									<option value="서초구">서초구</option>
									<option value="종로구">종로구</option>
								</select>
							</div>
						</div>

						<div className="half-field">
							<div className="field">
								<select className="select" defaultValue="">
									<option value="" disabled>정원</option>
									<option value="2">2</option>
									<option value="3">3</option>
									<option value="4">4</option>
									<option value="5">5</option>
									<option value="6">6</option>
									<option value="7">7</option>
									<option value="8">8</option>
									<option value="9">9</option>
									<option value="10">10</option>
								</select>
							</div>
							<div className="field">
								<select className="select" defaultValue="">
									<option value="" disabled>선호시간</option>
									<option value="오전">오전</option>
									<option value="오후">오후</option>
									<option value="저녁">저녁</option>
								</select>
							</div>
						</div>

						<div className="field__textarea">
							<textarea className="textarea" placeholder="스터디에 대해서 자세히 소개해주세요" resize="no"></textarea>
						</div>

						<div className="field__imgselect">
							<button type="button" className={`field__imgselect__button ${selectedThumbnail ? '--active' : ''}`} onClick={() => setShowThumbnailSelection(true)} >
								<span className="hide">방의 썸네일이 될 이미지를 골라보세요</span>
							</button>
							{selectedThumbnail && (
								<img src={selectedThumbnail} alt="선택된 썸네일" className="selected-thumbnail-preview" />
							)}
						</div>
					</div>
					<div className="create-study__buttons">
						<button type="submit" className="create-study__submit">개설하기</button>
					</div>
				</form>
			</div>
			{showThumbnailSelection && isMounted && (
				<>
					<div className="overlay2" onClick={handleThumbnailClose}></div>
					<div className={`thumbnail-selection ${isVisible ? 'fade-in' : 'fade-out'}`} >
						<div className="thumbnail-selection__header">
							<h2 className="thumbnail-selection__title">스터디 개설하기</h2>
							<button className="thumbnail-selection__close" onClick={handleThumbnailClose} aria-label="닫기"></button>
						</div>
						<div className="thumbnail-selection__content">
							<div className="field">
								<select className="select" name="thumbnail-selection" value={category} onChange={(e) => setCategory(e.target.value)}>
									<option value="default">기본</option>
									<option value="eng">공학</option>
									<option value="med">의학</option>
									<option value="std">교육/학문</option>
									<option value="ape">예체능</option>
									<option value="ilr">일러스트</option>
								</select>
							</div>

							<ul className="thumbnail-selection__list">
								{thumbnails.map((src, i) => (
									<li key={i}>
										<button type="button" className="thumbnail-select" onClick={() => {setSelectedThumbnail(src); setShowThumbnailSelection(false);}} >
											<img src={src} alt={`썸네일 ${i + 1}`} />
										</button>
									</li>
								))}
							</ul>
						</div>
						<div className="thumbnail-selection__buttons">
							<button type="button" className="thumbnail-selection__submit" >뒤로가기</button>
						</div>
					</div>
				</>
			)}
		</>
	);
};

export default CreateStudy; 