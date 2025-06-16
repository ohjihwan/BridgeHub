import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef(null);

	const handleHomeClick = () => {
		navigate('/home');
	};

	const handleLogout = () => {
		customConfirm('로그아웃 하시겠습니까?', () => {
			setMenuOpen(false);
			handleLogoutSet();
			navigate('/login');
		});
	};

	const handleMyPageClick = () => {
		setMenuOpen(false);
		navigate('/mypage');
	};

	const handleLogoutSet = () => {
		customAlert('로그아웃 되었습니다');
	};

	const toggleMenu = () => {
		setMenuOpen(prev => !prev);
	};

	// 바깥 클릭 시 메뉴 닫기 (선택사항)
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, []);

	return (
		<header className="header">
			<div className="header__left">
				<h1 className="logo">
					<a href="/home" onClick={(e) => { e.preventDefault(); handleHomeClick(); }}>
						<span className="hide">BridgeHub</span>
					</a>
				</h1>
			</div>
			<div className="header__right" ref={menuRef}>
				<button type="button" className="header__right__search">
					<span className="hide">검색</span>
				</button>
				<button type="button" className="header__right__menu" onClick={toggleMenu}>
					<span className="hide">메뉴 열기</span>
				</button>
				<div className={`user-menu${menuOpen ? ' --on' : ''}`}>
					<ul>
						<li className='user-menu__item'><a href="/mypage" onClick={(e) => { e.preventDefault(); handleMyPageClick(); }}>마이페이지</a></li>
						<li className='user-menu__item'><a href="/logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>로그아웃</a></li>
					</ul>
				</div>
			</div>
		</header>
	);
};

export default Header; 