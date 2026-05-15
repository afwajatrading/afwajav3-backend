(function (root, factory) {
    const catalog = factory();

    if (typeof module !== "undefined" && module.exports) {
        module.exports = catalog;
    }

    root.AfwajaFleetCatalog = catalog;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    return {
        groupLabelKeys: {
            "Kumpulan A (Compact & Economy)": "fleet_group_a",
            "Kumpulan B (Mid-size Sedan & Hatch)": "fleet_group_b",
            "Kumpulan C (SUV, Crossover & Family MPV)": "fleet_group_c",
            "Kumpulan D (Luxury & Large MPV)": "fleet_group_d",
        },
        fleetData: {
            "Kumpulan A (Compact & Economy)": [
                { name: "Perodua Axia", desc: "Auto &bull; 4 Seats &bull; Compact", price: 1, img: "https://platform-bcl.bsb-cdn.com/media/2026/04/01KP2KRRG31583SYNP78CEK0XS.png", type: "Compact" },
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
        },
    };
});
