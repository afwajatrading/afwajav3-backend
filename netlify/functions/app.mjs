import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getStore } from "@netlify/blobs";

const moduleFilename = fileURLToPath(import.meta.url);
const moduleDirname = path.dirname(moduleFilename);
const rootDir = path.resolve(moduleDirname, "..", "..");
const fleetData = {
    "Kumpulan A (Compact & Economy)": [
        { name: "Perodua Axia", desc: "Auto &bull; 4 Seats &bull; Compact", price: 135, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2KRRG31583SYNP78CEK0XS.png", type: "Compact" },
        { name: "Perodua Axia (Old Model)", desc: "Auto &bull; 4 Seats &bull; Compact", price: 120, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2NBPFBV38BFRPQ26N1YF6G.png", type: "Compact", imgPadding: "p-1" },
        { name: "Perodua Myvi", desc: "Auto &bull; 5 Seats &bull; Hatchback", price: 160, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2PZ2F2FX5K3FV79TBZ0VRK.png", type: "Hatchback" },
        { name: "Perodua Bezza", desc: "Auto &bull; 5 Seats &bull; Sedan", price: 150, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2NBQA2YBK2WEXG2S996C8P.png", type: "Sedan" },
        { name: "Perodua Ativa", desc: "Auto &bull; 5 Seats &bull; Compact SUV", price: 210, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2NBPXB7QDQK77S89SC316P.png", type: "SUV" },
    ],
    "Kumpulan B (Mid-size Sedan & Hatch)": [
        { name: "Toyota Yaris", desc: "Auto &bull; 5 Seats &bull; Hatchback", price: 250, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2PY3W1F1P5309YJ6N0KF8W.png", type: "Hatchback" },
        { name: "Honda City", desc: "Auto &bull; 5 Seats &bull; Sedan", price: 250, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2NCS662MEVPY7YBA73JZVX.png", type: "Sedan" },
        { name: "Honda City Hatchback", desc: "Auto &bull; 5 Seats &bull; Hatchback", price: 250, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2NCSS8QBVKBTRRK4SN8P12.png", type: "Hatchback" },
        { name: "Toyota Vios (3rd Gen)", desc: "Auto &bull; 5 Seats &bull; Sedan", price: 200, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2PY15JFRHXTY20R1FGAZJT.png", type: "Sedan" },
        { name: "Toyota Vios (4th Gen)", desc: "Auto &bull; 5 Seats &bull; Sedan", price: 250, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2PY23S26W22ATMH2RMY4FM.png", type: "Sedan" },
    ],
    "Kumpulan C (SUV, Crossover & Family MPV)": [
        { name: "Perodua Aruz", desc: "Auto &bull; 7 Seats &bull; SUV", price: 280, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2NBNM56ZB8SFR079M76GAR.png", type: "SUV" },
        { name: "Proton X50", desc: "Auto &bull; 5 Seats &bull; Compact SUV", price: 300, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2PY2JDHK54NMSY88V8WDSZ.png", type: "SUV" },
        { name: "Honda HR-V", desc: "Auto &bull; 5 Seats &bull; Crossover", price: 400, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2NCT6G5J5KTSV9VJBGJGW3.png", type: "Crossover" },
        { name: "Perodua Alza", desc: "Auto &bull; 7 Seats &bull; MPV", price: 250, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2NBP1TS612Y5JDK3HWTXY7.png", type: "MPV" },
        { name: "Nissan Serena", desc: "Auto &bull; 7 Seats &bull; MPV", price: 480, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2PZ3S9DWW3B66GNEAQZ2ZC.png", type: "MPV" },
        { name: "Mitsubishi Xpander", desc: "Auto &bull; 7 Seats &bull; MPV", price: 300, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2PY2ZSQF6XAK9FCFRRDVFD.png", type: "MPV" },
        { name: "Proton X70", desc: "Auto &bull; 5 Seats &bull; SUV", price: 350, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2PY3D8FPKQV1JTS3A34K27.png", type: "SUV" },
        { name: "Honda CR-V", desc: "Auto &bull; 5 Seats &bull; SUV", price: 450, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2NCTQVT8TEJQ92W1RMC8AP.png", type: "SUV" },
        { name: "Toyota Innova Zenix", desc: "Auto &bull; 7 Seats &bull; Premium MPV", price: 500, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2PZ2YH481ZY4XJJYZWMN1Q.png", type: "MPV" },
    ],
    "Kumpulan D (Luxury & Large MPV)": [
        { name: "Toyota Vellfire (3rd Gen)", desc: "Auto &bull; 7 Seats &bull; Luxury MPV", price: 850, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2NBMRMK1DBAAZ9JC6GJJDS.png", type: "Luxury MPV" },
        { name: "Toyota Vellfire (4th Gen)", desc: "Auto &bull; 7 Seats &bull; Luxury MPV", price: 900, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2NBN72PZMHH0DSWHR8NMMR.png", type: "Luxury MPV" },
        { name: "Hyundai Staria", desc: "Auto &bull; 10 Seats &bull; Large MPV", price: 600, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2PY1ND0V1BWT3KYE7E8BKA.png", type: "MPV" },
        { name: "Hyundai Starex", desc: "Auto &bull; 11 Seats &bull; Large MPV", price: 500, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2PZ3C702T0MXM8WSTKG0YA.png", type: "MPV" },
    ],
};

const homeBaseBias = {
    latitude: 2.9226,
    longitude: 101.6559,
};

const MINIMUM_BOOKING_NOTICE_HOURS = 12;
const RENTAL_DISCOUNT_RULES = [
    { minimumDays: 30, discountPercent: 45, label: "Monthly Rate" },
    { minimumDays: 7, discountPercent: 20, label: "Weekly Rate" },
    { minimumDays: 3, discountPercent: 10, label: "3+ Days Rate" },
];

loadEnvFile(path.join(rootDir, ".env"));

const testCheckoutConfig = getTestCheckoutConfig();
const carCatalog = createCarCatalog();
const paymentStore = createPaymentStore();

export const config = {
    path: ["/api/*", "/dev/email-preview"],
};

function createPaymentStore() {
    const hasNetlifyBlobsEnv = Boolean(
        trimValue(process.env.NETLIFY_BLOBS_CONTEXT) ||
        trimValue(process.env.NETLIFY) ||
        trimValue(process.env.CONTEXT) ||
        trimValue(process.env.SITE_ID)
    );

    if (hasNetlifyBlobsEnv) {
        return getStore({ name: "payment-records", consistency: "strong" });
    }

    const localStoreDir = path.join(rootDir, ".tmp");
    const localStoreFile = path.join(localStoreDir, "payment-records.json");

    const readAll = () => {
        try {
            if (!fs.existsSync(localStoreFile)) {
                return {};
            }

            return JSON.parse(fs.readFileSync(localStoreFile, "utf8"));
        } catch {
            return {};
        }
    };

    const writeAll = (payload) => {
        fs.mkdirSync(localStoreDir, { recursive: true });
        fs.writeFileSync(localStoreFile, JSON.stringify(payload, null, 2), "utf8");
    };

    return {
        async get(key, options = {}) {
            const records = readAll();
            const value = records[key];

            if (value === undefined) {
                return null;
            }

            if (options.type === "json") {
                return value;
            }

            return JSON.stringify(value);
        },
        async setJSON(key, value) {
            const records = readAll();
            records[key] = value;
            writeAll(records);
        },
    };
}

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

function getCarDeposit(groupName) {
    return getDepositByGroup(groupName);
}

function isTestCheckoutCar(carName) {
    return testCheckoutConfig.enabled && carName === testCheckoutConfig.carName;
}

function getCheckoutTotalOverride(carName) {
    if (!isTestCheckoutCar(carName)) {
        return null;
    }

    return Number.isFinite(testCheckoutConfig.total) ? testCheckoutConfig.total : 1;
}

function trimValue(value) {
    return `${value ?? ""}`.trim();
}

function jsonResponse(statusCode, payload, headers = {}) {
    return new Response(JSON.stringify(payload), {
        status: statusCode,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...headers,
        },
    });
}

function textResponse(statusCode, payload, headers = {}) {
    return new Response(payload, {
        status: statusCode,
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            ...headers,
        },
    });
}

function htmlResponse(statusCode, payload, headers = {}) {
    return new Response(payload, {
        status: statusCode,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            ...headers,
        },
    });
}

function buildCorsHeaders(request) {
    const allowedOrigins = trimValue(process.env.CORS_ALLOWED_ORIGIN)
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    const requestOrigin = trimValue(request.headers.get("origin"));
    const headers = {
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (!allowedOrigins.length) {
        return headers;
    }

    if (allowedOrigins.includes("*")) {
        headers["Access-Control-Allow-Origin"] = "*";
        return headers;
    }

    if (allowedOrigins.includes(requestOrigin)) {
        headers["Access-Control-Allow-Origin"] = requestOrigin;
        headers.Vary = "Origin";
    }

    return headers;
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
        .createHmac("sha256", trimValue(secretKey))
        .update(sortedValues.join("|"))
        .digest("hex");
}

function verifyChecksum(payload, checksum, secretKey) {
    if (!trimValue(checksum) || !trimValue(secretKey)) {
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
    const frontendBaseUrl = trimValue(process.env.FRONTEND_BASE_URL) || trimValue(process.env.APP_BASE_URL);
    const apiPublicBaseUrl = trimValue(process.env.API_PUBLIC_BASE_URL) || frontendBaseUrl;
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
    return Boolean(config.portalKey && config.personalAccessToken && config.apiSecretKey && config.frontendBaseUrl);
}

function isLocalPaymentBypassEnabled(config) {
    const bypassEnabled = parseBooleanEnv(process.env.BAYARCASH_LOCAL_BYPASS, false);
    const isLocalUrl = /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])/i.test(config.frontendBaseUrl || "");
    return bypassEnabled && isLocalUrl;
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

function isEmailConfigured(config) {
    if (config.provider !== "resend") {
        return false;
    }

    return Boolean(config.apiKey && config.fromEmail && config.adminEmail);
}

function formatEmailSender(config) {
    return config.fromName ? `${config.fromName} <${config.fromEmail}>` : config.fromEmail;
}

async function sendEmail(message, config) {
    if (!isEmailConfigured(config) || config.provider !== "resend") {
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

function createRefundBankDetailsHtml(record) {
    const refundDetails = [
        ["Bank Name", record.refundBankName],
        ["Account Holder Name", record.refundAccountName],
        ["Account Number", record.refundAccountNumber],
    ];

    return `
        <div style="margin:20px 0 0;padding:20px 20px 10px;border:1px solid #e2e8f0;border-radius:20px;background:#ffffff;">
            <h2 style="margin:0 0 14px;font-size:17px;line-height:1.3;color:#1f2d3d;">Refund Bank Details</h2>
            <table style="width:100%;border-collapse:collapse;border-spacing:0;">
                ${createEmailInfoTable(refundDetails)}
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
    const summaryHtml = `${createBookingSummaryHtml(record)}${createRefundBankDetailsHtml(record)}`;
    const intro = "A customer has completed payment successfully via BayarCash. Please review the booking summary below and proceed with follow-up.";
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
            `Refund Bank Name: ${record.refundBankName || "-"}`,
            `Refund Account Holder: ${record.refundAccountName || "-"}`,
            `Refund Account Number: ${record.refundAccountNumber || "-"}`,
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
    const summaryHtml = `${createBookingSummaryHtml(record)}${createRefundBankDetailsHtml(record)}`;
    const statusLabel = getPaymentStateLabel(record.state);
    const intro = "A booking payment attempt could not be completed. Please review the booking summary below and keep it for follow-up if the customer contacts your team.";
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
            `Refund Bank Name: ${record.refundBankName || "-"}`,
            `Refund Account Holder: ${record.refundAccountName || "-"}`,
            `Refund Account Number: ${record.refundAccountNumber || "-"}`,
        ].join("\n"),
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

function getRecordKey(orderNumber) {
    return `orders/${orderNumber}`;
}

async function readPaymentRecord(orderNumber) {
    if (!trimValue(orderNumber)) {
        return null;
    }

    return paymentStore.get(getRecordKey(orderNumber), {
        consistency: "strong",
        type: "json",
    }).catch(() => null);
}

async function readLatestPaymentRecord() {
    return paymentStore.get("__latest", {
        consistency: "strong",
        type: "json",
    }).catch(() => null);
}

async function savePaymentRecord(record) {
    if (!record?.orderNumber) {
        return;
    }

    await paymentStore.setJSON(getRecordKey(record.orderNumber), record);
    await paymentStore.setJSON("__latest", record);
}

function createEmailPreviewFallbackRecord() {
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
        refundBankName: "Maybank",
        refundAccountName: "Aisyah Rahman",
        refundAccountNumber: "112233445566",
        amount: 622.66,
        adminEmail: getEmailConfig().adminEmail || "admin@mail.afwajarental.com",
        state: "success",
        verified: true,
        notificationEmailState: "",
    };
}

async function createEmailPreviewRecord() {
    const latestRecord = await readLatestPaymentRecord();

    if (latestRecord) {
        return {
            ...latestRecord,
            adminEmail: latestRecord.adminEmail || getEmailConfig().adminEmail || "admin@mail.afwajarental.com",
            state: latestRecord.state || "success",
            verified: latestRecord.verified !== false,
        };
    }

    return createEmailPreviewFallbackRecord();
}

function hasCompleteBookingNotificationData(record) {
    return [
        record?.orderNumber,
        record?.customerName,
        record?.customerEmail,
        record?.customerPhone,
        record?.carName,
        record?.pickupDate,
        record?.pickupTime,
        record?.pickupLocation,
        record?.returnDate,
        record?.returnTime,
        record?.returnLocation,
    ].every((value) => trimValue(value));
}

async function maybeSendPaymentNotifications(record) {
    if (!record || record.verified === false) {
        return record;
    }

    const emailConfig = getEmailConfig();
    const emailEnabled = isEmailConfigured(emailConfig);

    if (!emailEnabled) {
        return record;
    }

    const notificationEmailState = getNotificationEmailState(record.state);
    if (!notificationEmailState || !hasCompleteBookingNotificationData(record)) {
        return record;
    }

    const enrichedRecord = {
        ...record,
        adminEmail: emailConfig.adminEmail,
    };
    const customerEmail = notificationEmailState === "success"
        ? createCustomerEmail(enrichedRecord)
        : createCustomerUnsuccessfulEmail(enrichedRecord);
    const adminEmail = notificationEmailState === "success"
        ? createAdminEmail(enrichedRecord)
        : createAdminUnsuccessfulEmail(enrichedRecord);
    const shouldSendCustomerEmail = trimValue(customerEmail.to)
        && (
            record.customerNotificationEmailSent !== true
            || record.customerNotificationEmailState !== notificationEmailState
        );
    const shouldSendAdminEmail = trimValue(adminEmail.to)
        && (
            record.adminNotificationEmailSent !== true
            || record.adminNotificationEmailState !== notificationEmailState
        );

    if (!shouldSendCustomerEmail && !shouldSendAdminEmail) {
        return {
            ...record,
            notificationEmailSent: record.customerNotificationEmailSent === true || record.adminNotificationEmailSent === true,
            notificationEmailState,
        };
    }

    try {
        const emailTasks = [];

        if (shouldSendCustomerEmail) {
            emailTasks.push(sendEmail(customerEmail, emailConfig));
        }

        if (shouldSendAdminEmail) {
            emailTasks.push(sendEmail(adminEmail, emailConfig));
        }

        const emailResults = await Promise.allSettled(emailTasks);
        const failedEmail = emailResults.find((result) => result.status === "rejected");

        if (failedEmail) {
            throw failedEmail.reason;
        }

        const updatedRecord = {
            ...record,
            notificationEmailSent: true,
            notificationEmailState,
            customerNotificationEmailSent: record.customerNotificationEmailSent === true || shouldSendCustomerEmail,
            customerNotificationEmailState: shouldSendCustomerEmail
                ? notificationEmailState
                : (record.customerNotificationEmailState || ""),
            adminNotificationEmailSent: record.adminNotificationEmailSent === true || shouldSendAdminEmail,
            adminNotificationEmailState: shouldSendAdminEmail
                ? notificationEmailState
                : (record.adminNotificationEmailState || ""),
        };

        await savePaymentRecord(updatedRecord);
        return updatedRecord;
    } catch (error) {
        console.error("Email notification error:", error.message);
        return record;
    }
}

function normalizeBayarcashTransactionData(payload) {
    if (!payload || typeof payload !== "object") {
        return null;
    }

    const directCandidate = payload.data?.attributes
        ? { id: payload.data.id, ...payload.data.attributes }
        : payload.data || payload.transaction || payload.result || payload;

    if (!directCandidate || typeof directCandidate !== "object") {
        return null;
    }

    const metadata =
        directCandidate.metadata ??
        directCandidate.meta ??
        directCandidate.payment_intent?.metadata ??
        directCandidate.paymentIntent?.metadata ??
        payload.metadata ??
        payload.meta ??
        {};

    return {
        ...directCandidate,
        id: directCandidate.id || payload.id || payload.data?.id || "",
        order_number: directCandidate.order_number || directCandidate.orderNumber || "",
        exchange_reference_number: directCandidate.exchange_reference_number || directCandidate.exchangeReferenceNumber || "",
        exchange_transaction_id: directCandidate.exchange_transaction_id || directCandidate.exchangeTransactionId || "",
        payer_bank_name: directCandidate.payer_bank_name || directCandidate.payerBankName || "",
        payer_name: directCandidate.payer_name || directCandidate.payerName || "",
        payer_email: directCandidate.payer_email || directCandidate.payerEmail || "",
        payer_telephone_number: directCandidate.payer_telephone_number || directCandidate.payerTelephoneNumber || "",
        status: directCandidate.status || "",
        status_description: directCandidate.status_description || directCandidate.statusDescription || "",
        amount: directCandidate.amount || "",
        metadata,
    };
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

    const payload = await response.json().catch(() => null);
    return normalizeBayarcashTransactionData(payload);
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

async function parseRequestBody(request) {
    const rawBody = await request.text();

    if (!rawBody) {
        return {};
    }

    const contentType = trimValue(request.headers.get("content-type")).toLowerCase();

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

function parseMetadataObject(value) {
    if (!value) {
        return {};
    }

    if (typeof value === "object") {
        return value;
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
    }

    return {};
}

function enrichRecordFromTransaction(existingRecord = {}, transactionData = null) {
    if (!transactionData) {
        return existingRecord;
    }

    const metadata = parseMetadataObject(transactionData.metadata);

    return {
        ...existingRecord,
        orderNumber: existingRecord.orderNumber || transactionData.order_number || "",
        transactionId: existingRecord.transactionId || transactionData.id || "",
        status: existingRecord.status || transactionData.status || "",
        statusDescription: existingRecord.statusDescription || transactionData.status_description || "",
        amount: existingRecord.amount || transactionData.amount || "",
        customerName: existingRecord.customerName || transactionData.payer_name || "",
        customerEmail: existingRecord.customerEmail || transactionData.payer_email || "",
        customerPhone: existingRecord.customerPhone || normalizePhoneNumber(transactionData.payer_telephone_number || ""),
        payerBankName: existingRecord.payerBankName || transactionData.payer_bank_name || "",
        carName: existingRecord.carName || metadata.car_name || "",
        rentalDays: existingRecord.rentalDays || metadata.rental_days || "",
        pickupDate: existingRecord.pickupDate || metadata.pickup_date || "",
        pickupTime: existingRecord.pickupTime || metadata.pickup_time || "",
        pickupLocation: existingRecord.pickupLocation || metadata.pickup_location || "",
        returnDate: existingRecord.returnDate || metadata.return_date || "",
        returnTime: existingRecord.returnTime || metadata.return_time || "",
        returnLocation: existingRecord.returnLocation || metadata.return_location || "",
        rateLabel: existingRecord.rateLabel || metadata.rate_label || "",
        rentalCharges: existingRecord.rentalCharges || metadata.rental_charges || "",
        deliveryCharge: existingRecord.deliveryCharge || metadata.delivery_charge || "",
        returnPickupCharge: existingRecord.returnPickupCharge || metadata.return_pickup_charge || "",
        refundableDeposit: existingRecord.refundableDeposit || metadata.refundable_deposit || "",
        refundBankName: existingRecord.refundBankName || metadata.refund_bank_name || "",
        refundAccountName: existingRecord.refundAccountName || metadata.refund_account_name || "",
        refundAccountNumber: existingRecord.refundAccountNumber || metadata.refund_account_number || "",
    };
}

function normalizeReturnPayload(payload, verified, existingRecord = {}) {
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

function encodeBookingSnapshot(record = {}) {
    const snapshot = {
        orderNumber: record.orderNumber || "",
        carName: record.carName || "",
        customerName: record.customerName || "",
        customerEmail: record.customerEmail || "",
        customerPhone: record.customerPhone || "",
        amount: record.amount || "",
        rentalDays: record.rentalDays || "",
        pickupDate: record.pickupDate || "",
        pickupTime: record.pickupTime || "",
        pickupLocation: record.pickupLocation || "",
        returnDate: record.returnDate || "",
        returnTime: record.returnTime || "",
        returnLocation: record.returnLocation || "",
        rateLabel: record.rateLabel || "",
        rentalCharges: record.rentalCharges || "",
        deliveryCharge: record.deliveryCharge || "",
        returnPickupCharge: record.returnPickupCharge || "",
        refundableDeposit: record.refundableDeposit || "",
        refundBankName: record.refundBankName || "",
        refundAccountName: record.refundAccountName || "",
        refundAccountNumber: record.refundAccountNumber || "",
    };

    return Buffer.from(JSON.stringify(snapshot), "utf8").toString("base64url");
}

function decodeBookingSnapshot(value) {
    const encoded = trimValue(value);

    if (!encoded) {
        return {};
    }

    try {
        const decoded = Buffer.from(encoded, "base64url").toString("utf8");
        const parsed = JSON.parse(decoded);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function enrichRecordFromSnapshot(existingRecord = {}, snapshot = {}) {
    if (!snapshot || typeof snapshot !== "object") {
        return existingRecord;
    }

    return {
        ...existingRecord,
        orderNumber: existingRecord.orderNumber || snapshot.orderNumber || "",
        carName: existingRecord.carName || snapshot.carName || "",
        customerName: existingRecord.customerName || snapshot.customerName || "",
        customerEmail: existingRecord.customerEmail || snapshot.customerEmail || "",
        customerPhone: existingRecord.customerPhone || snapshot.customerPhone || "",
        amount: existingRecord.amount || snapshot.amount || "",
        rentalDays: existingRecord.rentalDays || snapshot.rentalDays || "",
        pickupDate: existingRecord.pickupDate || snapshot.pickupDate || "",
        pickupTime: existingRecord.pickupTime || snapshot.pickupTime || "",
        pickupLocation: existingRecord.pickupLocation || snapshot.pickupLocation || "",
        returnDate: existingRecord.returnDate || snapshot.returnDate || "",
        returnTime: existingRecord.returnTime || snapshot.returnTime || "",
        returnLocation: existingRecord.returnLocation || snapshot.returnLocation || "",
        rateLabel: existingRecord.rateLabel || snapshot.rateLabel || "",
        rentalCharges: existingRecord.rentalCharges || snapshot.rentalCharges || "",
        deliveryCharge: existingRecord.deliveryCharge || snapshot.deliveryCharge || "",
        returnPickupCharge: existingRecord.returnPickupCharge || snapshot.returnPickupCharge || "",
        refundableDeposit: existingRecord.refundableDeposit || snapshot.refundableDeposit || "",
        refundBankName: existingRecord.refundBankName || snapshot.refundBankName || "",
        refundAccountName: existingRecord.refundAccountName || snapshot.refundAccountName || "",
        refundAccountNumber: existingRecord.refundAccountNumber || snapshot.refundAccountNumber || "",
    };
}

function buildMockPaymentReturnPayload(record) {
    return {
        record_type: "payment_intent",
        transaction_id: record.transactionId,
        exchange_reference_number: `mock-ref-${record.orderNumber}`,
        exchange_transaction_id: `mock-ex-${record.orderNumber}`,
        order_number: record.orderNumber,
        currency: "MYR",
        amount: record.amount,
        payer_name: record.customerName,
        payer_email: record.customerEmail,
        payer_bank_name: "Mock FPX Bank",
        status: "success",
        status_description: "Approved",
        datetime: new Date().toISOString(),
    };
}

function buildMockCheckoutUrl(record, config) {
    const payload = buildMockPaymentReturnPayload(record);
    const checksumPayload = getReturnChecksumPayload(payload);
    const checksum = buildChecksum(checksumPayload, config.apiSecretKey);
    const url = new URL(`${config.frontendBaseUrl}/thank-you.html`);

    url.searchParams.set("payment_return", "1");

    Object.entries(payload).forEach(([key, value]) => {
        url.searchParams.set(key, `${value}`);
    });

    url.searchParams.set("checksum", checksum);
    return url.toString();
}

async function handleMapsConfig(request) {
    const headers = buildCorsHeaders(request);
    const config = getMapsConfig();

    return jsonResponse(200, {
        enabled: isMapsConfigured(config),
        homeBaseName: config.homeBaseName,
        homeBaseAddress: config.homeBaseAddress,
        ratePerKm: config.ratePerKm,
    }, headers);
}

async function handleMapsAutocomplete(request) {
    const headers = buildCorsHeaders(request);
    const config = getMapsConfig();

    if (!isMapsConfigured(config)) {
        return jsonResponse(503, { error: "Google Maps is not configured yet." }, headers);
    }

    let body;

    try {
        body = await parseRequestBody(request);
    } catch {
        return jsonResponse(400, { error: "Invalid request body." }, headers);
    }

    const input = trimValue(body.input);
    if (input.length < 3) {
        return jsonResponse(200, { suggestions: [] }, headers);
    }

    try {
        const suggestions = await fetchPlaceSuggestions(input, config);
        return jsonResponse(200, { suggestions }, headers);
    } catch {
        return jsonResponse(502, { error: "Unable to fetch location suggestions right now." }, headers);
    }
}

async function handleDeliveryQuote(request) {
    const headers = buildCorsHeaders(request);
    const config = getMapsConfig();

    if (!isMapsConfigured(config)) {
        return jsonResponse(503, { error: "Google Maps is not configured yet." }, headers);
    }

    let body;

    try {
        body = await parseRequestBody(request);
    } catch {
        return jsonResponse(400, { error: "Invalid request body." }, headers);
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
        return jsonResponse(400, { error: "Pickup and return locations are required." }, headers);
    }

    try {
        const quote = await calculateDeliveryQuote(pickupLocation, returnLocation, config);
        return jsonResponse(200, quote, headers);
    } catch {
        return jsonResponse(400, { error: "We could not calculate the actual road distance for the selected locations." }, headers);
    }
}

async function handleCreatePaymentIntent(request) {
    const headers = buildCorsHeaders(request);
    const config = getBayarcashConfig();
    const mapsConfig = getMapsConfig();

    if (!isBayarcashConfigured(config)) {
        return jsonResponse(503, {
            error: "BayarCash is not configured yet. Fill in BAYARCASH_PORTAL_KEY, BAYARCASH_PAT and BAYARCASH_API_SECRET_KEY in your environment variables.",
        }, headers);
    }

    if (!isMapsConfigured(mapsConfig)) {
        return jsonResponse(503, {
            error: "Google Maps is not configured yet. Fill in GOOGLE_MAPS_API_KEY in your environment variables.",
        }, headers);
    }

    let body;

    try {
        body = await parseRequestBody(request);
    } catch {
        return jsonResponse(400, { error: "Invalid request body." }, headers);
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
    const termsAgreement = body.termsAgreement === true || `${body.termsAgreement || ""}`.toLowerCase() === "true";

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
        return jsonResponse(400, { error: "Please complete all booking fields before continuing." }, headers);
    }

    if (!termsAgreement) {
        return jsonResponse(400, { error: "Please agree to the Terms & Conditions before continuing to BayarCash." }, headers);
    }

    const selectedCar = carCatalog.get(carName);
    if (!selectedCar) {
        return jsonResponse(400, { error: "Selected car could not be found." }, headers);
    }

    const scheduleValidation = validateBookingSchedule(pickupDate, returnDate, pickupTime, returnTime);
    if (!scheduleValidation.valid) {
        return jsonResponse(400, { error: scheduleValidation.error }, headers);
    }
    const rentalDays = scheduleValidation.rentalDays;

    const rentalPricing = calculateRentalPricing(pickupDate, returnDate, pickupTime, returnTime, selectedCar.price);
    if (!rentalPricing) {
        return jsonResponse(400, { error: "We could not calculate the rental charges for the selected booking times." }, headers);
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
    } catch {
        return jsonResponse(400, { error: "We could not calculate the actual route charges for the selected locations." }, headers);
    }

    const calculatedTotal = rentalCharges + selectedCar.deposit + deliveryQuote.totalCharge;
    const amount = formatAmount(getCheckoutTotalOverride(selectedCar.name) ?? calculatedTotal);
    const localPaymentBypass = isLocalPaymentBypassEnabled(config);
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

    const baseRecord = {
        orderNumber,
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
        refundBankName: bankName,
        refundAccountName: bankAccountName,
        refundAccountNumber: bankAccountNumber,
        deliveryQuote,
    };

    const bookingSnapshot = encodeBookingSnapshot(baseRecord);

    if (bookingSnapshot) {
        const returnUrl = new URL(paymentIntentPayload.return_url);
        returnUrl.searchParams.set("booking_snapshot", bookingSnapshot);
        paymentIntentPayload.return_url = returnUrl.toString();

        if (paymentIntentPayload.callback_url) {
            const callbackUrl = new URL(paymentIntentPayload.callback_url);
            callbackUrl.searchParams.set("booking_snapshot", bookingSnapshot);
            paymentIntentPayload.callback_url = callbackUrl.toString();
        }
    }

    if (localPaymentBypass) {
        const mockRecord = {
            ...baseRecord,
            paymentIntentId: `pi_mock_${Date.now()}`,
            transactionId: `trx_mock_${Date.now()}`,
            checkoutUrl: "",
            status: "success",
            state: "success",
            verified: true,
            notificationEmailSent: false,
            notificationEmailState: "",
        };

        mockRecord.checkoutUrl = buildMockCheckoutUrl(mockRecord, config);

        const finalRecord = await maybeSendPaymentNotifications(mockRecord);
        await savePaymentRecord(finalRecord);

        return jsonResponse(200, {
            checkoutUrl: mockRecord.checkoutUrl,
            paymentIntentId: mockRecord.paymentIntentId,
            orderNumber,
            amount,
            rentalDays,
            rentalPricing,
            deliveryQuote,
            bypassed: true,
        }, headers);
    }

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
            return jsonResponse(502, {
                error: parsedBody?.message || parsedBody?.error || "BayarCash rejected the payment request.",
                status: apiResponse.status,
            }, headers);
        }

        await savePaymentRecord({
            ...baseRecord,
            paymentIntentId: parsedBody.id || "",
            checkoutUrl: parsedBody.url || "",
            status: parsedBody.status || "",
            state: getPaymentState(parsedBody.status),
            verified: false,
            notificationEmailSent: false,
            notificationEmailState: "",
        });

        return jsonResponse(200, {
            checkoutUrl: parsedBody.url,
            paymentIntentId: parsedBody.id,
            orderNumber,
            amount,
            rentalDays,
            rentalPricing,
            deliveryQuote,
        }, headers);
    } catch {
        return jsonResponse(502, {
            error: "Unable to reach BayarCash right now. Please check your API credentials and network access.",
        }, headers);
    }
}

async function handleVerifyReturn(request) {
    const headers = buildCorsHeaders(request);
    const config = getBayarcashConfig();
    const url = new URL(request.url);
    const payload = Object.fromEntries(url.searchParams.entries());
    const checksumPayload = getReturnChecksumPayload(payload);
    const transactionData = payload.transaction_id
        ? await fetchBayarcashTransaction(payload.transaction_id, config)
        : null;
    const bookingSnapshot = decodeBookingSnapshot(payload.booking_snapshot);
    let verified = verifyChecksum(checksumPayload, payload.checksum, config.apiSecretKey);

    if (!verified && transactionData) {
        verified = verifyReturnAgainstTransaction(payload, transactionData);
    }

    const existingRecord = await readPaymentRecord(payload.order_number);
    const normalizedPayload = normalizeReturnPayload(payload, verified, existingRecord || {});

    if (normalizedPayload.orderNumber) {
        const mergedRecord = enrichRecordFromTransaction(enrichRecordFromSnapshot({
            ...(existingRecord || {}),
            ...normalizedPayload,
        }, bookingSnapshot), transactionData);
        await savePaymentRecord(mergedRecord);
    }

    return jsonResponse(verified ? 200 : 400, normalizedPayload, headers);
}

async function handleCallback(request) {
    const headers = buildCorsHeaders(request);
    const config = getBayarcashConfig();
    let payload;

    try {
        payload = await parseRequestBody(request);
    } catch {
        return jsonResponse(400, { error: "Invalid callback payload." }, headers);
    }

    const checksumPayload = getReturnChecksumPayload(payload);
    const transactionData = payload.transaction_id
        ? await fetchBayarcashTransaction(payload.transaction_id, config)
        : null;
    const bookingSnapshot = decodeBookingSnapshot(payload.booking_snapshot);
    let verified = verifyChecksum(checksumPayload, payload.checksum, config.apiSecretKey);

    if (!verified && transactionData) {
        verified = verifyReturnAgainstTransaction(payload, transactionData);
    }

    const existingRecord = await readPaymentRecord(payload.order_number);
    const normalizedPayload = normalizeReturnPayload(payload, verified, existingRecord || {});

    if (normalizedPayload.orderNumber) {
        const mergedRecord = enrichRecordFromTransaction(enrichRecordFromSnapshot({
            ...(existingRecord || {}),
            ...normalizedPayload,
        }, bookingSnapshot), transactionData);
        await savePaymentRecord(mergedRecord);
    }

    return jsonResponse(verified ? 200 : 400, {
        received: true,
        verified,
        state: normalizedPayload.state,
    }, headers);
}

async function handleFinalizeBooking(request) {
    const headers = buildCorsHeaders(request);
    const config = getBayarcashConfig();
    let body;

    try {
        body = await parseRequestBody(request);
    } catch {
        return jsonResponse(400, { error: "Invalid finalize payload." }, headers);
    }

    const orderNumber = trimValue(body.orderNumber);
    const transactionId = trimValue(body.transactionId);
    const bookingSnapshot = decodeBookingSnapshot(body.bookingSnapshot);
    const transactionData = transactionId
        ? await fetchBayarcashTransaction(transactionId, config)
        : null;

    if (!orderNumber || !transactionId) {
        return jsonResponse(400, { error: "Order number and transaction ID are required." }, headers);
    }

    if (!transactionData) {
        return jsonResponse(409, { error: "Transaction could not be verified with BayarCash." }, headers);
    }

    if (trimValue(transactionData.order_number) !== orderNumber) {
        return jsonResponse(409, { error: "Transaction does not match the booking order number." }, headers);
    }

    const existingRecord = await readPaymentRecord(orderNumber);
    const mergedRecord = enrichRecordFromTransaction(enrichRecordFromSnapshot({
        ...(existingRecord || {}),
        orderNumber,
        transactionId,
        verified: true,
        state: getPaymentState(transactionData.status),
        status: transactionData.status || (existingRecord?.status || ""),
        statusDescription: transactionData.status_description || (existingRecord?.statusDescription || ""),
        amount: transactionData.amount || (existingRecord?.amount || ""),
    }, bookingSnapshot), transactionData);
    const finalRecord = await maybeSendPaymentNotifications(mergedRecord);
    await savePaymentRecord(finalRecord);

    return jsonResponse(200, {
        ok: true,
        orderNumber: finalRecord.orderNumber || orderNumber,
        state: finalRecord.state || "",
        notificationEmailState: finalRecord.notificationEmailState || "",
        customerNotificationEmailSent: finalRecord.customerNotificationEmailSent === true,
        adminNotificationEmailSent: finalRecord.adminNotificationEmailSent === true,
    }, headers);
}

async function handleEmailPreview(request) {
    const url = new URL(request.url);
    const type = url.searchParams.get("type") === "admin" ? "admin" : "customer";
    const state = url.searchParams.get("state") === "failed" ? "failed" : "success";
    const previewRecord = {
        ...(await createEmailPreviewRecord()),
        state,
    };
    const emailPayload = state === "failed"
        ? (type === "admin" ? createAdminUnsuccessfulEmail(previewRecord) : createCustomerUnsuccessfulEmail(previewRecord))
        : (type === "admin" ? createAdminEmail(previewRecord) : createCustomerEmail(previewRecord));

    return htmlResponse(200, `<!doctype html>
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

export default async function handler(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: buildCorsHeaders(request),
        });
    }

    if (request.method === "GET" && pathname === "/api/maps/config") {
        return handleMapsConfig(request);
    }

    if (request.method === "POST" && pathname === "/api/maps/autocomplete") {
        return handleMapsAutocomplete(request);
    }

    if (request.method === "POST" && pathname === "/api/maps/delivery-quote") {
        return handleDeliveryQuote(request);
    }

    if (request.method === "POST" && pathname === "/api/bayarcash/payment-intents") {
        return handleCreatePaymentIntent(request);
    }

    if (request.method === "GET" && pathname === "/api/bayarcash/verify-return") {
        return handleVerifyReturn(request);
    }

    if (request.method === "POST" && pathname === "/api/bayarcash/callback") {
        return handleCallback(request);
    }

    if (request.method === "POST" && pathname === "/api/bayarcash/finalize-booking") {
        return handleFinalizeBooking(request);
    }

    if (request.method === "GET" && pathname === "/dev/email-preview") {
        return handleEmailPreview(request);
    }

    return textResponse(404, "Not Found", buildCorsHeaders(request));
}
