import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createPost } from "@js/common-ui" // import 추가

export default function BoardWrite() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [message, setMessage] = useState("")
  const [image, setImage] = useState(null)
  const navigate = useNavigate()

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
    <div>
      <h2>글쓰기</h2>
      <p>
        제목:
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginLeft: "10px", width: "300px" }}
        />
      </p>
      <p>
        내용:
        <br />
        <textarea
          rows="8"
          cols="50"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ marginTop: "5px" }}
        />
      </p>
      <p>
        이미지 첨부:
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      </p>
      <button onClick={handleSubmit}>등록</button>
      <button onClick={() => navigate("/board")} style={{ marginLeft: "10px" }}>
        취소
      </button>
      <p style={{ color: message.includes("실패") ? "red" : "green" }}>{message}</p>
    </div>
  )
}
