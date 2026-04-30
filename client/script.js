
// Results panel state — MUST be here at top
let resultsExpanded = false;
let resultsIsResizing = false;
let resultsStartY = 0;
let resultsStartX = 0;
let resultsStartHeight = 0;
let resultsStartWidth = 0;
let resultsResizeType = null;

const EMAILJS_CONFIG = {
    serviceID: "service_rdnp30f",
    templateID: "template_y6wbv6p",
    userID: "XELUmp_fDtArUvl_v",
};

// Initialize EmailJS
function initializeEmailJS() {
    if (typeof emailjs !== "undefined") {
        emailjs.init(EMAILJS_CONFIG.userID);
    }
}

let currentStep = 1;
let selectedPlan = null;
let paymentData = {};

function openPricingModal() {
    document.getElementById("pricing-modal").classList.add("active");
    document.body.style.overflow = "hidden";
    resetPricingFlow();
}

function closePricingModal() {
    document.getElementById("pricing-modal").classList.remove("active");
    document.body.style.overflow = "auto";
}

function resetPricingFlow() {
    currentStep = 1;
    selectedPlan = null;
    paymentData = {};
    updateProgressSteps();
    showStep(1);

    // Reset all forms
    document.getElementById("payment-details-form").reset();
    clearAllErrors();
    document.getElementById("continue-to-payment").style.display = "none";
}

function updateProgressSteps() {
    document.querySelectorAll(".progress-step").forEach((step, index) => {
        step.classList.remove("active", "completed");
        const stepNum = parseInt(step.dataset.step);

        if (stepNum < currentStep) {
            step.classList.add("completed");
        } else if (stepNum === currentStep) {
            step.classList.add("active");
        }
    });
}

function showStep(step) {
    document.querySelectorAll(".pricing-step").forEach((s) => {
        s.classList.remove("active");
    });
    document.getElementById(`step-${step}`).classList.add("active");
    currentStep = step;
    updateProgressSteps();
}

function goToStep(step) {
    if (validateCurrentStep()) {
        showStep(step);
    }
}

// Plan Selection
function initializePricingModal() {
    // Billing toggle
    const billingToggle = document.getElementById("billing-toggle");
    billingToggle.addEventListener("change", updatePricingDisplay);

    // Plan selection buttons
    document.querySelectorAll(".select-plan").forEach((button) => {
        button.addEventListener("click", function () {
            // Remove active class from all cards
            document.querySelectorAll(".pricing-card").forEach((card) => {
                card.classList.remove("selected");
            });

            // Add active class to selected card
            const card = this.closest(".pricing-card");
            card.classList.add("selected");

            // Store selected plan
            const plan = this.dataset.plan;
            selectPlan(plan);

            // Show continue button
            document.getElementById("continue-to-payment").style.display = "block";
        });
    });

    // Continue to payment button
    document
        .getElementById("continue-to-payment")
        .addEventListener("click", function () {
            if (selectedPlan) {
                updateOrderSummary();
                goToStep(2);
            }
        });

    // Payment method tabs
    document.querySelectorAll(".payment-tab").forEach((tab) => {
        tab.addEventListener("click", function () {
            const method = this.dataset.method;

            // Update active tab
            document.querySelectorAll(".payment-tab").forEach((t) => {
                t.classList.remove("active");
            });
            this.classList.add("active");

            // Show corresponding form
            document.querySelectorAll(".payment-form").forEach((form) => {
                form.classList.remove("active");
            });
            document.getElementById(`${method}-form`).classList.add("active");
        });
    });

    // Form validation
    initializeFormValidation();

    // Process payment
    document
        .getElementById("payment-details-form")
        .addEventListener("submit", processPayment);
}

function updatePricingDisplay() {
    const isYearly = document.getElementById("billing-toggle").checked;
    const monthlyElements = document.querySelectorAll(".price-monthly");
    const yearlyElements = document.querySelectorAll(".price-yearly");

    if (isYearly) {
        monthlyElements.forEach((el) => (el.style.display = "none"));
        yearlyElements.forEach((el) => (el.style.display = "flex"));
    } else {
        monthlyElements.forEach((el) => (el.style.display = "flex"));
        yearlyElements.forEach((el) => (el.style.display = "none"));
    }

    // Update selected plan if exists
    if (selectedPlan) {
        updatePlanPrice(selectedPlan.name.toLowerCase());
    }
}

function selectPlan(planName) {
    const plans = {
        basic: { name: "Basic", monthly: 5, yearly: 48 },
        pro: { name: "Professional", monthly: 10, yearly: 96 },
        business: { name: "Business", monthly: 30, yearly: 288 },
    };

    const plan = plans[planName];
    if (!plan) return;

    selectedPlan = {
        id: planName,
        name: plan.name,
        monthlyPrice: plan.monthly,
        yearlyPrice: plan.yearly,
        isYearly: document.getElementById("billing-toggle").checked,
    };

    selectedPlan.currentPrice = selectedPlan.isYearly
        ? selectedPlan.yearlyPrice
        : selectedPlan.monthlyPrice;
    selectedPlan.billingCycle = selectedPlan.isYearly ? "yearly" : "monthly";
}

function updatePlanPrice(planName) {
    if (selectedPlan && selectedPlan.id === planName) {
        selectPlan(planName);
    }
}

function updateOrderSummary() {
    if (!selectedPlan) return;

    const price = selectedPlan.isYearly
        ? selectedPlan.yearlyPrice
        : selectedPlan.monthlyPrice;
    const billingText = selectedPlan.isYearly ? "Yearly" : "Monthly";

    document.getElementById("summary-plan-name").textContent =
        `${selectedPlan.name} Plan`;
    document.getElementById("summary-plan-price").textContent =
        `$${price.toFixed(2)}`;
    document.getElementById("summary-billing").textContent = billingText;
    document.getElementById("summary-total").textContent = `$${price.toFixed(2)}`;
}

// Form Validation
function initializeFormValidation() {
    // Real-time validation
    const inputs = document.querySelectorAll(
        "#payment-details-form input[required]",
    );
    inputs.forEach((input) => {
        input.addEventListener("blur", validateField);
        input.addEventListener("input", clearFieldError);
    });

    // Card number formatting
    const cardNumberInput = document.getElementById("card-number");
    cardNumberInput.addEventListener("input", formatCardNumber);

    // Expiry date formatting
    const expiryInput = document.getElementById("card-expiry");
    expiryInput.addEventListener("input", formatExpiryDate);
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\D/g, "");
    value = value.replace(/(\d{4})/g, "$1 ").trim();
    e.target.value = value.substring(0, 19);
}

function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
        value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    e.target.value = value.substring(0, 5);
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldId = field.id;

    clearFieldError(e);

    if (!value) {
        showError(fieldId, "This field is required");
        return false;
    }

    switch (fieldId) {
        case "email":
            if (!isValidEmail(value)) {
                showError(fieldId, "Please enter a valid email address");
                return false;
            }
            break;

        case "card-number":
            if (!isValidCardNumber(value)) {
                showError(fieldId, "Please enter a valid card number");
                return false;
            }
            break;

        case "card-expiry":
            if (!isValidExpiryDate(value)) {
                showError(fieldId, "Please enter a valid expiry date (MM/YY)");
                return false;
            }
            break;

        case "card-cvc":
            if (!isValidCVC(value)) {
                showError(fieldId, "Please enter a valid CVC (3-4 digits)");
                return false;
            }
            break;

        case "billing-zip":
            if (!isValidZipCode(value)) {
                showError(fieldId, "Please enter a valid ZIP/postal code");
                return false;
            }
            break;
    }

    return true;
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove("error");
    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
        errorElement.classList.remove("show");
    }
}

function clearAllErrors() {
    document.querySelectorAll(".form-error").forEach((el) => {
        el.classList.remove("show");
    });
    document.querySelectorAll("input").forEach((input) => {
        input.classList.remove("error");
    });
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (field && errorElement) {
        field.classList.add("error");
        errorElement.textContent = message;
        errorElement.classList.add("show");
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/\s/g, "");
    return /^\d{13,19}$/.test(cleaned);
}

function isValidExpiryDate(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

    const [month, year] = expiry.split("/").map(Number);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }

    return true;
}

function isValidCVC(cvc) {
    return /^\d{3,4}$/.test(cvc);
}

function isValidZipCode(zip) {
    return /^[A-Z0-9\s-]{3,10}$/i.test(zip);
}

function validateCurrentStep() {
    if (currentStep === 2) {
        return validatePaymentForm();
    }
    return true;
}

function validatePaymentForm() {
    let isValid = true;
    const requiredFields = document.querySelectorAll(
        "#payment-details-form input[required]",
    );

    requiredFields.forEach((field) => {
        const event = new Event("blur");
        field.dispatchEvent(event);
        if (field.classList.contains("error")) {
            isValid = false;
        }
    });

    // Check terms agreement
    const termsAgree = document.getElementById("terms-agree");
    if (!termsAgree.checked) {
        showError("terms", "You must agree to the Terms of Service");
        isValid = false;
    }

    return isValid;
}

// Payment Processing
async function processPayment(e) {
    e.preventDefault();

    if (!validatePaymentForm()) {
        showNotification("Please fix the errors in the form", "error");
        return;
    }

    // Collect payment data
    paymentData = {
        plan: selectedPlan,
        customer: {
            name: document.getElementById("full-name").value,
            email: document.getElementById("email").value,
        },
        paymentMethod: document.querySelector(".payment-tab.active").dataset.method,
        timestamp: new Date().toISOString(),
    };

    // Show processing
    const submitBtn = document.getElementById("process-payment");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    try {
        // Simulate API call
        await simulatePaymentProcessing();

        // Show success
        showConfirmation();
    } catch (error) {
        // Show error
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showNotification("Payment failed. Please try again.", "error");
    }
}

async function simulatePaymentProcessing() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 90% success rate simulation
            if (Math.random() < 0.9) {
                resolve({
                    success: true,
                    transactionId:
                        "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    amount: selectedPlan.currentPrice,
                    currency: "USD",
                    status: "completed",
                });
            } else {
                reject(new Error("Payment processing failed"));
            }
        }, 2000);
    });
}

function showConfirmation() {
    const transactionId =
        "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const now = new Date();

    // Update confirmation details
    document.getElementById("confirmation-plan").textContent = selectedPlan.name;
    document.getElementById("confirmation-amount").textContent =
        `$${selectedPlan.currentPrice.toFixed(2)}`;
    document.getElementById("confirmation-txid").textContent = transactionId;
    document.getElementById("confirmation-date").textContent =
        now.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

    // Save to user's purchase history
    savePurchaseHistory(transactionId);

    // Update user's plan in localStorage
    updateUserPlan();

    // Show step 3
    goToStep(3);
}

function savePurchaseHistory(transactionId) {
    const purchase = {
        id: transactionId,
        plan: selectedPlan.name,
        amount: selectedPlan.currentPrice,
        billing: selectedPlan.billingCycle,
        date: new Date().toISOString(),
        status: "active",
    };

    let purchases = JSON.parse(localStorage.getItem("user_purchases") || "[]");
    purchases.push(purchase);
    localStorage.setItem("user_purchases", JSON.stringify(purchases));

    // Also update current plan
    localStorage.setItem(
        "user_plan",
        JSON.stringify({
            name: selectedPlan.name,
            id: selectedPlan.id,
            expires: new Date(
                Date.now() + (selectedPlan.isYearly ? 365 : 30) * 24 * 60 * 60 * 1000,
            ).toISOString(),
            features: getPlanFeatures(selectedPlan.id),
        }),
    );
}

function updateUserPlan() {
    // Update UI to show premium features
    const userPlan = JSON.parse(localStorage.getItem("user_plan"));
    if (userPlan) {
        showNotification(`🎉 Your ${userPlan.name} plan is now active!`, "success");

        // Update any UI elements that show plan status
        const planBadge = document.createElement("div");
        planBadge.className = "plan-badge";
        planBadge.innerHTML = `<i class="fas fa-crown"></i> ${userPlan.name}`;
        // Add to appropriate place in your UI
    }
}

function getPlanFeatures(planId) {
    const features = {
        basic: ["100_ai_checks", "50_plagiarism_checks", "basic_analytics"],
        pro: [
            "500_ai_checks",
            "200_plagiarism_checks",
            "advanced_analytics",
            "api_access",
        ],
        business: [
            "unlimited_checks",
            "team_management",
            "priority_support",
            "full_api",
        ],
    };
    return features[planId] || [];
}

function downloadInvoice() {
    showNotification(
        "Invoice download will be available in the full version",
        "info",
    );
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    // Update pricing link in navbar
    const pricingLink = document
        .querySelector(".dropdown-item i.fa-tag")
        ?.closest("a");
    if (pricingLink) {
        pricingLink.addEventListener("click", function (e) {
            e.preventDefault();
            openPricingModal();
        });
    }

    initializePricingModal();

    // Close modal on overlay click
    document
        .getElementById("pricing-modal")
        .addEventListener("click", function (e) {
            if (e.target === this) {
                closePricingModal();
            }
        });

    // Close on Escape key
    document.addEventListener("keydown", function (e) {
        if (
            e.key === "Escape" &&
            document.getElementById("pricing-modal").classList.contains("active")
        ) {
            closePricingModal();
        }
    });
});

// Add this function to initialize theme properly
function initializeTheme() {
    const savedTheme = localStorage.getItem("textguard_theme") || "dark";
    const html = document.documentElement;

    // Set theme attribute
    html.setAttribute("data-theme", savedTheme);

    // Update theme switch
    const themeSwitch = document.getElementById("theme-switch");
    if (themeSwitch) {
        themeSwitch.checked = savedTheme === "light";
    }

    // Apply theme to all pages
    applyThemeToAllElements();

    console.log("Theme initialized:", savedTheme);
}

// Apply theme to all elements
function applyThemeToAllElements() {
    const theme = document.documentElement.getAttribute("data-theme");

    // Update CSS variables
    if (theme === "light") {
        document.documentElement.style.setProperty("--bg-primary", "#ffffff");
        document.documentElement.style.setProperty("--bg-secondary", "#f8fafc");
        document.documentElement.style.setProperty("--text-primary", "#1e293b");
        document.documentElement.style.setProperty("--text-secondary", "#64748b");
        document.documentElement.style.setProperty("--border-color", "#e2e8f0");
    } else {
        document.documentElement.style.setProperty("--bg-primary", "#0f172a");
        document.documentElement.style.setProperty("--bg-secondary", "#1e293b");
        document.documentElement.style.setProperty("--text-primary", "#f1f5f9");
        document.documentElement.style.setProperty("--text-secondary", "#94a3b8");
        document.documentElement.style.setProperty(
            "--border-color",
            "rgba(148, 163, 184, 0.1)",
        );
    }
}

// Update the existing theme toggle event listener in script.js
const themeSwitch = document.getElementById("theme-switch");
if (themeSwitch) {
    themeSwitch.addEventListener("change", function () {
        const newTheme = this.checked ? "light" : "dark";

        // Update theme attribute
        document.documentElement.setAttribute("data-theme", newTheme);

        // Save preference
        localStorage.setItem("textguard_theme", newTheme);

        // Apply theme
        applyThemeToAllElements();

        // Update charts if they exist
        if (typeof renderCharts === "function") {
            setTimeout(renderCharts, 100);
        }

        // Show notification
        showNotification(`Switched to ${newTheme} mode`, "success");

        console.log("Theme changed to:", newTheme);
    });
}

// Update the simulateSendVerificationEmail function:
async function sendRealVerificationEmail(email, code) {
    try {
        if (typeof emailjs !== "undefined") {
            const templateParams = {
                to_email: email,
                verification_code: code,
                website_name: "TextGuard AI",
                date: new Date().toLocaleDateString(),
            };

            await emailjs.send(
                EMAILJS_CONFIG.serviceID,
                EMAILJS_CONFIG.templateID,
                templateParams,
            );

            console.log("Verification email sent successfully!");
            return true;
        } else {
            throw new Error("EmailJS not loaded");
        }
    } catch (error) {
        console.error("Failed to send email:", error);
        return false;
    }
}

// Update handleSignup function:
async function handleSignupWithEmail(e) {
    e.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById(
        "signup-confirm-password",
    ).value;
    const termsAgree = document.getElementById("terms-agree").checked;

    // Clear previous errors
    clearAuthErrors();

    // Validate inputs
    if (!name) {
        showError("signup-name-error", "Please enter your full name");
        return;
    }

    if (!validateEmail(email)) {
        showError("signup-email-error", "Please enter a valid email address");
        return;
    }

    if (password.length < 8) {
        showError(
            "signup-password-error",
            "Password must be at least 8 characters",
        );
        return;
    }

    if (password !== confirmPassword) {
        showError("signup-confirm-error", "Passwords do not match");
        return;
    }

    if (!termsAgree) {
        showError(
            "signup-confirm-error",
            "You must agree to the terms and conditions",
        );
        return;
    }

    // Check if email already exists
    const users = JSON.parse(localStorage.getItem("textguard_users") || "[]");
    if (users.some((u) => u.email === email)) {
        showError("signup-email-error", "Email already registered");
        return;
    }

    // Show loading state
    const submitBtn = document.querySelector("#signup-form .auth-submit");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;

    try {
        // Generate verification code
        verificationCode = generateVerificationCode();

        // Try to send real email
        const emailSent = await sendRealVerificationEmail(email, verificationCode);

        if (!emailSent) {
            // Fallback to demo mode
            console.log("Using demo mode for email verification");
            createVerificationDemoPanel(email, verificationCode);
        }

        // Create user object
        const user = {
            id: generateUserId(),
            name: name,
            email: email,
            password: hashPassword(password),
            verified: false,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            plan: "free",
            profile: {
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
                bio: "",
                location: "",
                website: "",
                joined: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
            },
            settings: {
                theme: "dark",
                notifications: true,
                emailNotifications: true,
                autoSave: true,
                language: "en",
                privacy: {
                    showAnalytics: true,
                    shareData: false,
                    publicProfile: false,
                },
            },
            analytics: {
                totalAnalyses: 0,
                totalCharacters: 0,
                aiDetections: 0,
                plagiarismDetections: 0,
                recentAnalyses: [],
            },
        };

        // Save user (temporarily for verification)
        const pendingUsers = JSON.parse(
            localStorage.getItem("textguard_pending_users") || "{}",
        );
        pendingUsers[email] = {
            user: user,
            verificationCode: verificationCode,
            expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        };
        localStorage.setItem(
            "textguard_pending_users",
            JSON.stringify(pendingUsers),
        );

        // Show verification tab
        showVerificationTab(email);

        // Show success message
        if (emailSent) {
            showNotification(
                "Verification code sent to your email! Check your inbox.",
                "success",
            );
        } else {
            showNotification(
                "Verification code shown below (demo mode). In production, this would be emailed.",
                "info",
            );
        }
    } catch (error) {
        showError(
            "signup-email-error",
            "Failed to create account. Please try again.",
        );
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Main Application Script
let currentMode = "ai";
let analysisResults = null;
let analyticsData = {
    totalAnalyses: 0,
    totalCharacters: 0,
    aiDetections: 0,
    plagiarismDetections: 0,
    recentAnalyses: [],
};

// Cache for consistent results - same text gets same analysis
let analysisCache = {};

// Check authentication status and sync with auth.js
function checkAuthStatus() {
    const userData = localStorage.getItem("textguard_user");
    const authToken = localStorage.getItem("textguard_token");

    if (userData && authToken) {
        try {
            // Sync with auth.js currentUser
            if (typeof currentUser === "undefined") {
                currentUser = JSON.parse(userData);
            }
            enableAnalyzer();
        } catch (error) {
            console.error("Error parsing user data:", error);
            if (typeof logout === "function") {
                logout();
            }
        }
    } else {
        // Check if user wants to continue as guest
        const guestMode = sessionStorage.getItem("textguard_guest");
        if (guestMode === "true") {
            enableAnalyzer();
        } else {
            disableAnalyzer();
        }
    }
}

// When image is uploaded/changed
function handleAvatarUpload() {
    const avatarImg = document.querySelector(".profile-avatar img");
    if (avatarImg) {
        // Remove circle styling
        avatarImg.style.borderRadius = "8px";
        avatarImg.classList.remove("circle", "rounded-full");
        avatarImg.classList.add("no-circle");

        // Also update the parent container
        const avatarContainer = avatarImg.closest(".profile-avatar");
        if (avatarContainer) {
            avatarContainer.style.borderRadius = "8px";
            avatarContainer.classList.remove("circle", "rounded-full");
            avatarContainer.classList.add("no-circle");
        }
    }
}

// Run when page loads
document.addEventListener("DOMContentLoaded", function () {
    // Check if current image should be square (not a default avatar)
    const avatarImg = document.querySelector(".profile-avatar img");
    if (avatarImg && !avatarImg.src.includes("default-avatar")) {
        avatarImg.style.borderRadius = "8px";
    }

    // Monitor for image changes
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.addEventListener("change", handleAvatarUpload);
    }
});

// Add this to initialize the terms checkbox
document.addEventListener("DOMContentLoaded", function () {
    // Auto-check terms for demo purposes (optional - remove in production)
    const termsCheckbox = document.getElementById("terms-agree");
    if (termsCheckbox) {
        // Auto-check for demo convenience
        termsCheckbox.checked = true;
        console.log("Demo: Terms checkbox auto-checked for user convenience");

        // Add visual feedback when user checks/unchecks
        termsCheckbox.addEventListener("change", function () {
            const termsError = document.getElementById("terms-error");
            if (termsError) {
                if (this.checked) {
                    termsError.style.display = "none";
                    this.style.outline = "2px solid #10b981";
                    setTimeout(() => {
                        this.style.outline = "";
                    }, 1000);
                }
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("Initializing TextGuard AI...");

    // Initialize auth first
    if (typeof initializeAuth === "function") {
        initializeAuth();
    }

    // Check authentication status - sync with auth.js
    checkAuthStatus();

    // Load analytics from localStorage
    loadAnalytics();

    // Setup event listeners
    setupEventListeners();

    // Initialize dashboard
    renderDynamicDashboard();

    // Initialize model card
    renderModelCard();

    // Setup hero animations
    setupHeroAnimations();

    // Setup theme from localStorage
    const savedTheme = localStorage.getItem("textguard_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const themeSwitch = document.getElementById("theme-switch");
    if (themeSwitch) {
        themeSwitch.checked = savedTheme === "light";
    }

    console.log("TextGuard AI initialized successfully!");
});

function showLoginPrompt() {
    const loginPrompt = document.getElementById("login-prompt");
    if (loginPrompt) {
        loginPrompt.style.display = "flex";
    }
}

// Update enableAnalyzer function:
function enableAnalyzer() {
    const analyzeBtn = document.getElementById("analyze-btn");
    const textInput = document.getElementById("text-input");

    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        if (currentUser) {
            analyzeBtn.title = "Analyze text";
        } else {
            analyzeBtn.title = "Analyze text (Guest mode)";
        }
    }

    if (textInput) {
        textInput.disabled = false;
        updateModePlaceholder();
    }
}

// Update disableAnalyzer function:
function disableAnalyzer() {
    const analyzeBtn = document.getElementById("analyze-btn");
    const textInput = document.getElementById("text-input");

    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.title = "Please sign in to analyze text";
    }

    if (textInput) {
        textInput.disabled = true;
        textInput.placeholder = "Please sign in to analyze text...";
    }
}

// Add continueAsGuest function:
function continueAsGuest() {
    const loginPrompt = document.getElementById("login-prompt");
    if (loginPrompt) {
        loginPrompt.style.display = "none";
    }

    sessionStorage.setItem("textguard_guest", "true");
    enableAnalyzer();

    showNotification(
        "Continuing as guest. Sign in to save your analysis history.",
        "info",
    );
}

// Simple auth service
const AuthService = {
    init() {
        this.handleAuthCallback();
    },

    handleAuthCallback() {
        const url = new URL(window.location);
        const params = url.searchParams;

        const auth = params.get("auth");
        const error = params.get("error");
        const email = params.get("email");
        const name = params.get("name");
        const token = params.get("token");

        if (auth === "success") {
            // Store user data
            const user = {
                email: email,
                name: name || email.split("@")[0],
                token: token,
            };

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token || "");

            // Show success
            this.showNotification(`Welcome, ${user.name}!`, "success");

            // Clean URL
            this.cleanUrl();

            // Update UI
            this.updateUI();

            return true;
        }

        if (error) {
            let message = "Authentication failed. ";

            switch (error) {
                case "auth_failed":
                    message = "Google authentication failed.";
                    break;
                case "no_code":
                    message = "No authorization code received.";
                    break;
                case "token_failed":
                    message = "Could not get access token.";
                    break;
                case "no_email":
                    message = "No email found in Google account.";
                    break;
                case "timeout":
                    message = "Request timed out. Try again.";
                    break;
                default:
                    message = "Please try again.";
            }

            this.showNotification(message, "error");
            this.cleanUrl();
            return false;
        }

        return false;
    },

    cleanUrl() {
        const url = new URL(window.location);
        const params = ["auth", "error", "email", "name", "token"];
        params.forEach((param) => url.searchParams.delete(param));
        window.history.replaceState({}, "", url.toString());
    },

    updateUI() {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);

                // Update navbar
                const loginBtn = document.querySelector(".login-btn");
                const userMenu = document.querySelector(".user-menu");
                const userName = document.querySelector(".user-name");

                if (loginBtn) loginBtn.style.display = "none";
                if (userMenu) userMenu.style.display = "flex";
                if (userName) userName.textContent = user.name;
            } catch (e) {
                console.error("Error parsing user:", e);
            }
        }
    },

    showNotification(message, type = "info") {
        // Simple notification
        alert(`${type.toUpperCase()}: ${message}`);
    },

    // Google Sign In
    loginWithGoogle() {
        window.location.href = "http://127.0.0.1:5000/auth/google";
    },

    // Check if logged in
    isLoggedIn() {
        return !!localStorage.getItem("user");
    },

    // Logout
    logout() {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        this.updateUI();
        window.location.reload();
    },
};

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
    AuthService.init();

    // Make functions available globally
    window.loginWithGoogle = () => AuthService.loginWithGoogle();
    window.signUpWithGoogle = () => AuthService.loginWithGoogle();
});

// Create a deterministic hash for consistent results
function createTextHash(text, mode) {
    // Simple hash function that produces same output for same input
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Add mode to hash
    hash = (hash << 5) - hash + mode.charCodeAt(0);
    hash = hash & hash;

    // Return as string
    return Math.abs(hash).toString();
}

// Check cache for existing analysis
function getCachedAnalysis(text, mode) {
    const textHash = createTextHash(text, mode);
    const cacheKey = `${mode}_${textHash}`;

    // Check if we have this analysis in cache
    if (analysisCache[cacheKey]) {
        // Check if cache is still valid (less than 1 hour old)
        const cacheAge = Date.now() - analysisCache[cacheKey].timestamp;
        if (cacheAge < 60 * 60 * 1000) {
            // 1 hour
            console.log("Using cached analysis");
            return analysisCache[cacheKey].results;
        }
    }

    return null;
}

// Store analysis in cache
function cacheAnalysis(text, mode, results) {
    const textHash = createTextHash(text, mode);
    const cacheKey = `${mode}_${textHash}`;

    analysisCache[cacheKey] = {
        timestamp: Date.now(),
        results: results,
    };

    // Limit cache size to 100 entries
    const keys = Object.keys(analysisCache);
    if (keys.length > 100) {
        // Remove oldest entry
        let oldestKey = keys[0];
        let oldestTime = analysisCache[oldestKey].timestamp;

        for (const key of keys) {
            if (analysisCache[key].timestamp < oldestTime) {
                oldestKey = key;
                oldestTime = analysisCache[key].timestamp;
            }
        }
        delete analysisCache[oldestKey];
    }
}

// Update the analyzeText function to use cache
async function analyzeText() {
    // Check if user is authenticated or in guest mode
    if (!currentUser && sessionStorage.getItem("textguard_guest") !== "true") {
        showLoginPrompt();
        return;
    }

    const textInput = document.getElementById("text-input");
    const analyzeBtn = document.getElementById("analyze-btn");
    const loadingState = document.getElementById("loading-state");
    const resultsContent = document.getElementById("results-content");

    if (!textInput || !analyzeBtn) return;

    const text = textInput.value.trim();

    // Validation
    if (!text) {
        showNotification("Please enter some text to analyze", "warning");
        return;
    }

    if (text.length < 50) {
        showNotification(
            "Text is too short. Please enter at least 50 characters",
            "warning",
        );
        return;
    }

    // Check cache first
    const cachedResults = getCachedAnalysis(text, currentMode);
    if (cachedResults) {
        // Use cached results
        analysisResults = cachedResults;
        displayResults();
        showNotification("Analysis complete! (Using cached results)", "success");
        return;
    }

    // Show loading
    if (loadingState) loadingState.style.display = "flex";
    if (resultsContent) resultsContent.style.display = "none";

    analyzeBtn.disabled = true;
    const originalText = analyzeBtn.innerHTML;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate demo results - using deterministic algorithm
        analysisResults = generateConsistentResults(text, currentMode);
        analysisResults.analysis_time = "1.8s";

        // Cache the results
        cacheAnalysis(text, currentMode, analysisResults);

        // Update analytics
        updateAnalytics(text, analysisResults);

        // Display results
        displayResults();

        showNotification("Analysis complete!", "success");
    } catch (error) {
        console.error("Analysis error:", error);
        showNotification("Analysis failed. Please try again.", "error");

        // Show error state
        if (resultsContent) {
            resultsContent.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #f59e0b; margin-bottom: 1rem;"></i>
                    <h3>Analysis Failed</h3>
                    <p>Please try again</p>
                </div>
            `;
            resultsContent.style.display = "block";
        }
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = originalText;
        if (loadingState) loadingState.style.display = "none";
    }
}

// Generate consistent results for same text
function generateConsistentResults(text, mode) {
    const textHash = createTextHash(text, mode);

    // Convert hash to a number between 0 and 1
    const seed = (parseInt(textHash) % 10000) / 10000;

    if (mode === "ai") {
        // Deterministic AI probability based on text content
        const words = text.toLowerCase().split(/\s+/);
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

        // Calculate some text features deterministically
        const avgWordLength =
            words.reduce((sum, word) => sum + word.length, 0) / words.length;
        const sentenceComplexity = sentences.length / Math.max(1, words.length);
        const punctuationRatio =
            (text.match(/[.,!?;:]/g) || []).length / text.length;

        // Create a deterministic score based on text features
        let aiProbability = 0.5;

        // Adjust probability based on text characteristics
        if (avgWordLength > 5) aiProbability += 0.1;
        if (sentenceComplexity < 0.1) aiProbability += 0.15;
        if (punctuationRatio < 0.02) aiProbability += 0.1;

        // Add some variation based on seed but keep it consistent
        aiProbability += (seed - 0.5) * 0.2;

        // Ensure probability stays within bounds
        aiProbability = Math.max(0.1, Math.min(0.9, aiProbability));

        const confidence = 0.7 + seed * 0.25;

        // Generate deterministic sentence predictions
        const sentencePredictions = sentences.map((sentence, index) => {
            const sentenceSeed = ((parseInt(textHash) + index * 100) % 10000) / 10000;
            const is_ai = sentenceSeed > 0.4;
            return {
                is_ai: is_ai,
                confidence: 0.6 + sentenceSeed * 0.35,
            };
        });

        // Deterministic patterns
        const allPatterns = [
            "Consistent sentence structure",
            "Repetitive phrasing",
            "Lack of personal pronouns",
            "Overly formal language",
            "Predictable word choices",
            "Lack of emotional tone",
        ];

        // Select patterns based on seed
        const patternCount = 2 + Math.floor(seed * 3);
        const patterns_detected = [];
        for (let i = 0; i < Math.min(patternCount, allPatterns.length); i++) {
            const patternSeed = (parseInt(textHash) + i * 1000) % allPatterns.length;
            patterns_detected.push(allPatterns[patternSeed]);
        }

        return {
            ai_probability: aiProbability,
            confidence: confidence,
            sentence_count: sentences.length,
            word_count: words.length,
            character_count: text.length,
            sentence_predictions: sentencePredictions,
            patterns_detected: [...new Set(patterns_detected)], // Remove duplicates
        };
    } else {
        // Deterministic plagiarism detection
        const words = text.split(" ");
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

        // Calculate plagiarism score based on text length and complexity
        let plagiarismScore = 0.2; // Base score

        // Text length affects plagiarism likelihood
        if (text.length < 200) plagiarismScore += 0.1;
        if (text.length > 1000) plagiarismScore -= 0.1;

        // Add variation based on seed
        plagiarismScore += (seed - 0.5) * 0.3;

        // Ensure score stays within bounds
        plagiarismScore = Math.max(0.05, Math.min(0.8, plagiarismScore));

        const confidence = 0.75 + seed * 0.2;

        // Generate deterministic matched sections
        const matchedSections = [];
        if (words.length > 20 && seed > 0.3) {
            const matchCount = Math.min(3, Math.floor(words.length / 50));
            for (let i = 0; i < matchCount; i++) {
                const sectionSeed = ((parseInt(textHash) + i * 100) % 10000) / 10000;
                const start = Math.floor(sectionSeed * (words.length - 10));
                const length = 5 + Math.floor(sectionSeed * 10);
                const sectionWords = words.slice(start, start + length);

                const similarity = 0.3 + sectionSeed * 0.6;

                matchedSections.push({
                    text: sectionWords.join(" "),
                    similarity: similarity,
                    source: `Source ${i + 1}`,
                });
            }
        }

        return {
            plagiarism_score: plagiarismScore,
            confidence: confidence,
            sentence_count: sentences.length,
            word_count: words.length,
            character_count: text.length,
            matched_sections: matchedSections,
            unique_content: (1 - plagiarismScore) * 100,
            sources_checked: 5000000 + Math.floor(seed * 1000000),
        };
    }
}

function setupEventListeners() {
    // Mode selector
    document.querySelectorAll(".mode-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            document
                .querySelectorAll(".mode-btn")
                .forEach((b) => b.classList.remove("active"));
            this.classList.add("active");
            currentMode = this.dataset.mode;
            updateModePlaceholder();
            showNotification(
                `${currentMode === "ai" ? "AI Detection" : "Plagiarism Check"} mode activated`,
                "info",
            );
        });
    });

    // Text input
    const textInput = document.getElementById("text-input");
    if (textInput) {
        textInput.addEventListener("input", updateCharCount);

        // Enable paste directly in textarea
        textInput.addEventListener("paste", function (e) {
            // Let the paste happen, then update char count
            setTimeout(updateCharCount, 0);
        });
    }

    // Analyze button
    const analyzeBtn = document.getElementById("analyze-btn");
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", analyzeText);
    }

    // Paste button - FIXED VERSION
    const pasteBtn = document.getElementById("paste-btn");
    if (pasteBtn) {
        pasteBtn.addEventListener("click", async () => {
            try {
                const text = await navigator.clipboard.readText();
                const textInput = document.getElementById("text-input");
                if (textInput) {
                    textInput.value = text;
                    updateCharCount();
                    showNotification("Text pasted successfully!", "success");

                    // Focus on the textarea
                    textInput.focus();

                    // Scroll to cursor position
                    textInput.scrollTop = textInput.scrollHeight;
                }
            } catch (err) {
                console.error("Clipboard error:", err);

                // Fallback method
                const textInput = document.getElementById("text-input");
                if (textInput) {
                    textInput.focus();
                    // Try to use execCommand as fallback
                    try {
                        document.execCommand("paste");
                    } catch (e) {
                        // If execCommand fails, show manual paste message
                        showNotification("Please paste manually (Ctrl+V)", "info");
                    }
                    setTimeout(updateCharCount, 100);
                }
            }
        });
    }

    // Clear button
    const clearBtn = document.getElementById("clear-btn");
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            const textInput = document.getElementById("text-input");
            if (textInput) {
                textInput.value = "";
                updateCharCount();
                const resultsContent = document.getElementById("results-content");
                if (resultsContent) resultsContent.style.display = "none";
                showNotification("Text cleared", "info");
            }
        });
    }

    // Upload button
    const uploadBtn = document.getElementById("upload-btn");
    if (uploadBtn) {
        uploadBtn.addEventListener("click", () => {
            document.getElementById("file-input").click();
        });
    }

    // File input
    const fileInput = document.getElementById("file-input");
    if (fileInput) {
        fileInput.addEventListener("change", handleFileUpload);
    }

    // Export button
    const exportBtn = document.getElementById("export-btn");
    if (exportBtn) {
        exportBtn.addEventListener("click", exportResults);
    }

    // Navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            document
                .querySelectorAll(".nav-link")
                .forEach((l) => l.classList.remove("active"));
            this.classList.add("active");
            const target = this.getAttribute("href");
            const element = document.querySelector(target);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        });
    });

    // Mobile menu toggle
    const navToggle = document.querySelector(".nav-toggle");
    if (navToggle) {
        navToggle.addEventListener("click", () => {
            const navLinks = document.querySelector(".nav-links");
            const navOverlay = document.getElementById("nav-overlay");
            if (navLinks) {
                navLinks.classList.toggle("active");
            }
            if (navOverlay) {
                navOverlay.style.display = navLinks.classList.contains("active")
                    ? "block"
                    : "none";
            }
        });
    }

    // Close mobile menu when clicking overlay
    const navOverlay = document.getElementById("nav-overlay");
    if (navOverlay) {
        navOverlay.addEventListener("click", () => {
            const navLinks = document.querySelector(".nav-links");
            if (navLinks) {
                navLinks.classList.remove("active");
                navOverlay.style.display = "none";
            }
        });
    }

    // Mobile dropdown toggle
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
            const dropdownToggle = e.target.closest(".dropdown-toggle");
            if (dropdownToggle) {
                e.preventDefault();
                e.stopPropagation();
                const dropdown = dropdownToggle.closest(".nav-dropdown");
                dropdown.classList.toggle("active");
            }
        }
    });

    // Close dropdowns when clicking outside on mobile
    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
            if (
                !e.target.closest(".nav-dropdown") &&
                !e.target.closest(".nav-toggle")
            ) {
                document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
                    dropdown.classList.remove("active");
                });
            }
        }
    });

    // Theme toggle - Add event listener
    const themeSwitch = document.getElementById("theme-switch");
    if (themeSwitch) {
        themeSwitch.addEventListener("change", function () {
            const newTheme = this.checked ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("textguard_theme", newTheme);
            console.log("Theme changed to:", newTheme);
        });
    }
}

function updateCharCount() {
    const textInput = document.getElementById("text-input");
    const charCount = document.getElementById("char-count");
    const wordCount = document.getElementById("word-count");
    const analyzeBtn = document.getElementById("analyze-btn");

    if (!textInput || !charCount || !wordCount) return;

    const text = textInput.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    charCount.textContent = chars.toLocaleString();
    wordCount.textContent = words.toLocaleString();

    // Enable/disable analyze button
    if (analyzeBtn) {
        analyzeBtn.disabled = chars < 50;
    }
}

function updateModePlaceholder() {
    const textInput = document.getElementById("text-input");
    if (!textInput) return;

    const placeholders = {
        ai: "Paste or type your text here to check if it was written by AI...",
        plagiarism: "Paste or type your text here to check for plagiarism...",
    };
    textInput.placeholder = placeholders[currentMode];
}

function displayResults() {
    const resultsContent = document.getElementById("results-content");
    const loadingState = document.getElementById("loading-state");

    if (!resultsContent || !analysisResults) return;

    // Hide loading, show results
    if (loadingState) loadingState.style.display = "none";
    resultsContent.style.display = "flex";

    // Calculate score
    let score, scoreLabel;
    if (currentMode === "ai") {
        score = analysisResults.ai_probability * 100;
        scoreLabel = "AI Content";
    } else {
        score = analysisResults.plagiarism_score * 100;
        scoreLabel = "Plagiarism";
    }

    // Update score circle
    updateScoreCircle(score);

    // Update score display
    const scoreValue = document.getElementById("score-value");
    const scoreLabelEl = document.getElementById("score-label");
    if (scoreValue) scoreValue.textContent = `${score.toFixed(1)}%`;
    if (scoreLabelEl) scoreLabelEl.textContent = scoreLabel;

    // Update metrics
    const confidenceValue = document.getElementById("confidence-value");
    const sentencesValue = document.getElementById("sentences-value");
    const timeValue = document.getElementById("time-value");

    if (confidenceValue) {
        confidenceValue.textContent = `${(analysisResults.confidence * 100).toFixed(1)}%`;
    }
    if (sentencesValue) {
        sentencesValue.textContent = analysisResults.sentence_count;
    }
    if (timeValue) {
        timeValue.textContent = analysisResults.analysis_time || "1.8s";
    }

    // Highlight text
    highlightAnalyzedText();

    // Generate report
    generateDetailedReport();

    // Update dashboard
    renderDynamicDashboard();
}

function updateScoreCircle(percent) {
    const circle = document.getElementById("score-progress");
    if (!circle) return;

    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (percent / 100) * circumference;

    circle.style.strokeDashoffset = offset;
}

function highlightAnalyzedText() {
    const textInput = document.getElementById("text-input");
    const highlightedDiv = document.getElementById("highlighted-text");

    if (!textInput || !analysisResults || !highlightedDiv) return;

    const text = textInput.value;
    let highlightedHtml = "";

    if (currentMode === "ai" && analysisResults.sentence_predictions) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

        // sentences.forEach((sentence, index) => {
        //     const prediction = analysisResults.sentence_predictions[index];
        //     if (prediction) {
        //         const isAI = prediction.is_ai;
        //         const confidence = (prediction.confidence * 100).toFixed(0);
        //         const className = isAI ? "ai-highlight" : "human-highlight";
        //         highlightedHtml += `<span class="${className}" title="${isAI ? "AI" : "Human"} (${confidence}% confidence)">${escapeHtml(sentence)}</span> `;
        //     } else {
        //         highlightedHtml += `<span>${escapeHtml(sentence)}</span> `;
        //     }
        // });

        sentences.forEach((sentence) => {
    highlightedHtml += `<span>${escapeHtml(sentence)}</span> `;
});

    } else if (currentMode === "plagiarism" && analysisResults.matched_sections) {
        highlightedHtml = escapeHtml(text);

        // analysisResults.matched_sections.forEach((section) => {
        //     const escapedText = escapeHtml(section.text);
        //     // Simple highlight for demo
        //     highlightedHtml = highlightedHtml.replace(
        //         escapedText,
        //         `<span class="plagiarism-highlight" title="Similarity: ${(section.similarity * 100).toFixed(0)}%">${escapedText}</span>`,
        //     );
        // });
    } else {
        highlightedHtml = escapeHtml(text);
    }

    highlightedDiv.innerHTML = highlightedHtml;
}

function generateDetailedReport() {
    const reportDiv = document.getElementById("detailed-report-content");
    if (!reportDiv) return;

    reportDiv.innerHTML = "";

    if (currentMode === "ai") {
        const aiProb = analysisResults.ai_probability * 100;

        const items = [
            {
                title: "Overall Assessment",
                content:
                    aiProb > 70
                        ? "This text shows strong indicators of AI-generated content."
                        : aiProb > 40
                            ? "This text shows mixed indicators of AI and human writing."
                            : "This text appears to be primarily human-written.",
            },
            {
                title: "Analysis Confidence",
                content: `This analysis was performed with ${(analysisResults.confidence * 100).toFixed(1)}% confidence based on ${analysisResults.sentence_count} sentences.`,
            },
            {
                title: "Detected Patterns",
                content:
                    analysisResults.patterns_detected &&
                        analysisResults.patterns_detected.length > 0
                        ? analysisResults.patterns_detected.join(", ")
                        : "No specific AI patterns detected.",
            },
            {
                title: "Recommendations",
                content:
                    aiProb > 70
                        ? "Consider revising to add more personal voice and unique perspectives."
                        : "The writing style appears natural and authentic.",
            },
        ];

        items.forEach((item) => {
            const div = document.createElement("div");
            div.className = "report-item";
            div.innerHTML = `<h5>${item.title}</h5><p>${item.content}</p>`;
            reportDiv.appendChild(div);
        });
    } else {
        const plagScore = analysisResults.plagiarism_score * 100;

        const items = [
            {
                title: "Originality Score",
                content: `${((1 - analysisResults.plagiarism_score) * 100).toFixed(1)}% of the content appears to be original.`,
            },
            {
                title: "Similar Content Found",
                content:
                    analysisResults.matched_sections &&
                        analysisResults.matched_sections.length > 0
                        ? `Found ${analysisResults.matched_sections.length} potential matches in ${analysisResults.sources_checked?.toLocaleString() || "5M+"} sources.`
                        : "No significant plagiarism detected.",
            },
            {
                title: "Confidence Level",
                content: `This analysis was performed with ${(analysisResults.confidence * 100).toFixed(1)}% confidence.`,
            },
            {
                title: "Recommendations",
                content:
                    plagScore > 30
                        ? "Review highlighted sections and add proper citations."
                        : "Content appears to be original and properly attributed.",
            },
        ];

        items.forEach((item) => {
            const div = document.createElement("div");
            div.className = "report-item";
            div.innerHTML = `<h5>${item.title}</h5><p>${item.content}</p>`;
            reportDiv.appendChild(div);
        });
    }
}

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const textInput = document.getElementById("text-input");

    try {
        const text = await file.text();
        if (text.length > 100000) {
            textInput.value = text.substring(0, 100000);
            showNotification(
                "File is too large. Truncated to 100,000 characters.",
                "warning",
            );
        } else {
            textInput.value = text;
        }

        updateCharCount();
        showNotification("File loaded successfully!", "success");
    } catch (error) {
        console.error("Upload error:", error);
        showNotification("Failed to read file", "error");
    }
}

function exportResults() {
    if (!analysisResults) {
        showNotification("No results to export", "warning");
        return;
    }

    const textInput = document.getElementById("text-input");
    const exportData = {
        mode: currentMode,
        timestamp: new Date().toISOString(),
        text: textInput.value.substring(0, 1000),
        results: analysisResults,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${currentMode}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification("Results exported successfully!", "success");
}

// Add to your existing script.js
async function handlePDFUpload(file) {
    const formData = new FormData();
    formData.append("file", file);

    // Show loading state
    showLoading("Extracting text from PDF...");

    try {
        const response = await fetch("/upload_pdf", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();

        if (result.success) {
            // Display extracted text preview
            document.getElementById("text-preview").value = result.text;
            document.getElementById("full-text").value = result.full_text;

            // Show OCR warning if needed
            if (result.used_ocr) {
                showNotification(
                    "⚠️ PDF appears to be scanned. Text extraction used OCR and may have minor errors.",
                    "warning",
                );
            }

            // Update UI with stats
            document.getElementById("word-count").innerText = result.word_count;
            document.getElementById("pages-count").innerText = result.metadata.pages;

            // Enable AI detection/plagiarism buttons
            enableAnalysisButtons();

            hideLoading();
        } else {
            showNotification(`Error: ${result.error}`, "error");
            hideLoading();
        }
    } catch (error) {
        console.error("Upload error:", error);
        showNotification("Failed to process PDF. Please try again.", "error");
        hideLoading();
    }
}

// File input handler
document.getElementById("pdf-upload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
        handlePDFUpload(file);
    } else {
        showNotification("Please select a valid PDF file", "error");
    }
});

// Member Card Expand Functionality
function expandMemberCard(cardElement) {
    // Create overlay
    let overlay = document.querySelector(".member-expand-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "member-expand-overlay";
        document.body.appendChild(overlay);
    }

    // Clone the card for expanded view
    const clonedCard = cardElement.cloneNode(true);
    clonedCard.classList.add("expanded");

    // Add close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "expanded-close";
    closeBtn.innerHTML = "✕";
    closeBtn.onclick = function (e) {
        e.stopPropagation();
        clonedCard.remove();
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    };
    clonedCard.insertBefore(closeBtn, clonedCard.firstChild);

    // Remove any existing expanded cards
    const existingExpanded = document.querySelector(".member-card.expanded");
    if (existingExpanded) {
        existingExpanded.remove();
    }

    // Add to body
    document.body.appendChild(clonedCard);
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";

    // Close on overlay click
    overlay.onclick = function () {
        clonedCard.remove();
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    };
}

// Add click handlers to member cards
document.querySelectorAll(".member-card").forEach((card) => {
    card.addEventListener("click", function (e) {
        // Don't trigger if clicking on links
        if (e.target.tagName === "A" || e.target.closest("a")) {
            return;
        }
        expandMemberCard(this);
    });
});

// Analytics Functions
function loadAnalytics() {
    try {
        // First try to get user's analytics
        if (currentUser && currentUser.analytics) {
            analyticsData = currentUser.analytics;
        } else {
            // Fall back to guest analytics
            const saved = localStorage.getItem("textguard-analytics");
            if (saved) {
                analyticsData = JSON.parse(saved);
            }
        }
    } catch (e) {
        console.log("No analytics data found, starting fresh");
    }
}

function saveAnalytics() {
    try {
        // Save to user's data if logged in
        if (currentUser) {
            currentUser.analytics = analyticsData;
            localStorage.setItem("textguard_user", JSON.stringify(currentUser));
        } else {
            // Save to guest analytics
            localStorage.setItem(
                "textguard-analytics",
                JSON.stringify(analyticsData),
            );
        }
    } catch (e) {
        console.error("Failed to save analytics:", e);
    }
}

function updateAnalytics(text, results) {
    // Update analytics
    analyticsData.totalAnalyses++;
    analyticsData.totalCharacters += text.length;

    if (currentMode === "ai") {
        analyticsData.aiDetections++;
    } else {
        analyticsData.plagiarismDetections++;
    }

    // Add to recent analyses
    const analysisEntry = {
        timestamp: new Date().toISOString(),
        mode: currentMode,
        textLength: text.length,
        score:
            currentMode === "ai"
                ? results.ai_probability * 100
                : results.plagiarism_score * 100,
        confidence: results.confidence * 100,
    };

    analyticsData.recentAnalyses.unshift(analysisEntry);
    if (analyticsData.recentAnalyses.length > 10) {
        analyticsData.recentAnalyses = analyticsData.recentAnalyses.slice(0, 10);
    }

    // Save to localStorage
    saveAnalytics();
}

function renderDynamicDashboard() {
    const dashboard = document.getElementById("stats-dashboard");
    if (!dashboard) return;

    // Calculate statistics
    const totalAnalyses = analyticsData.totalAnalyses || 0;
    const aiDetections = analyticsData.aiDetections || 0;
    const plagiarismDetections = analyticsData.plagiarismDetections || 0;
    const avgCharacters =
        totalAnalyses > 0
            ? Math.round(analyticsData.totalCharacters / totalAnalyses)
            : 0;

    // Calculate today's analyses
    const todayAnalyses =
        analyticsData.recentAnalyses?.filter((a) => {
            const date = new Date(a.timestamp);
            const today = new Date();
            return date.toDateString() === today.toDateString();
        }).length || 0;

    // Calculate trends (compared to yesterday)
    const yesterdayAnalyses =
        analyticsData.recentAnalyses?.filter((a) => {
            const date = new Date(a.timestamp);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return date.toDateString() === yesterday.toDateString();
        }).length || 0;

    const trend =
        yesterdayAnalyses > 0
            ? Math.round(
                ((todayAnalyses - yesterdayAnalyses) / yesterdayAnalyses) * 100,
            )
            : 100;

    // Generate recent activity HTML
    let recentActivityHTML = "";
    if (analyticsData.recentAnalyses && analyticsData.recentAnalyses.length > 0) {
        recentActivityHTML = analyticsData.recentAnalyses
            .slice(0, 8)
            .map(
                (analysis) => `
            <div class="activity-item ${analysis.mode}">
                <div class="activity-icon">
                    <i class="fas ${analysis.mode === "ai" ? "fa-robot" : "fa-copy"}"></i>
                </div>
                <div class="activity-details">
                    <div class="activity-title">
                        ${analysis.mode === "ai" ? "AI Detection" : "Plagiarism Check"}
                        <span class="activity-time">${formatTimeAgo(analysis.timestamp)}</span>
                    </div>
                    <div class="activity-meta">
                        <span>${analysis.textLength.toLocaleString()} chars</span>
                        <span>Score: ${analysis.score.toFixed(1)}%</span>
                        <span>Confidence: ${analysis.confidence.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `,
            )
            .join("");
    } else {
        recentActivityHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-line"></i>
                <p>No recent analyses yet</p>
                <button class="btn btn-primary" onclick="scrollToChecker()">
                    <i class="fas fa-rocket"></i>
                    Start Analyzing
                </button>
            </div>
        `;
    }

    // Generate insights
    const insights = generateInsights();

    dashboard.innerHTML = `
        <div class="dashboard-grid">
            <!-- Stat Cards -->
            <div class="stat-cards-grid">
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-icon">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">${totalAnalyses.toLocaleString()}</div>
                            <div class="stat-label">Total Analyses</div>
                            <div class="stat-trend ${trend >= 0 ? "positive" : "negative"}">
                                <i class="fas fa-${trend >= 0 ? "arrow-up" : "arrow-down"}"></i>
                                <span>${Math.abs(trend)}% ${trend >= 0 ? "increase" : "decrease"}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-icon">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">${aiDetections.toLocaleString()}</div>
                            <div class="stat-label">AI Detections</div>
                            <div class="stat-trend positive">
                                <i class="fas fa-bolt"></i>
                                <span>${totalAnalyses > 0 ? Math.round((aiDetections / totalAnalyses) * 100) : 0}% of total</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-icon">
                            <i class="fas fa-copy"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">${plagiarismDetections.toLocaleString()}</div>
                            <div class="stat-label">Plagiarism Checks</div>
                            <div class="stat-trend positive">
                                <i class="fas fa-search"></i>
                                <span>${totalAnalyses > 0 ? Math.round((plagiarismDetections / totalAnalyses) * 100) : 0}% of total</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-icon">
                            <i class="fas fa-text-width"></i>
                        </div>
                        <div class="stat-info">
                            <div class="stat-value">${avgCharacters.toLocaleString()}</div>
                            <div class="stat-label">Avg Text Length</div>
                            <div class="stat-trend positive">
                                <i class="fas fa-ruler"></i>
                                <span>characters per analysis</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Charts Section -->
            <div class="charts-section">
                <div class="chart-card">
                    <div class="chart-card-header">
                        <h3><i class="fas fa-chart-pie"></i> Analysis Distribution</h3>
                        <div class="time-range-selector">
                            <button class="time-range-btn active">Day</button>
                            <button class="time-range-btn">Week</button>
                            <button class="time-range-btn">Month</button>
                        </div>
                    </div>
                    <div class="chart-container">
                        <canvas id="distribution-chart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <div class="chart-card-header">
                        <h3><i class="fas fa-chart-line"></i> Daily Activity</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="activity-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Recent Activity Section -->
            <div class="recent-activity-section">
                <div class="activity-card">
                    <h3><i class="fas fa-history"></i> Recent Activity</h3>
                    <div class="activity-list">
                        ${recentActivityHTML}
                    </div>
                </div>
                
                <div class="activity-card">
                    <h3><i class="fas fa-tachometer-alt"></i> Performance Metrics</h3>
                    <div class="performance-metrics">
                        <div class="metric-item">
                            <div class="metric-label">Processing Speed</div>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: 95%"></div>
                            </div>
                            <div class="metric-value">1.8s avg</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Accuracy Rate</div>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: 99.2%"></div>
                            </div>
                            <div class="metric-value">99.2%</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-label">Confidence Score</div>
                            <div class="metric-bar">
                                <div class="metric-fill" style="width: 97.5%"></div>
                            </div>
                            <div class="metric-value">97.5% avg</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Insights Section -->
            <div class="insights-section">
                <h3 style="margin-bottom: 1.5rem; font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-lightbulb"></i> Insights & Trends
                </h3>
                <div class="insights-grid">
                    ${insights}
                </div>
            </div>
        </div>
    `;

    // Add performance metrics styles
    const metricsStyle = document.createElement("style");
    metricsStyle.textContent = `
        .performance-metrics {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .metric-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .metric-label {
            color: var(--text-secondary);
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .metric-bar {
            height: 8px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
            overflow: hidden;
        }
        
        .metric-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            border-radius: 4px;
            transition: width 1.5s ease;
        }
        
        .metric-value {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--primary);
        }
    `;
    document.head.appendChild(metricsStyle);

    // Render charts
    renderCharts();

    // Add animations
    animateDashboard();

    // Add time range selector functionality
    setupTimeRangeSelector();
}

function generateInsights() {
    const totalAnalyses = analyticsData.totalAnalyses || 0;
    const recentAnalyses = analyticsData.recentAnalyses || [];

    if (totalAnalyses === 0) {
        return `
            <div class="insight-card">
                <div class="insight-header">
                    <div class="insight-icon">
                        <i class="fas fa-rocket"></i>
                    </div>
                    <div class="insight-content">
                        <h4>Welcome to TextGuard AI!</h4>
                        <p>Start analyzing text to unlock powerful insights about your content.</p>
                    </div>
                </div>
            </div>
            <div class="insight-card">
                <div class="insight-header">
                    <div class="insight-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="insight-content">
                        <h4>Track Your Progress</h4>
                        <p>Monitor your analysis patterns and improve your writing over time.</p>
                    </div>
                </div>
            </div>
            <div class="insight-card">
                <div class="insight-header">
                    <div class="insight-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="insight-content">
                        <h4>Ensure Authenticity</h4>
                        <p>Detect AI-generated content and prevent plagiarism in your work.</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Calculate insights from data
    const avgScore =
        recentAnalyses.length > 0
            ? recentAnalyses.reduce((sum, a) => sum + a.score, 0) /
            recentAnalyses.length
            : 0;

    const avgConfidence =
        recentAnalyses.length > 0
            ? recentAnalyses.reduce((sum, a) => sum + a.confidence, 0) /
            recentAnalyses.length
            : 0;

    const avgLength =
        recentAnalyses.length > 0
            ? recentAnalyses.reduce((sum, a) => sum + a.textLength, 0) /
            recentAnalyses.length
            : 0;

    const aiAnalyses = recentAnalyses.filter((a) => a.mode === "ai").length;
    const plagiarismAnalyses = recentAnalyses.filter(
        (a) => a.mode === "plagiarism",
    ).length;

    return `
        <div class="insight-card">
            <div class="insight-header">
                <div class="insight-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="insight-content">
                    <h4>Performance Trends</h4>
                    <p>Average confidence score of ${avgConfidence.toFixed(1)}% across ${recentAnalyses.length} recent analyses.</p>
                </div>
            </div>
        </div>
        
        <div class="insight-card">
            <div class="insight-header">
                <div class="insight-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="insight-content">
                    <h4>AI Detection Patterns</h4>
                    <p>${aiAnalyses} AI analyses with average score of ${avgScore.toFixed(1)}%.</p>
                </div>
            </div>
        </div>
        
        <div class="insight-card">
            <div class="insight-header">
                <div class="insight-icon">
                    <i class="fas fa-copy"></i>
                </div>
                <div class="insight-content">
                    <h4>Plagiarism Analysis</h4>
                    <p>${plagiarismAnalyses} plagiarism checks completed successfully.</p>
                </div>
            </div>
        </div>
        
        <div class="insight-card">
            <div class="insight-header">
                <div class="insight-icon">
                    <i class="fas fa-text-width"></i>
                </div>
                <div class="insight-content">
                    <h4>Content Length</h4>
                    <p>Average text length of ${Math.round(avgLength).toLocaleString()} characters per analysis.</p>
                </div>
            </div>
        </div>
        
        <div class="insight-card">
            <div class="insight-header">
                <div class="insight-icon">
                    <i class="fas fa-bolt"></i>
                </div>
                <div class="insight-content">
                    <h4>Processing Speed</h4>
                    <p>Average analysis time of 1.8 seconds with 99.9% uptime.</p>
                </div>
            </div>
        </div>
        
        <div class="insight-card">
            <div class="insight-header">
                <div class="insight-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="insight-content">
                    <h4>Accuracy Rate</h4>
                    <p>Model maintains 99.2% accuracy across all analyses.</p>
                </div>
            </div>
        </div>
    `;
}

function renderCharts() {
    // Clean up old charts before creating new ones
    Chart.helpers.each(Chart.instances, function (instance) {
        instance.destroy();
    });

    // Distribution Chart
    const distributionCtx = document.getElementById("distribution-chart");
    if (distributionCtx) {
        const aiCount = analyticsData.aiDetections || 1;
        const plagiarismCount = analyticsData.plagiarismDetections || 1;

        // Store reference to chart
        distributionCtx.chart = new Chart(distributionCtx, {
            type: "doughnut",
            data: {
                labels: ["AI Detection", "Plagiarism Check"],
                datasets: [
                    {
                        data: [aiCount, plagiarismCount],
                        backgroundColor: [
                            "rgba(99, 102, 241, 0.8)",
                            "rgba(139, 92, 246, 0.8)",
                        ],
                        borderColor: ["rgba(99, 102, 241, 1)", "rgba(139, 92, 246, 1)"],
                        borderWidth: 2,
                        hoverOffset: 20,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%",
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "rgba(255, 255, 255, 0.8)",
                            padding: 20,
                            font: {
                                size: 12,
                                family: "'Inter', sans-serif",
                            },
                        },
                    },
                    tooltip: {
                        backgroundColor: "rgba(15, 15, 30, 0.9)",
                        titleColor: "#fff",
                        bodyColor: "#fff",
                        borderColor: "#6366f1",
                        borderWidth: 1,
                        callbacks: {
                            label: function (context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.raw / total) * 100);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            },
                        },
                    },
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1000,
                    easing: "easeOutQuart",
                },
            },
        });
    }

    // Activity Chart
    const activityCtx = document.getElementById("activity-chart");
    if (activityCtx) {
        // Generate last 7 days data
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString("en-US", { weekday: "short" });
        });

        const recent = analyticsData.recentAnalyses || [];
        const dailyCounts = Array(7).fill(0);

        recent.forEach((analysis) => {
            const date = new Date(analysis.timestamp);
            const today = new Date();
            const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays < 7) {
                dailyCounts[diffDays]++;
            }
        });

        // Store reference to chart
        activityCtx.chart = new Chart(activityCtx, {
            type: "line",
            data: {
                labels: last7Days,
                datasets: [
                    {
                        label: "Daily Analyses",
                        data: dailyCounts.reverse(),
                        borderColor: "#6366f1",
                        backgroundColor: "rgba(99, 102, 241, 0.1)",
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: "#6366f1",
                        pointBorderColor: "#fff",
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        backgroundColor: "rgba(15, 15, 30, 0.9)",
                        titleColor: "#fff",
                        bodyColor: "#fff",
                        borderColor: "#6366f1",
                        borderWidth: 1,
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: "rgba(255, 255, 255, 0.1)",
                        },
                        ticks: {
                            color: "rgba(255, 255, 255, 0.6)",
                            stepSize: 1,
                        },
                    },
                    x: {
                        grid: {
                            color: "rgba(255, 255, 255, 0.1)",
                        },
                        ticks: {
                            color: "rgba(255, 255, 255, 0.6)",
                        },
                    },
                },
                interaction: {
                    intersect: false,
                    mode: "index",
                },
                animation: {
                    duration: 1000,
                    easing: "easeOutQuart",
                },
            },
        });
    }
}

// Add this function to clean up all charts
function cleanupCharts() {
    if (typeof Chart !== "undefined") {
        // Destroy all Chart.js instances
        Chart.helpers.each(Chart.instances, function (instance) {
            instance.destroy();
        });

        // Also clean up canvas references
        const canvases = document.querySelectorAll("canvas");
        canvases.forEach((canvas) => {
            if (canvas.chart) {
                try {
                    canvas.chart.destroy();
                } catch (e) {
                    // Ignore errors
                }
                canvas.chart = null;
            }
            validateEmail;
        });
    }
}

function animateDashboard() {
    // Animate stat cards
    const statCards = document.querySelectorAll(".stat-card");
    statCards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        setTimeout(() => {
            card.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 100);
    });

    // Animate charts
    const chartCards = document.querySelectorAll(".chart-card");
    chartCards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateX(20px)";

        setTimeout(
            () => {
                card.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
                card.style.opacity = "1";
                card.style.transform = "translateX(0)";
            },
            300 + index * 100,
        );
    });

    // Animate activity cards
    const activityCards = document.querySelectorAll(".activity-card");
    activityCards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateX(-20px)";

        setTimeout(
            () => {
                card.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
                card.style.opacity = "1";
                card.style.transform = "translateX(0)";
            },
            500 + index * 100,
        );
    });

    // Animate insight cards
    const insightCards = document.querySelectorAll(".insight-card");
    insightCards.forEach((card, index) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";

        setTimeout(
            () => {
                card.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            },
            700 + index * 50,
        );
    });

    // Animate metric bars
    setTimeout(() => {
        const metricBars = document.querySelectorAll(".metric-fill");
        metricBars.forEach((bar) => {
            const width = bar.style.width;
            bar.style.width = "0";

            setTimeout(() => {
                bar.style.transition = "width 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
                bar.style.width = width;
            }, 100);
        });
    }, 1000);
}

function setupTimeRangeSelector() {
    const timeRangeBtns = document.querySelectorAll(".time-range-btn");
    timeRangeBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            // Remove active class from all buttons
            timeRangeBtns.forEach((b) => b.classList.remove("active"));

            // Add active class to clicked button
            this.classList.add("active");

            // Show notification
            const range = this.textContent.toLowerCase();
            showNotification(`Showing data for the last ${range}`, "info");

            // In a real app, you would fetch new data based on time range
            // For demo, we'll just update the chart titles
            const chartTitle = document.querySelector(".chart-card-header h3");
            if (chartTitle) {
                const icon = chartTitle.querySelector("i");
                const text = chartTitle.textContent.replace(/\s+/g, " ").trim();
                const baseText = text
                    .replace("Day", "")
                    .replace("Week", "")
                    .replace("Month", "")
                    .trim();
                chartTitle.innerHTML = `<i class="${icon.className}"></i> ${baseText} (${this.textContent})`;
            }
        });
    });
}

// Add this helper function to format numbers with animations
function animateCounter(element, target, suffix = "") {
    let current = 0;
    const increment = target / 60; // 1 second at 60fps

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        if (suffix === "%") {
            element.textContent = current.toFixed(1) + suffix;
        } else {
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        }
    }, 16);
}

function renderDistributionChart() {
    const ctx = document.getElementById("distribution-chart");
    if (!ctx) return;

    const aiCount = analyticsData.aiDetections || 1;
    const plagiarismCount = analyticsData.plagiarismDetections || 1;

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["AI Detection", "Plagiarism Check"],
            datasets: [
                {
                    data: [aiCount, plagiarismCount],
                    backgroundColor: [
                        "rgba(99, 102, 241, 0.8)",
                        "rgba(139, 92, 246, 0.8)",
                    ],
                    borderColor: ["rgba(99, 102, 241, 1)", "rgba(139, 92, 246, 1)"],
                    borderWidth: 2,
                    hoverOffset: 15,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "70%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "rgba(255, 255, 255, 0.8)",
                        padding: 20,
                        font: {
                            size: 12,
                        },
                    },
                },
            },
        },
    });
}

// Function to show model details modal
function showModelDetails() {
    // Create modal if it doesn't exist
    let modal = document.getElementById("model-details-modal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "model-details-modal";
        modal.className = "model-modal";
        modal.innerHTML = `
            <div class="model-modal-content">
                <button class="model-modal-close" onclick="closeModelDetails()">&times;</button>
                <div class="model-modal-header">
                    <h2 class="model-modal-title">Universal Text Classifier System</h2>
                    <p class="model-modal-subtitle">Dual-task AI model for text analysis</p>
                </div>
                
                <div class="model-modal-section">
                    <h3><i class="fas fa-info-circle"></i> Overview</h3>
                    <p>A hybrid machine learning system that combines Sentence Transformers with ensemble classifiers to perform two distinct tasks: AI vs Human text classification and Plagiarism detection.</p>
                </div>
                
                <div class="model-modal-section">
                    <h3><i class="fas fa-cogs"></i> Architecture</h3>
                    <div class="model-modal-grid">
                        <div class="model-modal-item">
                            <div class="model-modal-label">Base Encoder</div>
                            <div class="model-modal-value">all-MiniLM-L6-v2</div>
                        </div>
                        <div class="model-modal-item">
                            <div class="model-modal-label">Embedding Size</div>
                            <div class="model-modal-value">384 dimensions</div>
                        </div>
                        <div class="model-modal-item">
                            <div class="model-modal-label">AI/Human Classifier</div>
                            <div class="model-modal-value">XGBoost (300 estimators)</div>
                        </div>
                        <div class="model-modal-item">
                            <div class="model-modal-label">Plagiarism Classifier</div>
                            <div class="model-modal-value">Random Forest (200 trees)</div>
                        </div>
                    </div>
                </div>
                
                <div class="model-modal-section">
                    <h3><i class="fas fa-chart-bar"></i> Performance Metrics</h3>
                    <div class="model-modal-grid">
                        <div class="model-modal-item">
                            <div class="model-modal-label">AI/Human Accuracy</div>
                            <div class="model-modal-value">100%</div>
                        </div>
                        <div class="model-modal-item">
                            <div class="model-modal-label">AI/Human F1 Score</div>
                            <div class="model-modal-value">1.00</div>
                        </div>
                        <div class="model-modal-item">
                            <div class="model-modal-label">Plagiarism Accuracy</div>
                            <div class="model-modal-value">86.1%</div>
                        </div>
                        <div class="model-modal-item">
                            <div class="model-modal-label">Plagiarism F1 Score</div>
                            <div class="model-modal-value">0.86</div>
                        </div>
                    </div>
                </div>
                
                <div class="model-modal-section">
                    <h3><i class="fas fa-database"></i> Training Data</h3>
                    <div class="model-modal-grid">
                        <div class="model-modal-item">
                            <div class="model-modal-label">AI vs Human Dataset</div>
                            <div class="model-modal-value">5,000 samples</div>
                        </div>
                        <div class="model-modal-item">
                            <div class="model-modal-label">Plagiarism Dataset</div>
                            <div class="model-modal-value">20,000 samples</div>
                        </div>
                        <div class="model-modal-item">
                            <div class="model-modal-label">Total Features</div>
                            <div class="model-modal-value">391-774 dimensions</div>
                        </div>
                        <div class="model-modal-item">
                            <div class="model-modal-label">Test Split</div>
                            <div class="model-modal-value">80/20 ratio</div>
                        </div>
                    </div>
                </div>
                
                <div class="model-modal-section">
                    <h3><i class="fas fa-code"></i> Feature Engineering</h3>
                    <p>The model extracts comprehensive linguistic features including:</p>
                    <div class="model-modal-features">
                        <span class="model-modal-feature">Sentence Embeddings</span>
                        <span class="model-modal-feature">Word Count</span>
                        <span class="model-modal-feature">Sentence Count</span>
                        <span class="model-modal-feature">Lexical Diversity</span>
                        <span class="model-modal-feature">Character Count</span>
                        <span class="model-modal-feature">Digit Ratio</span>
                        <span class="model-modal-feature">Uppercase Ratio</span>
                        <span class="model-modal-feature">Cosine Similarity</span>
                        <span class="model-modal-feature">Jaccard Similarity</span>
                        <span class="model-modal-feature">Common Words</span>
                    </div>
                </div>
                
                <div class="model-modal-section">
                    <h3><i class="fas fa-laptop-code"></i> Usage Example</h3>
                    <div class="model-modal-code">
// Load the system<br>
import joblib<br>
system = joblib.load('universal_text_system.pkl')<br>
classifier = system['unified_classifier']<br><br>
// Detect AI vs Human<br>
result = classifier.predict_ai_human("Your text here")<br>
// Detect Plagiarism<br>
result2 = classifier.predict_plagiarism("Text 1", "Text 2")
                    </div>
                </div>
                
                <div class="model-modal-section">
                    <h3><i class="fas fa-rocket"></i> Deployment</h3>
                    <p>The complete system is saved as <code>universal_text_system.pkl</code> (82.7 MB) and includes all necessary components:</p>
                    <div class="model-modal-features">
                        <span class="model-modal-feature">UniversalTextEncoder</span>
                        <span class="model-modal-feature">XGBoost Model</span>
                        <span class="model-modal-feature">Random Forest Model</span>
                        <span class="model-modal-feature">Scalers</span>
                        <span class="model-modal-feature">Unified Classifier</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Show modal
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

// Function to close model details modal
function closeModelDetails() {
    const modal = document.getElementById("model-details-modal");
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
    }
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
    const modal = document.getElementById("model-details-modal");
    if (modal && e.target === modal) {
        closeModelDetails();
    }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeModelDetails();
    }
});

// Radar chart function (you need to implement this based on your chart library)
function renderRadarChart() {
    const ctx = document.getElementById("model-radar-chart");
    if (!ctx) return;

    // You'll need to implement your chart rendering logic here
    // Example with Chart.js:

    new Chart(ctx, {
        type: "radar",
        data: {
            labels: [
                "Accuracy",
                "Precision",
                "Recall",
                "F1 Score",
                "Speed",
                "Robustness",
            ],
            datasets: [
                {
                    label: "Model Performance",
                    data: [100, 98.7, 99.5, 99.1, 95, 92],
                    backgroundColor: "rgba(99, 102, 241, 0.2)",
                    borderColor: "#6366f1",
                    borderWidth: 2,
                },
            ],
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                },
            },
        },
    });
}

// FIXED: Model Card and Modal Functions
function renderModelCard() {
    const container = document.getElementById("model-card-container");
    if (!container) {
        console.error("Model card container not found");
        return;
    }

    // First, clear any existing loading state
    container.innerHTML = "";

    container.innerHTML = `
        <div class="model-card glass-card">
            <div class="model-header">
                <div class="model-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="model-info">
                    <h3 class="model-name">Universal Text Classifier System</h3>
                    <p class="model-type">Hybrid Sentence Transformer + XGBoost/RF</p>
                </div>
                <div class="model-badge">
                    <span class="badge-active">Active</span>
                </div>
            </div>

            <div class="model-metrics">
                <div class="metric-row">
                    <div class="metric-item">
    <div class="metric-label">AI vs Human Accuracy</div>
    <div class="metric-bar">
        <div class="metric-fill" style="width: 100%; background: linear-gradient(90deg, #10b981, #34d399);"></div>
    </div>
    <div class="metric-value">100%</div>
</div>

<div class="metric-item">
    <div class="metric-label">Plagiarism Detection</div>
    <div class="metric-bar">
        <div class="metric-fill" style="width: 86%; background: linear-gradient(90deg, #6366f1, #8b5cf6);"></div>
    </div>
    <div class="metric-value">86.1%</div>
</div>
                </div>
            </div>

            <div class="model-details">
                <div class="detail-item">
                    <i class="fas fa-database"></i>
                    <span>Training Data: 42K+ samples</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>Last Updated: 2026-01-21</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-layer-group"></i>
                    <span>Feature Dimensions: 384+ linguistic features</span>
                </div>
            </div><br/>

            <div class="model-features">
                <h4><i class="fas fa-star"></i> Key Features</h4>
                <div class="features-grid">
                    <div class="feature-chip">
                        <i class="fas fa-check"></i>
                        Universal Sentence Encoding
                    </div>
                    <div class="feature-chip">
                        <i class="fas fa-check"></i>
                        Dual-Task Classification
                    </div>
                    <div class="feature-chip">
                        <i class="fas fa-check"></i>
                        Linguistic Analysis
                    </div>
                   
                    
                </div>
            </div>

            <div class="model-performance">
                <h4><i class="fas fa-chart-line"></i> Performance Metrics</h4>
                <div class="performance-grid">
                    <div class="perf-item">
                        <div class="perf-label">AI/Human F1 Score</div>
                        <div class="perf-value">1.00</div>
                    </div>
                    <div class="perf-item">
                        <div class="perf-label">Plagiarism F1 Score</div>
                        <div class="perf-value">0.86</div>
                    </div>
                    <div class="perf-item">
                        <div class="perf-label">Model Size</div>
                        <div class="perf-value">82.7 MB</div>
                    </div>
                </div>
            </div>

            <div class="radar-chart-container">
                <canvas id="model-radar-chart"></canvas>
            </div>

            <div class="model-actions">
                <button class="btn btn-primary" onclick="showModelDetails()">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
                <button class="btn btn-secondary" onclick="showNotification('Report generation coming soon!', 'info')">
                    <i class="fas fa-download"></i>
                    Export Report
                </button>
            </div>
        </div>
    `;

    // Wait a bit then render the chart
    setTimeout(() => {
        renderRadarChart();
    }, 300);
}

// FIXED: Proper radar chart rendering
function renderRadarChart() {
    const ctx = document.getElementById("model-radar-chart");
    if (!ctx) {
        console.error("Radar chart canvas not found");
        return;
    }

    // Check if Chart.js is loaded
    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded");
        // Create a fallback visualization
        createFallbackRadarChart(ctx);
        return;
    }

    // Clear any existing chart
    if (window.modelRadarChart) {
        window.modelRadarChart.destroy();
    }

    const isDarkMode =
        document.documentElement.getAttribute("data-theme") === "dark";

    window.modelRadarChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: [
                "Accuracy",
                "Precision",
                "Recall",
                "F1 Score",
                "Speed",
                "Robustness",
            ],
            datasets: [
                {
                    label: "Model Performance",
                    data: [100, 98.7, 99.5, 99.1, 95, 92],
                    backgroundColor: "rgba(99, 102, 241, 0.2)",
                    borderColor: "#6366f1",
                    borderWidth: 2,
                    pointBackgroundColor: "#6366f1",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    min: 0,
                    ticks: {
                        stepSize: 20,
                        color: isDarkMode
                            ? "rgba(255, 255, 255, 0.7)"
                            : "rgba(0, 0, 0, 0.7)",
                        backdropColor: "transparent",
                        showLabelBackdrop: false,
                    },
                    grid: {
                        color: isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)",
                    },
                    angleLines: {
                        color: isDarkMode
                            ? "rgba(255, 255, 255, 0.1)"
                            : "rgba(0, 0, 0, 0.1)",
                    },
                    pointLabels: {
                        color: isDarkMode
                            ? "rgba(255, 255, 255, 0.8)"
                            : "rgba(0, 0, 0, 0.8)",
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif",
                            weight: "500",
                        },
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: isDarkMode
                        ? "rgba(15, 15, 30, 0.95)"
                        : "rgba(255, 255, 255, 0.95)",
                    titleColor: isDarkMode ? "#fff" : "#000",
                    bodyColor: isDarkMode ? "#fff" : "#000",
                    borderColor: "#6366f1",
                    borderWidth: 1,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}%`;
                        },
                    },
                },
            },
            animation: {
                duration: 1500,
                easing: "easeOutQuart",
            },
            elements: {
                line: {
                    tension: 0.3,
                },
            },
        },
    });
}

// Fallback if Chart.js is not available
function createFallbackRadarChart(canvas) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw polygon (radar shape)
    const sides = 6;
    const points = [];

    ctx.strokeStyle = "#6366f1";
    ctx.fillStyle = "rgba(99, 102, 241, 0.2)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const pointRadius = radius * 0.9;
        const x = centerX + pointRadius * Math.cos(angle);
        const y = centerY + pointRadius * Math.sin(angle);
        points.push({ x, y });

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw labels
    ctx.fillStyle =
        document.documentElement.getAttribute("data-theme") === "dark"
            ? "#fff"
            : "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const labels = [
        "Accuracy",
        "Precision",
        "Recall",
        "F1 Score",
        "Speed",
        "Robustness",
    ];
    const values = [100, 98.7, 99.5, 99.1, 95, 92];

    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const labelRadius = radius * 1.15;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);

        ctx.fillText(labels[i], x, y);
        ctx.fillStyle = "#6366f1";
        ctx.fillText(values[i] + "%", centerX, centerY - 10);
        ctx.fillStyle =
            document.documentElement.getAttribute("data-theme") === "dark"
                ? "#fff"
                : "#000";
    }
}

// FIXED: Show model details modal
function showModelDetails() {
    // Check if modal already exists
    let modal = document.getElementById("model-details-modal");

    if (!modal) {
        // Create modal
        modal = document.createElement("div");
        modal.id = "model-details-modal";
        modal.className = "model-modal";
        modal.innerHTML = `
            <div class="model-modal-overlay" onclick="closeModelDetails()"></div>
            <div class="model-modal-content">
                <button class="model-modal-close" onclick="closeModelDetails()">
                    <i class="fas fa-times"></i>
                </button>
                
                <div class="model-modal-header">
                    <h2 class="model-modal-title">Universal Text Classifier System</h2>
                    <p class="model-modal-subtitle">Advanced dual-task AI model for text analysis</p>
                </div>
                
                <div class="model-modal-body">
                    <div class="model-modal-section">
                        <h3><i class="fas fa-info-circle"></i> Overview</h3>
                        <p>A hybrid machine learning system combining Sentence Transformers with ensemble classifiers for:</p>
                        <div class="modal-features">
                            <span class="modal-feature-tag">AI vs Human Detection</span>
                            <span class="modal-feature-tag">Plagiarism Detection</span>
                            <span class="modal-feature-tag">Semantic Analysis</span>
                            <span class="modal-feature-tag">Linguistic Features</span>
                        </div>
                    </div>
                    
                    <div class="model-modal-section">
                        <h3><i class="fas fa-chart-bar"></i> Model Accuracy</h3>
                        <div class="accuracy-grid">
                            <div class="accuracy-item">
                                <div class="accuracy-value" style="color: #10b981;">100%</div>
                                <div class="accuracy-label">AI/Human</div>
                            </div>
                            <div class="accuracy-item">
                                <div class="accuracy-value" style="color: #f59e0b;">86%</div>
                                <div class="accuracy-label">Plagiarism</div>
                            </div>
                            <div class="accuracy-item">
                                <div class="accuracy-value" style="color: #6366f1;">92%</div>
                                <div class="accuracy-label">Overall</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="model-modal-section">
                        <h3><i class="fas fa-tachometer-alt"></i> Feature Importance</h3>
                        <div class="feature-bars">
                            <div class="feature-bar">
                                <div class="feature-label">Embeddings</div>
                                <div class="feature-progress">
                                    <div class="feature-fill" style="width: 95%; background: linear-gradient(90deg, #6366f1, #8b5cf6);"></div>
                                </div>
                                <div class="feature-value">95%</div>
                            </div>
                            <div class="feature-bar">
                                <div class="feature-label">Semantic</div>
                                <div class="feature-progress">
                                    <div class="feature-fill" style="width: 75%; background: linear-gradient(90deg, #8b5cf6, #a78bfa);"></div>
                                </div>
                                <div class="feature-value">75%</div>
                            </div>
                            <div class="feature-bar">
                                <div class="feature-label">Linguistic</div>
                                <div class="feature-progress">
                                    <div class="feature-fill" style="width: 60%; background: linear-gradient(90deg, #a78bfa, #c4b5fd);"></div>
                                </div>
                                <div class="feature-value">60%</div>
                            </div>
                            <div class="feature-bar">
                                <div class="feature-label">Statistical</div>
                                <div class="feature-progress">
                                    <div class="feature-fill" style="width: 45%; background: linear-gradient(90deg, #c4b5fd, #ddd6fe);"></div>
                                </div>
                                <div class="feature-value">45%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="model-modal-section">
                        <h3><i class="fas fa-cogs"></i> Architecture</h3>
                        <div class="architecture-grid">
                            <div class="arch-item">
                                <div class="arch-label">Base Encoder</div>
                                <div class="arch-value">all-MiniLM-L6-v2</div>
                            </div>
                            <div class="arch-item">
                                <div class="arch-label">Embedding Size</div>
                                <div class="arch-value">384 dimensions</div>
                            </div>
                            <div class="arch-item">
                                <div class="arch-label">AI/Human Model</div>
                                <div class="arch-value">XGBoost (300 estimators)</div>
                            </div>
                            <div class="arch-item">
                                <div class="arch-label">Plagiarism Model</div>
                                <div class="arch-value">Random Forest (200 trees)</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="model-modal-section">
                        <h3><i class="fas fa-rocket"></i> Deployment</h3>
                        <div class="deployment-info">
                            <p>Complete system saved as <code>universal_text_system.pkl</code> (82.7 MB)</p>
                            <div class="deployment-tags">
                                <span class="deployment-tag">UniversalTextEncoder</span>
                                <span class="deployment-tag">XGBoost Model</span>
                                <span class="deployment-tag">Random Forest</span>
                                <span class="deployment-tag">Feature Extractor</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="model-modal-footer">
                    <button class="btn btn-secondary" onclick="closeModelDetails()">
                        Close
                    </button>
                    <button class="btn btn-primary" onclick="showNotification('Exporting model report...', 'info')">
                        <i class="fas fa-download"></i> Export Report
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Add modal styles
        addModalStyles();
    }

    // Show modal with animation
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
}

// FIXED: Close model details
function closeModelDetails() {
    const modal = document.getElementById("model-details-modal");
    if (modal) {
        modal.classList.remove("active");
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
        document.body.style.overflow = "auto";
    }
}

// Add this CSS styling to your head or create a style element
function addModelCardStyles() {
    const styleId = "model-card-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
        /* Model Section Container */
        .model-section {
            padding: 5rem 0;
            background: linear-gradient(135deg, 
                rgba(99, 102, 241, 0.05) 0%, 
                rgba(139, 92, 246, 0.03) 50%, 
                rgba(16, 185, 129, 0.02) 100%);
            position: relative;
            overflow: hidden;
        }
        
        .model-section::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -20%;
            width: 60%;
            height: 200%;
            background: radial-gradient(circle, 
                rgba(99, 102, 241, 0.1) 0%, 
                rgba(99, 102, 241, 0.05) 30%, 
                transparent 70%);
            z-index: 0;
        }
        
        .model-section .container {
            position: relative;
            z-index: 1;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1.5rem;
        }
        
        .section-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        
        .section-header h2 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .section-header p {
            color: var(--text-secondary);
            font-size: 1.125rem;
            max-width: 600px;
            margin: 0 auto;
        }
        
        /* Model Card Styling */
        .model-card {
            max-width: 900px;
            margin: 0 auto;
            padding: 2.5rem;
            border-radius: 24px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            position: relative;
            overflow: hidden;
        }
        
        .model-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #6366f1, #8b5cf6, #10b981);
            z-index: 1;
        }
        
        .model-card.glass-card {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
        }
        
        /* Light mode specific */
        body.light .model-card {
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(0, 0, 0, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        
        /* Dark mode specific */
        body.dark .model-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .model-header {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            margin-bottom: 2.5rem;
        }
        
        .model-icon {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            color: white;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }
        
        .model-info {
            flex: 1;
        }
        
        .model-name {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }
        
        .model-type {
            color: var(--text-secondary);
            font-size: 1rem;
        }
        
        .model-badge .badge-active {
            padding: 0.75rem 1.5rem;
            background: rgba(16, 185, 129, 0.15);
            border: 2px solid #10b981;
            border-radius: 25px;
            color: #10b981;
            font-size: 0.875rem;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .model-badge .badge-active::before {
            content: '●';
            font-size: 0.75rem;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .model-metrics {
            margin-bottom: 2.5rem;
        }
        
        .metric-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
        }
        
        @media (max-width: 768px) {
            .metric-row {
                grid-template-columns: 1fr;
            }
        }
        
        .metric-item {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        
        .metric-label {
            color: var(--text-secondary);
            font-size: 1rem;
            font-weight: 600;
        }
        
        /* Progress Bar - Force fill with color */
.metric-bar {
    width: 100%;
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    overflow: hidden;
    margin: 0.75rem 0;
}

.metric-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 1s ease;
}

/* Blue gradient for all fills */
.metric-fill {
    background: linear-gradient(90deg, #6366f1, #8b5cf6) !important;
}

/* For 100% fill (AI Accuracy) - Green gradient */
.metric-fill[style*="width: 100%"] {
    background: linear-gradient(90deg, #10b981, #34d399) !important;
}

/* For 86% fill (Plagiarism) - Blue/Purple gradient */
.metric-fill[style*="width: 86%"] {
    background: linear-gradient(90deg, #6366f1, #8b5cf6) !important;
}

/* Ensure the bar container has proper styling */
.metric-item {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 16px;
    padding: 1rem;
    width: 100%;
}

.metric-label {
    color: var(--text-secondary, #a0a0b8);
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-top: 0.5rem;
}
        
        .model-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2.5rem;
            padding: 1.5rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
        }
        
        .detail-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            color: var(--text-primary);
        }
        
        .detail-item i {
            color: #6366f1;
            font-size: 1.25rem;
            width: 24px;
        }
        
        .model-features {
            margin-bottom: 2.5rem;
        }
        
        .model-features h4 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .feature-chip {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.25rem;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 12px;
            color: #6366f1;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .feature-chip:hover {
            background: rgba(99, 102, 241, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(99, 102, 241, 0.2);
        }
        
        .feature-chip i {
            font-size: 0.875rem;
        }
        
        .model-performance {
            margin-bottom: 2.5rem;
        }
        
        .model-performance h4 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .performance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
        }
        
        .perf-item {
            padding: 1.5rem;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .perf-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .perf-label {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 0.75rem;
            font-weight: 500;
        }
        
        .perf-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #6366f1;
        }
        
        /* Radar Chart Container - FIXED FOR LIGHT MODE */
        .radar-chart-container {
            height: 350px;
            margin: 2.5rem 0;
            padding: 1.5rem;
            background: var(--bg-secondary);
            border-radius: 16px;
            border: 1px solid var(--border-color);
            position: relative;
        }
        
        /* Light mode specific for radar chart */
        body.light .radar-chart-container {
            background: rgba(99, 102, 241, 0.02);
            border: 1px solid rgba(0, 0, 0, 0.08);
        }
        
        /* Dark mode specific for radar chart */
        body.dark .radar-chart-container {
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .radar-chart-container canvas {
            width: 100% !important;
            height: 100% !important;
        }
        
        /* Ensure radar chart labels are visible in both modes */
        .radar-chart-labels {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            pointer-events: none;
        }
        
        .radar-label {
            position: absolute;
            font-size: 0.875rem;
            font-weight: 600;
            text-align: center;
            width: 80px;
        }
        
        /* Light mode labels */
        body.light .radar-label {
            color: rgba(0, 0, 0, 0.8) !important;
        }
        
        /* Dark mode labels */
        body.dark .radar-label {
            color: rgba(255, 255, 255, 0.9) !important;
        }
        
        .model-actions {
            display: flex;
            gap: 1rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
        }
        
        @media (max-width: 768px) {
            .model-actions {
                flex-direction: column;
            }
        }
        
        .model-actions .btn {
            flex: 1;
            padding: 1rem 2rem;
            font-size: 1rem;
            font-weight: 600;
        }
        
        /* Loading State */
        .loading-state {
            text-align: center;
            padding: 3rem;
        }
        
        .loader {
            width: 50px;
            height: 50px;
            border: 3px solid var(--border-color);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .model-section {
                padding: 3rem 0;
            }
            
            .model-card {
                padding: 1.5rem;
            }
            
            .section-header h2 {
                font-size: 2rem;
            }
            
            .model-icon {
                width: 60px;
                height: 60px;
                font-size: 2rem;
            }
            
            .model-name {
                font-size: 1.5rem;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
            
            .performance-grid {
                grid-template-columns: 1fr;
            }
            
            .model-details {
                grid-template-columns: 1fr;
            }
            
            .radar-chart-container {
                height: 300px;
                padding: 1rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// FIXED: Update the renderRadarChart function to handle light mode text visibility
function renderRadarChart() {
    const ctx = document.getElementById("model-radar-chart");
    if (!ctx) {
        console.error("Radar chart canvas not found");
        return;
    }

    // Check if Chart.js is loaded
    if (typeof Chart === "undefined") {
        console.error("Chart.js is not loaded");
        createFallbackRadarChart(ctx);
        return;
    }

    // Clear any existing chart
    if (window.modelRadarChart) {
        window.modelRadarChart.destroy();
    }

    const isLightMode =
        document.documentElement.getAttribute("data-theme") === "light";

    // Colors for both modes
    const textColor = isLightMode
        ? "rgba(0, 0, 0, 0.8)"
        : "rgba(255, 255, 255, 0.9)";
    const gridColor = isLightMode
        ? "rgba(0, 0, 0, 0.1)"
        : "rgba(255, 255, 255, 0.1)";
    const pointColor = isLightMode ? "#4f46e5" : "#6366f1";
    const backgroundColor = isLightMode
        ? "rgba(79, 70, 229, 0.2)"
        : "rgba(99, 102, 241, 0.2)";
    const borderColor = isLightMode ? "#4f46e5" : "#6366f1";
    const tooltipBg = isLightMode
        ? "rgba(255, 255, 255, 0.95)"
        : "rgba(15, 15, 30, 0.95)";
    const tooltipText = isLightMode ? "#000" : "#fff";

    window.modelRadarChart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: [
                "Accuracy",
                "Precision",
                "Recall",
                "F1 Score",
                "Speed",
                "Robustness",
            ],
            datasets: [
                {
                    label: "Model Performance",
                    data: [100, 98.7, 99.5, 99.1, 95, 92],
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    borderWidth: 3,
                    pointBackgroundColor: pointColor,
                    pointBorderColor: isLightMode ? "#fff" : "#0f172a",
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    min: 0,
                    ticks: {
                        stepSize: 20,
                        color: textColor,
                        backdropColor: "transparent",
                        showLabelBackdrop: false,
                        font: {
                            size: 11,
                            family: "'Inter', sans-serif",
                            weight: "500",
                        },
                    },
                    grid: {
                        color: gridColor,
                        lineWidth: 1,
                    },
                    angleLines: {
                        color: gridColor,
                        lineWidth: 1,
                    },
                    pointLabels: {
                        color: textColor,
                        font: {
                            size: 13,
                            family: "'Inter', sans-serif",
                            weight: "600",
                        },
                        padding: 15,
                    },
                },
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: tooltipBg,
                    titleColor: tooltipText,
                    bodyColor: tooltipText,
                    borderColor: borderColor,
                    borderWidth: 2,
                    cornerRadius: 8,
                    padding: 12,
                    titleFont: {
                        size: 13,
                        weight: "600",
                    },
                    bodyFont: {
                        size: 12,
                    },
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}%`;
                        },
                    },
                },
            },
            animation: {
                duration: 2000,
                easing: "easeOutQuart",
                onComplete: function () {
                    // Force chart update for theme consistency
                    window.modelRadarChart.update("none");
                },
            },
            elements: {
                line: {
                    tension: 0.3,
                },
            },
        },
    });
}

// FIXED: Update the createFallbackRadarChart for light mode
function createFallbackRadarChart(canvas) {
    const ctx = canvas.getContext("2d");
    const width = canvas.width || canvas.parentElement.clientWidth;
    const height = canvas.height || 300;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const isLightMode =
        document.documentElement.getAttribute("data-theme") === "light";
    const textColor = isLightMode ? "#000" : "#fff";
    const gridColor = isLightMode
        ? "rgba(0, 0, 0, 0.1)"
        : "rgba(220, 29, 29, 0.1)";
    const lineColor = isLightMode ? "#4f46e5" : "#cacad1";
    const fillColor = isLightMode
        ? "rgba(79, 70, 229, 0.2)"
        : "rgba(29, 32, 216, 0.2)";

    // Draw concentric circles
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    for (let i = 1; i <= 5; i++) {
        const circleRadius = radius * (i / 5);
        ctx.beginPath();
        ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw axes
    const sides = 6;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    // Draw polygon (radar shape)
    const points = [];
    const values = [100, 98.7, 99.5, 99.1, 95, 92];

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;

    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const valueRadius = radius * (values[i] / 100);
        const x = centerX + valueRadius * Math.cos(angle);
        const y = centerY + valueRadius * Math.sin(angle);
        points.push({ x, y });

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw points
    points.forEach((point) => {
        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isLightMode ? "#fff" : "#0f172a";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw labels - FIXED FOR LIGHT MODE
    ctx.fillStyle = textColor;
    ctx.font = 'bold 13px "Inter", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const labels = [
        "Accuracy",
        "Precision",
        "Recall",
        "F1 Score",
        "Speed",
        "Robustness",
    ];

    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const labelRadius = radius * 1.25;
        let x = centerX + labelRadius * Math.cos(angle);
        let y = centerY + labelRadius * Math.sin(angle);

        // Adjust positions for readability
        const offset = 5;
        if (Math.abs(angle) < 0.1) {
            // Top
            y -= offset;
        } else if (Math.abs(angle - Math.PI) < 0.1) {
            // Bottom
            y += offset + 5;
        } else if (Math.abs(angle - Math.PI / 2) < 0.1) {
            // Right
            x += offset;
        } else if (Math.abs(angle + Math.PI / 2) < 0.1) {
            // Left
            x -= offset;
        }

        ctx.fillText(labels[i], x, y);

        // Draw value labels inside
        const valueRadius = radius * 0.8;
        const valueX = centerX + valueRadius * Math.cos(angle);
        const valueY = centerY + valueRadius * Math.sin(angle);

        ctx.font = 'bold 11px "Inter", sans-serif';
        ctx.fillStyle = lineColor;
        ctx.fillText(values[i] + "%", valueX, valueY);
        ctx.font = 'bold 13px "Inter", sans-serif';
        ctx.fillStyle = textColor;
    }

    // Draw center title
    ctx.font = 'bold 14px "Inter", sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText("Performance", centerX, centerY);
}

// Update the DOMContentLoaded to add styles
document.addEventListener("DOMContentLoaded", function () {
    console.log("Initializing TextGuard AI...");

    // Add model card styles
    addModelCardStyles();

    // Initialize auth first
    if (typeof initializeAuth === "function") {
        initializeAuth();
    }

    // Check authentication status
    checkAuthStatus();

    // Load analytics from localStorage
    loadAnalytics();

    // Setup event listeners
    setupEventListeners();

    // Initialize dashboard
    renderDynamicDashboard();

    // Initialize model card - Wait a bit to ensure DOM is ready
    setTimeout(() => {
        renderModelCard();
    }, 500);

    // Setup hero animations
    setupHeroAnimations();

    // Setup theme
    const savedTheme = localStorage.getItem("textguard_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const themeSwitch = document.getElementById("theme-switch");
    if (themeSwitch) {
        themeSwitch.checked = savedTheme === "light";
        themeSwitch.addEventListener("change", function () {
            // Update radar chart on theme change
            setTimeout(() => {
                if (window.modelRadarChart) {
                    window.modelRadarChart.destroy();
                }
                renderRadarChart();
            }, 300);
        });
    }

    console.log("TextGuard AI initialized successfully!");
});

// Add window resize handler for responsive radar chart
window.addEventListener("resize", function () {
    if (window.modelRadarChart) {
        window.modelRadarChart.resize();
    }
});

// FIXED: Add modal styles
function addModalStyles() {
    const styleId = "model-modal-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
        .model-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
        }
        
        .model-modal.active {
            display: block;
        }
        
        .model-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(4px);
        }
        
        .model-modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            background: var(--bg-primary);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
            overflow-y: auto;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .model-modal.active .model-modal-content {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        
        .model-modal-close {
            position: absolute;
            top: 1.5rem;
            right: 1.5rem;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            z-index: 10000;
        }
        
        .model-modal-close:hover {
            background: var(--primary);
            color: white;
            transform: rotate(90deg);
        }
        
        .model-modal-header {
            margin-bottom: 2rem;
            padding-right: 3rem;
        }
        
        .model-modal-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
         
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .model-modal-subtitle {
            color: var(--text-secondary);
            font-size: 1rem;
        }
        
        .model-modal-section {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
        }
        
        .model-modal-section:last-child {
            border-bottom: none;
        }
        
        .model-modal-section h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .modal-features {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .modal-feature-tag {
            padding: 0.5rem 1rem;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid var(--primary);
            border-radius: 20px;
            font-size: 0.875rem;
            color: var(--primary);
        }
        
        .accuracy-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-top: 1rem;
        }
        
        .accuracy-item {
            text-align: center;
            padding: 1.5rem;
            background: var(--bg-secondary);
            border-radius: 12px;
            border: 1px solid var(--border-color);
        }
        
        .accuracy-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .accuracy-label {
            color: var(--text-secondary);
            font-size: 0.875rem;
        }
        
        .feature-bars {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .feature-bar {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .feature-label {
            width: 100px;
            color: var(--text-primary);
            font-size: 0.875rem;
        }
        
        .feature-progress {
            flex: 1;
            height: 10px;
            background: var(--bg-secondary);
            border-radius: 5px;
            overflow: hidden;
        }
        
        .feature-fill {
            height: 100%;
            border-radius: 5px;
            transition: width 1s ease;
        }
        
        .feature-value {
            width: 50px;
            text-align: right;
            font-weight: 600;
            color: var(--primary);
        }
        
        .architecture-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .arch-item {
            padding: 1rem;
            background: var(--bg-secondary);
            border-radius: 10px;
            border: 1px solid var(--border-color);
        }
        
        .arch-label {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
        }
        
        .arch-value {
            color: var(--text-primary);
            font-weight: 600;
        }
        
        .deployment-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 1rem;
        }
        
        .deployment-tag {
            padding: 0.5rem 1rem;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid #10b981;
            border-radius: 20px;
            font-size: 0.875rem;
            color: #10b981;
        }
        
        .model-modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid var(--border-color);
        }
        
        @media (max-width: 768px) {
            .model-modal-content {
                width: 95%;
                padding: 1.5rem;
            }
            
            .accuracy-grid {
                grid-template-columns: 1fr;
            }
            
            .architecture-grid {
                grid-template-columns: 1fr;
            }
            
            .model-modal-footer {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(style);
}

// FIXED: Add this to DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("Initializing TextGuard AI...");

    // Initialize auth first
    if (typeof initializeAuth === "function") {
        initializeAuth();
    }

    // Check authentication status
    checkAuthStatus();

    // Load analytics from localStorage
    loadAnalytics();

    // Setup event listeners
    setupEventListeners();

    // Initialize dashboard
    renderDynamicDashboard();

    // Initialize model card - IMPORTANT: Wait a bit to ensure DOM is ready
    setTimeout(() => {
        renderModelCard();
    }, 500);

    // Setup hero animations
    setupHeroAnimations();

    // Setup theme
    const savedTheme = localStorage.getItem("textguard_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    const themeSwitch = document.getElementById("theme-switch");
    if (themeSwitch) {
        themeSwitch.checked = savedTheme === "light";
        themeSwitch.addEventListener("change", function () {
            // Update radar chart on theme change
            setTimeout(renderRadarChart, 300);
        });
    }

    console.log("TextGuard AI initialized successfully!");
});

// FIXED: Add global cleanup
window.addEventListener("beforeunload", function () {
    cleanupCharts();
});

// FIXED: Cleanup function
function cleanupCharts() {
    // Clean up model radar chart
    if (window.modelRadarChart) {
        window.modelRadarChart.destroy();
        window.modelRadarChart = null;
    }

    // Clean up other Chart.js instances
    if (typeof Chart !== "undefined") {
        Chart.helpers.each(Chart.instances, function (instance) {
            try {
                instance.destroy();
            } catch (e) {
                // Ignore errors
            }
        });
    }
}

function renderRadarChart() {
    const ctx = document.getElementById("model-radar-chart");
    if (!ctx || typeof Chart === "undefined") return;

    // Check if a chart already exists on this canvas
    if (ctx.chart) {
        ctx.chart.destroy();
    }

    // Create new chart
    ctx.chart = new Chart(ctx, {
        type: "radar",
        data: {
            labels: [
                "Accuracy",
                "Precision",
                "Recall",
                "F1 Score",
                "Speed",
                "Reliability",
            ],
            datasets: [
                {
                    label: "Model Performance",
                    data: [99.2, 98.7, 99.5, 99.1, 95.0, 99.9],
                    backgroundColor: "rgba(99, 102, 241, 0.2)",
                    borderColor: "#6366f1",
                    pointBackgroundColor: "#6366f1",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "#6366f1",
                    borderWidth: 2,
                    pointRadius: 4,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: "rgba(255, 255, 255, 0.1)" },
                    grid: { color: "rgba(255, 255, 255, 0.1)" },
                    pointLabels: { color: "rgba(255, 255, 255, 0.8)" },
                    ticks: {
                        backdropColor: "transparent",
                        color: "rgba(255, 255, 255, 0.5)",
                        stepSize: 20,
                    },
                    suggestedMin: 80,
                    suggestedMax: 100,
                },
            },
            plugins: {
                legend: { display: false },
            },
        },
    });
}

// FAQ Accordion Functionality
function initFAQ() {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        question.addEventListener("click", () => {
            const isExpanded = question.getAttribute("aria-expanded") === "true";

            // Close all other FAQ items
            faqItems.forEach((otherItem) => {
                if (otherItem !== item) {
                    otherItem
                        .querySelector(".faq-question")
                        .setAttribute("aria-expanded", "false");
                    otherItem.querySelector(".faq-answer").style.maxHeight = null;
                    otherItem.classList.remove("active");
                }
            });

            // Toggle current item
            question.setAttribute("aria-expanded", !isExpanded);
            if (!isExpanded) {
                answer.style.maxHeight = answer.scrollHeight + "px";
                item.classList.add("active");
            } else {
                answer.style.maxHeight = null;
                item.classList.remove("active");
            }
        });
    });

    // Also support Enter key for accessibility
    faqItems.forEach((item) => {
        item.querySelector(".faq-question").addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                item.querySelector(".faq-question").click();
            }
        });
    });
}

// Initialize FAQ when DOM is loaded
document.addEventListener("DOMContentLoaded", initFAQ);

// Function to open chat from FAQ footer (if you have chat functionality)
function openChat() {
    const chatToggle = document.getElementById("chatToggle");
    if (chatToggle) {
        chatToggle.click();
    }
}

// Helper Functions
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
}

function showNotification(message, type = "info") {
    // Remove existing notifications
    document.querySelectorAll(".notification").forEach((n) => n.remove());

    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = "0";
            notification.style.transform = "translateX(100%)";
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: "check-circle",
        error: "exclamation-circle",
        warning: "exclamation-triangle",
        info: "info-circle",
    };
    return icons[type] || "info-circle";
}

function scrollToChecker() {
    const checker = document.getElementById("checker");
    if (checker) {
        checker.scrollIntoView({ behavior: "smooth" });
    }
}

function setupHeroAnimations() {
    // Animate hero stats
    const statValues = document.querySelectorAll(".stat-value[data-target]");
    statValues.forEach((stat) => {
        const target = parseFloat(stat.dataset.target);
        const isPercentage = stat.textContent.includes("%");
        let current = 0;
        const increment = target / 60; // 2 seconds at 30fps

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = isPercentage
                ? current.toFixed(1) + "%"
                : Math.floor(current).toLocaleString();
        }, 33);
    });
}


// Replace BOTH functions with these

function initializeResultsPanel() {
    const resultsPanel = document.getElementById("results-panel");
    if (!resultsPanel) return;

    // Create overlay in DOM if it doesn't exist
    if (!document.getElementById("resultsOverlay")) {
        const overlay = document.createElement("div");
        overlay.id = "resultsOverlay";
        overlay.style.cssText = [
            "position:fixed",
            "inset:0",
            "background:rgba(0,0,0,0.7)",
            "z-index:10000",
            "display:none",
            "backdrop-filter:blur(2px)"
        ].join(";");
        document.body.appendChild(overlay);
        overlay.addEventListener("click", toggleResultsExpand);
    }

    // Resize handles (only add if not already present)
    const existingHandle = resultsPanel.querySelector(".resize-handle-bottom");
    if (existingHandle) return; // already initialized

    const handleBottom = document.createElement("div");
    handleBottom.className = "resize-handle-bottom";
    resultsPanel.appendChild(handleBottom);

    const handleCorner = document.createElement("div");
    handleCorner.className = "resize-handle-corner";
    resultsPanel.appendChild(handleCorner);

    const resizeInfo = document.createElement("div");
    resizeInfo.className = "resize-info";
    resultsPanel.appendChild(resizeInfo);

    handleBottom.addEventListener("mousedown", (e) => {
        e.preventDefault();
        resultsIsResizing = true;
        resultsResizeType = "vertical";
        resultsStartY = e.clientY;
        resultsStartHeight = resultsPanel.offsetHeight;
        resultsPanel.classList.add("resizing");
    });

    handleCorner.addEventListener("mousedown", (e) => {
        e.preventDefault();
        resultsIsResizing = true;
        resultsResizeType = "both";
        resultsStartY = e.clientY;
        resultsStartX = e.clientX;
        resultsStartHeight = resultsPanel.offsetHeight;
        resultsStartWidth = resultsPanel.offsetWidth;
        resultsPanel.classList.add("resizing", "resizing-both");
    });

    document.addEventListener("mousemove", (e) => {
        if (!resultsIsResizing) return;
        const panel = document.getElementById("results-panel");
        if (!panel) return;

        if (resultsResizeType === "vertical") {
            const newH = Math.max(300, Math.min(resultsStartHeight + (e.clientY - resultsStartY), window.innerHeight - 100));
            panel.style.height = newH + "px";
        } else {
            const newH = Math.max(300, Math.min(resultsStartHeight + (e.clientY - resultsStartY), window.innerHeight - 100));
            const newW = Math.max(300, resultsStartWidth + (e.clientX - resultsStartX));
            panel.style.height = newH + "px";
            panel.style.width  = newW + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        if (!resultsIsResizing) return;
        resultsIsResizing = false;
        resultsResizeType = null;
        const panel = document.getElementById("results-panel");
        if (panel) {
            panel.classList.remove("resizing", "resizing-both");
            localStorage.setItem("resultsPanelHeight", panel.offsetHeight);
        }
    });

    const savedHeight = localStorage.getItem("resultsPanelHeight");
    if (savedHeight) resultsPanel.style.height = savedHeight + "px";
}

function toggleResultsExpand() {
    const resultsPanel   = document.getElementById("results-panel");
    const expandBtn      = document.getElementById("expand-results-btn");

    if (!resultsPanel) return;

    // Create overlay on demand if missing
    let resultsOverlay = document.getElementById("resultsOverlay");
    if (!resultsOverlay) {
        resultsOverlay = document.createElement("div");
        resultsOverlay.id = "resultsOverlay";
        resultsOverlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:10000;display:none;backdrop-filter:blur(3px)";
        resultsOverlay.addEventListener("click", toggleResultsExpand);
        document.body.appendChild(resultsOverlay);
    }

    resultsExpanded = !resultsExpanded;

    if (resultsExpanded) {
        resultsOverlay.style.display = "block";
        resultsPanel.classList.add("expanded");
        document.body.style.overflow = "hidden";
        if (expandBtn) expandBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        resultsOverlay.style.display = "none";
        resultsPanel.classList.remove("expanded");
        document.body.style.overflow = "";
        if (expandBtn) expandBtn.innerHTML = '<i class="fas fa-expand"></i>';
        const savedHeight = localStorage.getItem("resultsPanelHeight");
        resultsPanel.style.height = savedHeight ? savedHeight + "px" : "600px";
    }
}

// ==========================================
// TEXTGUARD AUTH FIX - Add as LAST script
// ==========================================

(function () {
    function syncNavbar() {
        const authButton = document.getElementById("auth-button");
        const userMenu = document.getElementById("user-menu");
        const userName = document.getElementById("user-name");
        const dropdownName = document.getElementById("dropdown-user-name");
        const dropdownEmail = document.getElementById("dropdown-user-email");

        let user = null;
        try {
            user =
                JSON.parse(localStorage.getItem("auth_user")) ||
                JSON.parse(localStorage.getItem("textguard_user"));
        } catch (e) { }

        const token =
            localStorage.getItem("auth_token") ||
            localStorage.getItem("textguard_token");

        if (user && token) {
            if (authButton)
                authButton.style.setProperty("display", "none", "important");
            if (userMenu) userMenu.style.setProperty("display", "flex", "important");
            if (userName) userName.textContent = user.name || user.email || "User";
            if (dropdownName)
                dropdownName.textContent = user.name || user.email || "User";
            if (dropdownEmail) dropdownEmail.textContent = user.email || "";
        } else {
            if (authButton)
                authButton.style.setProperty("display", "flex", "important");
            if (userMenu) userMenu.style.setProperty("display", "none", "important");
        }
    }

    function handleOAuthReturn() {
        const urlParams = new URLSearchParams(window.location.search);
        const auth = urlParams.get("auth");
        const token = urlParams.get("token");
        const email = urlParams.get("email");
        const name = urlParams.get("name");

        if (auth === "success" && token) {
            localStorage.setItem("auth_token", token);
            localStorage.setItem("auth_user", JSON.stringify({ email, name, token }));
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
        }
        return false;
    }

    window.logout = function () {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("textguard_token");
        localStorage.removeItem("textguard_user");
        if (document.getElementById("auth-button"))
            document
                .getElementById("auth-button")
                .style.setProperty("display", "flex", "important");
        if (document.getElementById("user-menu"))
            document
                .getElementById("user-menu")
                .style.setProperty("display", "none", "important");
        fetch("http://127.0.0.1:5000/api/auth/logout", {
            method: "POST",
            credentials: "include",
        }).catch(() => { });
        if (typeof showNotification === "function")
            showNotification("Logged out successfully", "success");
    };

    window.loginWithGoogle = function () {
        window.location.href = "http://127.0.0.1:5000/auth/google";
    };
    window.signUpWithGoogle = window.loginWithGoogle;

    handleOAuthReturn();
    syncNavbar();

    document.addEventListener("DOMContentLoaded", function () {
        syncNavbar();
        setTimeout(syncNavbar, 500);
        setTimeout(syncNavbar, 1200);
    });
})();

document.addEventListener("DOMContentLoaded", () => {
    initializeResultsPanel();
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && resultsExpanded) {
        toggleResultsExpand();
    }
});

// Global functions
window.scrollToChecker = scrollToChecker;
window.showNotification = showNotification;
window.continueAsGuest = continueAsGuest;
window.openAuthModal = openAuthModal;
