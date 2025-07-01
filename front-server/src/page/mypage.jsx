import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './common/Header';
import profileDefault from '/uploads/profile/default-profile1.png';
import { commonClient, getUsernameFromToken, formatPhone, cleanPhone } from '@js/common-ui';
import subjects from '@json/subject';
import regionData from '@json/region';

const MyPage = () => {
	const navigate = useNavigate();
	const [isEditing, setIsEditing] = useState(false);
	const [findPhone, setFindPhone] = useState('');
	const [profileData, setProfileData] = useState({
		profileImg: '',
		nickname: '',
		hp: '',
		education: '',
		department: '',
		region: '',
		district: '',
		timeZone: '',
		description: ''
	});
	const [editData, setEditData] = useState({
		profileImg: '',
		nickname: '',
		hp: '',
		education: '',
		department: '',
		region: '',
		district: '',
		timeZone: '',
		description: '',
		password: '',
		passwordConfirm: ''
	});
	
	const handleEditProfile = async () => {
		if (isEditing) {
			if (editData.password && editData.password !== editData.passwordConfirm) {
				await window.customAlert('비밀번호가 일치하지 않습니다.');
				return;
			}

			const username = getUsernameFromToken();
			try {
				const requestBody = {
					nickname: editData.nickname,
					phone: editData.hp,
					education: editData.education,
					department: editData.department,
					region: editData.region,
					district: editData.district,
					time: editData.timeZone,
					description: editData.description
				};

				console.log('=== 전송할 데이터 ===');
				console.log('description 값:', editData.description);
				console.log('전체 requestBody:', requestBody);
				console.log('description가 포함되었나?', 'description' in requestBody);
				console.log('description 값이 있나?', !!requestBody.description);

				// 비밀번호 입력이 있으면 함께 전송
				if (editData.password) {
					requestBody.password = editData.password;
				}

				// 프로필 이미지가 변경되었으면 함께 전송
				if (editData.profileImg && editData.profileImg !== profileData.profileImg) {
					requestBody.profileImage = editData.profileImg;
				}

				const res = await commonClient.put(`/api/members/${username}`, requestBody, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
						'Content-Type': 'application/json'
					}
				});
				

				if (res.data.status === 'success') {
					await window.customAlert('회원 정보가 수정되었습니다.');
					setProfileData({
						...profileData,
						...editData,
						password: '',
						passwordConfirm: ''
					});
					setEditData(prev => ({
						...prev,
						password: '',
						passwordConfirm: ''
					}));
					setIsEditing(false);
				} else {
					await window.customAlert('회원 정보 수정에 실패했습니다.');
				}
			} catch (err) {
				await window.customAlert('회원 정보 수정 중 오류가 발생했습니다.');
			}
		} else {
			setEditData({
				nickname: profileData.nickname || '',
				hp: profileData.hp || '',
				education: profileData.education || '',
				department: profileData.department || '',
				region: profileData.region || '',
				district: profileData.district || '',
				timeZone: profileData.timeZone || '',
				description: profileData.description || '',
				profileImg: profileData.profileImg || ''
			});
			setIsEditing(true);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setEditData((prev) => ({
			...prev,
			[name]: name === "hp" ? cleanPhone(value) : value,  // 하이픈 제거 상태로 저장
		}));
	};

	useEffect(() => {
		console.log('로컬스토리지 토큰:', localStorage.getItem('token'));
		const username = getUsernameFromToken();
		console.log('토큰에서 추출한 username:', username);
		if (!username) {
			window.customAlert('로그인이 필요합니다.');
			navigate('/login');
			return;
		}

		const fetchProfile = async () => {
			try {
				const res = await commonClient.get(`/api/members/${username}`, {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				});
				
				console.log(res.data);  // 바로 여기!

				if (res.data.status === 'success') {
					const newProfileData = {
						profileImg: res.data.data.profileImage || '',
						nickname: res.data.data.nickname || '',
						hp: res.data.data.phone || '',
						education: res.data.data.education || '',
						department: res.data.data.department || '',
						region: res.data.data.region || '',
						district: res.data.data.district || '',
						timeZone: res.data.data.time || '',
						description: res.data.data.description || ''
					};
					setProfileData(newProfileData);
					// editData도 초기값으로 설정
					setEditData({
						...newProfileData,
						password: '',
						passwordConfirm: ''
					});
				} else {
					await window.customAlert('회원 정보를 불러오는데 실패했습니다.');
				}
			} catch (err) {
				await window.customAlert('회원 정보 조회 중 오류가 발생했습니다.');
			}
		};
		fetchProfile();
	}, []);

	return (
		<>
			{isEditing ? (
				<Header title="프로필 설정" isEditing={true} showSearch={false} />
			) : (
				<Header title="프로필 설정" showSearch={false} />
			)}
			<div className="mypage-profile">
				<div className="mypage-profile__img">
					{isEditing ? (
						<>
							<button type="button" className='mypage-profile__imgbutton' onClick={() => document.getElementById('profileImgInput').click()}>
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
							<img src={editData.profileImg || profileDefault} className='mypage-profile__userimg' alt="나의 프로필 이미지"/>
						</>
					) : (
						<img src={profileData.profileImg || profileDefault} className='mypage-profile__userimg' alt="나의 프로필 이미지"/>
					)}
				</div>
				
				<div className="mypage-profile__info">
					{isEditing ? (
						<>
							<div className="mypage-profile__item">
								<label htmlFor='nickname' className="label">닉네임</label>
								<div className="field">
									<input type="text" name="nickname" id="nickname" value={editData.nickname || ''} className="text" placeholder="별명을 입력하세요" onChange={handleInputChange}/>
								</div>
							</div>
							<div className="mypage-profile__item">
								<label htmlFor='password' className="label">비밀번호</label>
								<div className="field">
									<input type="password" name="password" id="password" value={editData.password || ''} className="text" placeholder="비밀번호를 입력하세요" onChange={handleInputChange}/>
								</div>
								<div className="field">
									<input type="password" name="passwordConfirm" value={editData.passwordConfirm || ''} className="text" placeholder="비밀번호를 다시 입력하세요" onChange={handleInputChange}/>
								</div>
							</div>
							<div className="mypage-profile__item">
								<label htmlFor='hp' className="label">휴대폰번호</label>
								<div className="field">
									<input type="tel" name="hp" id="hp" value={formatPhone(editData.hp || '')} className="text" maxLength={13} placeholder="휴대폰번호를 입력하세요" onChange={handleInputChange}/>
								</div>
							</div>
							<div className="mypage-profile__item">
								<h4 className="label">전공</h4>
								<div className="half-field">
									<div className="field">
										<select 
											className="select" 
											name="education" 
											value={editData.education || ''} 
											onChange={handleInputChange}
										>
											<option value="">학력</option>
											{subjects["학력"].map((education) => (
												<option key={education} value={education}>
													{education}
												</option>
											))}
										</select>
									</div>
									
									<div className="field">
										<select 
											className="select" 
											name="department" 
											value={editData.department || ''} 
											onChange={handleInputChange}
										>
											<option value="">계열 선택</option>
											{subjects["계열"].map((department) => (
												<option key={department} value={department}>
													{department}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
							<div className="mypage-profile__item">
								<h4 className="label">지역</h4>
								<div className="half-field">
									<div className="field">
										<select
											className="select"
											name="region"
											value={editData.region}
											onChange={(e) => {
												const { value } = e.target;
												setEditData((prev) => ({
													...prev,
													region: value,
													// 지역무관이 아니고 해당 지역에 구가 있으면 첫 번째 구 자동 선택
													district: value !== '지역무관' && regionData[value]?.length > 0 
														? regionData[value][0] 
														: ''
												}));
											}}
										>
											<option value="지역무관">지역무관</option>
											{Object.keys(regionData).map((region) => (
												<option key={region} value={region}>
													{region}
												</option>
											))}
										</select>
									</div>
									{editData.region !== '지역무관' && regionData[editData.region]?.length > 0 && (
										<div className="field">
											<select
												className="select"
												name="district"
												value={editData.district}
												onChange={handleInputChange}
											>
												{regionData[editData.region].map((district) => (
													<option key={district} value={district}>
														{district}
													</option>
												))}
											</select>
										</div>
									)}
								</div>
							</div>
							<div className="mypage-profile__item">
								<span className="label">시간대</span>
								<div className="field">
									<select className="select" name="timeZone" value={editData.timeZone || ''} onChange={handleInputChange}>
										<option value="">선호 시간대 선택</option>
										<option value="오전">오전 (06:00-12:00)</option>
										<option value="오후">오후 (12:00-18:00)</option>
										<option value="야간">저녁 (18:00-24:00)</option>
									</select>
								</div>
							</div>
							<div className="mypage-profile__item">
								<label htmlFor="memo" className="label">메모</label>
								<div className="field __textarea">
									<textarea className="textarea" id="memo" name="description" value={editData.description || ''} onChange={handleInputChange} placeholder="경력, 이력, 메모 등 자유롭게 작성하세요" />
								</div>
							</div>
						</>
					) : (
						<>
							<div className="profile-nickname">
								<span className="label hide">닉네임</span>
								<span className="value">{profileData.nickname}</span>
							</div>

							<hr className="hr" />
							<h3 className="mypage-profile__datatitle">기본 정보</h3>
							<div className="mypage-profile__item mypage-profile__data">
								<span className="label">휴대폰번호</span>
								<span className="value">{profileData.hp}</span>
							</div>
							<div className="mypage-profile__item mypage-profile__data">
								<span className="label">전공</span>
								<span className="value">{profileData.education && profileData.department ? `${profileData.education} ${profileData.department}` : profileData.education || profileData.department}</span>
							</div>
							<div className="mypage-profile__item mypage-profile__data">
								<span className="label">지역</span>
								<span className="value">{profileData.region === '지역무관' ? '지역무관' : `${profileData.region} ${profileData.district}`}</span>
							</div>
							<div className="mypage-profile__item mypage-profile__data">
								<span className="label">시간대</span>
								<span className="value">{profileData.timeZone}</span>
							</div>
							<div className="mypage-profile__item mypage-profile__data mypage-profile__data--textarea">
								<span className="label">메모</span>
								<span className="value">{profileData.description}</span>
							</div>
						</>
					)}
				</div>
				<div className="fixed">
					<button type="button" className="button button-primary" onClick={handleEditProfile}>
						{isEditing ? '수정 완료' : '프로필 수정'}
					</button>
				</div>
			</div>
		</>
	);
};

export default MyPage;
