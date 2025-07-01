import { useState, useEffect, useRef } from "react"

const JoinSystem = ({ isOpen, onClose, profileData }) => {
	const [swipeDistance, setSwipeDistance] = useState(0)
	const [isDragging, setIsDragging] = useState(false)
	const [startX, setStartX] = useState(0)
	const [isCompleted, setIsCompleted] = useState(false)
	const [sliderWidth, setSliderWidth] = useState(300)
	const sliderRef = useRef(null)

	// 기본값 설정 (props가 없을 때만 사용)
	const defaultProfileData = {
		profileImg: "",
		nickname: "김사과",
		education: "대학교 졸업",
		department: "공학계열",
		region: "서울특별시",
		district: "강남구",
		timeZone: "오후",
		description: "함께 공부하며 성장하고 싶습니다!",
	}

	// props로 받은 데이터가 있으면 사용하고, 없으면 기본값 사용
	const currentProfileData = profileData || defaultProfileData

	useEffect(() => {
		if (isOpen) {
			setTimeout(() => {
				const modalEl = document.querySelector(".join-system__modal")
				if (modalEl) {
					modalEl.classList.add("join-system__modal--active")
				}
			}, 10)
		}
	}, [isOpen])

	const updateSliderWidth = () => {
		if (sliderRef.current) {
			const containerWidth = sliderRef.current.parentElement.clientWidth
			const maxWidth = Math.min(containerWidth - 80, 350)
			const minWidth = 250
			setSliderWidth(Math.max(minWidth, maxWidth))
		}
	}

	useEffect(() => {
		if (isOpen) {
			updateSliderWidth()
			const handleResize = () => {
				updateSliderWidth()
			}
			window.addEventListener("resize", handleResize)
			return () => window.removeEventListener("resize", handleResize)
		}
	}, [isOpen])

	const handleTouchStart = (e) => {
		setStartX(e.touches[0].clientX)
		setIsDragging(true)
	}

	const handleTouchMove = (e) => {
		if (!isDragging || isCompleted) return
		const currentX = e.touches[0].clientX
		const distance = currentX - startX
		const maxDistance = sliderWidth - 60
		if (distance >= 0 && distance <= maxDistance) {
			setSwipeDistance(distance)
		}
	}

	const handleTouchEnd = () => {
		if (!isDragging || isCompleted) return
		setIsDragging(false)
		const maxDistance = sliderWidth - 60
		if (swipeDistance >= maxDistance * 0.9) {
			setSwipeDistance(maxDistance)
			setIsCompleted(true)
			setTimeout(() => {
				onClose()
			}, 500)
		} else {
			setSwipeDistance(0)
		}
	}

	const handleMouseDown = (e) => {
		setStartX(e.clientX)
		setIsDragging(true)
	}

	const handleMouseMove = (e) => {
		if (!isDragging || isCompleted) return
		const distance = e.clientX - startX
		const maxDistance = sliderWidth - 60
		if (distance >= 0 && distance <= maxDistance) {
			setSwipeDistance(distance)
		}
	}

	const handleMouseUp = () => {
		if (!isDragging || isCompleted) return
		setIsDragging(false)
		const maxDistance = sliderWidth - 60
		if (swipeDistance >= maxDistance * 0.9) {
			setSwipeDistance(maxDistance)
			setIsCompleted(true)
			setTimeout(() => {
				onClose()
			}, 500)
		} else {
			setSwipeDistance(0)
		}
	}

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove)
			document.addEventListener("mouseup", handleMouseUp)
			return () => {
				document.removeEventListener("mousemove", handleMouseMove)
				document.removeEventListener("mouseup", handleMouseUp)
			}
		}
	}, [isDragging, startX, swipeDistance, sliderWidth, isCompleted])

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				onClose()
			}
		}
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown)
			return () => document.removeEventListener("keydown", handleKeyDown)
		}
	}, [isOpen, onClose])

	useEffect(() => {
		if (isOpen) {
			setSwipeDistance(0)
			setIsCompleted(false)
			setIsDragging(false)
		}
	}, [isOpen])

	if (!isOpen) return null

	const maxDistance = sliderWidth - 60
	const progress = maxDistance > 0 ? swipeDistance / maxDistance : 0

	return (
		<div className="join-system">
			<div className="join-system__modal" onClick={(e) => e.stopPropagation()}>
				<div className="join-system__profile">
					<div className="join-system__profile-img">
						<img
							src={currentProfileData?.profileImg || "/placeholder.svg?height=80&width=80&query=profile"}
							alt="프로필 이미지"
							className="join-system__profile-image"
						/>
					</div>

					<div className="join-system__profile-info">
						<div className="join-system__profile-nickname">{currentProfileData?.nickname || "사용자"}</div>

						<div className="join-system__profile-details">
							{currentProfileData?.education && (
								<div className="join-system__profile-item">
									<span className="join-system__profile-label">학력:</span>
									<span className="join-system__profile-value">{currentProfileData.education}</span>
								</div>
							)}

							{currentProfileData?.department && (
								<div className="join-system__profile-item">
									<span className="join-system__profile-label">계열:</span>
									<span className="join-system__profile-value">{currentProfileData.department}</span>
								</div>
							)}

							{(currentProfileData?.region || currentProfileData?.district) && (
								<div className="join-system__profile-item">
									<span className="join-system__profile-label">지역:</span>
									<span className="join-system__profile-value">
										{currentProfileData.region === "지역무관"
											? "지역무관"
											: `${currentProfileData.region || ""} ${currentProfileData.district || ""}`.trim()}
									</span>
								</div>
							)}

							{currentProfileData?.timeZone && (
								<div className="join-system__profile-item">
									<span className="join-system__profile-label">시간대:</span>
									<span className="join-system__profile-value">{currentProfileData.timeZone}</span>
								</div>
							)}

							{currentProfileData?.description && (
								<div className="join-system__profile-item join-system__profile-item--description">
									<span className="join-system__profile-label">메모:</span>
									<span className="join-system__profile-value">{currentProfileData.description}</span>
								</div>
							)}
						</div>
					</div>
				</div>

				<h2 className="join-system__title">
					<span className="join-system__name">{currentProfileData?.nickname || "사용자"}</span>님이
					<br />
					참여를 요청했습니다
				</h2>

				<p className="join-system__description">
					함께하시려면
					<br />
					아래 슬라이더를 밀어주세요.
				</p>

				<div
					ref={sliderRef}
					className={`join-system__slider ${isCompleted ? "join-system__slider--completed" : ""}`}
					style={{ width: `${sliderWidth}px` }}
				>
					<div
						className={`join-system__progress ${isCompleted ? "join-system__progress--completed" : ""}`}
						style={{
							width: `${Math.max(60, swipeDistance + 60)}px`,
							backgroundColor: isCompleted ? "#007fff" : `rgba(0, 127, 255, ${progress * 0.3})`,
							transition: isDragging ? "none" : "all 0.3s ease",
						}}
					/>
					<div className={`join-system__text ${isCompleted ? "join-system__text--completed" : ""}`}>
						{isCompleted ? "완료!" : "밀어서 함께하기"}
					</div>
					<div
						className={`join-system__handle ${isDragging ? "join-system__handle--dragging" : ""}`}
						style={{
							left: `${swipeDistance}px`,
							transition: isDragging ? "none" : "left 0.3s ease",
						}}
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
						onMouseDown={handleMouseDown}
					>
						{isCompleted ? "✓" : "→"}
					</div>
				</div>

				<div className="join-system__buttons">
					<button className="join-system__cancel" onClick={onClose} aria-label="닫기"></button>
				</div>
			</div>
		</div>
	)
}

export default JoinSystem