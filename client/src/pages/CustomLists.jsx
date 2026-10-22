import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ListPlus,
  FolderPlus,
  Globe,
  Lock,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  ExternalLink,
  X,
  Check,
  Film,
  Sparkles,
  Loader2,
  MoreVertical,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getUserLists,
  createList,
  updateList,
  deleteList,
} from '../services/movieService'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/helpers'
import EmptyState from '../components/common/EmptyState'
import ConfirmDialog from '../components/common/ConfirmDialog'
import LoadingSpinner from '../components/common/LoadingSpinner'

const CustomLists = () => {
  const { user } = useAuth()
  const userId = user?._id || user?.id

  // Lists state
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal State (Create or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingList, setEditingList] = useState(null)
  const [modalForm, setModalForm] = useState({
    title: '',
    description: '',
    visibility: 'public',
  })
  const [submitting, setSubmitting] = useState(false)

  // Delete state
  const [listToDelete, setListToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch lists
  const fetchLists = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const res = await getUserLists(userId)
      const listData = res.data?.lists || res.lists || []
      setLists(listData)
    } catch (err) {
      toast.error(err.message || 'Failed to load custom lists')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingList(null)
    setModalForm({
      title: '',
      description: '',
      visibility: 'public',
    })
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (list) => {
    setEditingList(list)
    setModalForm({
      title: list.title || '',
      description: list.description || '',
      visibility: list.visibility || 'public',
    })
    setIsModalOpen(true)
  }

  // Save Modal Form (Create or Edit)
  const handleSaveModal = async (e) => {
    e.preventDefault()
    if (!modalForm.title.trim()) {
      toast.error('List title is required')
      return
    }

    try {
      setSubmitting(true)
      if (editingList) {
        // Update existing list
        const res = await updateList(editingList._id, {
          title: modalForm.title.trim(),
          description: modalForm.description.trim(),
          visibility: modalForm.visibility,
        })
        const updated = res.data?.list || res.list
        setLists((prev) =>
          prev.map((l) => (l._id === editingList._id ? { ...l, ...updated } : l))
        )
        toast.success(`List "${modalForm.title}" updated`)
      } else {
        // Create new list
        const res = await createList({
          title: modalForm.title.trim(),
          description: modalForm.description.trim(),
          visibility: modalForm.visibility,
        })
        const created = res.data?.list || res.list
        setLists((prev) => [created, ...prev])
        toast.success(`Created new list "${modalForm.title}"`)
      }

      setIsModalOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to save list')
    } finally {
      setSubmitting(false)
    }
  }

  // Delete List Execution
  const handleConfirmDelete = async () => {
    if (!listToDelete) return
    try {
      setDeleteLoading(true)
      await deleteList(listToDelete._id)
      setLists((prev) => prev.filter((l) => l._id !== listToDelete._id))
      toast.success(`Deleted list "${listToDelete.title}"`)
      setListToDelete(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete list')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cs-bg text-cs-text pb-20 pt-6 sm:pt-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-cs-border">
          <div>
            <div className="flex items-center gap-2 text-cs-accent mb-1.5">
              <Layers className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest font-bold">Collections</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cs-text">
              My Lists
            </h1>
            <p className="text-sm text-cs-text-secondary mt-1">
              Curate thematic watchlists, director filmographies, or award-season marathons.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cs-accent text-cs-bg font-bold text-sm shadow-cs-accent hover:bg-yellow-400 active:scale-95 transition-all self-start sm:self-auto"
          >
            <FolderPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New List</span>
          </button>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-cs-card border border-cs-border rounded-2xl p-6 h-52 animate-pulse"
                />
              ))}
            </div>
          ) : lists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => {
                const isPublic = list.visibility === 'public'
                const itemCount = list.items?.length ?? list.itemCount ?? 0

                return (
                  <div
                    key={list._id}
                    className="group relative flex flex-col justify-between bg-cs-card border border-cs-border hover:border-cs-accent/50 rounded-2xl p-6 shadow-cs hover:shadow-cs-lg transition-all duration-300"
                  >
                    <div>
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isPublic
                              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                              : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary'
                          }`}
                        >
                          {isPublic ? (
                            <>
                              <Globe className="w-3 h-3" />
                              <span>Public</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Private</span>
                            </>
                          )}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(list)}
                            className="p-1.5 rounded-lg text-cs-text-secondary hover:text-cs-accent hover:bg-cs-bg-secondary transition-colors"
                            title="Edit List Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setListToDelete(list)}
                            className="p-1.5 rounded-lg text-cs-text-secondary hover:text-cs-error hover:bg-cs-bg-secondary transition-colors"
                            title="Delete List"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <Link to={`/lists/${list._id}`} className="block group-hover:text-cs-accent transition-colors">
                        <h3 className="text-xl font-bold text-cs-text tracking-tight group-hover:text-cs-accent transition-colors line-clamp-1">
                          {list.title}
                        </h3>
                      </Link>

                      <p className="text-sm text-cs-text-secondary mt-2 line-clamp-2 leading-relaxed">
                        {list.description || 'No description provided for this collection.'}
                      </p>
                    </div>

                    {/* Footer: Item Count, Date, and CTA */}
                    <div className="mt-6 pt-4 border-t border-cs-border/60 flex items-center justify-between text-xs text-cs-text-secondary">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-cs-text flex items-center gap-1">
                          <Film className="w-3.5 h-3.5 text-cs-accent" />
                          <span>{itemCount} {itemCount === 1 ? 'title' : 'titles'}</span>
                        </span>
                        <span>•</span>
                        <span>{formatDate(list.createdAt)}</span>
                      </div>

                      <Link
                        to={`/lists/${list._id}`}
                        className="inline-flex items-center gap-1 font-bold text-cs-accent hover:underline"
                      >
                        <span>View</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={ListPlus}
              title="You haven't created any custom lists yet"
              description="Group movies into personalized marathons, thematic anthologies, or shareable top lists with friends."
              actionText="Create Your First List"
              onAction={handleOpenCreateModal}
              actionIcon={FolderPlus}
            />
          )}
        </div>
      </div>

      {/* Create / Edit List Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-cs-card border border-cs-border rounded-2xl p-6 sm:p-8 shadow-cs-lg animate-scale-in">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-cs-text-secondary hover:text-cs-text hover:bg-cs-bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cs-accent/15 border border-cs-accent/30 text-cs-accent flex items-center justify-center">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-cs-text">
                  {editingList ? 'Edit List Details' : 'Create Custom List'}
                </h3>
                <p className="text-xs text-cs-text-secondary">
                  Configure your list title, narrative context, and visibility
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Title input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cs-text mb-1.5">
                  List Title <span className="text-cs-accent">*</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  required
                  placeholder="e.g., Cyberpunk Noir Classics, Spooky October"
                  value={modalForm.title}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 bg-cs-bg-secondary border border-cs-border rounded-xl text-sm text-cs-text placeholder-cs-text-secondary/60 focus:outline-none focus:border-cs-accent transition-all"
                />
              </div>

              {/* Description input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cs-text mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Share the theme, criteria, or backstory of this curation..."
                  value={modalForm.description}
                  onChange={(e) =>
                    setModalForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full p-3 bg-cs-bg-secondary border border-cs-border rounded-xl text-sm text-cs-text placeholder-cs-text-secondary/60 focus:outline-none focus:border-cs-accent transition-all resize-y"
                />
              </div>

              {/* Visibility Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cs-text mb-2">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setModalForm((prev) => ({ ...prev, visibility: 'public' }))}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      modalForm.visibility === 'public'
                        ? 'bg-cs-accent/15 border-cs-accent text-cs-accent font-bold'
                        : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary hover:text-cs-text'
                    }`}
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Public</span>
                      <span className="text-[10px] text-cs-text-secondary block">
                        Visible to all users
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalForm((prev) => ({ ...prev, visibility: 'private' }))}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      modalForm.visibility === 'private'
                        ? 'bg-cs-accent/15 border-cs-accent text-cs-accent font-bold'
                        : 'bg-cs-bg-secondary border-cs-border text-cs-text-secondary hover:text-cs-text'
                    }`}
                  >
                    <Lock className="w-4 h-4 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Private</span>
                      <span className="text-[10px] text-cs-text-secondary block">
                        Only you can view
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cs-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl border border-cs-border text-xs font-semibold text-cs-text-secondary hover:text-cs-text hover:bg-cs-bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cs-accent text-cs-bg font-bold text-xs shadow-cs-accent hover:bg-yellow-400 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingList ? 'Save Changes' : 'Create List'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(listToDelete)}
        title="Delete Custom List"
        message={`Are you sure you want to permanently delete "${listToDelete?.title}"? All items saved in this list will be removed.`}
        confirmText="Delete List"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setListToDelete(null)}
      />
    </div>
  )
}

export default CustomLists
