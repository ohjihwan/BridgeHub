import { useState, useEffect, useMemo } from "react"
import { useNavigate, Link } from "react-router-dom"
import Header from "@common/Header"
import ListSearch from "@components/ListSearch"

function Board() {
    const [showSearch, setShowSearch] = useState(false)
    const [posts, setPosts] = useState([])
    const [searchKeyword, setSearchKeyword] = useState("")
    const [sortType, setSortType] = useState("recent")
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const [showDetail, setShowDetail] = useState(false)

    
    // 댓글 관련 state
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [commentLoading, setCommentLoading] = useState(false)

    const navigate = useNavigate()



    // 게시글 목록 가져오기
    const fetchPosts = async (page = 0, reset = false) => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const params = new URLSearchParams({
                page: page.toString(),
                size: "10",
                sort: sortType,
            })

            if (searchKeyword.trim()) {
                params.append("search", searchKeyword.trim())
            }

            const url = `/api/board?${params.toString()}`
            const response = await fetch(url, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                credentials: "include",
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success && result.data) {
                    const newPosts = result.data.boards || []
                    console.log("📋 게시글 목록 가져옴:", newPosts.length, "개")

                    // 백엔드에서 contentPreview를 제공하므로 개별 조회 제거
                    const postsWithPreview = newPosts.map(post => ({
                        ...post,
                        contentPreview: post.content ? 
                            (post.content.length > 150 ? 
                                post.content.substring(0, 150) + "..." : 
                                post.content) : 
                            "내용이 없습니다."
                    }))

                    if (reset) {
                        setPosts(postsWithPreview)
                    } else {
                        setPosts((prev) => [...prev, ...postsWithPreview])
                    }

                    setTotalPages(result.data.totalPages || 0)
                    setCurrentPage(result.data.currentPage || 0)
                    setTotalElements(result.data.totalElements || 0)
                    console.log(`✅ 게시글 ${postsWithPreview.length}개 로드 완료`)
                }
            } else {
                console.error("❌ API 응답 실패:", response.status)
            }
        } catch (error) {
            console.error("❌ 게시글 조회 에러:", error)
        } finally {
            setLoading(false)
        }
    }

    // 게시글 상세 조회
    const fetchPostDetail = async (boardId) => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`/api/board/${boardId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                credentials: "include",
            })
            
            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setSelectedPost(result.data)
                    setShowDetail(true)
                    // 댓글도 함께 가져오기
                    fetchComments(boardId)
                }
            }
        } catch (error) {
            console.error("게시글 상세 조회 에러:", error)
        }
    }

    // 댓글 목록 가져오기
    const fetchComments = async (boardId) => {
        try {
            const token = localStorage.getItem("token")
            const response = await fetch(`/api/board/${boardId}/comments`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                credentials: "include",
            })
            
            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setComments(result.data || [])
                }
            }
        } catch (error) {
            console.error("댓글 조회 에러:", error)
        }
    }

    // 댓글 작성
    const submitComment = async () => {
        if (!newComment.trim()) {
            alert("댓글을 입력해주세요.")
            return
        }

        const token = localStorage.getItem("token")
        if (!token) {
            alert("로그인이 필요합니다.")
            return
        }

        setCommentLoading(true)
        try {
            const response = await fetch(`/api/board/${selectedPost.boardId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    content: newComment.trim()
                }),
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setNewComment("")
                    // 댓글 목록 새로고침
                    fetchComments(selectedPost.boardId)
                    // 게시글의 댓글 수 업데이트
                    setSelectedPost(prev => ({
                        ...prev,
                        commentCount: prev.commentCount + 1
                    }))
                }
            }
        } catch (error) {
            console.error("댓글 작성 실패:", error)
        } finally {
            setCommentLoading(false)
        }
    }

    // 댓글 삭제
    const deleteComment = async (commentId) => {
        if (!confirm("댓글을 삭제하시겠습니까?")) return

        const token = localStorage.getItem("token")
        try {
            const response = await fetch(`/api/board/${selectedPost.boardId}/comments/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    // 댓글 목록 새로고침
                    fetchComments(selectedPost.boardId)
                    // 게시글의 댓글 수 업데이트
                    setSelectedPost(prev => ({
                        ...prev,
                        commentCount: prev.commentCount - 1
                    }))
                }
            }
        } catch (error) {
            console.error("댓글 삭제 실패:", error)
        }
    }

    // 좋아요 토글 (상세보기에서만)
    const toggleLike = async (boardId) => {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                alert("로그인이 필요합니다.")
                return
            }

            const response = await fetch(`/api/board/${boardId}/like`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            })
            
            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    // 상세보기 모달의 좋아요만 업데이트
                    if (selectedPost && selectedPost.boardId === boardId) {
                        setSelectedPost((prev) => ({
                            ...prev,
                            isLiked: result.data.liked,
                            likeCount: result.data.likeCount,
                        }))
                    }
                }
            }
        } catch (error) {
            console.error("좋아요 처리 실패:", error)
        }
    }

    // useMemo로 게시글 표시 목록 계산
    const displayPosts = useMemo(() => {
        return posts.map((post) => {
            // 내용 미리보기 생성 (150자로 제한)
            const getPreview = (content, maxLength = 150) => {
                if (!content || content.trim() === "" || content === "내용을 불러오는 중...") {
                    return content || "내용이 없습니다."
                }
                const cleanContent = content.replace(/\n/g, " ").trim()
                if (cleanContent.length <= maxLength) return cleanContent
                return cleanContent.substring(0, maxLength) + "..."
            }

            const preview = getPreview(post.content)

            return {
                ...post,
                contentPreview: preview,
            }
        })
    }, [posts])

    // useMemo로 페이지네이션 정보 계산
    const paginationInfo = useMemo(() => {
        return {
            hasMore: currentPage + 1 < totalPages,
            currentCount: posts.length,
            totalCount: totalElements,
            currentPageDisplay: currentPage + 1,
            totalPagesDisplay: totalPages,
        }
    }, [currentPage, totalPages, posts.length, totalElements])

    // 초기 로드 및 필터 변경 시 게시글 가져오기
    useEffect(() => {
        fetchPosts(0, true)
    }, [sortType, searchKeyword])

    // 더 보기
    const loadMore = () => {
        if (paginationInfo.hasMore && !loading) {
            fetchPosts(currentPage + 1, false)
        }
    }

    const formatMMDD = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR', { 
            month: '2-digit', 
            day: '2-digit' 
        }).replace(/\.\s?/g, '/').replace(/\/$/, '')
    }

    // 더 보기 자동스크롤
    useEffect(() => {
        let timer = null
        const handleScroll = () => {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                    if (paginationInfo.hasMore && !loading) {
                        loadMore()
                    }
                }
            }, 100)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [paginationInfo.hasMore, loading])

    return (
        <>
            <Header showSearch={true} title="자유게시판" onSearch={() => setShowSearch(true)} />
            <div className="board-list">
                {showSearch && (
                    <ListSearch 
                        value={searchKeyword} 
                        onChange={(e) => setSearchKeyword(e.target.value)} 
                        onClose={() => setShowSearch(false)}
                    />
                )}

                <div className="board-list__content">
                    {displayPosts.length > 0 ? (
                        <>
                            {displayPosts.map((post, idx) => (
                                <div key={post.boardId} className={`board-list__item delay-${idx % 10}`}>
                                    <div className="board-list__txts" onClick={() => fetchPostDetail(post.boardId)}>
                                        <h3 className="board-list__title">{post.title}</h3>
                                        <div className="board-list__txt">{post.contentPreview}</div>
                                    </div>
                                    <div className="board-list__infos">
                                        <span className="board-list__likes">❤ {post.likeCount}</span>
                                        <span className="board-list__comments">💬 {post.commentCount}</span>
                                        {post.attachmentCount > 0 && (
                                            <span className="board-list__attachments">📎 {post.attachmentCount}</span>
                                        )}
                                        <span className="board-list__date">{formatMMDD(post.createdAt)}</span>
                                        <span className="board-list__name">{post.authorNickname}</span>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        !loading && (
                            <div className="board-empty">
                                {searchKeyword.trim() 
                                    ? `"${searchKeyword}"에 대한 검색 결과가 없습니다.`
                                    : "게시글이 없습니다."
                                }
                            </div>
                        )
                    )}
                </div>

                <div className="fixed">
                    <Link to={"/board/write"} className="button button-primary">글쓰기</Link>
                </div>

                {/* 게시글 상세보기 모달 */}
                {showDetail && selectedPost && (
                    <div className="board-view">
                        <div className="board-view__header">
                            <button type="button" className="board-view__close" onClick={() => setShowDetail(false)}></button>
                        </div>
                        <div className="board-view__contents">
                            <div className="board-view__top">
                                <h2 className="board-view__title">{selectedPost.title}</h2>
                                <div className="board-view__infos">
                                    <span className="board-view__likes">❤ {selectedPost.likeCount}</span>
                                    <span className="board-view__comments">{selectedPost.commentCount}</span>
                                    <span className="board-list__date">{formatMMDD(selectedPost.createdAt)}</span>
                                    <span className="board-view__name">{selectedPost.authorNickname}</span>
                                </div>
                            </div>
                            <div className="board-view__content">
                                {selectedPost.content || "내용이 없습니다."}
                            </div>

                            {/* 첨부파일 섹션 */}
                            {selectedPost.attachments && selectedPost.attachments.length > 0 && (
                                <div className="board-view__attachments">
                                    <h4 className="board-view__attachments-title">첨부파일</h4>
                                    <div className="board-view__attachments-list">
                                        {selectedPost.attachments.map((file) => (
                                            <div key={file.fileId} className="board-view__attachment-item">
                                                <a 
                                                    href={`/api/files/download/${file.fileId}`}
                                                    className="board-view__attachment-link"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <span className="board-view__attachment-name">
                                                        {file.originalFilename}
                                                    </span>
                                                    <span className="board-view__attachment-size">
                                                        ({(file.fileSize / 1024).toFixed(1)} KB)
                                                    </span>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="board-view__buttons">
                                <button 
                                    type="button" 
                                    className="board-view__button" 
                                    onClick={() => toggleLike(selectedPost.boardId)}
                                >
                                    ❤ {selectedPost.likeCount}
                                </button>
                            </div>

                            {/* 댓글 섹션 */}
                            <div className="board-view__comments">
                                
                                {/* 댓글 작성 */}
                                <div className="comment-write">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="댓글을 입력하세요..."
                                        className="comment-write__textarea"
                                    />
                                    <button
                                        onClick={submitComment}
                                        disabled={commentLoading || !newComment.trim()}
                                        className="comment-write__button"
                                    >
                                        {commentLoading ? '작성 중...' : '댓글 작성'}
                                    </button>
                                </div>

                                {/* 댓글 목록 */}
                                <div className="comment-list">
                                    {comments.length > 0 ? (
                                        comments.map((comment) => (
                                            <div key={comment.commentId} className="comment-item">
                                                <div className="comment-item__header">
                                                    <div className="comment-item__info">
                                                        <span className="comment-item__author">
                                                            {comment.authorNickname}
                                                        </span>
                                                        <span className="comment-item__date">
                                                            {formatMMDD(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    {comment.isAuthor && (
                                                        <button
                                                            onClick={() => deleteComment(comment.commentId)}
                                                            className="comment-item__delete"
                                                        >
                                                            삭제
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="comment-item__content">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="comment-empty">
                                            첫 번째 댓글을 작성해보세요!
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Board