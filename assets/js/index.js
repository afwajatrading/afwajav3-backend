(function () {
    const { createLanguageController, setCurrentYear } = window.AfwajaSite;
    const { fleetData = {}, groupLabelKeys = {} } = window.AfwajaFleetCatalog || {};
    const siteConfig = window.AfwajaSiteConfig || {};
    const runtimeConfig = window.AfwajaRuntimeConfig || {};
    const WHATSFORM_URL = "https://whatsform.com/dt7Aom";
    const PAYMENT_RETURN_FLAG = "payment_return";
    const STATUS_CONFIG = {
        success: {
            tone: "border-emerald-200 bg-emerald-50/95",
            iconTone: "bg-emerald-100 text-emerald-600",
            icon: "fa-circle-check",
        },
        pending: {
            tone: "border-amber-200 bg-amber-50/95",
            iconTone: "bg-amber-100 text-amber-600",
            icon: "fa-clock",
        },
        failed: {
            tone: "border-rose-200 bg-rose-50/95",
            iconTone: "bg-rose-100 text-rose-600",
            icon: "fa-circle-xmark",
        },
        cancelled: {
            tone: "border-slate-200 bg-slate-50/95",
            iconTone: "bg-slate-100 text-slate-500",
            icon: "fa-ban",
        },
        unknown: {
            tone: "border-cyan-200 bg-cyan-50/95",
            iconTone: "bg-cyan-100 text-cyan-600",
            icon: "fa-circle-info",
        },
    };
    const TIME_SLOT_START_MINUTES = 7 * 60;
    const TIME_SLOT_END_MINUTES = 23 * 60;
    const TIME_SLOT_INTERVAL_MINUTES = 30;
    const MINIMUM_BOOKING_NOTICE_HOURS = 12;
    const TEST_CHECKOUT_CAR_NAME = runtimeConfig.testCheckout?.carName || "Perodua Axia";
    const TEST_CHECKOUT_TOTAL = Number(runtimeConfig.testCheckout?.total ?? 1);
    const TEST_CHECKOUT_ENABLED = Boolean(runtimeConfig.testCheckout?.enabled);
    const RENTAL_DISCOUNT_RULES = [
        { minimumDays: 30, discountPercent: 45, labelKey: "rate_monthly" },
        { minimumDays: 7, discountPercent: 20, labelKey: "rate_weekly" },
        { minimumDays: 3, discountPercent: 10, labelKey: "rate_three_day" },
    ];

    const translations = {
        en: {
            nav_home: "Home", nav_about: "About Us", nav_fleet: "Our Fleet",
            nav_testimonials: "Testimonials", nav_terms: "Terms", nav_contact: "Contact Us",
            hero_badge: "Premium Car Rental",
            hero_title1: "Travel in Comfort and Style with",
            hero_subtitle: "Premium, reliable, and affordable car rentals for your every journey. Experience smooth rides and hassle-free booking today.",
            hero_chip_fast: "Easy Booking Options",
            hero_chip_support: "24/7 Customer Support",
            hero_chip_delivery: "KLIA & City Delivery",
            hero_stat_fleet: "Vehicles Ready",
            hero_stat_clients: "Happy Customers",
            hero_stat_support: "Support Team",
            hero_offer_badge: "From RM120/day",
            hero_offer_desc: "Compact, sedan, SUV and MPV options for city trips, airport transfer and long-term rental.",
            btn_view_fleet: "View Cars", btn_contact_us: "WhatsApp Us",
            about_label: "About Us", about_title: "Your Trusted Travel Companion",
            about_p1: "At Afwaja Car Rental, we believe that the journey is just as important as the destination. We provide a wide range of well-maintained vehicles to suit your needs, whether it's a quick city run, a family vacation, or a corporate trip.",
            about_p2: "Our core values are simplicity, transparency, and customer satisfaction. No hidden fees, flexible rental terms, and a dedicated team ready to assist you 24/7.",
            feat_price: "Best Prices", feat_price_desc: "Competitive rates with zero hidden charges.",
            feat_quality: "Well-Maintained", feat_quality_desc: "Sanitized & strictly serviced for your safety.",
            feat_support: "24/7 Support", feat_support_desc: "Roadside assistance whenever you need us.",
            feat_fast: "Easy Booking", feat_fast_desc: "Simple booking through our website or WhatsApp in just minutes.",
            stat_clients: "Happy Clients", stat_cars: "Vehicles", stat_reviews: "Reviews",
            fleet_label: "Our Fleet", fleet_title: "Choose Your Perfect Ride",
            fleet_group_a: "Group A (Compact & Economy)",
            fleet_group_b: "Group B (Mid-size Sedan & Hatch)",
            fleet_group_c: "Group C (SUV, Crossover & Family MPV)",
            fleet_group_d: "Group D (Luxury & Large MPV)",
            per_day: "/ day", book_whatsapp: "Book via WhatsApp", book_direct: "Book Now", card_deposit: "Refundable Deposit:",
            testi_label: "Testimonials", testi_title: "What Our Clients Say",
            review_1: "Clean and well-scented cars. The pickup and return process is very easy. Awesome service Afwaja!",
            review_2: "Very responsive customer service via WhatsApp. The Myvi I rented was well-maintained. Highly recommended for tourists.",
            review_3: "Rented a Vellfire for a family trip. Reasonable price and satisfying service. Will repeat again.",
            terms_title: "Rental Terms & Conditions",
            term1_title: "Required Documents", term1_desc: "Valid driving license, original IC / Passport, and latest utility bill (water/electric) or student card.",
            term2_title: "Security Deposit", term2_desc: "A refundable security deposit is required upon vehicle handover. Will be refunded within 3-7 working days after return.",
            term3_title: "Fuel Policy", term3_desc: "Vehicles must be returned with the same fuel level as when collected. Surcharges apply for insufficient fuel.",
            term4_title: "Driving Area Limits", term4_desc: "Vehicles are strictly for use within Peninsular Malaysia. Off-road driving or track racing is strictly prohibited.",
            term5_title: "Traffic Fines & Summons", term5_desc: "The renter is fully responsible for all traffic summons, parking tickets, and tolls incurred during the rental period.",
            term6_title: "Extension & Cancellation", term6_desc: "Extensions must be informed 24 hours prior. Cancellations made less than 48 hours will forfeit the booking fee.",
            btn_open_terms: "Read Full Terms Document",
            footer_desc: "Your trusted partner for comfortable, safe, and affordable car rentals across the city.",
            footer_links: "Quick Links", footer_contact: "Contact Us",
            footer_logistics: "Logistics Calculator",
            modal_badge: "Secure Booking",
            modal_title: "Secure Online Booking",
            modal_subtitle: "Complete your trip details below and continue to BayarCash checkout.",
            modal_form_label: "Booking Details",
            modal_form_desc: "We will use these details to prepare your BayarCash checkout.",
            modal_car: "Selected Car",
            modal_rate: "Rate / Day",
            modal_rate_discounted: "{amount} ({label} - {discount}% OFF)",
            modal_deposit: "Refundable Deposit",
            modal_days: "Rental Duration",
            modal_delivery_charge: "Delivery Charge",
            modal_collection_charge: "Return Pickup Charge",
            modal_total: "Estimated Total",
            modal_total_note: "Checkout amount includes rental charges, refundable deposit, and any extra-hour charges after rental ended. Deposit will be returned based on the rental terms after vehicle handover.",
            modal_date: "Pick-up Date",
            modal_return_date: "Return Date",
            modal_pickup_time: "Pick-up Time",
            modal_pickup_time_note: "Bookings can only be made at least 12 hours in advance.",
            modal_return_time: "Return Time",
            modal_select_time: "Select time",
            modal_time_unavailable_suffix: " - unavailable",
            modal_pickup_time_status_prefix: "Earliest available pick-up time:",
            modal_pickup_time_status_none: "No pick-up times are available on this date. Please choose a later date.",
            modal_return_time_status_wait: "Return time is flexible. If you return on the same day, it only needs to be later than your pick-up time.",
            modal_return_time_status_prefix: "Earliest available return time:",
            modal_return_time_status_all_day: "All return times are available for the selected return date.",
            modal_return_time_status_none: "No return times are available on this date. Please choose a different return date.",
            modal_return_time_note: "Return time is flexible. Only same-day returns need to be later than your pick-up time.",
            modal_pickup_location: "Pick-up Location",
            modal_return_location: "Return Location",
            modal_homebase_free: "Afwaja Car Rental (Free)",
            modal_distance_note_title: "Distance-Based Delivery Charges",
            modal_distance_note_desc: "Pickup and return transport are calculated from Afwaja Car Rental Cyberjaya at RM2.00 per km using actual road distance.",
            modal_distance_empty: "Enter both locations to calculate delivery and pickup charges.",
            modal_distance_loading: "Calculating actual road distance from Afwaja Car Rental Cyberjaya...",
            modal_distance_error: "We could not calculate the route charges yet. Please refine both locations.",
            modal_distance_ready: "Delivery: {deliveryDistance} km (RM{deliveryCharge}) | Return pickup: {collectionDistance} km (RM{collectionCharge})",
            modal_name: "Full Name",
            modal_phone: "Phone Number",
            modal_email: "Email Address",
            modal_bank_note_title: "Refund Bank Details",
            modal_bank_note_desc: "Deposit refund will be processed to the bank account below after the vehicle is returned and inspection is completed.",
            modal_bank_name: "Bank Name",
            modal_account_name: "Account Holder Name",
            modal_account_number: "Account Number",
            modal_payment_note_title: "Secure BayarCash Checkout",
            modal_payment_note_desc: "After you submit this form, you will be redirected to BayarCash to complete payment securely.",
            modal_terms_agreement_html: 'I agree to the <a href="terms.html" target="_blank" rel="noopener noreferrer" class="font-semibold text-afwaja-teal underline underline-offset-2 hover:text-afwaja-navy">Terms &amp; Conditions</a> before proceeding to BayarCash.',
            modal_cancel: "Cancel",
            modal_submit: "Pay Now",
            modal_processing: "Redirecting to BayarCash...",
            placeholder_location: "Type your location",
            placeholder_name: "Type your name",
            placeholder_phone: "Type your phone number",
            placeholder_email: "Type your email",
            placeholder_bank: "Type your bank name",
            placeholder_account_name: "Type account holder name",
            placeholder_account_number: "Type account number",
            booking_error_location_quote: "Please wait for the delivery and pickup charges to be calculated before continuing.",
            booking_error_map_config: "Google Maps location services are not configured on this server yet.",
            payment_update_title: "Payment Update",
            payment_status_success: "Payment successful. Our team will contact you shortly to confirm the booking.",
            payment_status_pending: "Payment is still pending confirmation. We will update your booking once it is approved.",
            payment_status_failed: "Payment was not completed. You can try again whenever you are ready.",
            payment_status_cancelled: "Payment was cancelled before completion.",
            payment_status_unknown: "We received your payment return, but the status could not be verified yet.",
            payment_status_invalid: "We could not verify the BayarCash return checksum. Please contact our team if money has been deducted.",
            payment_order_label: "Order",
            payment_transaction_label: "Transaction",
            modal_days_empty: "Select your travel dates",
            modal_days_value: "day(s)",
            modal_extra_hours_value: "extra hour(s)",
            rate_standard: "Standard Rate",
            rate_three_day: "3+ Days Rate",
            rate_weekly: "Weekly Rate",
            rate_monthly: "Monthly Rate",
            booking_error_pickup_past: "Pick-up date cannot be earlier than today.",
            booking_error_invalid_dates: "Return date must be the same day or after the pick-up date.",
            booking_error_invalid_return_time: "Return time must be the same as or later than the pick-up time when both dates are the same.",
            booking_error_min_notice: "Bookings must be made at least 12 hours in advance.",
            booking_error_missing_car: "Please select a car again before continuing.",
            booking_error_generic: "We could not start BayarCash right now. Please try again in a moment.",
            booking_error_config: "BayarCash is not configured on this server yet. Add your portal key, PAT and API secret key first.",
            booking_error_terms: "Please agree to the Terms & Conditions before proceeding to BayarCash.",
        },
        ms: {
            nav_home: "Utama", nav_about: "Tentang Kami", nav_fleet: "Kereta Kami",
            nav_testimonials: "Testimoni", nav_terms: "Terma", nav_contact: "Hubungi Kami",
            hero_badge: "Sewa Kereta Premium",
            hero_title1: "Nikmati Perjalanan yang Selesa dan Bergaya bersama",
            hero_subtitle: "Sewa kereta premium, diyakini, dan mampu milik untuk setiap perjalanan anda. Alami pemanduan lancar dan tempahan mudah hari ini.",
            hero_chip_fast: "Pilihan Tempahan Mudah",
            hero_chip_support: "Khidmat Sokongan 24/7",
            hero_chip_delivery: "Penghantaran KLIA & Bandar",
            hero_stat_fleet: "Kenderaan Sedia Ada",
            hero_stat_clients: "Pelanggan Gembira",
            hero_stat_support: "Pasukan Sokongan",
            hero_offer_badge: "Serendah RM120/hari",
            hero_offer_desc: "Pilihan kompak, sedan, SUV dan MPV untuk urusan bandar, airport transfer dan sewaan jangka panjang.",
            btn_view_fleet: "Lihat Kereta", btn_contact_us: "WhatsApp Kami",
            about_label: "Tentang Kami", about_title: "Rakan Perjalanan Anda Yang Dipercayai",
            about_p1: "Di Afwaja Car Rental, kami percaya bahawa perjalanan itu sama penting dengan destinasi. Kami menyediakan pelbagai jenis kenderaan yang dijaga rapi untuk memenuhi keperluan anda, sama ada pusing bandar, percutian keluarga, atau urusan korporat.",
            about_p2: "Nilai teras kami adalah keringkasan, ketelusan, dan kepuasan pelanggan. Tiada cas tersembunyi, terma sewaan yang fleksibel, dan pasukan berdedikasi sedia membantu anda 24/7.",
            feat_price: "Harga Terbaik", feat_price_desc: "Kadar kompetitif tanpa caj tersembunyi.",
            feat_quality: "Diselenggara Rapi", feat_quality_desc: "Disanitasi & diservis demi keselamatan anda.",
            feat_support: "Bantuan 24/7", feat_support_desc: "Bantuan kerosakan tepi jalan bila-bila masa.",
            feat_fast: "Tempahan Mudah", feat_fast_desc: "Tempahan ringkas melalui laman web atau WhatsApp hanya dalam beberapa minit.",
            stat_clients: "Pelanggan Puas Hati", stat_cars: "Kenderaan", stat_reviews: "Bintang Ulasan",
            fleet_label: "Kereta Kami", fleet_title: "Pilih Kereta Idaman Anda",
            fleet_group_a: "Kumpulan A (Kompak & Ekonomi)",
            fleet_group_b: "Kumpulan B (Sedan Sederhana & Hatchback)",
            fleet_group_c: "Kumpulan C (SUV, Crossover & MPV Keluarga)",
            fleet_group_d: "Kumpulan D (MPV Mewah & Besar)",
            per_day: "/ hari", book_whatsapp: "Tempah via WhatsApp", book_direct: "Tempah Sekarang", card_deposit: "Deposit (Pulang):",
            testi_label: "Testimoni", testi_title: "Apa Kata Pelanggan Kami",
            review_1: "\"Kereta bersih, wangi dan tip-top. Proses ambil dan pulang kereta pun sangat mudah. Terbaik Afwaja!\"",
            review_2: "\"Servis pelanggan yang sangat pantas di WhatsApp. Myvi yang saya sewa dijaga rapi. Sangat disyorkan untuk pelancong.\"",
            review_3: "\"Sewa Vellfire untuk trip keluarga. Harga sangat berpatutan dan layanan memuaskan. Akan repeat lagi nanti.\"",
            terms_title: "Terma & Syarat Sewaan",
            term1_title: "Dokumen Diperlukan", term1_desc: "Lesen memandu yang sah, IC / Pasport asal, dan bil utiliti terkini (air/elektrik) atau kad pelajar.",
            term2_title: "Deposit Keselamatan", term2_desc: "Deposit keselamatan diperlukan semasa ambil kereta. Akan dipulangkan dalam 3-7 hari bekerja selepas pulangkan kereta.",
            term3_title: "Polisi Minyak", term3_desc: "Kenderaan mesti dipulangkan dengan tahap minyak yang sama. Cas tambahan dikenakan jika minyak tidak mencukupi.",
            term4_title: "Had Kawasan Pandu", term4_desc: "Kenderaan hanya untuk kegunaan di Semenanjung Malaysia. Panduan 'off-road' atau litar lumba adalah dilarang sama sekali.",
            term5_title: "Saman & Tiket Trafik", term5_desc: "Penyewa bertanggungjawab sepenuhnya ke atas semua saman trafik, tiket parking, dan tol sepanjang tempoh sewaan.",
            term6_title: "Lanjutan & Pembatalan", term6_desc: "Lanjutan masa perlu dimaklumkan 24 jam lebih awal. Pembatalan kurang dari 48 jam, deposit tempahan akan hangus.",
            btn_open_terms: "Baca Dokumen Penuh Terma",
            footer_desc: "Rakan dipercayai anda untuk sewaan kereta yang selesa, selamat, dan mampu milik di sekitar bandar.",
            footer_links: "Pautan Pantas", footer_contact: "Hubungi Kami",
            footer_logistics: "Kalkulator Logistik",
            modal_badge: "Tempahan Selamat",
            modal_title: "Tempahan Dalam Talian Selamat",
            modal_subtitle: "Lengkapkan maklumat perjalanan anda di bawah dan teruskan ke checkout BayarCash.",
            modal_form_label: "Maklumat Tempahan",
            modal_form_desc: "Maklumat ini akan digunakan untuk sediakan checkout BayarCash anda.",
            modal_car: "Kereta Pilihan",
            modal_rate: "Kadar / Hari",
            modal_rate_discounted: "{amount} ({label} - Diskaun {discount}%)",
            modal_deposit: "Deposit Pulang",
            modal_days: "Tempoh Sewaan",
            modal_delivery_charge: "Caj Delivery",
            modal_collection_charge: "Caj Pickup Semula",
            modal_total: "Anggaran Jumlah",
            modal_total_note: "Jumlah checkout merangkumi caj sewaan, deposit pulang, dan sebarang caj lebihan jam selepas tempoh sewaan tamat. Deposit akan dipulangkan mengikut terma sewaan selepas serahan kenderaan.",
            modal_date: "Tarikh Ambil",
            modal_return_date: "Tarikh Pulang",
            modal_pickup_time: "Masa Ambil",
            modal_pickup_time_note: "Tempahan hanya boleh dibuat sekurang-kurangnya 12 jam lebih awal.",
            modal_return_time: "Masa Pulang",
            modal_select_time: "Pilih masa",
            modal_time_unavailable_suffix: " - belum tersedia",
            modal_pickup_time_status_prefix: "Masa ambil terawal yang boleh dipilih:",
            modal_pickup_time_status_none: "Tiada masa ambil yang tersedia pada tarikh ini. Sila pilih tarikh yang lebih lewat.",
            modal_return_time_status_wait: "Masa pulang adalah fleksibel. Jika pulang pada hari yang sama, ia hanya perlu lebih lewat daripada masa ambil.",
            modal_return_time_status_prefix: "Masa pulang terawal yang boleh dipilih:",
            modal_return_time_status_all_day: "Semua masa pulang tersedia untuk tarikh pulang yang dipilih.",
            modal_return_time_status_none: "Tiada masa pulang yang tersedia pada tarikh ini. Sila pilih tarikh pulang lain.",
            modal_return_time_note: "Masa pulang adalah fleksibel. Hanya pemulangan pada hari yang sama perlu lebih lewat daripada masa ambil.",
            modal_pickup_location: "Lokasi Ambil",
            modal_return_location: "Lokasi Pulang",
            modal_homebase_free: "Afwaja Car Rental (Percuma)",
            modal_distance_note_title: "Caj Delivery Berdasarkan Jarak",
            modal_distance_note_desc: "Penghantaran dan pickup semula dikira dari Afwaja Car Rental Cyberjaya pada kadar RM2.00 setiap km menggunakan jarak jalan sebenar.",
            modal_distance_empty: "Masukkan kedua-dua lokasi untuk kira caj delivery dan pickup semula.",
            modal_distance_loading: "Sedang mengira jarak jalan sebenar dari Afwaja Car Rental Cyberjaya...",
            modal_distance_error: "Kami belum dapat kira caj laluan. Sila semak semula kedua-dua lokasi.",
            modal_distance_ready: "Delivery: {deliveryDistance} km (RM{deliveryCharge}) | Pickup semula: {collectionDistance} km (RM{collectionCharge})",
            modal_name: "Nama Penuh",
            modal_phone: "Nombor Telefon",
            modal_email: "Alamat Emel",
            modal_bank_note_title: "Butiran Bank Untuk Refund",
            modal_bank_note_desc: "Refund deposit akan diproses ke akaun bank di bawah selepas kenderaan dipulangkan dan pemeriksaan selesai.",
            modal_bank_name: "Nama Bank",
            modal_account_name: "Nama Pemegang Akaun",
            modal_account_number: "Nombor Akaun",
            modal_payment_note_title: "Checkout BayarCash Selamat",
            modal_payment_note_desc: "Selepas anda hantar borang ini, anda akan dibawa ke BayarCash untuk lengkapkan bayaran dengan selamat.",
            modal_terms_agreement_html: 'Saya setuju dengan <a href="terms.html" target="_blank" rel="noopener noreferrer" class="font-semibold text-afwaja-teal underline underline-offset-2 hover:text-afwaja-navy">Terma &amp; Syarat</a> sebelum meneruskan ke BayarCash.',
            modal_cancel: "Batal",
            modal_submit: "Bayar Sekarang",
            modal_processing: "Sedang ke BayarCash...",
            placeholder_location: "Taip lokasi anda",
            placeholder_name: "Taip nama anda",
            placeholder_phone: "Taip nombor telefon anda",
            placeholder_email: "Taip emel anda",
            placeholder_bank: "Taip nama bank anda",
            placeholder_account_name: "Taip nama pemegang akaun",
            placeholder_account_number: "Taip nombor akaun",
            booking_error_location_quote: "Sila tunggu sehingga caj delivery dan pickup semula selesai dikira sebelum teruskan.",
            booking_error_map_config: "Perkhidmatan lokasi Google Maps belum dikonfigurasi pada server ini.",
            payment_update_title: "Kemaskini Bayaran",
            payment_status_success: "Bayaran berjaya. Pasukan kami akan hubungi anda sebentar lagi untuk sahkan tempahan.",
            payment_status_pending: "Bayaran masih menunggu pengesahan. Kami akan kemas kini tempahan anda selepas ia diluluskan.",
            payment_status_failed: "Bayaran belum berjaya diselesaikan. Anda boleh cuba semula bila bersedia.",
            payment_status_cancelled: "Bayaran telah dibatalkan sebelum selesai.",
            payment_status_unknown: "Kami menerima pulangan bayaran anda, tetapi statusnya belum dapat disahkan lagi.",
            payment_status_invalid: "Pulangan BayarCash tidak dapat disahkan. Hubungi pasukan kami jika wang telah ditolak.",
            payment_order_label: "No. Tempahan",
            payment_transaction_label: "Transaksi",
            modal_days_empty: "Pilih tarikh perjalanan anda",
            modal_days_value: "hari",
            modal_extra_hours_value: "jam tambahan",
            rate_standard: "Kadar Biasa",
            rate_three_day: "Kadar 3+ Hari",
            rate_weekly: "Kadar Mingguan",
            rate_monthly: "Kadar Bulanan",
            booking_error_pickup_past: "Tarikh ambil tidak boleh lebih awal daripada hari ini.",
            booking_error_invalid_dates: "Tarikh pulang mesti sama hari atau selepas tarikh ambil.",
            booking_error_invalid_return_time: "Masa pulang mesti sama atau selepas masa ambil jika kedua-dua tarikh adalah hari yang sama.",
            booking_error_min_notice: "Tempahan hanya boleh dibuat sekurang-kurangnya 12 jam lebih awal.",
            booking_error_missing_car: "Sila pilih semula kereta sebelum teruskan.",
            booking_error_generic: "Kami belum dapat mulakan BayarCash sekarang. Cuba lagi sebentar lagi.",
            booking_error_config: "BayarCash belum dikonfigurasi pada server ini. Masukkan portal key, PAT dan API secret key dahulu.",
            booking_error_terms: "Sila setuju dengan Terma & Syarat sebelum meneruskan ke BayarCash.",
        },
    };

    const fleetContainer = document.getElementById("fleet-container");
    const mobileMenu = document.getElementById("mobile-menu");
    const bookingModal = document.getElementById("booking-modal");
    const bookingForm = document.getElementById("booking-form");
    const bookingPickupDate = document.getElementById("booking-pickup-date");
    const bookingReturnDate = document.getElementById("booking-return-date");
    const bookingPickupTime = document.getElementById("booking-pickup-time");
    const bookingReturnTime = document.getElementById("booking-return-time");
    const bookingPickupTimeStatus = document.getElementById("booking-pickup-time-status");
    const bookingReturnTimeStatus = document.getElementById("booking-return-time-status");
    const bookingPickupLocation = document.getElementById("booking-pickup-location");
    const bookingReturnLocation = document.getElementById("booking-return-location");
    const bookingPickupHomeBase = document.getElementById("booking-pickup-homebase");
    const bookingReturnHomeBase = document.getElementById("booking-return-homebase");
    const bookingName = document.getElementById("booking-name");
    const bookingEmail = document.getElementById("booking-email");
    const bookingPhone = document.getElementById("booking-phone");
    const bookingBankName = document.getElementById("booking-bank-name");
    const bookingBankAccountName = document.getElementById("booking-bank-account-name");
    const bookingBankAccountNumber = document.getElementById("booking-bank-account-number");
    const bookingTermsAgreement = document.getElementById("booking-terms-agreement");
    const bookingSubmitButton = document.getElementById("booking-submit-button");
    const bookingSubmitText = document.getElementById("booking-submit-text");
    const bookingFormError = document.getElementById("booking-form-error");
    const bookingDistanceFeedback = document.getElementById("booking-distance-feedback");
    const paymentStatusBanner = document.getElementById("payment-status-banner");
    const paymentStatusCard = document.getElementById("payment-status-card");
    const paymentStatusIcon = document.getElementById("payment-status-icon");
    const paymentStatusTitle = document.getElementById("payment-status-title");
    const paymentStatusMessage = document.getElementById("payment-status-message");

    const bookingSummary = {
        car: document.getElementById("booking-summary-car"),
        rate: document.getElementById("booking-summary-rate"),
        deposit: document.getElementById("booking-summary-deposit"),
        days: document.getElementById("booking-summary-days"),
        delivery: document.getElementById("booking-summary-delivery"),
        collection: document.getElementById("booking-summary-collection"),
        total: document.getElementById("booking-summary-total"),
    };

    const carIndex = createCarIndex();
    const locationSuggestionElements = {
        pickup: document.getElementById("booking-pickup-location-suggestions"),
        return: document.getElementById("booking-return-location-suggestions"),
    };
    const mapConfig = {
        enabled: false,
        homeBaseName: "Afwaja Car Rental Cyberjaya",
        homeBaseAddress: "Afwaja Car Rental Cyberjaya, Cyberjaya, Selangor, Malaysia",
        ratePerKm: 2,
    };
    const locationFieldState = {
        pickup: { input: bookingPickupLocation, key: "pickup", suggestions: [], debounceId: null },
        return: { input: bookingReturnLocation, key: "return", suggestions: [], debounceId: null },
    };
    const deliveryQuote = {
        status: "idle",
        pickupDistanceKm: 0,
        pickupCharge: 0,
        collectionDistanceKm: 0,
        collectionCharge: 0,
        totalCharge: 0,
    };
    let selectedCar = null;
    let quoteRequestToken = 0;

    const languageController = createLanguageController({
        defaultLanguage: "ms",
        translations,
        desktopToggleId: "lang-toggle",
        mobileToggleId: "lang-toggle-mobile",
        htmlKeys: ["modal_terms_agreement_html"],
        onUpdate: () => {
            renderFleet();
            populateTimeDropdowns();
            updateDistanceFeedback();
            updateBookingSummary();
        },
    });

    function createCarIndex() {
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

    function escapeAttribute(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function getDepositByGroup(groupName) {
        if (groupName.includes("Kumpulan A")) return 100;
        if (groupName.includes("Kumpulan B")) return 200;
        if (groupName.includes("Kumpulan C")) return 300;
        if (groupName.includes("Kumpulan D")) return 400;
        return 0;
    }

    function isTestCheckoutCar(carName) {
        return TEST_CHECKOUT_ENABLED && carName === TEST_CHECKOUT_CAR_NAME;
    }

    function getCarDeposit(groupName, carName) {
        return getDepositByGroup(groupName);
    }

    function getCheckoutTotalOverride(carName) {
        if (!isTestCheckoutCar(carName)) {
            return null;
        }

        return Number.isFinite(TEST_CHECKOUT_TOTAL) ? TEST_CHECKOUT_TOTAL : 1;
    }

    function getCurrentLanguage() {
        return languageController.getCurrentLanguage();
    }

    function t(key) {
        return translations[getCurrentLanguage()]?.[key] || key;
    }

    function interpolate(template, values) {
        return Object.entries(values).reduce((message, [key, value]) => {
            return message.replaceAll(`{${key}}`, value);
        }, template);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat("en-MY", {
            style: "currency",
            currency: "MYR",
            minimumFractionDigits: 2,
        }).format(amount);
    }

    function formatChargeNumber(amount) {
        return Number(amount).toFixed(2);
    }

    function buildApiUrl(path) {
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;
        const apiBaseUrl = `${siteConfig.apiBaseUrl || ""}`.trim().replace(/\/+$/, "");
        return apiBaseUrl ? `${apiBaseUrl}${normalizedPath}` : normalizedPath;
    }

    function formatDistanceKm(distanceKm) {
        return Number(distanceKm).toFixed(1);
    }

    function todayString() {
        return formatDateInputValue(new Date());
    }

    function formatDateInputValue(date) {
        const year = date.getFullYear();
        const day = `${date.getDate()}`.padStart(2, "0");
        const month = `${date.getMonth() + 1}`.padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function parseDateParts(value) {
        if (!value) {
            return null;
        }

        if (/^\d{2}\/\d{2}\/\d{2}$/.test(value)) {
            const [day, month, year] = value.split("/").map(Number);
            return { year: 2000 + year, month, day };
        }

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [year, month, day] = value.split("-").map(Number);
            return { year, month, day };
        }

        return null;
    }

    function parseDateInput(value) {
        const parts = parseDateParts(value);

        if (!parts) {
            return null;
        }

        const { year, month, day } = parts;
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

    function calculateRentalPricing(pickupDateValue, returnDateValue, pickupTimeValue, returnTimeValue, dailyRate) {
        const pickupDateTime = combineDateAndTime(pickupDateValue, pickupTimeValue);
        const returnDateTime = combineDateAndTime(returnDateValue, returnTimeValue);

        if (!pickupDateTime || !returnDateTime || Number.isNaN(Number(dailyRate))) {
            return null;
        }

        const durationMilliseconds = returnDateTime.getTime() - pickupDateTime.getTime();

        if (durationMilliseconds < 0) {
            return null;
        }

        const totalMinutes = Math.ceil(durationMilliseconds / 60000);
        const baseDayMinutes = 24 * 60;
        const normalizedDailyRate = Number(dailyRate);

        if (totalMinutes <= baseDayMinutes) {
            return {
                baseDays: 1,
                extraHours: 0,
                extraHourCharge: 0,
                chargeableDays: 1,
                originalDailyRate: normalizedDailyRate,
                discountedDailyRate: normalizedDailyRate,
                discountPercent: 0,
                rateLabelKey: "rate_standard",
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
            rateLabelKey: discountRule?.labelKey || "rate_standard",
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

        const dateParts = parseDateParts(dateValue);
        const timeParts = timeValue.split(":").map(Number);

        if (!dateParts || timeParts.length !== 2) {
            return null;
        }

        const { year, month, day } = dateParts;
        const [hours, minutes] = timeParts;
        const combined = new Date(year, month - 1, day, hours, minutes, 0, 0);

        return Number.isNaN(combined.getTime()) ? null : combined;
    }

    function isSameCalendarDate(firstDateValue, secondDateValue) {
        const firstDate = parseDateInput(firstDateValue);
        const secondDate = parseDateInput(secondDateValue);

        if (!firstDate || !secondDate) {
            return false;
        }

        return firstDate.getTime() === secondDate.getTime();
    }

    function getMinimumPickupDateTime() {
        return new Date(Date.now() + (MINIMUM_BOOKING_NOTICE_HOURS * 60 * 60 * 1000));
    }

    function getEarliestPickupSlot() {
        const minimumDateTime = getMinimumPickupDateTime();

        for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
            const candidateDate = new Date(
                minimumDateTime.getFullYear(),
                minimumDateTime.getMonth(),
                minimumDateTime.getDate() + dayOffset,
                0,
                0,
                0,
                0
            );
            const candidateDateValue = formatDateInputValue(candidateDate);

            for (let minutes = TIME_SLOT_START_MINUTES; minutes <= TIME_SLOT_END_MINUTES; minutes += TIME_SLOT_INTERVAL_MINUTES) {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                const slotValue = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
                const slotDateTime = combineDateAndTime(candidateDateValue, slotValue);

                if (slotDateTime && slotDateTime >= minimumDateTime) {
                    return {
                        dateValue: candidateDateValue,
                        timeValue: slotValue,
                    };
                }
            }
        }

        const fallbackDateValue = formatDateInputValue(minimumDateTime);
        return {
            dateValue: fallbackDateValue,
            timeValue: "",
        };
    }

    function formatDisplayDate(dateValue) {
        const date = parseDateInput(dateValue);
        if (!date) {
            return dateValue;
        }

        const day = `${date.getUTCDate()}`.padStart(2, "0");
        const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    }

    function formatTimeLabel(timeValue) {
        const minutes = parseTimeInput(timeValue);
        if (minutes === null) {
            return timeValue;
        }

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const period = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 === 0 ? 12 : hours % 12;
        return `${hour12}:${String(mins).padStart(2, "0")} ${period}`;
    }

    function setTimeStatusMessage(element, message, tone = "amber") {
        if (!element) {
            return;
        }

        const toneClasses = {
            amber: ["text-amber-600"],
            emerald: ["text-emerald-600"],
            slate: ["text-slate-500"],
        };

        element.textContent = message;
        element.classList.remove("text-amber-600", "text-emerald-600", "text-slate-500");
        element.classList.add(...(toneClasses[tone] || toneClasses.amber));
    }

    function getScheduleValidation(pickupDateValue, returnDateValue, pickupTimeValue, returnTimeValue) {
        const today = parseDateInput(todayString());
        const pickupDate = parseDateInput(pickupDateValue);
        const returnDate = parseDateInput(returnDateValue);

        if (!pickupDate || !returnDate) {
            return { status: "incomplete" };
        }

        if (pickupDate < today) {
            return { status: "invalid", message: t("booking_error_pickup_past") };
        }

        const rentalDays = calculateRentalDays(pickupDateValue, returnDateValue);
        if (rentalDays === null || rentalDays < 0) {
            return { status: "invalid", message: t("booking_error_invalid_dates") };
        }

        const pickupTimeMinutes = parseTimeInput(pickupTimeValue);
        const returnTimeMinutes = parseTimeInput(returnTimeValue);

        if (pickupTimeMinutes !== null && returnTimeMinutes !== null && isSameCalendarDate(pickupDateValue, returnDateValue) && returnTimeMinutes < pickupTimeMinutes) {
            return { status: "invalid", message: t("booking_error_invalid_return_time") };
        }

        if (pickupTimeMinutes !== null) {
            const pickupDateTime = combineDateAndTime(pickupDateValue, pickupTimeValue);
            const minimumPickupDateTime = getMinimumPickupDateTime();

            if (pickupDateTime && pickupDateTime < minimumPickupDateTime) {
                return { status: "invalid", message: t("booking_error_min_notice") };
            }
        }

        return {
            status: "valid",
            rentalDays,
        };
    }

    function refreshTimeOptions() {
        const timeSlots = buildTimeSlots();
        const minimumPickupDateTime = getMinimumPickupDateTime();
        const pickupDateValue = bookingPickupDate?.value || "";
        const returnDateValue = bookingReturnDate?.value || "";
        const pickupTimeMinutes = parseTimeInput(bookingPickupTime?.value || "");
        let firstEnabledPickupOption = "";
        let firstEnabledReturnOption = "";

        [bookingPickupTime, bookingReturnTime].forEach((selectElement, index) => {
            if (!selectElement) {
                return;
            }

            const currentValue = selectElement.value;
            const isPickupField = index === 0;
            const targetDateValue = isPickupField ? pickupDateValue : returnDateValue;

            Array.from(selectElement.options).forEach((option) => {
                if (!option.value) {
                    option.disabled = false;
                    return;
                }

                const matchingSlot = timeSlots.find((slot) => slot.value === option.value);
                if (matchingSlot) {
                    option.textContent = matchingSlot.label;
                }

                const optionMinutes = parseTimeInput(option.value);
                let isDisabled = false;

                if (isPickupField && targetDateValue) {
                    const optionDateTime = combineDateAndTime(targetDateValue, option.value);
                    if (!optionDateTime || optionDateTime < minimumPickupDateTime) {
                        isDisabled = true;
                    }
                }

                if (!isPickupField && targetDateValue && pickupDateValue && isSameCalendarDate(targetDateValue, pickupDateValue) && pickupTimeMinutes !== null && optionMinutes !== null && optionMinutes < pickupTimeMinutes) {
                    isDisabled = true;
                }

                option.disabled = isDisabled;

                if (isDisabled && matchingSlot) {
                    option.textContent = `${matchingSlot.label}${t("modal_time_unavailable_suffix")}`;
                } else if (!isDisabled) {
                    if (isPickupField && !firstEnabledPickupOption) {
                        firstEnabledPickupOption = option.value;
                    }

                    if (!isPickupField && !firstEnabledReturnOption) {
                        firstEnabledReturnOption = option.value;
                    }
                }
            });

            if (currentValue) {
                const currentOption = Array.from(selectElement.options).find((option) => option.value === currentValue);
                if (currentOption?.disabled) {
                    selectElement.value = "";
                }
            }
        });

        if (pickupDateValue) {
            if (firstEnabledPickupOption) {
                setTimeStatusMessage(
                    bookingPickupTimeStatus,
                    `${t("modal_pickup_time_status_prefix")} ${formatDisplayDate(pickupDateValue)}, ${formatTimeLabel(firstEnabledPickupOption)}`,
                    "emerald"
                );
            } else {
                setTimeStatusMessage(
                    bookingPickupTimeStatus,
                    t("modal_pickup_time_status_none"),
                    "amber"
                );
            }
        } else {
            setTimeStatusMessage(
                bookingPickupTimeStatus,
                t("modal_pickup_time_note"),
                "slate"
            );
        }

        if (!returnDateValue) {
            setTimeStatusMessage(
                bookingReturnTimeStatus,
                t("modal_return_time_note"),
                "slate"
            );
            return;
        }

        if (pickupDateValue && isSameCalendarDate(returnDateValue, pickupDateValue) && pickupTimeMinutes === null) {
            setTimeStatusMessage(
                bookingReturnTimeStatus,
                t("modal_return_time_status_wait"),
                "amber"
            );
            return;
        }

        if (firstEnabledReturnOption) {
            const returnStatusKey = pickupDateValue && isSameCalendarDate(returnDateValue, pickupDateValue)
                ? "modal_return_time_status_prefix"
                : "modal_return_time_status_all_day";

            const returnStatusMessage = returnStatusKey === "modal_return_time_status_prefix"
                ? `${t(returnStatusKey)} ${formatTimeLabel(firstEnabledReturnOption)}`
                : t(returnStatusKey);

            setTimeStatusMessage(
                bookingReturnTimeStatus,
                returnStatusMessage,
                "emerald"
            );
            return;
        }

        setTimeStatusMessage(
            bookingReturnTimeStatus,
            t("modal_return_time_status_none"),
            "amber"
        );
    }

    function formatRentalDays(days) {
        return `${days} ${t("modal_days_value")}`;
    }

    function formatRentalDuration(pricing) {
        if (!pricing) {
            return t("modal_days_empty");
        }

        const baseLabel = formatRentalDays(pricing.baseDays);

        if (!pricing.extraHours) {
            return baseLabel;
        }

        return `${baseLabel} + ${pricing.extraHours} ${t("modal_extra_hours_value")}`;
    }

    function formatRateDisplay(pricing) {
        if (!pricing) {
            return "-";
        }

        const amount = formatCurrency(pricing.discountedDailyRate);
        const label = t(pricing.rateLabelKey || "rate_standard");

        if (!pricing.discountPercent) {
            return `${amount} (${label})`;
        }

        return interpolate(t("modal_rate_discounted"), {
            amount,
            label,
            discount: pricing.discountPercent,
        });
    }

    function renderFleet() {
        if (!fleetContainer) {
            return;
        }

        let html = "";
        const currentLanguage = getCurrentLanguage();

        Object.entries(fleetData).forEach(([groupName, cars]) => {
            const groupLabelKey = groupLabelKeys[groupName];
            const localizedGroupName = translations[currentLanguage]?.[groupLabelKey] || groupName;

            html += `
                <div class="mb-12">
                    <div class="flex items-center gap-4 mb-8">
                        <div class="h-px bg-slate-300 flex-grow"></div>
                        <h4 class="text-2xl font-bold text-afwaja-navy px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">${localizedGroupName}</h4>
                        <div class="h-px bg-slate-300 flex-grow"></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            `;

            cars.forEach((car) => {
                const paddingClass = car.imgPadding || "p-3";
                const carName = escapeAttribute(car.name);
                const deposit = getCarDeposit(groupName, car.name);

                html += `
                    <div class="bg-white rounded-2xl shadow-lg shadow-slate-200/70 hover:shadow-xl transition-shadow overflow-hidden flex flex-col border border-slate-200">
                        <div class="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden group">
                            <img src="${car.img}" alt="${carName}" class="w-full h-full object-contain ${paddingClass} group-hover:scale-105 transition-transform duration-500">
                            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-afwaja-navy shadow-sm">
                                ${car.type}
                            </div>
                        </div>
                        <div class="p-6 flex-grow flex flex-col bg-white">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h4 class="text-xl font-bold text-afwaja-navy">${car.name}</h4>
                                    <p class="text-sm text-slate-500 mb-2">${car.desc}</p>
                                    <span class="inline-flex items-center gap-1 text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                                        <i class="fas fa-shield-alt text-afwaja-teal"></i> <span data-i18n="card_deposit">Refundable Deposit:</span> RM${deposit}
                                    </span>
                                </div>
                                <div class="text-right">
                                    <span class="text-xl font-bold text-afwaja-teal">RM${car.price}</span>
                                    <span class="text-xs text-slate-500 block" data-i18n="per_day">/ day</span>
                                </div>
                            </div>
                            <div class="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
                                <button type="button" data-action="payment" data-car-name="${carName}" class="w-full flex items-center justify-center gap-2 bg-[#1f2d3d] hover:bg-[#16212e] text-white py-3 rounded-lg font-semibold transition-colors shadow-md shadow-slate-900/10 border border-[#1f2d3d]">
                                    <i class="fas fa-credit-card text-xl"></i>
                                    <span data-i18n="book_direct">Book Now</span>
                                </button>
                                <button type="button" data-action="whatsapp" data-car-name="${carName}" class="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-lg font-semibold transition-colors shadow-md shadow-emerald-500/20 border border-[#25D366]">
                                    <i class="fab fa-whatsapp text-xl"></i>
                                    <span data-i18n="book_whatsapp">Book via WhatsApp</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += "</div></div>";
        });

        fleetContainer.innerHTML = html;
    }

    function buildTimeSlots() {
        const slots = [];

        for (let minutes = TIME_SLOT_START_MINUTES; minutes <= TIME_SLOT_END_MINUTES; minutes += TIME_SLOT_INTERVAL_MINUTES) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const period = hours >= 12 ? "PM" : "AM";
            const hour12 = hours % 12 === 0 ? 12 : hours % 12;
            const value = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
            const label = `${hour12}:${String(mins).padStart(2, "0")} ${period}`;
            slots.push({ value, label });
        }

        return slots;
    }

    function populateTimeDropdowns() {
        const timeSlots = buildTimeSlots();
        const selectPlaceholder = t("modal_select_time");

        [bookingPickupTime, bookingReturnTime].forEach((selectElement) => {
            if (!selectElement) {
                return;
            }

            const previousValue = selectElement.value;
            const optionsMarkup = [`<option value="">${selectPlaceholder}</option>`]
                .concat(timeSlots.map((slot) => `<option value="${slot.value}">${slot.label}</option>`))
                .join("");

            selectElement.innerHTML = optionsMarkup;

            if (previousValue && timeSlots.some((slot) => slot.value === previousValue)) {
                selectElement.value = previousValue;
            }
        });

        refreshTimeOptions();
    }

    function resetDeliveryQuote(status = "idle") {
        deliveryQuote.status = status;
        deliveryQuote.pickupDistanceKm = 0;
        deliveryQuote.pickupCharge = 0;
        deliveryQuote.collectionDistanceKm = 0;
        deliveryQuote.collectionCharge = 0;
        deliveryQuote.totalCharge = 0;
    }

    function updateDistanceFeedback() {
        if (!bookingDistanceFeedback) {
            return;
        }

        if (!mapConfig.enabled) {
            bookingDistanceFeedback.textContent = t("booking_error_map_config");
            return;
        }

        if (deliveryQuote.status === "loading") {
            bookingDistanceFeedback.textContent = t("modal_distance_loading");
            return;
        }

        if (deliveryQuote.status === "ready") {
            bookingDistanceFeedback.textContent = interpolate(t("modal_distance_ready"), {
                deliveryDistance: formatDistanceKm(deliveryQuote.pickupDistanceKm),
                deliveryCharge: formatChargeNumber(deliveryQuote.pickupCharge),
                collectionDistance: formatDistanceKm(deliveryQuote.collectionDistanceKm),
                collectionCharge: formatChargeNumber(deliveryQuote.collectionCharge),
            });
            return;
        }

        if (deliveryQuote.status === "error") {
            bookingDistanceFeedback.textContent = t("modal_distance_error");
            return;
        }

        bookingDistanceFeedback.textContent = t("modal_distance_empty");
    }

    function buildLocationPayload(inputElement) {
        return {
            address: inputElement?.value.trim() || "",
            placeId: inputElement?.dataset.placeId || "",
            isHomeBase: inputElement?.dataset.homeBase === "true",
        };
    }

    function clearLocationSelection(inputElement) {
        if (!inputElement) {
            return;
        }

        inputElement.dataset.placeId = "";
        inputElement.dataset.placeLabel = "";
        inputElement.dataset.homeBase = "";
    }

    function setLocationAsHomeBase(inputElement) {
        if (!inputElement) {
            return;
        }

        inputElement.value = mapConfig.homeBaseName;
        inputElement.dataset.placeId = "";
        inputElement.dataset.placeLabel = mapConfig.homeBaseName;
        inputElement.dataset.homeBase = "true";
    }

    function toggleHomeBaseLocation(key, isChecked) {
        const inputElement = key === "pickup" ? bookingPickupLocation : bookingReturnLocation;

        if (!inputElement) {
            return;
        }

        if (isChecked) {
            setLocationAsHomeBase(inputElement);
            inputElement.readOnly = true;
            inputElement.classList.add("bg-slate-100", "text-slate-500", "cursor-not-allowed");
            hideSuggestionList(key);
        } else {
            inputElement.readOnly = false;
            inputElement.classList.remove("bg-slate-100", "text-slate-500", "cursor-not-allowed");
            inputElement.value = "";
            clearLocationSelection(inputElement);
        }

        resetDeliveryQuote("idle");
        updateDistanceFeedback();
        updateBookingSummary();
        requestDeliveryQuote();
    }

    function hideSuggestionList(key) {
        const suggestionElement = locationSuggestionElements[key];
        if (!suggestionElement) {
            return;
        }

        suggestionElement.classList.add("hidden");
        suggestionElement.innerHTML = "";
    }

    function renderSuggestionList(key, suggestions) {
        const suggestionElement = locationSuggestionElements[key];
        if (!suggestionElement) {
            return;
        }

        if (!suggestions.length) {
            hideSuggestionList(key);
            return;
        }

        suggestionElement.innerHTML = suggestions.map((suggestion, index) => `
            <button
                type="button"
                class="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${index < suggestions.length - 1 ? "border-b border-slate-100" : ""}"
                data-location-suggestion="${key}"
                data-place-id="${escapeAttribute(suggestion.placeId)}"
                data-label="${escapeAttribute(suggestion.label)}"
            >
                <span class="block text-sm font-semibold text-slate-800">${escapeAttribute(suggestion.mainText)}</span>
                <span class="mt-1 block text-xs text-slate-500">${escapeAttribute(suggestion.secondaryText)}</span>
            </button>
        `).join("");
        suggestionElement.classList.remove("hidden");
    }

    async function fetchMapConfig() {
        try {
            const response = await fetch(buildApiUrl("/api/maps/config"));
            const result = await response.json();

            if (!response.ok || !result.enabled) {
                mapConfig.enabled = false;
                updateDistanceFeedback();
                return;
            }

            mapConfig.enabled = true;
            mapConfig.homeBaseName = result.homeBaseName || mapConfig.homeBaseName;
            mapConfig.homeBaseAddress = result.homeBaseAddress || mapConfig.homeBaseAddress;
            mapConfig.ratePerKm = Number(result.ratePerKm) || mapConfig.ratePerKm;
            updateDistanceFeedback();
        } catch (error) {
            mapConfig.enabled = false;
            updateDistanceFeedback();
        }
    }

    async function fetchLocationSuggestions(key, inputValue) {
        if (!mapConfig.enabled || inputValue.trim().length < 3) {
            hideSuggestionList(key);
            return;
        }

        try {
            const response = await fetch(buildApiUrl("/api/maps/autocomplete"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ input: inputValue.trim() }),
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok || !Array.isArray(result.suggestions)) {
                hideSuggestionList(key);
                return;
            }

            renderSuggestionList(key, result.suggestions);
        } catch (error) {
            hideSuggestionList(key);
        }
    }

    async function requestDeliveryQuote() {
        const pickupLocation = buildLocationPayload(bookingPickupLocation);
        const returnLocation = buildLocationPayload(bookingReturnLocation);

        if (!mapConfig.enabled) {
            resetDeliveryQuote("error");
            updateDistanceFeedback();
            updateBookingSummary();
            return;
        }

        if (!pickupLocation.address || !returnLocation.address) {
            resetDeliveryQuote("idle");
            updateDistanceFeedback();
            updateBookingSummary();
            return;
        }

        const currentToken = ++quoteRequestToken;
        deliveryQuote.status = "loading";
        updateDistanceFeedback();
        updateBookingSummary();

        try {
            const response = await fetch(buildApiUrl("/api/maps/delivery-quote"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pickupLocation,
                    returnLocation,
                }),
            });
            const result = await response.json().catch(() => ({}));

            if (currentToken !== quoteRequestToken) {
                return;
            }

            if (!response.ok) {
                resetDeliveryQuote("error");
                updateDistanceFeedback();
                updateBookingSummary();
                return;
            }

            deliveryQuote.status = "ready";
            deliveryQuote.pickupDistanceKm = Number(result.pickupDistanceKm) || 0;
            deliveryQuote.pickupCharge = Number(result.pickupCharge) || 0;
            deliveryQuote.collectionDistanceKm = Number(result.collectionDistanceKm) || 0;
            deliveryQuote.collectionCharge = Number(result.collectionCharge) || 0;
            deliveryQuote.totalCharge = Number(result.totalCharge) || 0;
            updateDistanceFeedback();
            updateBookingSummary();
        } catch (error) {
            if (currentToken !== quoteRequestToken) {
                return;
            }

            resetDeliveryQuote("error");
            updateDistanceFeedback();
            updateBookingSummary();
        }
    }

    function toggleMobileMenu() {
        if (mobileMenu) {
            mobileMenu.classList.toggle("hidden");
        }
    }

    function closeMobileMenu() {
        if (mobileMenu) {
            mobileMenu.classList.add("hidden");
        }
    }

    function openBookingModal(carName) {
        selectedCar = carIndex.get(carName) || null;

        if (!selectedCar || !bookingModal) {
            window.alert(t("booking_error_missing_car"));
            return;
        }

        bookingForm?.reset();
        clearBookingError();

        const minDate = todayString();
        const earliestPickupSlot = getEarliestPickupSlot();

        if (bookingPickupDate) {
            bookingPickupDate.min = minDate;
            bookingPickupDate.value = earliestPickupSlot.dateValue;
        }

        if (bookingReturnDate) {
            bookingReturnDate.min = earliestPickupSlot.dateValue;
            bookingReturnDate.value = earliestPickupSlot.dateValue;
        }

        if (bookingPickupTime) {
            bookingPickupTime.value = "";
        }

        if (bookingReturnTime) {
            bookingReturnTime.value = "";
        }

        if (bookingPickupHomeBase) {
            bookingPickupHomeBase.checked = false;
        }

        if (bookingReturnHomeBase) {
            bookingReturnHomeBase.checked = false;
        }

        clearLocationSelection(bookingPickupLocation);
        clearLocationSelection(bookingReturnLocation);
        toggleHomeBaseLocation("pickup", false);
        toggleHomeBaseLocation("return", false);
        hideSuggestionList("pickup");
        hideSuggestionList("return");
        resetDeliveryQuote("idle");
        refreshTimeOptions();
        updateDistanceFeedback();
        updateBookingSummary();
        setBookingLoading(false);
        bookingModal.classList.remove("hidden");
        bookingModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("overflow-hidden");
        bookingName?.focus();
    }

    function closeBookingModal() {
        if (!bookingModal) {
            return;
        }

        bookingModal.classList.add("hidden");
        bookingModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("overflow-hidden");
        clearBookingError();
        setBookingLoading(false);
    }

    function updateBookingSummary() {
        if (!selectedCar) {
            return;
        }

        if (bookingSummary.car) {
            bookingSummary.car.textContent = selectedCar.name;
        }

        if (bookingSummary.rate) {
            bookingSummary.rate.textContent = `${formatCurrency(selectedCar.price)} (${t("rate_standard")})`;
        }

        if (bookingSummary.deposit) {
            bookingSummary.deposit.textContent = formatCurrency(selectedCar.deposit);
        }

        if (bookingSummary.delivery) {
            bookingSummary.delivery.textContent = deliveryQuote.status === "ready"
                ? formatCurrency(deliveryQuote.pickupCharge)
                : "-";
        }

        if (bookingSummary.collection) {
            bookingSummary.collection.textContent = deliveryQuote.status === "ready"
                ? formatCurrency(deliveryQuote.collectionCharge)
                : "-";
        }

        const scheduleValidation = getScheduleValidation(
            bookingPickupDate?.value,
            bookingReturnDate?.value,
            bookingPickupTime?.value,
            bookingReturnTime?.value
        );

        if (!bookingPickupDate?.value || !bookingReturnDate?.value) {
            bookingSummary.days.textContent = t("modal_days_empty");
            bookingSummary.total.textContent = "-";
            return;
        }

        if (scheduleValidation.status === "invalid") {
            bookingSummary.days.textContent = scheduleValidation.message;
            bookingSummary.total.textContent = "-";
            return;
        }

        const rentalPricing = calculateRentalPricing(
            bookingPickupDate?.value,
            bookingReturnDate?.value,
            bookingPickupTime?.value,
            bookingReturnTime?.value,
            selectedCar.price
        );

        if (!rentalPricing) {
            bookingSummary.days.textContent = t("modal_days_empty");
            bookingSummary.total.textContent = "-";
            return;
        }

        if (bookingSummary.rate) {
            bookingSummary.rate.textContent = formatRateDisplay(rentalPricing);
        }

        const rentalCharges = rentalPricing.rentalCharge;
        const transportCharges = deliveryQuote.status === "ready" ? deliveryQuote.totalCharge : 0;
        const totalPayable = getCheckoutTotalOverride(selectedCar.name)
            ?? (rentalCharges + selectedCar.deposit + transportCharges);

        bookingSummary.days.textContent = formatRentalDuration(rentalPricing);
        bookingSummary.total.textContent = formatCurrency(totalPayable);
    }

    function setBookingError(message) {
        if (!bookingFormError) {
            return;
        }

        bookingFormError.textContent = message;
        bookingFormError.classList.remove("hidden");
    }

    function clearBookingError() {
        if (!bookingFormError) {
            return;
        }

        bookingFormError.textContent = "";
        bookingFormError.classList.add("hidden");
    }

    function setBookingLoading(isLoading) {
        if (bookingSubmitButton) {
            bookingSubmitButton.disabled = isLoading;
            bookingSubmitButton.classList.toggle("opacity-70", isLoading);
            bookingSubmitButton.classList.toggle("cursor-not-allowed", isLoading);
        }

        if (bookingSubmitText) {
            bookingSubmitText.textContent = isLoading ? t("modal_processing") : t("modal_submit");
        }
    }

    async function goToPayment() {
        if (!selectedCar || !bookingForm) {
            setBookingError(t("booking_error_missing_car"));
            return;
        }

        clearBookingError();

        const scheduleValidation = getScheduleValidation(
            bookingPickupDate?.value,
            bookingReturnDate?.value,
            bookingPickupTime?.value,
            bookingReturnTime?.value
        );

        if (scheduleValidation.status !== "valid") {
            setBookingError(scheduleValidation.message || t("booking_error_invalid_dates"));
            return;
        }

        if (!mapConfig.enabled) {
            setBookingError(t("booking_error_map_config"));
            return;
        }

        if (deliveryQuote.status !== "ready") {
            setBookingError(t("booking_error_location_quote"));
            return;
        }

        if (!bookingTermsAgreement?.checked) {
            setBookingError(t("booking_error_terms"));
            return;
        }

        const payload = {
            carName: selectedCar.name,
            pickupDate: bookingPickupDate?.value || "",
            returnDate: bookingReturnDate?.value || "",
            customerName: bookingName?.value.trim() || "",
            customerEmail: bookingEmail?.value.trim() || "",
            customerPhone: bookingPhone?.value.trim() || "",
            pickupTime: bookingPickupTime?.value || "",
            returnTime: bookingReturnTime?.value || "",
            pickupLocation: bookingPickupLocation?.value.trim() || "",
            pickupPlaceId: bookingPickupLocation?.dataset.placeId || "",
            pickupAtHomeBase: bookingPickupLocation?.dataset.homeBase === "true",
            returnLocation: bookingReturnLocation?.value.trim() || "",
            returnPlaceId: bookingReturnLocation?.dataset.placeId || "",
            returnAtHomeBase: bookingReturnLocation?.dataset.homeBase === "true",
            bankName: bookingBankName?.value.trim() || "",
            bankAccountName: bookingBankAccountName?.value.trim() || "",
            bankAccountNumber: bookingBankAccountNumber?.value.trim() || "",
            termsAgreement: Boolean(bookingTermsAgreement?.checked),
        };

        setBookingLoading(true);

        try {
            const response = await fetch(buildApiUrl("/api/bayarcash/payment-intents"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                const fallbackMessage = response.status === 503 ? t("booking_error_config") : t("booking_error_generic");
                setBookingError(result.error || fallbackMessage);
                return;
            }

            if (!result.checkoutUrl) {
                setBookingError(t("booking_error_generic"));
                return;
            }

            window.location.assign(result.checkoutUrl);
        } catch (error) {
            setBookingError(t("booking_error_generic"));
        } finally {
            setBookingLoading(false);
        }
    }

    function directBook() {
        window.open(WHATSFORM_URL, "_blank");
    }

    function setupFleetActions() {
        if (!fleetContainer) {
            return;
        }

        fleetContainer.addEventListener("click", (event) => {
            const actionButton = event.target.closest("[data-action]");

            if (!actionButton) {
                return;
            }

            const { action, carName = "" } = actionButton.dataset;

            if (action === "payment") {
                openBookingModal(carName);
            }

            if (action === "whatsapp") {
                directBook(carName);
            }
        });
    }

    function setupMenuActions() {
        document.getElementById("mobile-menu-toggle")?.addEventListener("click", toggleMobileMenu);
        document.querySelectorAll("[data-mobile-nav-link]").forEach((link) => {
            link.addEventListener("click", closeMobileMenu);
        });
    }

    function setupLanguageActions() {
        document.querySelectorAll("[data-language-toggle]").forEach((button) => {
            button.addEventListener("click", () => {
                languageController.toggleLanguage();
            });
        });
    }

    function setupLocationAutocomplete() {
        Object.values(locationFieldState).forEach((fieldState) => {
            fieldState.input?.addEventListener("input", () => {
                if (fieldState.input.dataset.homeBase === "true") {
                    return;
                }

                clearLocationSelection(fieldState.input);
                resetDeliveryQuote("idle");
                updateDistanceFeedback();
                updateBookingSummary();

                window.clearTimeout(fieldState.debounceId);
                fieldState.debounceId = window.setTimeout(() => {
                    fetchLocationSuggestions(fieldState.key, fieldState.input.value);
                    requestDeliveryQuote();
                }, 250);
            });

            fieldState.input?.addEventListener("blur", () => {
                window.setTimeout(() => {
                    hideSuggestionList(fieldState.key);
                    requestDeliveryQuote();
                }, 150);
            });
        });

        bookingPickupHomeBase?.addEventListener("change", (event) => {
            toggleHomeBaseLocation("pickup", event.target.checked);
        });

        bookingReturnHomeBase?.addEventListener("change", (event) => {
            toggleHomeBaseLocation("return", event.target.checked);
        });

        Object.entries(locationSuggestionElements).forEach(([key, suggestionElement]) => {
            suggestionElement?.addEventListener("click", (event) => {
                const suggestionButton = event.target.closest("[data-location-suggestion]");
                if (!suggestionButton) {
                    return;
                }

                const inputElement = key === "pickup" ? bookingPickupLocation : bookingReturnLocation;
                inputElement.value = suggestionButton.dataset.label || "";
                inputElement.dataset.placeId = suggestionButton.dataset.placeId || "";
                inputElement.dataset.placeLabel = suggestionButton.dataset.label || "";
                inputElement.dataset.homeBase = "";

                if (key === "pickup" && bookingPickupHomeBase) {
                    bookingPickupHomeBase.checked = false;
                }

                if (key === "return" && bookingReturnHomeBase) {
                    bookingReturnHomeBase.checked = false;
                }

                hideSuggestionList(key);
                requestDeliveryQuote();
            });
        });
    }

    function setupBookingModal() {
        if (!bookingModal || !bookingForm) {
            return;
        }

        bookingModal.querySelectorAll("[data-booking-close]").forEach((element) => {
            element.addEventListener("click", closeBookingModal);
        });

        document.getElementById("booking-modal-close")?.addEventListener("click", closeBookingModal);
        bookingPickupDate?.addEventListener("input", () => {
            const pickupDate = parseDateInput(bookingPickupDate.value);
            const returnDate = parseDateInput(bookingReturnDate?.value || "");

            if (bookingReturnDate && bookingPickupDate.value) {
                bookingReturnDate.min = bookingPickupDate.value;
            }

            if (bookingReturnDate && pickupDate && returnDate && returnDate < pickupDate) {
                bookingReturnDate.value = bookingPickupDate.value;
            }

            refreshTimeOptions();
            updateBookingSummary();
        });
        bookingReturnDate?.addEventListener("input", () => {
            refreshTimeOptions();
            updateBookingSummary();
        });
        bookingPickupTime?.addEventListener("input", () => {
            refreshTimeOptions();
            updateBookingSummary();
        });
        bookingReturnTime?.addEventListener("input", updateBookingSummary);
        bookingForm.addEventListener("submit", (event) => {
            event.preventDefault();
            goToPayment();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !bookingModal.classList.contains("hidden")) {
                closeBookingModal();
            }
        });
    }

    function setupStatsAnimation() {
        const statsSection = document.getElementById("stats-section");
        const statNumbers = document.querySelectorAll(".stat-number");
        let hasAnimated = false;

        const animateNumbers = () => {
            statNumbers.forEach((stat) => {
                const target = parseFloat(stat.getAttribute("data-target"));
                const isDecimal = stat.hasAttribute("data-is-decimal");
                const duration = 2000;
                let startTime = null;

                const step = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const easeProgress = 1 - Math.pow(1 - progress, 3);
                    const current = target * easeProgress;

                    stat.innerText = isDecimal ? current.toFixed(1) : Math.floor(current);

                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        stat.innerText = isDecimal ? target.toFixed(1) : target;
                    }
                };

                window.requestAnimationFrame(step);
            });
        };

        if (!statsSection) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                hasAnimated = true;
                animateNumbers();
            }
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    function mapPaymentState(statusValue) {
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

    function showPaymentStatus(state, details = {}) {
        if (!paymentStatusBanner || !paymentStatusCard || !paymentStatusIcon || !paymentStatusTitle || !paymentStatusMessage) {
            return;
        }

        const config = STATUS_CONFIG[state] || STATUS_CONFIG.unknown;
        const messageKey = details.verified === false ? "payment_status_invalid" : `payment_status_${state}`;
        const orderText = details.orderNumber ? ` ${t("payment_order_label")}: ${details.orderNumber}.` : "";
        const transactionText = details.transactionId ? ` ${t("payment_transaction_label")}: ${details.transactionId}.` : "";
        const descriptionText = details.statusDescription ? ` ${details.statusDescription}` : "";

        paymentStatusCard.className = `rounded-3xl border backdrop-blur-md shadow-2xl shadow-slate-900/10 p-5 ${config.tone}`;
        paymentStatusIcon.className = `w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${config.iconTone}`;
        paymentStatusIcon.innerHTML = `<i class="fas ${config.icon} text-lg"></i>`;
        paymentStatusTitle.textContent = t("payment_update_title");
        paymentStatusMessage.textContent = `${t(messageKey)}${descriptionText}${orderText}${transactionText}`.trim();
        paymentStatusBanner.classList.remove("hidden");
    }

    async function handlePaymentReturn() {
        const url = new URL(window.location.href);

        if (!url.searchParams.has("checksum") || !url.searchParams.has("transaction_id")) {
            return;
        }

        try {
            const response = await fetch(buildApiUrl(`/api/bayarcash/verify-return?${url.searchParams.toString()}`));
            const result = await response.json();
            const state = mapPaymentState(result.status);

            showPaymentStatus(state, result);
        } catch (error) {
            showPaymentStatus("unknown", { verified: false });
        } finally {
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete(PAYMENT_RETURN_FLAG);
            [
                "record_type",
                "transaction_id",
                "exchange_reference_number",
                "exchange_transaction_id",
                "order_number",
                "currency",
                "amount",
                "payer_name",
                "payer_email",
                "payer_bank_name",
                "status",
                "status_description",
                "datetime",
                "checksum",
            ].forEach((key) => cleanUrl.searchParams.delete(key));
            window.history.replaceState({}, document.title, `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
        }
    }

    function setupPaymentStatusBanner() {
        document.getElementById("payment-status-close")?.addEventListener("click", () => {
            paymentStatusBanner?.classList.add("hidden");
        });
    }

    setCurrentYear();
    renderFleet();
    populateTimeDropdowns();
    resetDeliveryQuote("idle");
    updateDistanceFeedback();
    fetchMapConfig();
    setupFleetActions();
    setupMenuActions();
    setupLanguageActions();
    setupLocationAutocomplete();
    setupBookingModal();
    setupPaymentStatusBanner();
    languageController.updateUI();
    setupStatsAnimation();
    handlePaymentReturn();
})();
