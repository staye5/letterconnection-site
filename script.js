const header = document.querySelector("[data-header]");

const updateHeader = () => {
  if (!header) return;
  header.toggleAttribute("data-scrolled", window.scrollY > 8);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

// Reserve-a-mailbox form: submit to Web3Forms without leaving the page.
const form = document.querySelector("[data-reserve-form]");
const status = document.querySelector("[data-form-status]");

function setStatus(message, kind) {
  if (!status) return;
  status.textContent = message;
  status.classList.remove("is-error", "is-success");
  if (kind === "error") status.classList.add("is-error");
  if (kind === "success") status.classList.add("is-success");
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const key = form.querySelector('input[name="access_key"]');
    if (!key || key.value.startsWith("REPLACE_WITH")) {
      setStatus("Online form isn't connected yet — please call 281-499-6245 to reserve a box.", "error");
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const original = button ? button.textContent : "";
    if (button) {
      button.disabled = true;
      button.textContent = "Sending...";
    }
    setStatus("", "");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        form.reset();
        setStatus("Thanks! We got your request and will call you back. Need it sooner? Call 281-499-6245.", "success");
      } else {
        setStatus("Something went wrong. Please call 281-499-6245 or email admin@letterconnection.com.", "error");
      }
    } catch (err) {
      setStatus("Couldn't send right now. Please call 281-499-6245 or email admin@letterconnection.com.", "error");
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = original;
      }
    }
  });
}
