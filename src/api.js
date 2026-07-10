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
export async function createCourse(name, rubric) {
  const res = await req("/api/v1/courses/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, rubric }),
  });
  return res.ok ? res.json() : null;
}
export async function importPreview(courseId, file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await req(`/api/v1/courses/${courseId}/import/preview/`, {
    method: "POST",
    body: fd,
  });
  return res.json();
}
export async function importCommit(courseId, file, skipInvalid = false) {
  const fd = new FormData();
  fd.append("file", file);
  if (skipInvalid) fd.append("skip_invalid", "true");
  const res = await req(`/api/v1/courses/${courseId}/import/commit/`, {
    method: "POST",
    body: fd,
  });
  return { ok: res.ok, data: await res.json() };
}
export async function updateExam(courseId, examId, exam_size, pass_mark) {
  const res = await req(`/api/v1/courses/${courseId}/exams/${examId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exam_size, pass_mark }),
  });
  return { ok: res.ok, data: await res.json() };
}
