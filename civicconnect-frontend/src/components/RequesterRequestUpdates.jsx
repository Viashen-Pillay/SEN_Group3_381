import { useEffect, useState } from "react";
import {getAssignedStaff,getComments} from "../services/requestService";

export default function RequesterRequestUpdates({ requestId }) {
  const [assignedStaff, setAssignedStaff] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUpdates() {
      setLoading(true);
      setError("");
      setAssignedStaff(null);
      setComments([]);

      try {
        const [staff, requestComments] = await Promise.all([
          getAssignedStaff(requestId),
          getComments(requestId)
        ]);

        if (!active) return;

        setAssignedStaff(staff);
        setComments(requestComments);
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load request updates.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUpdates();

    return () => {
      active = false;
    };
  }, [requestId]);

  if (loading) {
    return <p>Loading request updates...</p>;
  }

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <div className="requester-updates">
      <section className="requester-assignment">
        <h3>Assigned Staff Member</h3>

        {assignedStaff ? (
          <p>
            {assignedStaff.first_name} {assignedStaff.last_name}
          </p>
        ) : (
          <p>Not assigned yet.</p>
        )}
      </section>

      <section className="requester-comments">
        <h3>Staff Comments</h3>

        {comments.length === 0 ? (
          <p>No comments have been added yet.</p>
        ) : (
          <div className="requester-comments-list">
            {comments.map((comment) => (
              <div
                className="requester-comment"
                key={comment.comment_id}
              >
                <strong>
                  {comment.first_name} {comment.last_name}
                </strong>

                <p>{comment.content}</p>

                <small>
                  {new Date(
                    comment.created_at
                  ).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}