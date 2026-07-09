function getCookie(name) {
  const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return m ? m.pop() : "";
}

async function req(path, options = {}) {
  const opts = { credentials: "include", headers: {}, ...options };
  if (opts.method && opts.method !== "GET") {
    opts.headers["X-CSRFToken"] = getCookie("csrftoken");
  }
  const res = await fetch(path, opts);
  return res;
}

export async function getMe() {
  const res = await req("/api/v1/me/");
  return res.ok ? res.json() : null;
}
export async function listCourses() {
  const res = await req("/api/v1/courses/");
  return res.ok ? res.json() : [];
}
export async function getCourseContent(id) {
  const res = await req(`/api/v1/courses/${id}/content/`);
  return res.ok ? res.json() : null;
}
