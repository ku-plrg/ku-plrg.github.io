document.addEventListener("DOMContentLoaded", function () {
  const countdownElements = document.querySelectorAll(".countdown");
  const formattedDeadlineElements = document.querySelectorAll(
    ".formatted-deadline"
  );

  countdownElements.forEach(function (element) {
    const deadline = new Date(element.getAttribute("data-deadline"));

    function updateCountdown() {
      const now = new Date();
      const aoeNow = new Date(now.getTime() - 21 * 60 * 60 * 1000);
      const timeDifference = deadline - aoeNow;

      if (timeDifference < 0) {
        element.innerHTML = "Deadline has passed";
        return;
      }

      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      element.innerHTML = `${days} days ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  });

  formattedDeadlineElements.forEach(function (element) {
    const deadline = new Date(element.getAttribute("data-deadline"));
    element.innerHTML = deadline.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });
});
