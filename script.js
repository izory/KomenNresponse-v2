const sheetId = "13xLjhbICv4BGzHm1WCKom9Uof8A15g2axBjzTKbsVi0"; 
const gid = "234595483";

function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour < 24) return `${diffHour} hours ago`;
  if (diffDay === 1) {
    return `Yesterday at ${date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })}`;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).replace(",", " •");
}

function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

let commentsData = [];

async function loadComments() {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    const json = JSON.parse(text.substring(47, text.length - 2));

    let rows = json.table.rows || [];
    rows = rows.reverse();

    commentsData = rows.map(row => {
      const timestampStr = row.c[0]?.f || ""; // timestamp
      const name = row.c[1]?.v || "";          // name
      const association = row.c[2]?.v || "";   // association
      const comment = row.c[3]?.v || "";       // comment
      const response = row.c[4]?.v || "";      // admin response

      return { timestampStr, name, association, comment, response };
    });

    renderComments();
  } catch (err) {
    console.error("Error loading comments:", err);
    document.getElementById("comments").innerHTML =
      "<p>⚠️ Could not load comments. Check sheetId & permissions.</p>";
  }
}

function renderComments() {
  const container = document.getElementById("comments");
  container.innerHTML = "";

  commentsData.forEach(item => {
    if (item.name && item.comment && item.timestampStr) {
      const dateObj = new Date(item.timestampStr);
      const formatted = isNaN(dateObj)
        ? escapeHtml(item.timestampStr)
        : formatRelativeTime(dateObj);

      const el = document.createElement("div");
      el.className = "comment";
      el.innerHTML = `
        <div class="comment-header">
          <strong>${escapeHtml(item.name)}</strong>
          ${item.association ? `<span class="separator"> | </span><span class="association">${escapeHtml(item.association)}</span>` : ""}
          <span class="date">${formatted}</span>
        </div>
        <p>${escapeHtml(item.comment)}</p>
        ${
          item.response
            ? `<div class="admin-response"><strong>Admin:</strong> ${escapeHtml(item.response)}</div>`
            : ""
        }
      `;
      container.appendChild(el);
    }
  });
}

// load immediately and refresh
loadComments();
setInterval(loadComments, 5000);
