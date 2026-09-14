(function () {
  const YOUR_EMAIL = "olatobiloba58@gmail.com";
  const BRAND_NAME = "CBQ Client Brief Questionnaire";

  const TOTAL_STEPS = 7;
  let currentStep = 1;
  let lastSubmission = null;

  const FIELD_LABELS = {
    clientName: "Your name",
    businessName: "Business / brand name",
    email: "Email",
    phone: "Phone",
    websiteType: "Website type",
    industry: "Industry / niche",
    serviceArea: "Location / service area",
    businessDescription: "Business description",
    pageGoals: "Website goals",
    primaryAction: "Primary call-to-action",
    targetAudience: "Target audience",
    uniqueValue: "Unique value",
    competitors: "Competitors",
    sections: "Page sections wanted",
    headline: "Headline / tagline",
    keyMessages: "Key messages",
    contentReady: "Content ready",
    brandColors: "Brand colors",
    designStyle: "Design style",
    inspirationSites: "Inspiration websites",
    avoidDesign: "Design to avoid",
    brandAssets: "Brand assets available",
    features: "Features needed",
    formFields: "Form fields to collect",
    integrations: "Tool integrations",
    socialMedia: "Social media accounts",
    domain: "Domain status",
    domainName: "Domain name",
    hosting: "Hosting status",
    existingSite: "Existing website",
    launchDate: "Launch timeline",
    budget: "Budget",
    ongoingNeeds: "Ongoing needs",
    additionalNotes: "Additional notes",
    referralSource: "How they found you",
  };

  const form = document.getElementById("clientBriefForm");
  const steps = document.querySelectorAll(".form-step");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const successMessage = document.getElementById("successMessage");
  const submissionSummary = document.getElementById("submissionSummary");
  const downloadedFilename = document.getElementById("downloadedFilename");
  const designerEmail = document.getElementById("designerEmail");
  const resetBtn = document.getElementById("resetBtn");
  const downloadTxtBtn = document.getElementById("downloadTxtBtn");
  const copyBtn = document.getElementById("copyBtn");

  designerEmail.textContent = YOUR_EMAIL;

  function updateProgress() {
    const pct = (currentStep / TOTAL_STEPS) * 100;
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `Section ${currentStep} of ${TOTAL_STEPS}`;
  }

  function showStep(step) {
    steps.forEach((el) => {
      el.classList.toggle("active", Number(el.dataset.step) === step);
    });

    prevBtn.disabled = step === 1;
    nextBtn.classList.toggle("hidden", step === TOTAL_STEPS);
    submitBtn.classList.toggle("hidden", step !== TOTAL_STEPS);

    updateProgress();
  }

  function getActiveStepEl() {
    return document.querySelector(`.form-step[data-step="${currentStep}"]`);
  }

  function validateStep() {
    const stepEl = getActiveStepEl();
    const requiredFields = stepEl.querySelectorAll("[required]");
    let valid = true;

    requiredFields.forEach((field) => {
      field.classList.remove("invalid");

      if (field.type === "radio") {
        const group = stepEl.querySelectorAll(`input[name="${field.name}"]`);
        const checked = Array.from(group).some((r) => r.checked);
        if (!checked) valid = false;
      } else if (!field.value.trim()) {
        valid = false;
        field.classList.add("invalid");
      }
    });

    return valid;
  }

  function collectFormData() {
    const formData = new FormData(form);
    const data = { submittedAt: new Date().toISOString() };

    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
      } else {
        data[key] = value;
      }
    }

    return data;
  }

  function formatValue(value) {
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  }

  function getFilename(data) {
    const name = (data.businessName || data.clientName || "client-brief")
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();
    return `cbq-${name}-brief.txt`;
  }

  function buildSummaryHtml(data) {
    return Object.entries(data)
      .filter(([key]) => key !== "submittedAt")
      .map(([key, value]) => {
        const label = FIELD_LABELS[key] || key;
        return `<div class="summary-row"><dt>${label}</dt><dd>${formatValue(value) || "—"}</dd></div>`;
      })
      .join("");
  }

  function buildTextReport(data) {
    const lines = [
      BRAND_NAME.toUpperCase(),
      "=".repeat(BRAND_NAME.length),
      `Submitted: ${new Date(data.submittedAt).toLocaleString()}`,
      "",
    ];

    Object.entries(data).forEach(([key, value]) => {
      if (key === "submittedAt") return;
      const label = FIELD_LABELS[key] || key;
      lines.push(`${label}:`);
      lines.push(formatValue(value) || "—");
      lines.push("");
    });

    lines.push("---");
    lines.push(`Please send this file to: ${YOUR_EMAIL}`);

    return lines.join("\n");
  }

  function downloadBrief(data) {
    const filename = getFilename(data);
    downloadedFilename.textContent = filename;

    const blob = new Blob([buildTextReport(data)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  nextBtn.addEventListener("click", () => {
    if (!validateStep()) return;

    if (currentStep < TOTAL_STEPS) {
      currentStep++;
      showStep(currentStep);
      document.getElementById("questionnaire").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  prevBtn.addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    lastSubmission = collectFormData();
    submissionSummary.innerHTML = buildSummaryHtml(lastSubmission);
    downloadBrief(lastSubmission);

    form.classList.add("hidden");
    successMessage.classList.remove("hidden");
    document.getElementById("questionnaire").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  downloadTxtBtn.addEventListener("click", () => {
    if (!lastSubmission) return;
    downloadBrief(lastSubmission);
    downloadTxtBtn.textContent = "Downloaded!";
    setTimeout(() => {
      downloadTxtBtn.textContent = "Download Again";
    }, 2000);
  });

  copyBtn.addEventListener("click", async () => {
    if (!lastSubmission) return;

    try {
      await navigator.clipboard.writeText(buildTextReport(lastSubmission));
      copyBtn.textContent = "Copied!";
      setTimeout(() => {
        copyBtn.textContent = "Copy Answers Instead";
      }, 2000);
    } catch {
      copyBtn.textContent = "Copy failed — use download";
    }
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    currentStep = 1;
    lastSubmission = null;
    submissionSummary.innerHTML = "";
    showStep(1);
    form.classList.remove("hidden");
    successMessage.classList.add("hidden");
  });

  showStep(1);
})();
