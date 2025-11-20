import { Suspense, useEffect, useState } from "react";
import { useAuthStore } from "@/zustand/useAuthStore";
import { usePostStore } from "@/zustand/usePostStore";
import { PostService } from "@/appwrite/post-service";
import toast from "react-hot-toast";
import CustomLoader from "@/lib/loader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash,  Heart, Send, MessageCircle } from "lucide-react";
import CreatePostModal from "@/components/modal/CreatePostModal";
import DeletePostModal from "@/components/modal/DeletePostModal";
import type {  Post } from "@/lib/interface";
import { ScrollArea } from "@/components/ui/scroll-area";

const CreatorHomePage = () => {
  const { user } = useAuthStore();
  const { posts, setPosts, toggleLikePost,updatePost } = usePostStore();
 
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingMedia, setEditingMedia] = useState<File | null>(null);
  const [isDeleteModalOpen,setIsDeleteModalOpen]=useState(false)
  const [postToDelete,setPostToDelete]=useState<Post | null>(null)

  // Comments modal state
  const [activeCommentModalPost, setActiveCommentModalPost] = useState<Post | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch posts of this user
  const fetchPosts = async () => {
    if (!user?.$id) return;
    setLoading(true);
    try {
      let data;
      if(user?.role?.toLowerCase()==="creator"){
     data=await PostService.fetchUserPosts(user.$id);
      }
      else{
        data=await PostService.fetchAllPosts();
      }
      const postsWithComments = await Promise.all(
        data.map(async (post: any) => {
          const comments = await PostService.fetchCommentsForPost(post.$id || post.id);
          return { ...post, comments };
        })
      );
      setPosts(postsWithComments as any);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* ---------- Post actions ---------- */



  // const handleEditPost = (post: Post) => {
  //   setEditingPost(post);
  //   setEditingTitle(post.title);
  //   setEditingDescription(post.description);
  //   setEditingMedia(null);
  // };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    setLoading(true);
    try {
      await PostService.updatePost(
        editingPost.$id,
        { title: editingTitle, description: editingDescription },
        editingMedia || undefined
      );
      setEditingPost(null);
      setEditingTitle("");
      setEditingDescription("");
      setEditingMedia(null);
      fetchPosts();
      toast.success("Post updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update post.");
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (post: Post) => {
    if (!user?.$id) return;
    toggleLikePost(post.$id, user.$id); // optimistic UI for post likes
    try {
      await PostService.toggleLikeToPost(post.$id, user.$id);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------- Comments Modal helpers ---------- */

  const openCommentsModal = async (post: Post) => {
    setModalLoading(true);
    try {
      const comments = await PostService.fetchCommentsForPost(post.$id);
      const freshPost = { ...post, comments };
      setActiveCommentModalPost(freshPost);
      updatePost(post.$id, { comments });
    } catch (err) {
      console.error(err);
      setActiveCommentModalPost(post);
    } finally {
      setModalLoading(false);
    }
  };

  const closeCommentsModal = () => setActiveCommentModalPost(null);

  /* ---------- Render ---------- */
  return (
    <div className="p-0 md:p-4">
      <div className="mb-4">
    <h2 className="text-3xl font-bold text-green-700 tracking-tight">
      {
        user?.role?.toLowerCase()==="creator"?"My Creations":
        "Explore Creations"
      }
    </h2>
    <p className="text-gray-500 text-sm mt-1">
    {
      user?.role?.toLowerCase()==="creator"?"Manage and update all the content you’ve uploaded.":
      "Browse, like, and comment on content shared by creators."
    }
    </p>
  </div>

      <CreatePostModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />

      {loading ?(
        <div className="flex gap-2 items-center">
          <CustomLoader size={20} />
          <span className="text-gray-600">Loading...</span>
        </div>
      ):!loading && posts.length === 0 ? (
        <div className="flex flex-col gap-2 mt-14 items-center">
          <p>No Post exists. Create your first post Now</p>
          <Button
            size={"sm"}
            variant={"outline"}
            className="border border-green-700 bg-transparent text-green-700 hover:text-green-700 hover:bg-transparent cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            Create Post
          </Button>
        </div>
      ):(
        <>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post,index) => (
          <article key={index} className="bg-white rounded-md shadow-sm overflow-hidden">
            {post.mediaURL && post.mediaType==="video" ? (
              <video src={post.mediaURL} autoPlay controls className="w-full  h-[400px] object-contain" />
            ) : (
              <img src={post.mediaURL} alt={post.title} className="w-full h-[400px] object-contain" />
            )}

            <div className="p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-lg">{post.title}</h3>
                <p className={`text-gray-600 mt-1 ${post.description.length>150?"line-clamp-3":""}`}>{
                post.description
                }
                </p>
                 <span>
                {post.description.length> 150 && (
                  <small
                   onClick={() => openCommentsModal(post as Post)}
                  className="text-red-600 cursor-pointer hover:underline">Read more...</small>
                )}
                </span>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLikePost(post as Post)}
                    aria-label="Like post"
                    className="flex items-center gap-2"
                  >
                    <Heart size={18} className={post?.likes?.includes(user?.$id!) ? "text-red-500" : ""} />
                    <span className="text-sm">{post?.likes?.length}</span>
                  </button>

                  <button
                    onClick={() => openCommentsModal(post as Post)}
                    className="flex items-center gap-2"
                    aria-label="Open comments"
                  >
                    <MessageCircle size={16} className="cursor-pointer" />
                    <span className="text-sm">{post?.commentsCount ?? post?.comments?.length ?? 0}</span>
                  </button>
                </div>

                {/* small user + edit/delete */}
                <div className="flex items-center justify-end gap-0">
                  <div className="flex items-center gap-2 mr-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={"https://github.com/shadcn.png"} />
                      <AvatarFallback>{user?.fullname?.charAt(0)}</AvatarFallback>
                    </Avatar>
                     {/* <div className="text-sm">{
                    user?.$id===post?.userId?"You":
                user?.fullname || "User"
                    }</div> */}
                    <div className="text-sm">{user?.fullname}</div>
                  </div>

                 {
                  user?.role?.toLowerCase()==="creator" && (
                     <div className="flex gap-1">
                    {/* <Button size="sm" variant="ghost" onClick={() => handleEditPost(post as any)}>
                      <Edit size={16} />
                    </Button> */}
                    <Button size="sm" variant="ghost"
                    className="text-red-600 cursor-pointer hover:text-red-600"
                    onClick={() => {
                      setPostToDelete(post)
                      setIsDeleteModalOpen(true)
                    }}>
                      <Trash size={16} />
                    </Button>
                  </div>
                  )
                 }
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md w-full max-w-lg">
            <h3 className="font-bold text-lg mb-2">Edit Post</h3>
            <Input placeholder="Title" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} />
            <Textarea placeholder="Description" value={editingDescription} onChange={(e) => setEditingDescription(e.target.value)} className="mt-2" />
            <div className="mt-2">
              <input type="file" accept="image/*,video/*" onChange={(e) => setEditingMedia(e.target.files ? e.target.files[0] : null)} />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button onClick={() => setEditingPost(null)} variant="outline">Cancel</Button>
              <Button onClick={handleUpdatePost} disabled={loading}>{loading ? <CustomLoader /> : "Update"}</Button>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {activeCommentModalPost && (
        <CommentsModal
          post={activeCommentModalPost}
          onClose={closeCommentsModal}
          updatePost={(updated:any) => updatePost(activeCommentModalPost.$id, updated)}
          refreshPostComments={async () => {
            // optional manual refresh inside modal
            const comments = await PostService.fetchCommentsForPost(activeCommentModalPost.$id);
            updatePost(activeCommentModalPost.$id, { comments, commentsCount: comments.length });
            setActiveCommentModalPost({ ...activeCommentModalPost, comments });
          }}
          modalLoading={modalLoading}
        />
      )}
        </>
      )
      
      }

      

     

      <Suspense fallback={null}>
  <DeletePostModal isOpen={isDeleteModalOpen}
  post={postToDelete!}
  setIsOpen={setIsDeleteModalOpen} />
  </Suspense>
    </div>
  );
};

/* ---------------- CommentsModal ---------------- */
const CommentsModal = ({ post, onClose, updatePost, refreshPostComments, modalLoading }: any) => {
  const { user } = useAuthStore();
  const [localPost, setLocalPost] = useState(post); // local copy inside modal to show optimistically
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => setLocalPost(post), [post]);

  // add comment optimistic
  const handleAddComment = async (text: string) => {
    if (!text.trim()) return;
    setAddingComment(true);

    const optimistic = {
      $id: crypto.randomUUID(),
      postId: post.$id,
      parentCommentId: null,
      userId: user?.$id!,
      text,
      likes: [],
      replies: [],
      userName: user?.fullname || "You",
    };
   console.log("post hia",post)
    // optimistic: update UI & store
    const optimisticUpdated = {
      ...localPost,
      commentsCount: (localPost.commentsCount || 0) + 1,
      comments: [...(localPost.comments || []), optimistic],
    };
    try {
      const saved = await PostService.addCommentToPost(post.$id, user?.username!, { userId: user?.$id!, text });
      // replace optimistic with saved (match by text + userId + fallback)
      const replacedComments = optimisticUpdated.comments.map((c: any) =>
        c.$id === optimistic.$id ? saved : c
      );
      setLocalPost({ ...optimisticUpdated, comments: replacedComments });
      updatePost({ comments: replacedComments, commentsCount: replacedComments.length });
    } catch (err:any) {
      console.error(err);
      toast.error(err?.message || err ||"Failed to add comment.");
      // revert
      await refreshPostComments();
    } finally {
      setAddingComment(false);
    }
  };

  // on close propagate localPost to store (already done on every update) then close
  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 px-4 flex  items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-md shadow-lg overflow-hidden z-70 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <div className="flex gap-2 items-center">
                <h3 className="font-semibold">{post.title}</h3> 
            <span className="text-sm flex gap-2 mt-0.5 text-red-600 items-center">
              {localPost?.commentsCount ?? localPost?.comments?.length ?? 0}
              {" "} comments
              </span>
            </div>           
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleClose} variant={"outline"} className="text-sm
             text-green-600 hover:text-green-600
             border border-green-600 cursor-pointer">Close</Button>
          </div>
        </div>
                 <ScrollArea className="overflow-auto p-4">
             <p className="text-xs text-gray-500">{post.description}</p>
        

        {/* Comments list */}
        <div className="p-4 overflow-auto flex-1 space-y-3">
          {modalLoading ? (
            <div className="flex items-center justify-center"><CustomLoader size={18} /></div>
          ) : (
            <CommentList
              post={localPost}
              updateLocalPost={(p: any) => {
                setLocalPost(p);
                updatePost({ comments: p.comments, commentsCount: p.commentsCount });
              }}
            />
          )}
        </div>

        {/* Add comment (fixed bottom) */}
        <div className="p-4 border-t">
          <AddCommentRow onAdd={handleAddComment} loading={addingComment} />
        </div>
          </ScrollArea>
      </div>
    </div>
  );
};

/* ---------------- CommentList + CommentItem inside modal ---------------- */

const CommentList = ({ post, updateLocalPost }: any) => {
  const {user}=useAuthStore()
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null);
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // ensure replies arrays exist
    if (!post.comments) post.comments = [];
  }, [post]);

  const toggleLike = async (comment: any) => {
    // optimistic update
    const userId = useAuthStore.getState().user?.$id;
    if (!userId) return;

    const updatedComments = post.comments.map((c: any) =>
      c.$id === comment.$id
        ? { ...c, likes: c.likes?.includes(userId) ? c.likes.filter((l: string) => l !== userId) : [...(c.likes || []), userId] }
        : c
    );
    const updated = { ...post, comments: updatedComments };
    updateLocalPost(updated);

    try {
      await PostService.toggleLikeToComment(comment.$id, userId);
    } catch (err) {
      console.error(err);
      // revert by refetching server data
      const fresh = await PostService.fetchCommentsForPost(post.$id);
      updateLocalPost({ ...post, comments: fresh });
    }
  };

  const addReply = async (commentId: string, text: string, onDone: () => void) => {
    const userId = useAuthStore.getState().user?.$id;
    if (!userId) return;

    const optimistic = {
      $id: crypto.randomUUID(),
      postId: post.$id,
      parentCommentId: commentId,
      userId,
      text,
      likes: [],
      userName: useAuthStore.getState().user?.username || "You",
    };

    const updatedComments = post.comments.map((c: any) =>
      c.$id === commentId ? { ...c, replies: [...(c.replies || []), optimistic] } : c
    );
    

    try {
      const saved = await PostService.addReplyToComment(post.$id, user?.username!, commentId, { userId, text });
      // replace optimistic reply
      const replaced = updatedComments.map((c: any) =>
        c.$id === commentId
          ? { ...c, replies: c.replies.map((r: any) => (r.$id === optimistic.$id ? saved : r)) }
          : c
      );
      updateLocalPost({ ...post, comments: replaced });
      onDone();
    } catch (err:any) {
      console.error(err);
      toast.error(err?.message || err || "Failed to add reply.");
      // revert by fetching fresh
      const fresh = await PostService.fetchCommentsForPost(post.$id);
      updateLocalPost({ ...post, comments: fresh });
    }
  };

  return (
    <div className="space-y-3">
      {(!post.comments || post.comments.length === 0) && (
        <div className="text-sm text-gray-500">No comments yet — be the first to comment.</div>
      )}

      {post.comments?.map((comment: any) => (
        <div key={comment.$id} className="border rounded-md p-3">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{
                user?.$id===comment?.userId?"You":
                comment.userName || "User"}</div>
                <div className="text-xs text-gray-400">{new Date(comment.$createdAt || Date.now()).toLocaleString()}</div>
              </div>
              <p className="text-sm mt-1">{comment.text}</p>

              <div className="flex items-center gap-3 mt-2 text-xs">
                <button onClick={() => toggleLike(comment)} className="flex items-center gap-1">
                  <Heart size={14} className={comment.likes?.includes(useAuthStore.getState().user?.$id!) ? "text-red-500" : ""} />
                  <span>{comment.likes?.length || 0}</span>
                </button>

                <button
              
                onClick={() => setOpenReplyFor(openReplyFor === comment.$id ? null : comment.$id)}
                 className="text-red-600 cursor-pointer">
                  Reply
                </button>

                {comment.replies && comment.replies.length > 0 && (
                  <button
                    onClick={() => setOpenReplies((s) => ({ ...s, [comment.$id]: !s[comment.$id] }))}
                    className="text-blue-600 cursor-pointer"
                  >
                    {openReplies[comment.$id] ? "Hide Replies" : `Show Replies (${comment.replies.length})`}
                  </button>
                )}
              </div>

              {/* Reply box inline */}
              {openReplyFor === comment.$id && (
                <InlineReply
                  onSubmit={async (txt) => {
                    await addReply(comment.$id, txt, () => setOpenReplyFor(null));
                  }}
                />
              )}

              {/* Replies list */}
              {openReplies[comment.$id] && comment.replies?.length > 0 && (
                <div className="mt-3 space-y-2 pl-4 border-l">
                  {comment.replies.map((r: any) => (
                    <div key={r.$id} className="text-sm">
                      <div className="font-medium text-xs">{
                      user?.$id===comment?.userId?"You":
                r.userName || "User"}</div>
                      <small>{r.text}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* Inline reply input used for a specific comment */
const InlineReply = ({ onSubmit }: { onSubmit: (text: string) => Promise<void> | void }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex gap-2 mt-3">
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a reply..." />
      <Button
        size="sm"
        onClick={async () => {
          if (!text.trim()) return;
          setLoading(true);
          try {
            await onSubmit(text.trim());
            setText("");
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading || !text.trim()}
      >
        {loading ? <CustomLoader size={12} /> : <Send size={16} />}
      </Button>
    </div>
  );
};

/* AddCommentRow placed at bottom of modal */
const AddCommentRow = ({ onAdd, loading }: { onAdd: (text: string) => Promise<void> | void; loading: boolean }) => {
  const [text, setText] = useState("");
  return (
    <div className="flex gap-2">
      <Input placeholder="Add a comment..." value={text} onChange={(e) => setText(e.target.value)} />
      <Button
        size="sm"
        onClick={async () => {
          if (!text.trim()) return;
          await onAdd(text.trim());
          setText("");
        }}
        disabled={loading || !text.trim()}
      >
        {loading ? <CustomLoader size={14} /> : <Send size={16} />}
      </Button>

      
    </div>

    
  );

  
};

export default CreatorHomePage;
