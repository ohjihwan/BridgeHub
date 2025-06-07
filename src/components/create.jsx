import React from 'react';
import '@scss/components/create.scss';

const CreateStudy = ({ onClose }) => {
	return (
		<div className="create-study">
		<div className="create-study__header">
			<h2 className="create-study__title">스터디 개설하기</h2>
			<button className="create-study__close" onClick={onClose}>닫기</button>
		</div>
		
		<div className="create-study__content">
			<form className="create-study__form">
				<div className="create-study__field">
					<input type="text" className="create-study__input" placeholder="제목"/>
				</div>

				<div className="create-study__field">
					<input type="text" className="create-study__input" placeholder="주제/과목"/>
				</div>

				<div className="create-study__field">
					<select className="create-study__select" defaultValue="">
						<option value="" disabled>지역</option>
						<option value="서울">서울</option>
						<option value="경기">경기</option>
						<option value="인천">인천</option>
					</select>
				</div>

				<div className="create-study__location">
					<select className="create-study__select" defaultValue="">
						<option value="" disabled>서울</option>
						<option value="강남구">강남구</option>
						<option value="서초구">서초구</option>
						<option value="송파구">송파구</option>
					</select>

					<select className="create-study__select" defaultValue="">
						<option value="" disabled>서초구</option>
						<option value="서초동">서초동</option>
						<option value="반포동">반포동</option>
						<option value="방배동">방배동</option>
					</select>
				</div>

				<div className="create-study__field">
					<select className="create-study__select" defaultValue="">
						<option value="" disabled>정원</option>
						{[...Array(10)].map((_, i) => (
							<option key={i + 1} value={i + 1}>{i + 1}명</option>
						))}
					</select>
				</div>

				<div className="create-study__field">
					<textarea className="create-study__textarea" placeholder="상세 내용"rows="5"></textarea>
				</div>

				<button type="submit" className="create-study__submit">개설하기</button>
			</form>
		</div>
		</div>
	);
};

export default CreateStudy; 