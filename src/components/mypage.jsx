import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './common/Header';

const MyPage = () => {
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const [profileData, setProfileData] = useState({
		nickname: '',
		education: '',
		major: '',
		location: '',
		subLocation: '',
		timeZone: '',
		interests: '',
		message: ''
	});
	
	const [editData, setEditData] = useState({...profileData});

	const locationOptions = {
		'지역무관': [],
		'서울': ['강남구', '서초구', '송파구', '강동구', '마포구'],
		'부산': ['해운대구', '수영구', '부산진구', '동래구', '남구'],
		'대구': ['중구', '수성구', '달서구', '동구', '북구']
	};

	const handlePersonalPost = () => {
		navigate('/personal-posts');
	};

	const handleTeamPost = () => {
		navigate('/team-posts');
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
			<Header />
			<div className="edit-profile">
				<button 
					type="button" 
					className="button button-primary"
					onClick={handleEditProfile}
				>
					{isEditing ? '수정 완료' : '프로필 수정'}
				</button>
			</div>
			{isEditing ? (
				<>
					<div className="info-row">
						<span className="label">닉네임</span>
						<input 
							className="info-row__input" 
							type="text" 
							name="nickname"
							value={editData.nickname}
							onChange={handleInputChange}
						/>
					</div>
					<div className="info-row info-row--major">
						<span className="label">전공</span>
						<div className="info-row__select-group">
							<select 
								className="info-row__input info-row__select" 
								name="education"
								value={editData.education}
								onChange={handleInputChange}
							>
								<option value="">선택하세요</option>
								<option value="고졸">고졸</option>
								<option value="대학교">대학교</option>
								<option value="대학원">대학원</option>
							</select>
							<input 
								className="info-row__input" 
								type="text" 
								name="major"
								placeholder="전공을 입력하세요"
								value={editData.major}
								onChange={handleInputChange}
							/>
						</div>
					</div>
					<div className="info-row info-row--location">
						<span className="label">지역</span>
						<div className="info-row__select-group">
							<select 
								className="info-row__input info-row__select" 
								name="location"
								value={editData.location}
								onChange={handleInputChange}
							>
								<option value="">선택하세요</option>
								<option value="지역무관">지역무관</option>
								<option value="서울">서울</option>
								<option value="부산">부산</option>
								<option value="대구">대구</option>
							</select>
							{editData.location && editData.location !== '지역무관' && (
								<select 
									className="info-row__input info-row__select" 
									name="subLocation"
									value={editData.subLocation}
									onChange={handleInputChange}
								>
									<option value="">선택하세요</option>
									{locationOptions[editData.location]?.map(sub => (
										<option key={sub} value={sub}>{sub}</option>
									))}
								</select>
							)}
						</div>
					</div>
					<div className="info-row">
						<span className="label">시간대</span>
						<select 
							className="info-row__input info-row__select" 
							name="timeZone"
							value={editData.timeZone}
							onChange={handleInputChange}
						>
							<option value="">선택하세요</option>
							<option value="오전">오전</option>
							<option value="오후">오후</option>
							<option value="야간">야간</option>
						</select>
					</div>
					<div className="info-row">
						<span className="label">관심사</span>
						<input 
							className="info-row__input" 
							type="text" 
							name="interests"
							value={editData.interests}
							onChange={handleInputChange}
						/>
					</div>
					<div className="message-box">
						<textarea 
							className="info-row__input info-row__input--textarea" 
							name="message"
							value={editData.message}
							onChange={handleInputChange}
						/>
					</div>
				</>
			) : (
				<>
					<div className="info-row">
						<span className="label">닉네임</span>
						<span className="value">{profileData.nickname}</span>
					</div>
					<div className="info-row">
						<span className="label">전공</span>
						<span className="value">
							{profileData.education && profileData.major 
								? `${profileData.education} ${profileData.major}`
								: profileData.education || profileData.major}
						</span>
					</div>
					<div className="info-row">
						<span className="label">지역</span>
						<span className="value">
							{profileData.location === '지역무관' 
								? '지역무관' 
								: `${profileData.location} ${profileData.subLocation}`}
						</span>
					</div>
					<div className="info-row">
						<span className="label">시간대</span>
						<span className="value">{profileData.timeZone}</span>
					</div>
					<div className="info-row">
						<span className="label">관심사</span>
						<span className="value">{profileData.interests}</span>
					</div>
					<div className="message-box">
						<p>{profileData.message}</p>
					</div>
				</>
			)}
			<div className="fixed">
				<button type="button" className="button button-primary">개설 목록</button>
				<button type="button" className="button button-primary">신청 목록</button>
			</div>
		</div>
	);
};

export default MyPage;
