import { useEffect, useState } from "react";
import {getComments, addComment} from "../services/requestService";

export default function StaffComments({ requestId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getComments(requestId);
        if (active) setComments(data);
      } catch (err) {
        if (active) setMessage(err.message);
      }
    }

    load();
    return () => { active = false; };
  }, [requestId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!commentText.trim() || busy) return;

    setBusy(true);
    setMessage("");

    try {
      await addComment(
        requestId,
        currentUser.user_id,
        commentText.trim()
      );

      const updated = await getComments(requestId);
      setComments(updated);
      setCommentText("");
      setMessage("Comment added successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="staff-action-panel">
      <h3>Request Comments</h3>

      <div className="staff-comments-list">
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div
              className="staff-comment"
              key={comment.comment_id}
            >
              <strong>
                {comment.first_name} {comment.last_name}
              </strong>

              <p>{comment.content}</p>

              <small>
                {new Date(comment.created_at).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="staff-comment-text">
          Add a comment
        </label>

        <textarea
          id="staff-comment-text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment about this request..."
          rows={4}
          required
          disabled={busy}
        />

        <button
          type="submit"
          className="primary-button"
          disabled={!commentText.trim() || busy}
        >
          {busy ? "Posting..." : "Add Comment"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </section>
  );
}