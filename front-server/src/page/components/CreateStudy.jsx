import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import thumbnailList from '@json/Thumbnail';
import { customAlert } from '@/assets/js/common-ui';
import studyService from '@dev/services/studyService';
import regionData from '@json/region';
import subjects from '@json/subject';

const CreateStudy = ({ onClose }) => {
	const navigate = useNavigate();
	const [isVisible, setIsVisible] = useState(false);
	const [isMounted, setIsMounted] = useState(true);
	const [showThumbnailSelection, setShowThumbnailSelection] = useState(false);
	const [selectedThumbnail, setSelectedThumbnail] = useState(null);
	const handleThumbnailClose = () => {
		setShowThumbnailSelection(false);
	};
	const [category, setCategory] = useState('default');
	const [thumbnails, setThumbnails] = useState(thumbnailList['default']);
	const [errors, setErrors] = useState({
		title: false,
		department: false,
		major: false,
		city: false,
		district: false,
		capacity: false,
		time: false,
		description: false,
		thumbnail: false
	});


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

	/* 콘솔 */
	const [title, setTitle] = useState('');
	const [department, setDepartment] = useState('');
	const [major, setMajor] = useState('');
	const [city, setCity] = useState('지역무관');
	const [district, setDistrict] = useState('지역무관');
	const [capacity, setCapacity] = useState('');
	const [time, setTime] = useState('');
	const [description, setDescription] = useState('');
	const handleCityChange = (e) => {
		const selectedCity = e.target.value;
		setCity(selectedCity);
		setErrors(prev => ({ ...prev, city: false, district: false }));
		setDistrict('지역무관'); // 구 초기화
	};
	const handleSubmit = async (e) => {
		e.preventDefault();

		const isInvalid = !title.trim() || !department || !major || !city || !district || !capacity || !time || !description.trim() || !selectedThumbnail;

		if (isInvalid) {
			await customAlert('빈 값을 입력해주세요');

			// 여기서 에러 값을 새로 계산
			const newErrors = {
				title: !title.trim(),
				department: !department,
				major: !major,
				city: !city,
				district: !district,
				capacity: !capacity,
				time: !time,
				description: !description.trim(),
				thumbnail: !selectedThumbnail
			};

			setErrors(newErrors);
			return;
		}

		try {
			// 반드시 선언 먼저
			const studyData = {
				title: title.trim(),
				education: department,
				department: major,
				region: city,
				district: district,
				capacity: parseInt(capacity),
				time: time,
				description: description.trim(),
				thumbnail: selectedThumbnail.split('/').pop()
			};

			console.log('스터디룸 생성 요청:', studyData); // 선언 이후 사용

			const createdStudy = await studyService.createStudyRoom(studyData);
			console.log('스터디룸 생성 성공:', createdStudy);

			await customAlert('스터디룸이 성공적으로 생성되었습니다!');
			navigate('/chat', { state: { studyRoom: createdStudy, isNewStudy: true } });

		} catch (error) {
			console.error('스터디룸 생성 실패:', error);
		}
	};
	/* // 콘솔 */

	return (
		<>
			<div className="overlay" onClick={handleClose}></div>
			<div className={`create-study ${isVisible ? 'slide-up' : ''}`}>
				<div className="create-study__header">
					<h2 className="create-study__title">스터디 개설하기</h2>
					<button className="create-study__close" onClick={handleClose} aria-label="닫기"></button>
				</div>
				
				<form className="create-study__form" onSubmit={handleSubmit}>
					<div className="create-study__content">
						<div className={`field ${errors.title ? '--field__error' : ''}`}>
							<input type="text" className="text" placeholder="스터디 제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} onFocus={() => setErrors((prev) => ({ ...prev, title: false }))} />
						</div>

						<div className="half-field">
							<div className={`field ${errors.department ? '--field__error' : ''}`}>
								<select className="select" name="department1" value={department} onChange={(e) => setDepartment(e.target.value)} onFocus={() => setErrors((prev) => ({ ...prev, department: false }))} >
									<option value="">학력</option>
									{subjects["학력"].map((v) => (
										<option key={v} value={v}>{v}</option>
									))}
								</select>
							</div>
							<div className={`field ${errors.major ? '--field__error' : ''}`}>
								<select className="select" value={major} onChange={(e) => setMajor(e.target.value)} onFocus={() => setErrors(prev => ({ ...prev, major: false }))}>
									<option value="">계열 선택</option>
									{subjects["계열"].map((v) => (
										<option key={v} value={v}>{v}</option>
									))}
								</select>
							</div>
						</div>

						<div className="half-field">
							<div className={`field ${errors.city ? '--field__error' : ''}`}>
								<select className="select" name="education1" value={city} onChange={handleCityChange} onFocus={() => setErrors(prev => ({ ...prev, city: false }))}>
									<option value="지역무관">지역무관</option>
									{Object.keys(regionData).map((region) => (
										<option key={region} value={region}>
											{region}
										</option>
									))}
								</select>
							</div>
							{city !== '지역무관' && (
								<div className={`field ${errors.district ? '--field__error' : ''}`}>
									<select className="select" name="education2" value={district} onChange={(e) => setDistrict(e.target.value)} onFocus={() => setErrors(prev => ({ ...prev, district: false }))}>
										<option value="지역무관">구/군 선택</option>
										{regionData[city]?.map((d) => (
											<option key={d} value={d}>{d}</option>
										))}
									</select>
								</div>
							)}
						</div>

						<div className="half-field">
							<div className={`field ${errors.capacity ? '--field__error' : ''}`}>
								<select className="select" name="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} onFocus={() => setErrors(prev => ({ ...prev, capacity: false }))} >
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
							<div className={`field ${errors.time ? '--field__error' : ''}`}>
								<select className="select" name="time" value={time} onChange={(e) => setTime(e.target.value)} onFocus={() => setErrors(prev => ({ ...prev, time: false }))} >
									<option value="" disabled>선호시간</option>
									<option value="오전">오전</option>
									<option value="오후">오후</option>
									<option value="저녁">저녁</option>
								</select>
							</div>
						</div>

						<div className={`field __textarea ${errors.description ? '--field__error' : ''}`}>
							<textarea className="textarea" placeholder="스터디에 대해서 자세히 소개해주세요" name="description" value={description} onChange={(e) => setDescription(e.target.value)} onFocus={() => setErrors(prev => ({ ...prev, description: false }))} />
						</div>

						<div className={`field __imgselect ${errors.description ? '--field__error' : ''}`}>
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
								<select className="select" name="thumbnail-selection" value={category} onChange={(e) => setCategory(e.target.value)} onFocus={() => setErrors(prev => ({ ...prev, major: false }))}>
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