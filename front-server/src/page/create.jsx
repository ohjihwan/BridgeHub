import React, { useState } from 'react';

const CreateStudy = ({ onClose }) => {

	const [showThumbnailSelection, setShowThumbnailSelection] = useState(false);
	const [slideUp, setSlideUp] = useState(false);

	useEffect(() => {
		if (showThumbnailSelection) {
			// mount 후 클래스 부여 → transition 작동
			const timer = setTimeout(() => setSlideUp(true), 10);
			return () => clearTimeout(timer);
		} else {
			setSlideUp(false); // 숨길 땐 제거
		}
	}, [showThumbnailSelection]);
	
	return (
		<div className="create-study">
			<div className="create-study__header">
				<h2 className="create-study__title">스터디 개설하기</h2>
				<button className="create-study__close" onClick={onClose} aria-label="닫기"></button>
			</div>
			
			<form className="create-study__form" onSubmit={(e) => {e.preventDefault(); setShowThumbnailSelection(true);}} >
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
								<option value="지역무관">지역무관</option>
								<option value="서울">서울</option>
								<option value="대구">대구</option>
								<option value="부산">부산</option>
							</select>
						</div>
						<div className="field">
							<select className="select" name="education2">
								<option value="강남구">강남구</option>
								<option value="서초구">서초구</option>
								<option value="종로구">종로구</option>
							</select>
						</div>
					</div>

					<div className="half-field">
						<div className="field">
							<select className="select" name="education1">
								<option value="지역무관">지역무관</option>
								<option value="서울">서울</option>
								<option value="대구">대구</option>
								<option value="부산">부산</option>
							</select>
						</div>
						<div className="field">
							<select className="select" name="education2">
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
								<option value="1">1</option>
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
						<button type="button" className="field__imgselect__button" onClick={() => setShowThumbnailSelection(true)} >
							<span className="hide">방의 썸네일이 될 이미지를 골라보세요</span>
						</button>
					</div>
				</div>
				<div className="create-study__buttons">
					<button type="submit" className="create-study__submit">개설하기</button>
				</div>
			</form>
			{showThumbnailSelection && (
				<div className={`thumbnail-selection ${slideUp ? 'slide-up' : ''}`}>
					<div className="thumbnail-selection__content">
						<p>썸네일을 선택하세요</p>
						{/* 썸네일 리스트를 여기에 추가 */}
					</div>
					<div className="thumbnail-selection__buttons">
						<button type="button" className="thumbnail-selection__submit" onClick={() => setShowThumbnailSelection(false)} >뒤로가기</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default CreateStudy; 