import { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@common/Header';
import StudyRoomList from '@components/StudyRoomList';
import roomData from '@json/Room.json';

const Search = () => {
	const location = useLocation();
	const studyInfo = location.state;
	const [searchKeyword, setSearchKeyword] = useState('');
	const [showRecommended, setShowRecommended] = useState(true);

	const recommendedKeywords = useMemo(() => {
		const trimmedKeyword = searchKeyword.trim().toLowerCase();
		if (!trimmedKeyword) return [];

		const keywordSet = new Set();

		roomData.forEach(room => {
			room.title.split(' ').forEach(word => {
				if (word.toLowerCase().includes(trimmedKeyword)) {
					keywordSet.add(word);
				}
			});
			room.region.split(' ').forEach(word => {
				if (word.toLowerCase().includes(trimmedKeyword)) {
					keywordSet.add(word);
				}
			});
		});

		return Array.from(keywordSet);
	}, [searchKeyword]);

	// 실제 검색 결과
	const filteredRooms = useMemo(() => {
		const trimmedKeyword = searchKeyword.trim().toLowerCase();
		if (!trimmedKeyword) return [];

		return roomData.filter((room) =>
			room.title.toLowerCase().includes(trimmedKeyword) ||
			room.region.toLowerCase().includes(trimmedKeyword)
		);
	}, [searchKeyword]);

	return (
		<>
			<Header showSearch={false} title={studyInfo?.title || '통합 검색'} />
			<div className="search-page">

				<div className="field">
					<input
						type="text"
						className="text"
						value={searchKeyword}
						onChange={(e) => {
							setSearchKeyword(e.target.value);
							setShowRecommended(true);
						}}
						placeholder="검색어 입력"
					/>
				</div>

				{recommendedKeywords.length > 0 && showRecommended && (
					<div className="search-page__keywords">
						{recommendedKeywords.map((keyword, idx) => {
							const highlightText = searchKeyword.trim();
							const regex = new RegExp(`(${highlightText})`, 'gi');
							const highlightedKeyword = keyword.replace(regex, '<span class="key-point">$1</span>');

							return (
								<button
									key={idx}
									type="button"
									className="search-page__word"
									onClick={() => {
										setSearchKeyword(keyword);
										setShowRecommended(false);
									}}
									dangerouslySetInnerHTML={{ __html: highlightedKeyword }}
								/>
							);
						})}
					</div>
				)}

				<div className="search-page__content">
					{searchKeyword ? (
						filteredRooms.length > 0 ? (
							<StudyRoomList
								/* StudyRoomList rooms={rooms || []} */
								rooms={filteredRooms}
								onItemClick={() => {}}
							/>
						) : (
							<p className="search-page__noresult --not-result">검색 결과가 없습니다.</p>
						)
					) : (
						<p className="search-page__noresult --ready">검색어를 입력하세요.</p>
					)}
				</div>
			</div>
		</>
	);
};

export default Search; 