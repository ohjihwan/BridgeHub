import { useState } from 'react';

const Video = ({ onClose }) => {


	return (
		<div className="video-rtc">
			<div className="video-rtc__header">
				<h2 className="video-rtc__title">영상 통화</h2>
				<button type="button" className="video-rtc__close" onClick={onClose}>✕</button>
			</div>

			<div className="video-rtc__screen">
				<video className="video-rtc__remote" autoPlay playsInline />
				<video className="video-rtc__local" autoPlay playsInline muted />
			</div>

			<div className="video-rtc__controls">
				<button type="button" className="video-rtc__control video-rtc__control--mute">마이크</button>
				<button type="button" className="video-rtc__control video-rtc__control--camera">카메라</button>
				<button type="button" className="video-rtc__control video-rtc__control--end" onClick={onClose}>종료</button>
			</div>
		</div>
	);
};

export default Video;
