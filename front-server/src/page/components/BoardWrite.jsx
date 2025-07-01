import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { createPost } from "@js/common-ui" // import 추가
import Header from "@common/Header"

export default function BoardWrite() {
	const [title, setTitle] = useState("")
	const [content, setContent] = useState("")
	const [message, setMessage] = useState("")
	const [image, setImage] = useState(null)
	const navigate = useNavigate()

	 // 간단한 자동 높이 조정
	const handleChange = (e) => {
		setContent(e.target.value)
	}

	const handleSubmit = async () => {
		if (!title || !content) {
			setMessage("제목과 내용을 모두 입력하세요 💡")
			return
		}

		setMessage("등록 중...") // 로딩 메시지

		try {
			// 이미지가 있는 경우 먼저 이미지 업로드
			let attachmentIds = []
			if (image) {
				const formData = new FormData()
				formData.append("file", image)
				
				const token = localStorage.getItem("token")
				const uploadResponse = await fetch("/api/files/upload/board", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					credentials: "include",
					body: formData,
				})

				if (uploadResponse.ok) {
					const uploadResult = await uploadResponse.json()
					if (uploadResult.success) {
						attachmentIds.push(uploadResult.data.fileId)
					}
				}
			}

			// 게시글 작성 (JSON으로 전송)
			const token = localStorage.getItem("token")
			const response = await fetch("/api/board", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				credentials: "include",
				body: JSON.stringify({
					title: title,
					content: content,
					categoryId: 1, // 기본 카테고리
					attachmentIds: attachmentIds
				}),
			})

			if (!response.ok) {
				throw new Error("서버 응답 오류")
			}

			setMessage("글이 성공적으로 등록되었습니다! 🎉")
			setTimeout(() => navigate("/board"), 1000)
		} catch (error) {
			console.error("글쓰기 에러:", error)
			setMessage("글쓰기 실패 😵‍💫")
		}
	}

	return (
		<>
		<div className="board-write">
			<h2 className="board-write__title">글쓰기</h2>
			<div className="board-write__content">
				<div className="field">
					<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="text" placeholder="제목을 입력하세요"/>
				</div>
				<div className="field __textarea">
					<textarea className="textarea" placeholder="글을 작성해보세요" name="description" value={content} onChange={(e) => setContent(e.target.value)}/>
				</div>
			</div>
			<div className="board-write__images" >
				<input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
			</div>
			<div className="fixed --comf">
				<Link to="/board" type="button" className="button button-border" onClick={() => navigate("/board")}>취소</Link>
				<button type="button" className="button button-primary" onClick={handleSubmit}>등록</button>
			</div>
			<p style={{ color: message.includes("실패") ? "red" : "green" }}>{message}</p>
		</div>
		</>
	)
}
