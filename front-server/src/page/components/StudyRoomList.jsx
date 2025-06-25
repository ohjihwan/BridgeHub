import { useState, useEffect } from 'react';
import roomData from '@json/Room.json';

const StudyRoomList = ({ searchKeyword = '', onItemClick, limit = roomData.length }) => {
	const [filteredRooms, setFilteredRooms] = useState(roomData);

	useEffect(() => {
		const keyword = (searchKeyword || '').toLowerCase();
		const filtered = roomData.filter(room =>
			room.title.toLowerCase().includes(keyword) || room.region.toLowerCase().includes(keyword)
		);
		setFilteredRooms(filtered);
	}, [searchKeyword]);

	return (
		<ul className="studyroom">
			{filteredRooms.slice(0, limit).map((room) => (
				<li className="studyroom__item" onClick={() => onItemClick(room)} key={room.id}>
					<button type="button" className="studyroom__info">
						<img src={`/uploads/thumbnail/${room.thumbnail}`} className="studyroom__img" />
						<h3 className="studyroom__title">{room.title}</h3>
						<div className="studyroom__details">
							<span className="studyroom__detail">{room.region}</span>
							<span className="studyroom__detail">{room.time}</span>
							<span className="studyroom__detail">{room.currentMembers}/{room.capacity}명</span>
						</div>
					</button>
				</li>
			))}
		</ul>
	);
};

export default StudyRoomList;
