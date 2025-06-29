import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from "react-router-dom"
import { getPosts } from '@js/common-ui';

export default function BoardList(){
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [selectedPost, setSelectedPost] = useState(null)
    const observer = useRef()
    
    const lastPostRef = useCallback((node) => {
        if(loading) return;
        if(observer.current) observer.current.disconnect()
        observer.current = new IntersectionObserver(entries => {
            if(entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1)
            }
        })
        if (node) observer.current.observe(node)
    }, [loading, hasMore])
    const navigate = useNavigate()
    
    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const data = await getPosts(page, 10, 1);
                if(data.length == 0) {
                    setHasMore(false)
                } else {
                    setPosts((prev) => {
                        const merged = [...prev, ...data]
                        const unique = Array.from(new Map(merged.map(p => [p.id, p])).values())
                        return unique
                    })
                }
            } catch (error) {
                console.error('게시글 로딩 실패:', error);
                // 사용자에게 에러 메시지 표시하는 로직 추가
            } finally {
                setLoading(false)
            }
        }

        if(hasMore) load()
    }, [page])

    return (
        <div>
            <h2>게시판</h2>
            <button onClick={() => navigate('/board/write')}>글쓰기</button>
            <ul>
                {posts.map((post, idx) => (
                    <li key={`post-${post.id}`} ref={idx === posts.length - 1 ? lastPostRef : null} style={{ marginBottom: '1em', borderBottom: '1px solid #ccc', paddingBottom: '0.5em', cursor: 'pointer'}} onClick={() => setSelectedPost(post)}>
                        <strong>{post.title}</strong> - {post.writerName}<br/>
                        <small>{new Date(post.createdAt).toLocaleString()}</small>
                    </li>
                ))}
            </ul>
            {selectedPost && (
                <div className='modal-overlay' onClick={() => setSelectedPost(null)}>
                    <div className='modal-content' onClick={(e) => e.stopPropagation()}>
                        <h3>{selectedPost.title}</h3>
                        <p><strong>작성자:</strong> {selectedPost.writerName}</p>
                        <p><strong>작성일:</strong> {new Date(selectedPost.createdAt).toLocaleString()}</p>
                        {selectedPost.thumbnailUrl && (
                            <div style={{margin:'1em 0'}}>
                                <h3>첨부 이미지 😍</h3>
                                {/* <img src={`${import.meta.env.VITE_API_BASE_URL}${selectedPost.thumbnailUrl}`} alt='썸네일'
                                style={{
                                    maxWidth:'100%',
                                    borderRadius :'8px',
                                    border:'1px solid #ccc',
                                    display : 'block'
                                }}/> */}
                            </div>
                        )}
                        <hr/>
                        <p>{selectedPost.content}</p>
                        <button onClick={() => setSelectedPost(null)}>닫기</button>
                    </div>
              </div>
            )}
        </div>
    )
}