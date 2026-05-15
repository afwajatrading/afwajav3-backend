const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");

const host = (process.env.HOST || "0.0.0.0").trim();
const port = Number.parseInt(process.env.PORT || "4173", 10) || 4173;
const requestBaseUrl = (process.env.INTERNAL_BASE_URL || `http://localhost:${port}`).trim();
const rootDir = __dirname;
const { fleetData = {} } = require("./assets/js/fleet-data.js");
const paymentRecords = new Map();
const homeBaseBias = {
    latitude: 2.9226,
    longitude: 101.6559,
};

loadEnvFile(path.join(rootDir, ".env"));

const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webp": "image/webp",
};
const MINIMUM_BOOKING_NOTICE_HOURS = 12;
const RENTAL_DISCOUNT_RULES = [
    { minimumDays: 30, discountPercent: 45, label: "Monthly Rate" },
    { minimumDays: 7, discountPercent: 20, label: "Weekly Rate" },
    { minimumDays: 3, discountPercent: 10, label: "3+ Days Rate" },
];
const testCheckoutConfig = getTestCheckoutConfig();

const carCatalog = createCarCatalog();

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const envLines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

    envLines.forEach((line) => {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith("#")) {
            return;
        }

        const separatorIndex = trimmedLine.indexOf("=");
        if (separatorIndex === -1) {
            return;
        }

        const key = trimmedLine.slice(0, separatorIndex).trim();
        const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^['"]|['"]$/g, "");

        if (process.env[key] === undefined) {
            process.env[key] = value;
        }
    });
}

function parseBooleanEnv(value, defaultValue = false) {
    if (value === undefined || value === null || `${value}`.trim() === "") {
        return defaultValue;
    }

    return ["1", "true", "yes", "on"].includes(`${value}`.trim().toLowerCase());
}

function parseNumberEnv(value, defaultValue) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : defaultValue;
}

function getTestCheckoutConfig() {
    return {
        enabled: parseBooleanEnv(process.env.TEST_CHECKOUT_ENABLED, false),
        carName: `${process.env.TEST_CHECKOUT_CAR_NAME || ""}`.trim() || "Perodua Axia",
        total: parseNumberEnv(process.env.TEST_CHECKOUT_TOTAL, 1),
    };
}

function createCarCatalog() {
    const cars = new Map();

    Object.entries(fleetData).forEach(([groupName, groupCars]) => {
        groupCars.forEach((car) => {
            cars.set(car.name, {
                ...car,
                groupName,
                deposit: getCarDeposit(groupName, car.name),
            });
        });
    });

    return cars;
}

function getDepositByGroup(groupName) {
    if (groupName.includes("Kumpulan A")) return 100;
    if (groupName.includes("Kumpulan B")) return 200;
    if (groupName.includes("Kumpulan C")) return 300;
    if (groupName.includes("Kumpulan D")) return 400;
    return 0;
}

function isTestCheckoutCar(carName) {
    return testCheckoutConfig.enabled && carName === testCheckoutConfig.carName;
}

function getCarDeposit(groupName, carName) {
    if (isTestCheckoutCar(carName)) {
        return 0;
    }

    return getDepositByGroup(groupName);
}

function resolveFilePath(requestUrl) {
    const safeUrl = new URL(requestUrl, requestBaseUrl);
    const decodedPath = decodeURIComponent(safeUrl.pathname);
    const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
    const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(rootDir, normalizedPath);

    if (!filePath.startsWith(rootDir)) {
        return null;
    }

    return filePath;
}

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, payload) {
    response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(payload);
}

function sendHtml(response, statusCode, payload) {
    response.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8" });
    response.end(payload);
}

function sendJavaScript(response, statusCode, payload) {
    response.writeHead(statusCode, { "Content-Type": "application/javascript; charset=utf-8" });
    response.end(payload);
}

function trimValue(value) {
    return `${value ?? ""}`.trim();
}

function createRuntimeConfigScript() {
    const publicConfig = {
        testCheckout: {
            enabled: testCheckoutConfig.enabled,
            carName: testCheckoutConfig.carName,
            total: testCheckoutConfig.total,
        },
    };

    return `window.AfwajaRuntimeConfig = ${JSON.stringify(publicConfig, null, 2)};`;
}

function getCorsConfig() {
    return {
        allowedOrigin: trimValue(process.env.CORS_ALLOWED_ORIGIN),
    };
}

function applyCorsHeaders(request, response) {
    const corsConfig = getCorsConfig();
    const requestOrigin = trimValue(request.headers.origin);

    if (!corsConfig.allowedOrigin) {
        return;
    }

    if (corsConfig.allowedOrigin === "*" || corsConfig.allowedOrigin === requestOrigin) {
        response.setHeader("Access-Control-Allow-Origin", corsConfig.allowedOrigin === "*" ? "*" : requestOrigin);
        response.setHeader("Vary", "Origin");
    }

    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function normalizePhoneNumber(value) {
    const digitsOnly = trimValue(value).replace(/[^\d+]/g, "");
    const withoutPlus = digitsOnly.startsWith("+") ? digitsOnly.slice(1) : digitsOnly;

    if (withoutPlus.startsWith("60")) {
        return withoutPlus;
    }

    if (withoutPlus.startsWith("0")) {
        return `60${withoutPlus.slice(1)}`;
    }

    return withoutPlus;
}

function parseDateInput(value) {
    let year;
    let month;
    let day;

    if (/^\d{2}\/\d{2}\/\d{2}$/.test(value || "")) {
        const parsedParts = value.split("/").map(Number);
        [day, month] = parsedParts;
        year = 2000 + parsedParts[2];
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
        [year, month, day] = value.split("-").map(Number);
    } else {
        return null;
    }

    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    if (
        parsedDate.getUTCFullYear() !== year ||
        parsedDate.getUTCMonth() !== month - 1 ||
        parsedDate.getUTCDate() !== day
    ) {
        return null;
    }

    return parsedDate;
}

function todayString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const day = `${now.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function calculateRentalDays(pickupDate, returnDate) {
    const pickup = parseDateInput(pickupDate);
    const dropOff = parseDateInput(returnDate);

    if (!pickup || !dropOff) {
        return null;
    }

    const difference = Math.round((dropOff - pickup) / 86400000);

    if (difference < 0) {
        return -1;
    }

    return Math.max(1, difference);
}

function getRentalDiscountRule(chargeableDays) {
    return RENTAL_DISCOUNT_RULES.find((rule) => chargeableDays >= rule.minimumDays) || null;
}

function calculateRentalPricing(pickupDate, returnDate, pickupTime, returnTime, dailyRate) {
    const pickupDateTime = combineDateAndTime(pickupDate, pickupTime);
    const returnDateTime = combineDateAndTime(returnDate, returnTime);
    const normalizedDailyRate = Number(dailyRate);

    if (!pickupDateTime || !returnDateTime || Number.isNaN(normalizedDailyRate)) {
        return null;
    }

    const durationMilliseconds = returnDateTime.getTime() - pickupDateTime.getTime();

    if (durationMilliseconds < 0) {
        return null;
    }

    const totalMinutes = Math.ceil(durationMilliseconds / 60000);
    const baseDayMinutes = 24 * 60;

    if (totalMinutes <= baseDayMinutes) {
        return {
            baseDays: 1,
            extraHours: 0,
            extraHourCharge: 0,
            chargeableDays: 1,
            originalDailyRate: normalizedDailyRate,
            discountedDailyRate: normalizedDailyRate,
            discountPercent: 0,
            rateLabel: "Standard Rate",
            rentalCharge: normalizedDailyRate,
        };
    }

    const baseDays = Math.floor(totalMinutes / baseDayMinutes);
    const remainingMinutes = totalMinutes % baseDayMinutes;
    const extraHours = remainingMinutes > 0 ? Math.ceil(remainingMinutes / 60) : 0;
    const chargeableDays = Math.max(1, baseDays);
    const discountRule = getRentalDiscountRule(chargeableDays);
    const discountPercent = discountRule?.discountPercent || 0;
    const discountedDailyRate = normalizedDailyRate * ((100 - discountPercent) / 100);
    const extraHourCharge = Math.min(extraHours * discountedDailyRate * 0.1, discountedDailyRate);

    return {
        baseDays,
        extraHours,
        extraHourCharge,
        chargeableDays,
        originalDailyRate: normalizedDailyRate,
        discountedDailyRate,
        discountPercent,
        rateLabel: discountRule?.label || "Standard Rate",
        rentalCharge: (baseDays * discountedDailyRate) + extraHourCharge,
    };
}

function parseTimeInput(value) {
    if (!/^\d{2}:\d{2}$/.test(value || "")) {
        return null;
    }

    const [hours, minutes] = value.split(":").map(Number);
    return (hours * 60) + minutes;
}

function combineDateAndTime(dateValue, timeValue) {
    if (!dateValue || !timeValue) {
        return null;
    }

    const parsedDate = parseDateInput(dateValue);
    const timeParts = timeValue.split(":").map(Number);

    if (!parsedDate || timeParts.length !== 2) {
        return null;
    }

    const [hours, minutes] = timeParts;
    const combined = new Date(
        parsedDate.getUTCFullYear(),
        parsedDate.getUTCMonth(),
        parsedDate.getUTCDate(),
        hours,
        minutes,
        0,
        0
    );

    return Number.isNaN(combined.getTime()) ? null : combined;
}

function getMinimumPickupDateTime() {
    return new Date(Date.now() + (MINIMUM_BOOKING_NOTICE_HOURS * 60 * 60 * 1000));
}

function validateBookingSchedule(pickupDate, returnDate, pickupTime, returnTime) {
    const today = parseDateInput(todayString());
    const pickup = parseDateInput(pickupDate);
    const dropOff = parseDateInput(returnDate);

    if (!pickup || !dropOff) {
        return { valid: false, error: "Pick-up and return dates are required." };
    }

    if (pickup < today) {
        return { valid: false, error: "Pick-up date cannot be earlier than today." };
    }

    const rentalDays = calculateRentalDays(pickupDate, returnDate);
    if (rentalDays === null || rentalDays < 0) {
        return { valid: false, error: "Return date must be the same day or after the pick-up date." };
    }

    const pickupTimeMinutes = parseTimeInput(pickupTime);
    const returnTimeMinutes = parseTimeInput(returnTime);

    if (pickupTimeMinutes === null || returnTimeMinutes === null) {
        return { valid: false, error: "Pick-up and return times are required." };
    }

    const pickupDateTime = combineDateAndTime(pickupDate, pickupTime);
    const returnDateTime = combineDateAndTime(returnDate, returnTime);

    if (!pickupDateTime || !returnDateTime) {
        return { valid: false, error: "Invalid pick-up or return time." };
    }

    if (pickupDateTime < getMinimumPickupDateTime()) {
        return { valid: false, error: "Bookings must be made at least 12 hours in advance." };
    }

    if (returnDateTime < pickupDateTime || (pickupDate === returnDate && returnTimeMinutes < pickupTimeMinutes)) {
        return { valid: false, error: "Return time must be the same as or later than the pick-up time when both dates are the same." };
    }

    return {
        valid: true,
        rentalDays,
    };
}

function formatAmount(value) {
    return Number(value).toFixed(2);
}

function buildChecksum(payload, secretKey) {
    const sortedValues = Object.keys(payload)
        .sort()
        .map((key) => trimValue(payload[key]));

    return crypto
        .createHmac("sha256", secretKey)
        .update(sortedValues.join("|"))
        .digest("hex");
}

function verifyChecksum(payload, checksum, secretKey) {
    if (!checksum || !secretKey) {
        return false;
    }

    return buildChecksum(payload, secretKey) === checksum;
}

function normalizeComparableValue(value) {
    if (value === undefined || value === null) {
        return "";
    }

    return `${value}`.trim();
}

function getBayarcashConfig() {
    const frontendBaseUrl = trimValue(process.env.FRONTEND_BASE_URL) || trimValue(process.env.APP_BASE_URL) || requestBaseUrl;
    const apiPublicBaseUrl = trimValue(process.env.API_PUBLIC_BASE_URL) || trimValue(process.env.APP_BASE_URL) || requestBaseUrl;
    const apiBaseUrl = trimValue(process.env.BAYARCASH_API_BASE_URL) || "https://api.console.bayar.cash/v3";
    const portalKey = trimValue(process.env.BAYARCASH_PORTAL_KEY);
    const personalAccessToken = trimValue(process.env.BAYARCASH_PAT);
    const apiSecretKey = trimValue(process.env.BAYARCASH_API_SECRET_KEY);
    const paymentChannel = Number.parseInt(trimValue(process.env.BAYARCASH_PAYMENT_CHANNEL) || "1", 10) || 1;
    const callbackEnabled = !/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])/i.test(apiPublicBaseUrl);

    return {
        frontendBaseUrl,
        apiPublicBaseUrl,
        apiBaseUrl,
        portalKey,
        personalAccessToken,
        apiSecretKey,
        paymentChannel,
        returnUrl: `${frontendBaseUrl}/thank-you.html?payment_return=1`,
        callbackUrl: callbackEnabled ? `${apiPublicBaseUrl}/api/bayarcash/callback` : null,
    };
}

function isBayarcashConfigured(config) {
    return Boolean(config.portalKey && config.personalAccessToken && config.apiSecretKey);
}

function getEmailConfig() {
    return {
        provider: trimValue(process.env.EMAIL_PROVIDER || "resend").toLowerCase(),
        apiKey: trimValue(process.env.RESEND_API_KEY),
        fromEmail: trimValue(process.env.NOTIFICATION_FROM_EMAIL),
        fromName: trimValue(process.env.NOTIFICATION_FROM_NAME) || "Afwaja Car Rental",
        adminEmail: trimValue(process.env.ADMIN_NOTIFICATION_EMAIL),
        replyToEmail: trimValue(process.env.REPLY_TO_EMAIL) || trimValue(process.env.ADMIN_NOTIFICATION_EMAIL),
    };
}

function getWhatsAppConfig() {
    return {
        provider: trimValue(process.env.WHATSAPP_PROVIDER || "meta").toLowerCase(),
        accessToken: trimValue(process.env.WHATSAPP_ACCESS_TOKEN),
        phoneNumberId: trimValue(process.env.WHATSAPP_PHONE_NUMBER_ID),
        apiVersion: trimValue(process.env.WHATSAPP_API_VERSION) || "v23.0",
        mode: trimValue(process.env.WHATSAPP_MESSAGE_MODE || "template").toLowerCase(),
        templateLanguage: trimValue(process.env.WHATSAPP_TEMPLATE_LANGUAGE) || "en",
        successTemplateName: trimValue(process.env.WHATSAPP_TEMPLATE_SUCCESS_NAME),
        unsuccessfulTemplateName: trimValue(process.env.WHATSAPP_TEMPLATE_UNSUCCESSFUL_NAME),
    };
}

function isEmailConfigured(config) {
    if (config.provider !== "resend") {
        return false;
    }

    return Boolean(config.apiKey && config.fromEmail && config.adminEmail);
}

function isWhatsAppConfigured(config) {
    if (config.provider !== "meta") {
        return false;
    }

    if (!config.accessToken || !config.phoneNumberId) {
        return false;
    }

    if (config.mode === "template") {
        return Boolean(config.successTemplateName && config.unsuccessfulTemplateName);
    }

    return true;
}

function formatEmailSender(config) {
    return config.fromName ? `${config.fromName} <${config.fromEmail}>` : config.fromEmail;
}

async function sendEmail(message, config) {
    if (!isEmailConfigured(config)) {
        return { delivered: false, skipped: true };
    }

    if (config.provider !== "resend") {
        return { delivered: false, skipped: true };
    }

    const payload = {
        from: formatEmailSender(config),
        to: Array.isArray(message.to) ? message.to : [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
    };

    if (config.replyToEmail) {
        payload.reply_to = config.replyToEmail;
    }

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(`Email delivery failed: ${response.status} ${errorBody}`);
    }

    return { delivered: true };
}

function escapeHtml(value) {
    return `${value ?? ""}`
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatMaybeCurrency(value) {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
        return value || "-";
    }

    return `RM${numericValue.toFixed(2)}`;
}

function formatDisplayDate(value) {
    const parsedDate = parseDateInput(value);
    if (!parsedDate) {
        return value || "-";
    }

    const day = `${parsedDate.getUTCDate()}`.padStart(2, "0");
    const month = `${parsedDate.getUTCMonth() + 1}`.padStart(2, "0");
    const year = parsedDate.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

function createEmailInfoTable(rows) {
    return rows.map(([label, value]) => `
        <tr>
            <td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#334155;background:#f8fafc;width:38%;">${escapeHtml(label)}</td>
            <td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;color:#0f172a;background:#ffffff;">${escapeHtml(value || "-")}</td>
        </tr>
    `).join("");
}

function createBookingSummaryHtml(record) {
    const overviewCards = [
        ["Order Number", record.orderNumber],
        ["Transaction ID", record.transactionId],
        ["Vehicle", record.carName],
        ["Total Paid", formatMaybeCurrency(record.amount)],
    ];

    const bookingDetails = [
        ["Customer Name", record.customerName],
        ["Customer Email", record.customerEmail],
        ["Customer Phone", record.customerPhone],
        ["Rental Period", `${record.pickupDate} ${record.pickupTime} to ${record.returnDate} ${record.returnTime}`],
        ["Pickup Location", record.pickupLocation],
        ["Return Location", record.returnLocation],
        ["Rate Plan", record.rateLabel],
    ];

    const paymentDetails = [
        ["Rental Charges", formatMaybeCurrency(record.rentalCharges)],
        ["Delivery Charge", formatMaybeCurrency(record.deliveryCharge)],
        ["Return Pickup Charge", formatMaybeCurrency(record.returnPickupCharge)],
        ["Refundable Deposit", formatMaybeCurrency(record.refundableDeposit)],
        ["Total Paid", formatMaybeCurrency(record.amount)],
    ];

    const overviewHtml = overviewCards.map(([label, value]) => `
        <div style="min-width:160px;flex:1 1 220px;padding:18px 18px 16px;border:1px solid #dbeafe;border-radius:18px;background:linear-gradient(180deg,#f8fdff 0%,#eff6ff 100%);">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#0891b2;">${escapeHtml(label)}</p>
            <p style="margin:0;font-size:18px;line-height:1.4;font-weight:700;color:#0f172a;">${escapeHtml(value || "-")}</p>
        </div>
    `).join("");

    return `
        <div style="margin:0 0 22px;">
            <div style="display:flex;flex-wrap:wrap;gap:12px;">
                ${overviewHtml}
            </div>
        </div>

        <div style="margin:0 0 20px;padding:20px 20px 10px;border:1px solid #e2e8f0;border-radius:20px;background:#ffffff;">
            <h2 style="margin:0 0 14px;font-size:17px;line-height:1.3;color:#1f2d3d;">Booking Details</h2>
            <table style="width:100%;border-collapse:collapse;border-spacing:0;">
                ${createEmailInfoTable(bookingDetails)}
            </table>
        </div>

        <div style="padding:20px 20px 10px;border:1px solid #e2e8f0;border-radius:20px;background:#ffffff;">
            <h2 style="margin:0 0 14px;font-size:17px;line-height:1.3;color:#1f2d3d;">Payment Breakdown</h2>
            <table style="width:100%;border-collapse:collapse;border-spacing:0;">
                ${createEmailInfoTable(paymentDetails)}
            </table>
        </div>
    `;
}

function createEmailLayout({
    eyebrow,
    title,
    intro,
    highlightValue,
    highlightLabel,
    summaryHtml,
    closingTitle,
    closingText,
    footerNote,
    accentColor = "#0d9488",
}) {
    return `
        <div style="margin:0;padding:24px;background:#f8fafc;font-family:Poppins,Arial,sans-serif;color:#0f172a;">
            <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 18px 40px rgba(15,23,42,0.08);">
                <div style="padding:28px 32px;background:linear-gradient(135deg,#12324c 0%,#1f2d3d 52%,#0f172a 100%);color:#ffffff;">
                    <div style="display:flex;align-items:center;gap:14px;">
                        <img src="https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2KFY3QZ342VQBTS02D1K8E.png" alt="Afwaja Car Rental" style="height:42px;width:auto;display:block;">
                        <div>
                            <p style="margin:0;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;color:#bae6fd;font-weight:700;">${escapeHtml(eyebrow)}</p>
                            <h1 style="margin:8px 0 0;font-size:28px;line-height:1.2;color:#ffffff;">${escapeHtml(title)}</h1>
                        </div>
                    </div>
                </div>

                <div style="padding:32px;">
                    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#475569;">${intro}</p>

                    <div style="margin:0 0 24px;padding:20px 22px;border-radius:20px;background:linear-gradient(180deg,rgba(34,211,238,0.08),rgba(13,148,136,0.08));border:1px solid rgba(13,148,136,0.14);">
                        <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${accentColor};">${escapeHtml(highlightLabel)}</p>
                        <p style="margin:0;font-size:30px;line-height:1.1;font-weight:700;color:#0f172a;">${escapeHtml(highlightValue)}</p>
                    </div>

                    ${summaryHtml}

                    <div style="padding:18px 20px;border-radius:18px;background:#f8fafc;border:1px solid #e2e8f0;">
                        <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#1f2d3d;">${escapeHtml(closingTitle)}</p>
                        <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">${closingText}</p>
                    </div>
                </div>

                <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
                    <p style="margin:0;font-size:12px;line-height:1.7;color:#64748b;">${footerNote}</p>
                </div>
            </div>
        </div>
    `;
}

function createCustomerEmail(record) {
    const summaryHtml = createBookingSummaryHtml(record);
    const customerName = escapeHtml(record.customerName || "Customer");
    const intro = `Hi ${customerName}, your payment has been received successfully.`;
    const closingText = "Our team will contact you shortly to confirm the vehicle handover and trip details. If you need help, reach us at WhatsApp 011-15122092.";

    return {
        to: record.customerEmail,
        subject: `Booking Confirmed - ${record.orderNumber}`,
        html: createEmailLayout({
            eyebrow: "Booking Confirmed",
            title: "Thank you for your booking",
            intro,
            highlightValue: formatMaybeCurrency(record.amount),
            highlightLabel: "Total Paid",
            summaryHtml,
            closingTitle: "What happens next",
            closingText,
            footerNote: "This email confirms your successful payment with Afwaja Car Rental. Please keep this message for your records.",
        }),
        text: [
            `Thank you for your booking, ${record.customerName || "Customer"}.`,
            `Order Number: ${record.orderNumber}`,
            `Transaction ID: ${record.transactionId}`,
            `Car: ${record.carName}`,
            `Rental Period: ${record.pickupDate} ${record.pickupTime} to ${record.returnDate} ${record.returnTime}`,
            `Total Paid: ${formatMaybeCurrency(record.amount)}`,
        ].join("\n"),
    };
}

function createAdminEmail(record) {
    const summaryHtml = createBookingSummaryHtml(record);
    const intro = `A customer has completed payment successfully via BayarCash. Please review the booking summary below and proceed with follow-up.`;
    const closingText = "Please contact the customer for final confirmation, logistics coordination, and vehicle handover arrangements.";

    return {
        to: record.adminEmail,
        subject: `New Paid Booking - ${record.orderNumber}`,
        html: createEmailLayout({
            eyebrow: "Admin Notification",
            title: "New paid booking received",
            intro,
            highlightValue: formatMaybeCurrency(record.amount),
            highlightLabel: "Payment Received",
            summaryHtml,
            closingTitle: "Recommended next step",
            closingText,
            footerNote: "This admin notification was generated automatically after a verified BayarCash payment.",
            accentColor: "#1f2d3d",
        }),
        text: [
            "New paid booking received.",
            `Order Number: ${record.orderNumber}`,
            `Transaction ID: ${record.transactionId}`,
            `Customer: ${record.customerName} (${record.customerEmail})`,
            `Car: ${record.carName}`,
            `Total Paid: ${formatMaybeCurrency(record.amount)}`,
        ].join("\n"),
    };
}

function createCustomerUnsuccessfulEmail(record) {
    const summaryHtml = createBookingSummaryHtml(record);
    const customerName = escapeHtml(record.customerName || "Customer");
    const statusLabel = getPaymentStateLabel(record.state);
    const intro = `Hi ${customerName}, we could not complete your booking payment at this time.`;
    const closingText = "You may return to our website and try the payment again when ready. If you need help, reach us at WhatsApp 011-15122092.";

    return {
        to: record.customerEmail,
        subject: `Booking Payment ${statusLabel} - ${record.orderNumber}`,
        html: createEmailLayout({
            eyebrow: "Booking Update",
            title: "Update on your booking payment",
            intro,
            highlightValue: statusLabel,
            highlightLabel: "Payment Status",
            summaryHtml,
            closingTitle: "What happens next",
            closingText,
            footerNote: "No booking is confirmed until a successful payment is received by Afwaja Car Rental.",
        }),
        text: [
            `Your booking payment was not successful, ${record.customerName || "Customer"}.`,
            `Order Number: ${record.orderNumber}`,
            `Transaction ID: ${record.transactionId}`,
            `Status: ${statusLabel}`,
            `Car: ${record.carName}`,
            "If you need help, reach us at WhatsApp 011-15122092.",
        ].join("\n"),
    };
}

function createAdminUnsuccessfulEmail(record) {
    const summaryHtml = createBookingSummaryHtml(record);
    const statusLabel = getPaymentStateLabel(record.state);
    const intro = `A booking payment attempt could not be completed. Please review the booking summary below and keep it for follow-up if the customer contacts your team.`;
    const closingText = "No vehicle should be reserved until the customer completes a successful payment. If needed, contact the customer to assist with a new payment attempt.";

    return {
        to: record.adminEmail,
        subject: `Unsuccessful Booking Payment - ${record.orderNumber}`,
        html: createEmailLayout({
            eyebrow: "Admin Notification",
            title: "Booking payment update",
            intro,
            highlightValue: statusLabel,
            highlightLabel: "Payment Status",
            summaryHtml,
            closingTitle: "Recommended next step",
            closingText,
            footerNote: "This admin notification was generated automatically after a non-success BayarCash return or callback status.",
            accentColor: "#1f2d3d",
        }),
        text: [
            "Booking payment was not completed.",
            `Order Number: ${record.orderNumber}`,
            `Transaction ID: ${record.transactionId}`,
            `Status: ${statusLabel}`,
            `Customer: ${record.customerName} (${record.customerEmail})`,
            `Car: ${record.carName}`,
        ].join("\n"),
    };
}

function createWhatsAppSummaryLines(record) {
    return [
        `Order Number: ${record.orderNumber || "-"}`,
        `Vehicle: ${record.carName || "-"}`,
        `Rental Period: ${formatDisplayDate(record.pickupDate)} ${record.pickupTime || "-"} to ${formatDisplayDate(record.returnDate)} ${record.returnTime || "-"}`,
        `Pickup Location: ${record.pickupLocation || "-"}`,
        `Return Location: ${record.returnLocation || "-"}`,
        `Rate Plan: ${record.rateLabel || "-"}`,
        `Rental Charges: ${formatMaybeCurrency(record.rentalCharges)}`,
        `Delivery Charge: ${formatMaybeCurrency(record.deliveryCharge)}`,
        `Return Pickup Charge: ${formatMaybeCurrency(record.returnPickupCharge)}`,
        `Refundable Deposit: ${formatMaybeCurrency(record.refundableDeposit)}`,
    ];
}

function createCustomerWhatsAppSuccessMessage(record) {
    const customerName = record.customerName || "Customer";
    const lines = [
        `Hi ${customerName}, payment received successfully by Afwaja Car Rental.`,
        "",
        ...createWhatsAppSummaryLines(record),
        `Total Paid: ${formatMaybeCurrency(record.amount)}`,
        "",
        "Our team will contact you shortly to confirm the vehicle handover and trip details. If you need help, reach us at WhatsApp 011-15122092.",
    ];

    return lines.join("\n");
}

function createCustomerWhatsAppUnsuccessfulMessage(record) {
    const customerName = record.customerName || "Customer";
    const statusLabel = getPaymentStateLabel(record.state);
    const lines = [
        `Hi ${customerName}, your booking payment is currently ${statusLabel.toLowerCase()}.`,
        "",
        ...createWhatsAppSummaryLines(record),
        `Payment Status: ${statusLabel}`,
        "",
        "You may return to our website and try the payment again when ready. If you need help, reach us at WhatsApp 011-15122092.",
    ];

    return lines.join("\n");
}

function getLatestPaymentRecord() {
    const records = Array.from(paymentRecords.values());
    return records[records.length - 1] || null;
}

function createEmailPreviewRecord() {
    const latestRecord = getLatestPaymentRecord();

    if (latestRecord) {
        return {
            ...latestRecord,
            adminEmail: latestRecord.adminEmail || getEmailConfig().adminEmail || "admin@mail.afwajarental.com",
            state: latestRecord.state || "success",
            verified: latestRecord.verified !== false,
            notificationWhatsAppState: latestRecord.notificationWhatsAppState || "",
        };
    }

    return {
        orderNumber: "AFW-260512-8C5A",
        transactionId: "trx_demoA1",
        customerName: "Aisyah Rahman",
        customerEmail: "customer@example.com",
        customerPhone: "60123456789",
        carName: "Perodua Bezza",
        pickupDate: "2026-05-15",
        pickupTime: "10:00 AM",
        pickupLocation: "KLIA Terminal 1",
        returnDate: "2026-05-18",
        returnTime: "10:00 AM",
        returnLocation: "Afwaja Car Rental Cyberjaya",
        rateLabel: "3+ Days Rate",
        rentalCharges: 364.5,
        deliveryCharge: 58.16,
        returnPickupCharge: 0,
        refundableDeposit: 200,
        amount: 622.66,
        adminEmail: getEmailConfig().adminEmail || "admin@mail.afwajarental.com",
        state: "success",
        verified: true,
        notificationWhatsAppState: "",
    };
}

function getPaymentStateLabel(state) {
    if (state === "success") return "Successful";
    if (state === "failed") return "Failed";
    if (state === "cancelled") return "Cancelled";
    if (state === "pending") return "Pending";
    return "Unsuccessful";
}

function getNotificationEmailState(state) {
    if (state === "success") {
        return "success";
    }

    if (state === "failed" || state === "cancelled" || state === "unknown") {
        return "unsuccessful";
    }

    return "";
}

function getWhatsAppTemplateName(recordState, config) {
    return recordState === "success"
        ? config.successTemplateName
        : config.unsuccessfulTemplateName;
}

function getWhatsAppMessageText(record, notificationState) {
    return notificationState === "success"
        ? createCustomerWhatsAppSuccessMessage(record)
        : createCustomerWhatsAppUnsuccessfulMessage(record);
}

function buildWhatsAppTemplatePayload(record, config, notificationState) {
    const templateName = getWhatsAppTemplateName(record.state, config);
    if (!templateName) {
        return null;
    }

    const statusLabel = getPaymentStateLabel(record.state);
    const parameters = notificationState === "success"
        ? [
            record.customerName || "Customer",
            record.orderNumber || "-",
            record.carName || "-",
            formatMaybeCurrency(record.amount),
            `${formatDisplayDate(record.pickupDate)} ${record.pickupTime || "-"}`,
            `${formatDisplayDate(record.returnDate)} ${record.returnTime || "-"}`,
        ]
        : [
            record.customerName || "Customer",
            record.orderNumber || "-",
            statusLabel,
            record.carName || "-",
            "011-15122092",
        ];

    return {
        messaging_product: "whatsapp",
        to: record.customerPhone,
        type: "template",
        template: {
            name: templateName,
            language: {
                code: config.templateLanguage,
            },
            components: [
                {
                    type: "body",
                    parameters: parameters.map((text) => ({
                        type: "text",
                        text: `${text ?? "-"}`,
                    })),
                },
            ],
        },
    };
}

async function sendWhatsAppNotification(record, config, notificationState) {
    if (!isWhatsAppConfigured(config) || !record.customerPhone) {
        return { delivered: false, skipped: true };
    }

    let payload;
    if (config.mode === "template") {
        payload = buildWhatsAppTemplatePayload(record, config, notificationState);
    } else {
        payload = {
            messaging_product: "whatsapp",
            to: record.customerPhone,
            type: "text",
            text: {
                preview_url: false,
                body: getWhatsAppMessageText(record, notificationState),
            },
        };
    }

    if (!payload) {
        return { delivered: false, skipped: true };
    }

    const response = await fetch(`https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(`WhatsApp delivery failed: ${response.status} ${errorBody}`);
    }

    return { delivered: true };
}

async function maybeSendPaymentNotifications(record) {
    if (!record || record.verified === false) {
        return;
    }

    const emailConfig = getEmailConfig();
    const whatsAppConfig = getWhatsAppConfig();
    const emailEnabled = isEmailConfigured(emailConfig);
    const whatsAppEnabled = isWhatsAppConfigured(whatsAppConfig);

    if (!emailEnabled && !whatsAppEnabled) {
        return;
    }

    const notificationEmailState = getNotificationEmailState(record.state);
    const shouldSendEmail = emailEnabled && record.notificationEmailState !== notificationEmailState;
    const shouldSendWhatsApp = whatsAppEnabled && record.notificationWhatsAppState !== notificationEmailState;

    if (!notificationEmailState || (!shouldSendEmail && !shouldSendWhatsApp)) {
        return;
    }

    const enrichedRecord = {
        ...record,
        adminEmail: emailConfig.adminEmail,
    };

    try {
        const tasks = [];

        if (shouldSendEmail) {
            const customerEmail = notificationEmailState === "success"
                ? createCustomerEmail(enrichedRecord)
                : createCustomerUnsuccessfulEmail(enrichedRecord);
            const adminEmail = notificationEmailState === "success"
                ? createAdminEmail(enrichedRecord)
                : createAdminUnsuccessfulEmail(enrichedRecord);

            tasks.push(sendEmail(customerEmail, emailConfig));
            tasks.push(sendEmail(adminEmail, emailConfig));
        }

        if (shouldSendWhatsApp) {
            tasks.push(sendWhatsAppNotification(enrichedRecord, whatsAppConfig, notificationEmailState));
        }

        await Promise.all(tasks);

        if (shouldSendEmail) {
            record.notificationEmailSent = notificationEmailState === "success";
            record.notificationEmailState = notificationEmailState;
        }

        if (shouldSendWhatsApp) {
            record.notificationWhatsAppState = notificationEmailState;
        }

        paymentRecords.set(record.orderNumber, {
            ...(paymentRecords.get(record.orderNumber) || {}),
            notificationEmailSent: shouldSendEmail ? notificationEmailState === "success" : record.notificationEmailSent,
            notificationEmailState: shouldSendEmail ? notificationEmailState : record.notificationEmailState || "",
            notificationWhatsAppState: shouldSendWhatsApp ? notificationEmailState : record.notificationWhatsAppState || "",
        });
    } catch (error) {
        console.error("Email notification error:", error.message);
    }
}

async function fetchBayarcashTransaction(transactionId, config) {
    if (!transactionId || !config.personalAccessToken) {
        return null;
    }

    const response = await fetch(`${config.apiBaseUrl}/transactions/${transactionId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${config.personalAccessToken}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        return null;
    }

    return response.json().catch(() => null);
}

function verifyReturnAgainstTransaction(payload, transactionData) {
    if (!transactionData) {
        return false;
    }

    const comparisons = [
        ["transaction_id", payload.transaction_id, transactionData.id],
        ["order_number", payload.order_number, transactionData.order_number],
        ["exchange_reference_number", payload.exchange_reference_number, transactionData.exchange_reference_number],
        ["exchange_transaction_id", payload.exchange_transaction_id, transactionData.exchange_transaction_id],
        ["payer_bank_name", payload.payer_bank_name, transactionData.payer_bank_name],
        ["status", payload.status, transactionData.status],
        ["status_description", payload.status_description, transactionData.status_description],
    ];

    return comparisons.every(([, payloadValue, transactionValue]) => {
        const normalizedPayloadValue = normalizeComparableValue(payloadValue);
        const normalizedTransactionValue = normalizeComparableValue(transactionValue);

        if (!normalizedPayloadValue) {
            return true;
        }

        return normalizedPayloadValue === normalizedTransactionValue;
    });
}

function getMapsConfig() {
    return {
        apiKey: trimValue(process.env.GOOGLE_MAPS_API_KEY),
        homeBaseName: trimValue(process.env.GOOGLE_MAPS_HOME_BASE_NAME) || "Afwaja Car Rental Cyberjaya",
        homeBaseAddress: trimValue(process.env.GOOGLE_MAPS_HOME_BASE_ADDRESS) || "Afwaja Car Rental Cyberjaya, Cyberjaya, Selangor, Malaysia",
        ratePerKm: Number.parseFloat(trimValue(process.env.DELIVERY_RATE_PER_KM) || "2") || 2,
    };
}

function isMapsConfigured(config) {
    return Boolean(config.apiKey);
}

function roundToTwo(value) {
    return Math.round(value * 100) / 100;
}

function buildRouteWaypoint(location) {
    if (trimValue(location.placeId)) {
        return { placeId: trimValue(location.placeId) };
    }

    return { address: trimValue(location.address) };
}

async function fetchPlaceSuggestions(input, config) {
    const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": config.apiKey,
            "X-Goog-FieldMask": [
                "suggestions.placePrediction.placeId",
                "suggestions.placePrediction.text.text",
                "suggestions.placePrediction.structuredFormat.mainText.text",
                "suggestions.placePrediction.structuredFormat.secondaryText.text",
            ].join(","),
        },
        body: JSON.stringify({
            input,
            includedRegionCodes: ["my"],
            languageCode: "en",
            locationBias: {
                circle: {
                    center: homeBaseBias,
                    radius: 50000,
                },
            },
        }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload?.error?.message || "Autocomplete request failed.");
    }

    return (payload.suggestions || [])
        .map((entry) => entry.placePrediction)
        .filter(Boolean)
        .map((prediction) => ({
            placeId: prediction.placeId || "",
            label: prediction.text?.text || "",
            mainText: prediction.structuredFormat?.mainText?.text || prediction.text?.text || "",
            secondaryText: prediction.structuredFormat?.secondaryText?.text || "",
        }))
        .filter((prediction) => prediction.label);
}

async function fetchRouteDistanceMeters(origin, destination, config) {
    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": config.apiKey,
            "X-Goog-FieldMask": "routes.distanceMeters",
        },
        body: JSON.stringify({
            origin,
            destination,
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_UNAWARE",
            languageCode: "en-US",
            units: "METRIC",
        }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(payload?.error?.message || "Route calculation failed.");
    }

    return Number(payload?.routes?.[0]?.distanceMeters || 0);
}

async function calculateDeliveryQuote(pickupLocation, returnLocation, config) {
    const homeBaseWaypoint = { address: config.homeBaseAddress };
    const pickupWaypoint = buildRouteWaypoint(pickupLocation);
    const returnWaypoint = buildRouteWaypoint(returnLocation);

    const pickupDistanceMeters = pickupLocation.isHomeBase
        ? 0
        : await fetchRouteDistanceMeters(homeBaseWaypoint, pickupWaypoint, config);

    const collectionDistanceMeters = returnLocation.isHomeBase
        ? 0
        : await fetchRouteDistanceMeters(returnWaypoint, homeBaseWaypoint, config);

    const pickupDistanceKm = roundToTwo(pickupDistanceMeters / 1000);
    const collectionDistanceKm = roundToTwo(collectionDistanceMeters / 1000);
    const pickupCharge = roundToTwo(pickupDistanceKm * config.ratePerKm);
    const collectionCharge = roundToTwo(collectionDistanceKm * config.ratePerKm);

    return {
        homeBaseName: config.homeBaseName,
        homeBaseAddress: config.homeBaseAddress,
        ratePerKm: config.ratePerKm,
        pickupDistanceKm,
        pickupCharge,
        collectionDistanceKm,
        collectionCharge,
        totalCharge: roundToTwo(pickupCharge + collectionCharge),
    };
}

async function handleMapsConfig(_request, response) {
    const config = getMapsConfig();

    sendJson(response, 200, {
        enabled: isMapsConfigured(config),
        homeBaseName: config.homeBaseName,
        homeBaseAddress: config.homeBaseAddress,
        ratePerKm: config.ratePerKm,
    });
}

async function handleMapsAutocomplete(request, response) {
    const config = getMapsConfig();

    if (!isMapsConfigured(config)) {
        sendJson(response, 503, { error: "Google Maps is not configured yet." });
        return;
    }

    let body;

    try {
        body = await parseRequestBody(request);
    } catch (error) {
        sendJson(response, 400, { error: "Invalid request body." });
        return;
    }

    const input = trimValue(body.input);
    if (input.length < 3) {
        sendJson(response, 200, { suggestions: [] });
        return;
    }

    try {
        const suggestions = await fetchPlaceSuggestions(input, config);
        sendJson(response, 200, { suggestions });
    } catch (error) {
        sendJson(response, 502, { error: "Unable to fetch location suggestions right now." });
    }
}

async function handleDeliveryQuote(request, response) {
    const config = getMapsConfig();

    if (!isMapsConfigured(config)) {
        sendJson(response, 503, { error: "Google Maps is not configured yet." });
        return;
    }

    let body;

    try {
        body = await parseRequestBody(request);
    } catch (error) {
        sendJson(response, 400, { error: "Invalid request body." });
        return;
    }

    const pickupLocation = {
        address: trimValue(body?.pickupLocation?.address),
        placeId: trimValue(body?.pickupLocation?.placeId),
        isHomeBase: Boolean(body?.pickupLocation?.isHomeBase),
    };
    const returnLocation = {
        address: trimValue(body?.returnLocation?.address),
        placeId: trimValue(body?.returnLocation?.placeId),
        isHomeBase: Boolean(body?.returnLocation?.isHomeBase),
    };

    if (!pickupLocation.address || !returnLocation.address) {
        sendJson(response, 400, { error: "Pickup and return locations are required." });
        return;
    }

    try {
        const quote = await calculateDeliveryQuote(pickupLocation, returnLocation, config);
        sendJson(response, 200, quote);
    } catch (error) {
        sendJson(response, 400, { error: "We could not calculate the actual road distance for the selected locations." });
    }
}

function generateOrderNumber() {
    const now = new Date();
    const shortDate = [
        `${now.getFullYear()}`.slice(-2),
        `${now.getMonth() + 1}`.padStart(2, "0"),
        `${now.getDate()}`.padStart(2, "0"),
    ].join("");
    const suffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    return `AFW-${shortDate}-${suffix}`;
}

function getPaymentState(statusValue) {
    const normalized = `${statusValue ?? ""}`.toLowerCase();

    if (normalized === "3" || normalized === "success" || normalized === "paid" || normalized === "approved") {
        return "success";
    }

    if (normalized === "1" || normalized === "pending") {
        return "pending";
    }

    if (normalized === "2" || normalized === "failed" || normalized === "unsuccessful") {
        return "failed";
    }

    if (normalized === "4" || normalized === "cancelled" || normalized === "canceled") {
        return "cancelled";
    }

    return "unknown";
}

async function parseRequestBody(request) {
    const rawBody = await new Promise((resolve, reject) => {
        let body = "";

        request.on("data", (chunk) => {
            body += chunk;

            if (body.length > 1024 * 1024) {
                reject(new Error("Payload too large"));
                request.destroy();
            }
        });

        request.on("end", () => resolve(body));
        request.on("error", reject);
    });

    if (!rawBody) {
        return {};
    }

    const contentType = trimValue(request.headers["content-type"]).toLowerCase();

    if (contentType.includes("application/json")) {
        return JSON.parse(rawBody);
    }

    if (contentType.includes("application/x-www-form-urlencoded")) {
        return Object.fromEntries(new URLSearchParams(rawBody).entries());
    }

    return {};
}

function getReturnChecksumPayload(payload) {
    if (payload.record_type || payload.payer_name || payload.payer_email || payload.datetime) {
        return {
            record_type: payload.record_type,
            transaction_id: payload.transaction_id,
            exchange_reference_number: payload.exchange_reference_number,
            exchange_transaction_id: payload.exchange_transaction_id,
            order_number: payload.order_number,
            currency: payload.currency,
            amount: payload.amount,
            payer_name: payload.payer_name,
            payer_email: payload.payer_email,
            payer_bank_name: payload.payer_bank_name,
            status: payload.status,
            status_description: payload.status_description,
            datetime: payload.datetime,
        };
    }

    return {
        transaction_id: payload.transaction_id,
        exchange_reference_number: payload.exchange_reference_number,
        exchange_transaction_id: payload.exchange_transaction_id,
        order_number: payload.order_number,
        currency: payload.currency,
        amount: payload.amount,
        payer_bank_name: payload.payer_bank_name,
        status: payload.status,
        status_description: payload.status_description,
    };
}

function normalizeReturnPayload(payload, verified) {
    const existingRecord = paymentRecords.get(payload.order_number) || {};

    return {
        verified,
        state: getPaymentState(payload.status),
        orderNumber: payload.order_number || existingRecord.orderNumber || "",
        transactionId: payload.transaction_id || existingRecord.transactionId || "",
        status: payload.status || existingRecord.status || "",
        statusDescription: payload.status_description || existingRecord.statusDescription || "",
        amount: payload.amount || existingRecord.amount || "",
        payerBankName: payload.payer_bank_name || existingRecord.payerBankName || "",
    };
}

async function handleCreatePaymentIntent(request, response) {
    const config = getBayarcashConfig();
    const mapsConfig = getMapsConfig();

    if (!isBayarcashConfigured(config)) {
        sendJson(response, 503, {
            error: "BayarCash is not configured yet. Fill in BAYARCASH_PORTAL_KEY, BAYARCASH_PAT and BAYARCASH_API_SECRET_KEY in your .env file.",
        });
        return;
    }

    if (!isMapsConfigured(mapsConfig)) {
        sendJson(response, 503, {
            error: "Google Maps is not configured yet. Fill in GOOGLE_MAPS_API_KEY in your .env file.",
        });
        return;
    }

    let body;

    try {
        body = await parseRequestBody(request);
    } catch (error) {
        sendJson(response, 400, { error: "Invalid request body." });
        return;
    }

    const carName = trimValue(body.carName);
    const pickupDate = trimValue(body.pickupDate);
    const returnDate = trimValue(body.returnDate);
    const pickupTime = trimValue(body.pickupTime);
    const returnTime = trimValue(body.returnTime);
    const pickupLocation = trimValue(body.pickupLocation);
    const pickupPlaceId = trimValue(body.pickupPlaceId);
    const pickupAtHomeBase = Boolean(body.pickupAtHomeBase);
    const returnLocation = trimValue(body.returnLocation);
    const returnPlaceId = trimValue(body.returnPlaceId);
    const returnAtHomeBase = Boolean(body.returnAtHomeBase);
    const customerName = trimValue(body.customerName);
    const customerEmail = trimValue(body.customerEmail);
    const customerPhone = normalizePhoneNumber(body.customerPhone);
    const bankName = trimValue(body.bankName);
    const bankAccountName = trimValue(body.bankAccountName);
    const bankAccountNumber = trimValue(body.bankAccountNumber);

    if (
        !carName ||
        !pickupDate ||
        !returnDate ||
        !pickupTime ||
        !returnTime ||
        !pickupLocation ||
        !returnLocation ||
        !customerName ||
        !customerEmail ||
        !customerPhone ||
        !bankName ||
        !bankAccountName ||
        !bankAccountNumber
    ) {
        sendJson(response, 400, { error: "Please complete all booking fields before continuing." });
        return;
    }

    const selectedCar = carCatalog.get(carName);
    if (!selectedCar) {
        sendJson(response, 400, { error: "Selected car could not be found." });
        return;
    }

    const scheduleValidation = validateBookingSchedule(pickupDate, returnDate, pickupTime, returnTime);
    if (!scheduleValidation.valid) {
        sendJson(response, 400, { error: scheduleValidation.error });
        return;
    }
    const rentalDays = scheduleValidation.rentalDays;

    const rentalPricing = calculateRentalPricing(pickupDate, returnDate, pickupTime, returnTime, selectedCar.price);
    if (!rentalPricing) {
        sendJson(response, 400, { error: "We could not calculate the rental charges for the selected booking times." });
        return;
    }

    const orderNumber = generateOrderNumber();
    const rentalCharges = rentalPricing.rentalCharge;
    let deliveryQuote;

    try {
        deliveryQuote = await calculateDeliveryQuote({
            address: pickupLocation,
            placeId: pickupPlaceId,
            isHomeBase: pickupAtHomeBase,
        }, {
            address: returnLocation,
            placeId: returnPlaceId,
            isHomeBase: returnAtHomeBase,
        }, mapsConfig);
    } catch (error) {
        sendJson(response, 400, { error: "We could not calculate the actual route charges for the selected locations." });
        return;
    }

    const amount = isTestCheckoutCar(selectedCar.name)
        ? formatAmount(testCheckoutConfig.total)
        : formatAmount(rentalCharges + selectedCar.deposit + deliveryQuote.totalCharge);
    const paymentIntentPayload = {
        payment_channel: config.paymentChannel,
        portal_key: config.portalKey,
        order_number: orderNumber,
        amount,
        payer_name: customerName,
        payer_email: customerEmail,
        payer_telephone_number: customerPhone,
        return_url: config.returnUrl,
        metadata: JSON.stringify({
            car_name: selectedCar.name,
            rental_days: rentalDays,
            rental_base_days: rentalPricing.baseDays,
            extra_hours: rentalPricing.extraHours,
            chargeable_days: rentalPricing.chargeableDays,
            pickup_date: pickupDate,
            pickup_time: pickupTime,
            pickup_location: pickupLocation,
            pickup_at_home_base: pickupAtHomeBase,
            return_date: returnDate,
            return_time: returnTime,
            return_location: returnLocation,
            return_at_home_base: returnAtHomeBase,
            daily_rate: selectedCar.price,
            discounted_daily_rate: formatAmount(rentalPricing.discountedDailyRate),
            discount_percent: rentalPricing.discountPercent,
            rate_label: rentalPricing.rateLabel,
            rental_charges: formatAmount(rentalCharges),
            extra_hour_charge: formatAmount(rentalPricing.extraHourCharge),
            refundable_deposit: selectedCar.deposit,
            delivery_rate_per_km: mapsConfig.ratePerKm,
            delivery_home_base_name: mapsConfig.homeBaseName,
            delivery_home_base_address: mapsConfig.homeBaseAddress,
            delivery_distance_km: deliveryQuote.pickupDistanceKm,
            delivery_charge: formatAmount(deliveryQuote.pickupCharge),
            return_pickup_distance_km: deliveryQuote.collectionDistanceKm,
            return_pickup_charge: formatAmount(deliveryQuote.collectionCharge),
            total_transport_charge: formatAmount(deliveryQuote.totalCharge),
            total_payable: amount,
            test_checkout_override: isTestCheckoutCar(selectedCar.name),
            refund_bank_name: bankName,
            refund_account_name: bankAccountName,
            refund_account_number: bankAccountNumber,
        }),
        platform_id: "afwaja-web",
    };

    if (config.callbackUrl) {
        paymentIntentPayload.callback_url = config.callbackUrl;
    }

    paymentIntentPayload.checksum = buildChecksum({
        payment_channel: paymentIntentPayload.payment_channel,
        order_number: paymentIntentPayload.order_number,
        amount: paymentIntentPayload.amount,
        payer_name: paymentIntentPayload.payer_name,
        payer_email: paymentIntentPayload.payer_email,
    }, config.apiSecretKey);

    try {
        const apiResponse = await fetch(`${config.apiBaseUrl}/payment-intents`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.personalAccessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paymentIntentPayload),
        });

        const responseBody = await apiResponse.text();
        const parsedBody = responseBody ? JSON.parse(responseBody) : {};

        if (!apiResponse.ok) {
            sendJson(response, 502, {
                error: parsedBody?.message || parsedBody?.error || "BayarCash rejected the payment request.",
                status: apiResponse.status,
            });
            return;
        }

        paymentRecords.set(orderNumber, {
            orderNumber,
            paymentIntentId: parsedBody.id || "",
            checkoutUrl: parsedBody.url || "",
            carName: selectedCar.name,
            customerName,
            customerEmail,
            customerPhone,
            amount,
            rentalDays,
            pickupDate,
            pickupTime,
            pickupLocation,
            returnDate,
            returnTime,
            returnLocation,
            rateLabel: rentalPricing.rateLabel,
            rentalCharges: formatAmount(rentalCharges),
            deliveryCharge: formatAmount(deliveryQuote.pickupCharge),
            returnPickupCharge: formatAmount(deliveryQuote.collectionCharge),
            refundableDeposit: formatAmount(selectedCar.deposit),
            deliveryQuote,
            status: parsedBody.status || "",
            state: getPaymentState(parsedBody.status),
            verified: false,
            notificationEmailSent: false,
            notificationEmailState: "",
            notificationWhatsAppState: "",
        });

        sendJson(response, 200, {
            checkoutUrl: parsedBody.url,
            paymentIntentId: parsedBody.id,
            orderNumber,
            amount,
            rentalDays,
            rentalPricing,
            deliveryQuote,
        });
    } catch (error) {
        sendJson(response, 502, {
            error: "Unable to reach BayarCash right now. Please check your API credentials and network access.",
        });
    }
}

async function handleVerifyReturn(request, response) {
    const config = getBayarcashConfig();
    const url = new URL(request.url || "/", requestBaseUrl);
    const payload = Object.fromEntries(url.searchParams.entries());
    const checksumPayload = getReturnChecksumPayload(payload);
    let verified = verifyChecksum(checksumPayload, payload.checksum, config.apiSecretKey);

    if (!verified && payload.transaction_id) {
        const transactionData = await fetchBayarcashTransaction(payload.transaction_id, config);
        verified = verifyReturnAgainstTransaction(payload, transactionData);
    }

    const normalizedPayload = normalizeReturnPayload(payload, verified);

    if (normalizedPayload.orderNumber) {
        const mergedRecord = {
            ...(paymentRecords.get(normalizedPayload.orderNumber) || {}),
            ...normalizedPayload,
        };
        paymentRecords.set(normalizedPayload.orderNumber, mergedRecord);
        await maybeSendPaymentNotifications(mergedRecord);
    }

    sendJson(response, verified ? 200 : 400, normalizedPayload);
}

async function handleCallback(request, response) {
    const config = getBayarcashConfig();
    let payload;

    try {
        payload = await parseRequestBody(request);
    } catch (error) {
        sendJson(response, 400, { error: "Invalid callback payload." });
        return;
    }

    const checksumPayload = getReturnChecksumPayload(payload);
    let verified = verifyChecksum(checksumPayload, payload.checksum, config.apiSecretKey);

    if (!verified && payload.transaction_id) {
        const transactionData = await fetchBayarcashTransaction(payload.transaction_id, config);
        verified = verifyReturnAgainstTransaction(payload, transactionData);
    }

    const normalizedPayload = normalizeReturnPayload(payload, verified);

    if (normalizedPayload.orderNumber) {
        const mergedRecord = {
            ...(paymentRecords.get(normalizedPayload.orderNumber) || {}),
            ...normalizedPayload,
        };
        paymentRecords.set(normalizedPayload.orderNumber, mergedRecord);
        await maybeSendPaymentNotifications(mergedRecord);
    }

    sendJson(response, verified ? 200 : 400, {
        received: true,
        verified,
        state: normalizedPayload.state,
    });
}

function handleEmailPreview(response, url) {
    const type = url.searchParams.get("type") === "admin" ? "admin" : "customer";
    const state = url.searchParams.get("state") === "failed" ? "failed" : "success";
    const previewRecord = {
        ...createEmailPreviewRecord(),
        state,
    };
    const emailPayload = state === "failed"
        ? (type === "admin" ? createAdminUnsuccessfulEmail(previewRecord) : createCustomerUnsuccessfulEmail(previewRecord))
        : (type === "admin" ? createAdminEmail(previewRecord) : createCustomerEmail(previewRecord));

    sendHtml(response, 200, `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Email Preview - ${type === "admin" ? "Admin" : "Customer"}</title>
    <style>
        body {
            margin: 0;
            background: #e2e8f0;
            font-family: Arial, sans-serif;
        }
        .preview-bar {
            max-width: 960px;
            margin: 0 auto;
            padding: 18px 24px 0;
        }
        .preview-chip {
            display: inline-block;
            margin: 0 8px 8px 0;
            padding: 8px 12px;
            border-radius: 999px;
            background: #0f172a;
            color: #ffffff;
            text-decoration: none;
            font-size: 13px;
        }
        .preview-chip.alt {
            background: #ffffff;
            color: #0f172a;
        }
        .preview-meta {
            margin: 0 0 10px;
            color: #334155;
            font-size: 14px;
        }
        .preview-meta strong {
            color: #0f172a;
        }
    </style>
</head>
<body>
    <div class="preview-bar">
        <p class="preview-meta"><strong>Subject:</strong> ${escapeHtml(emailPayload.subject)}</p>
        <a class="preview-chip" href="/dev/email-preview?type=customer&state=success">Customer Success</a>
        <a class="preview-chip alt" href="/dev/email-preview?type=admin&state=success">Admin Success</a>
        <a class="preview-chip" href="/dev/email-preview?type=customer&state=failed">Customer Unsuccessful</a>
        <a class="preview-chip alt" href="/dev/email-preview?type=admin&state=failed">Admin Unsuccessful</a>
    </div>
    ${emailPayload.html}
</body>
</html>`);
}

function handleWhatsAppPreview(response, url) {
    const state = url.searchParams.get("state") === "failed" ? "failed" : "success";
    const previewRecord = {
        ...createEmailPreviewRecord(),
        state,
    };
    const message = state === "failed"
        ? createCustomerWhatsAppUnsuccessfulMessage(previewRecord)
        : createCustomerWhatsAppSuccessMessage(previewRecord);
    const escapedMessage = escapeHtml(message).replace(/\n/g, "<br>");

    sendHtml(response, 200, `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>WhatsApp Preview</title>
    <style>
        body {
            margin: 0;
            background: #d9fdd3;
            font-family: Arial, sans-serif;
            color: #111b21;
        }
        .shell {
            max-width: 900px;
            margin: 0 auto;
            padding: 24px;
        }
        .chips {
            margin-bottom: 18px;
        }
        .chip {
            display: inline-block;
            margin: 0 8px 8px 0;
            padding: 8px 12px;
            border-radius: 999px;
            background: #111b21;
            color: #ffffff;
            text-decoration: none;
            font-size: 13px;
        }
        .frame {
            background: #efeae2;
            border: 1px solid #cfd8dc;
            border-radius: 24px;
            padding: 20px;
        }
        .bubble {
            max-width: 620px;
            margin-left: auto;
            padding: 16px 18px;
            border-radius: 18px 18px 4px 18px;
            background: #dcf8c6;
            box-shadow: 0 8px 18px rgba(0,0,0,0.08);
            font-size: 15px;
            line-height: 1.7;
        }
        .label {
            margin: 0 0 12px;
            font-size: 14px;
            color: #54656f;
        }
    </style>
</head>
<body>
    <div class="shell">
        <div class="chips">
            <a class="chip" href="/dev/whatsapp-preview?state=success">Customer Success</a>
            <a class="chip" href="/dev/whatsapp-preview?state=failed">Customer Unsuccessful</a>
        </div>
        <div class="frame">
            <p class="label">WhatsApp customer notification preview</p>
            <div class="bubble">${escapedMessage}</div>
        </div>
    </div>
</body>
</html>`);
}

function serveStaticFile(request, response) {
    const filePath = resolveFilePath(request.url || "/");

    if (!filePath) {
        sendText(response, 403, "Forbidden");
        return;
    }

    fs.stat(filePath, (statError, stats) => {
        if (statError) {
            sendText(response, 404, "Not Found");
            return;
        }

        const finalPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
        const extension = path.extname(finalPath).toLowerCase();
        const contentType = contentTypes[extension] || "application/octet-stream";

        fs.readFile(finalPath, (readError, fileBuffer) => {
            if (readError) {
                sendText(response, 500, "Internal Server Error");
                return;
            }

            response.writeHead(200, { "Content-Type": contentType });
            response.end(fileBuffer);
        });
    });
}

const server = http.createServer(async (request, response) => {
    applyCorsHeaders(request, response);

    if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
    }

    const url = new URL(request.url || "/", requestBaseUrl);

    if (request.method === "GET" && url.pathname === "/api/maps/config") {
        await handleMapsConfig(request, response);
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/maps/autocomplete") {
        await handleMapsAutocomplete(request, response);
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/maps/delivery-quote") {
        await handleDeliveryQuote(request, response);
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/bayarcash/payment-intents") {
        await handleCreatePaymentIntent(request, response);
        return;
    }

    if (request.method === "GET" && url.pathname === "/api/bayarcash/verify-return") {
        await handleVerifyReturn(request, response);
        return;
    }

    if (request.method === "POST" && url.pathname === "/api/bayarcash/callback") {
        await handleCallback(request, response);
        return;
    }

    if (request.method === "GET" && url.pathname === "/dev/email-preview") {
        handleEmailPreview(response, url);
        return;
    }

    if (request.method === "GET" && url.pathname === "/dev/whatsapp-preview") {
        handleWhatsAppPreview(response, url);
        return;
    }

    if (request.method === "GET" && url.pathname === "/assets/js/runtime-config.js") {
        sendJavaScript(response, 200, createRuntimeConfigScript());
        return;
    }

    serveStaticFile(request, response);
});

server.listen(port, host, () => {
    console.log(`Preview server running at http://${host}:${port}`);
});
