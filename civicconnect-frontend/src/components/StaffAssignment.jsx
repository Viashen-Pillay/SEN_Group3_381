import { useEffect, useState } from "react";
import {getStaffMembers,assignStaff,getAssignmentHistory} from "../services/requestService";

export default function StaffAssignment({ requestId, currentUser }) {
  const [staff, setStaff] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [members, assignments] = await Promise.all([
          getStaffMembers(),
          getAssignmentHistory(requestId)
        ]);

        if (!active) return;
        setStaff(members);
        setHistory(assignments);
      } catch (err) {
        if (active) setMessage(err.message);
      }
    }

    load();
    return () => { active = false; };
  }, [requestId]);

  const handleAssign = async () => {
    if (!selectedStaff || busy) return;

    setBusy(true);
    setMessage("");

    try {
      await assignStaff(
        requestId,
        Number(selectedStaff),
        currentUser.user_id
      );

      const assignments = await getAssignmentHistory(requestId);
      setHistory(assignments);
      setSelectedStaff("");
      setMessage("Staff member assigned successfully.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="staff-action-panel">
      <h3>Staff Assignment</h3>

      <label htmlFor="assign-staff">Assign request to</label>

      <select
        id="assign-staff"
        value={selectedStaff}
        onChange={(e) => setSelectedStaff(e.target.value)}
        disabled={busy}
      >
        <option value="">Select a staff member</option>

        {staff.map((member) => (
          <option key={member.user_id} value={member.user_id}>
            {member.first_name} {member.last_name}
          </option>
        ))}
      </select>

      <button
        className="primary-button"
        disabled={!selectedStaff || busy}
        onClick={handleAssign}
      >
        {busy ? "Saving..." : "Assign Staff"}
      </button>

      {message && <p role="status">{message}</p>}

      <h4>Assignment History</h4>

      {history.length === 0 ? (
        <p>No assignments recorded.</p>
      ) : (
        <ul className="staff-history-list">
          {history.map((entry) => (
            <li key={entry.assignment_history_id}>
              <strong>
                {entry.new_first_name} {entry.new_last_name}
              </strong>
              {" assigned by "}
              {entry.changed_by_first_name}{" "}
              {entry.changed_by_last_name}

              {entry.changed_at && (
                <small>
                  {new Date(entry.changed_at).toLocaleString()}
                </small>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}