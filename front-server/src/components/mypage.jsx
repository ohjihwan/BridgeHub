import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './common/Header';
import profileDefault from '@img/default-profile.png';

const MyPage = () => {
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const [profileData, setProfileData] = useState({
		profileImg: '',
		nickname: '',
		password: '',
		passwordConfirm: '',
		hp:'',
		education: '',
		major: '',
		location: '',
		subLocation: '',
		timeZone: '',
	});
	
	const [editData, setEditData] = useState({...profileData});

	const locationOptions = {
		'지역무관': [],
		'서울': ['강남구', '서초구', '송파구', '강동구', '마포구'],
		'부산': ['해운대구', '수영구', '부산진구', '동래구', '남구'],
		'대구': ['중구', '수성구', '달서구', '동구', '북구']
	};

	const handleEditProfile = () => {
		if (isEditing) {
			setProfileData({...editData});
		} else {
			setEditData({...profileData});
		}
		setIsEditing(!isEditing);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		if (name === 'location') {
			setEditData(prev => ({
				...prev,
				location: value,
				subLocation: ''
			}));
		} else {
			setEditData(prev => ({
				...prev,
				[name]: value
			}));
		}
	};

	return (
		<div className="mypage-container">
			{isEditing ? (
				<Header isEditing={true} />
			) : (
				<Header/>
			)}

			{isEditing ? (
				<div className="profile-img">
					<button type="button" className='profile-img__button' onClick={() => document.getElementById('profileImgInput').click()}>
						<span className='hide'>프로필 변경하기</span>
					</button>
					<input type="file" id="profileImgInput" accept="image/*" style={{ display: 'none' }}
						onChange={(e) => {
							const file = e.target.files[0];
							if (file) {
								const reader = new FileReader();
								reader.onloadend = () => {
									setEditData(prev => ({
										...prev,
										profileImg: reader.result
									}));
								};
								reader.readAsDataURL(file);
							}
						}}
					/>
					<img src={editData.profileImg || profileDefault} className='profile-img__img' alt="나의 프로필 이미지"/>
				</div>
			) : (
				<div className="profile-img">
					<img src={profileData.profileImg ? profileData.profileImg : profileDefault} className='profile-img__img' alt="나의 프로필 이미지"/>
				</div>
			)}
			

			<div className="info-row-area">
				{isEditing ? (
					<>
						<div className="info-row">
							<label htmlFor='nickname' className="label">닉네임</label>
							<div className="field">
								<input type="text" name="nickname" id="nickname" value={editData.nickname} className="text" placeholder="별명을 입력하세요" onChange={handleInputChange}/>
							</div>
						</div>
						<div className="info-row">
							<label htmlFor='password' className="label">비밀번호</label>
							<div className="field">
								<input type="password" name="password" id="password" value={editData.password} className="text" placeholder="비밀번호를 입력하세요" onChange={handleInputChange}/>
							</div>
							<div className="field">
								<input type="password" name="passwordConfirm" value={editData.passwordConfirm} className="text" placeholder="비밀번호를 다시 입력하세요" onChange={handleInputChange}/>
							</div>
						</div>
						<div className="info-row">
							<label htmlFor='hp' className="label">휴대폰번호</label>
							<div className="field">
								<input type="tel" name="hp" id="hp" value={editData.hp} className="text" placeholder="휴대폰번호를 입력하세요" onChange={handleInputChange}/>
							</div>
						</div>
						<div className="info-row info-row--major">
							<h4 htmlFor="nickname" className="label">전공</h4>
							<div className="half-field">
								<div className="field">
									<select className="select" name="education" value={editData.education} onChange={handleInputChange}>
										<option value="">학력</option>
										<option value="고졸">고졸</option>
										<option value="대학교">대학교</option>
										<option value="대학원">대학원</option>
									</select>
								</div>
								<div className="field">
									<select className="select" name="major" value={editData.major} onChange={handleInputChange}>
										<option value="">학과/학부 선택</option>
										<option value="컴퓨터공학과">컴퓨터공학과</option>
										<option value="소프트웨어학과">소프트웨어학과</option>
										<option value="정보통신공학과">정보통신공학과</option>
									</select>
								</div>
							</div>
						</div>
						<div className="info-row info-row--location">
							<h4 className="label">지역</h4>
							<div className="half-field">
								<div className="field">
									<select className="select" name="location" value={editData.location} onChange={handleInputChange}>
										<option value="지역무관">지역무관</option>
										<option value="서울">서울</option>
										<option value="대구">대구</option>
										<option value="부산">부산</option>
									</select>
								</div>
								{editData.location && editData.location !== '지역무관' && (
									<div className="field">
										<select className="select" name="subLocation" value={editData.subLocation} onChange={handleInputChange}>
											<option value="">세부 지역 선택</option>
											{locationOptions[editData.location]?.map(sub => (
												<option key={sub} value={sub}>{sub}</option>
											))}
										</select>
									</div>
								)}
							</div>
						</div>
						<div className="info-row">
							<span className="label">시간대</span>
							<div className="field">
								<select className="select" name="timeZone" value={editData.timeZone} onChange={handleInputChange}>
									<option value="">선호 시간대 선택</option>
									<option value="오전">오전 (06:00-12:00)</option>
									<option value="오후">오후 (12:00-18:00)</option>
									<option value="야간">저녁 (18:00-24:00)</option>
								</select>
							</div>
						</div>
					</>
				) : (
					<>
						<div className="info-row profile-data">
							<span className="label">닉네임</span>
							<span className="value">{profileData.nickname}</span>
						</div>
						<div className="info-row profile-data">
							<span className="label">휴대폰번호</span>
							<span className="value">{profileData.hp}</span>
						</div>
						<div className="info-row profile-data">
							<span className="label">전공</span>
							<span className="value">
								{profileData.education && profileData.major 
									? `${profileData.education} ${profileData.major}`
									: profileData.education || profileData.major}
							</span>
						</div>
						<div className="info-row profile-data">
							<span className="label">지역</span>
							<span className="value">
								{profileData.location === '지역무관' 
									? '지역무관' 
									: `${profileData.location} ${profileData.subLocation}`}
							</span>
						</div>
						<div className="info-row profile-data">
							<span className="label">시간대</span>
							<span className="value">{profileData.timeZone}</span>
						</div>
					</>
				)}
			</div>
			
			<div className="fixed">
				<button type="button" className="button button-primary">개설 목록</button>
				<button type="button" className="button button-secondary" onClick={handleEditProfile}>
					{isEditing ? '수정 완료' : '프로필 수정'}
				</button>
			</div>
		</div>
	);
};

export default MyPage;
