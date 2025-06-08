import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
	const navigate = useNavigate();

	const handleLogout = () => {
		navigate('/login');
	};

	const handleMyPageClick = () => {
		navigate('/mypage');
	};

	return (
		<header className="header">
			<div className="header__left">
				<h1 className="logo">
				<span className="hide">TeamHub</span>
				</h1>
			</div>
			<div className="header__right">
				<button type="button" className="my-page-btn" onClick={handleMyPageClick}>
					마이페이지
				</button>
				<button type="button" className="logout-btn" onClick={handleLogout}>
					LOGOUT
				</button>
			</div>
		</header>
	);
};

export default Header; 