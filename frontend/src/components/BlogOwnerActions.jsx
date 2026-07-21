import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { blogAPI } from '../lib/api'
import { useToast } from './Toast'
import ConfirmDeleteModal from './ConfirmDeleteModal'

/**
 * BlogOwnerActions — renders Edit + Delete only for the blog owner or admin.
 * Renders nothing for all other users.
 *
 * Props:
 *   blog      — blog object { _id, authorId, title, slug }
 *   onDeleted — optional callback(blogId) for list removal after delete
 *   variant   — 'card' (icon-only) | 'detail' (with text labels)
 */
function BlogOwnerActions({ blog, onDeleted, variant = 'detail' }) {
    const { user } = useAuth()
    const { addToast } = useToast()
    const navigate = useNavigate()
    const [showDelete, setShowDelete] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    if (!user) return null

    const isOwner = blog.authorId?.toString() === user._id?.toString()
    const isAdmin = user.role === 'admin'
    if (!isOwner && !isAdmin) return null

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await blogAPI.delete(blog._id)
            addToast('Blog deleted successfully.', 'success')
            setShowDelete(false)
            if (onDeleted) onDeleted(blog._id)
            else navigate('/blog')
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to delete blog', 'error')
        } finally {
            setIsDeleting(false)
        }
    }

    const isCard = variant === 'card'
    const btnStyle = { fontSize: isCard ? '0.75rem' : '0.875rem', padding: isCard ? '0.3rem 0.6rem' : undefined }

    return (
        <>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                    className="btn btn-ghost btn-sm"
                    style={btnStyle}
                    title="Edit blog"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/create-blog?edit=${blog._id}`) }}
                >
                    ✏️{!isCard && ' Edit'}
                </button>
                <button
                    className="btn btn-sm"
                    style={{ ...btnStyle, background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', border: 'none' }}
                    title="Delete blog"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDelete(true) }}
                >
                    🗑️{!isCard && ' Delete'}
                </button>
            </div>
            <ConfirmDeleteModal
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title={blog.title}
            />
        </>
    )
}

export default BlogOwnerActions
