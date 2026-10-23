/** Every ViewModel method resolves to one of these; the View decides how to render it. */
const ok = (type, data = {}) => ({ ok: true, type, data });
const fail = error => ({ ok: false, error });

module.exports = { ok, fail };
